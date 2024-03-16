// Queries
const waExecuteOrderRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-execute-order-requisition-details-wa");
const waExecuteOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-execute-order-requisition-details");
const waExecuteOrderRequisitionQueries = require("../../db/queries/wa/wa-execute-order-requisition");
const waQueries = require("../../db/queries/wa/wa");
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");

// Helper
const trans = require("../../helpers/transform");

// Services
const waExecuteOrderRequisitionDetailsWaService = require("./wa-execute-order-requisition-details-wa");
const waService = require("./wa");
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");


// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const {
    waExecuteOrderRequisitionDetailsTableName,
    waExecuteOrderRequisitionDetailsWaTableName,
    waTableName
} = require("../../util/database-tables-name");

exports.create = async (waExecuteOrderRequisitionDetails) => {

    for (let i = 0; i < waExecuteOrderRequisitionDetails.items.length; i++) {
        waExecuteOrderRequisitionDetails.waId = trans.transform();


        waExecuteOrderRequisitionDetails.items[i].waExecuteOrderRequisitionDetailsId = trans.transform();

        // Check Consigment Manufacturing Dupplication
        const selectConsigmentYarnOneResult = await consigmentYarnQueries.selectOne({ number: waExecuteOrderRequisitionDetails.items[i].newConsigmentYarnNumber })
        if (Array.isArray(selectConsigmentYarnOneResult) && selectConsigmentYarnOneResult.length > 0) {
            waExecuteOrderRequisitionDetails.items[i].consigmentYarnId = selectConsigmentYarnOneResult[0].id;
        } else {
            waExecuteOrderRequisitionDetails.items[i].consigmentYarnId = trans.transform();
            await consigmentYarnQueries.insertForWaExecuteOrder(waExecuteOrderRequisitionDetails, waExecuteOrderRequisitionDetails.items[i]);
        }

        const results = await waExecuteOrderRequisitionDetailsQueries.insert(waExecuteOrderRequisitionDetails, waExecuteOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(waExecuteOrderRequisitionDetails.items[i].quantity)

            // select wa for decrement current quantity
            let weWhereCluse = {}
            weWhereCluse[`${waTableName}.id`] = waExecuteOrderRequisitionDetails.items[i].waId
            const yarnsStoredInWaResult = await waQueries.selectOne(weWhereCluse)
            if (yarnsStoredInWaResult[0] != null) {

                const yarnStoredInWa = yarnsStoredInWaResult[0];
                let currentQuantity = yarnStoredInWa.current_quantity
                let updatedQuantity = 0

                // decrement wa CurrentQuantity
                let returnedQuantityObj = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity);
                newQuantity = returnedQuantityObj.newQuantity
                updatedQuantity = returnedQuantityObj.updatedQuantity
                waExecuteOrderRequisitionDetails.items[i].waId = yarnStoredInWa.id
                waExecuteOrderRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                // Add wa execute order Requisition Details wa
                await waExecuteOrderRequisitionDetailsWaService.create(waExecuteOrderRequisitionDetails, waExecuteOrderRequisitionDetails.items[i])

                // Insert wa
                await waQueries.insertForExecuteOrderRequisition(waExecuteOrderRequisitionDetails, waExecuteOrderRequisitionDetails.items[i])

                // update order requisition quantity
                await waYarnOrderRequisitionDetailsService.updateForExecuteOrder(waExecuteOrderRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: waExecuteOrderRequisitionDetails.id } };
};


exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await waExecuteOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`] = requisitionId;
        whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
        const results = await waExecuteOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (waExecuteOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.id`] = waExecuteOrderRequisitionDetails.id;
    whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waExecuteOrderRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false
        waExecuteOrderRequisitionDetails.waExecuteOrderRequisitionId = isFound[0].wa_execute_order_requisition_id

        let waExecuteOrderRequisitionDetailsWaWhereCluse = {}
        waExecuteOrderRequisitionDetailsWaWhereCluse[`${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`] = waExecuteOrderRequisitionDetails.id
        const waExecuteOrderRequisitionDetailsWaSelectOneResult = await waExecuteOrderRequisitionDetailsWaQueries.selectOne(waExecuteOrderRequisitionDetailsWaWhereCluse)
        if (waExecuteOrderRequisitionDetailsWaSelectOneResult[0] != null) {

            // Update wb transition between industries requisition Without Quantity
            callArray.push(waExecuteOrderRequisitionQueries.update({
                date: waExecuteOrderRequisitionDetails.date,
                note: waExecuteOrderRequisitionDetails.requisitionNote,
            },
                {
                    id: waExecuteOrderRequisitionDetails.waExecuteOrderRequisitionId
                }))

            // Update wb transition between industries requisition details Without Quantity
            callArray.push(
                waExecuteOrderRequisitionDetailsQueries.update({
                    price: waExecuteOrderRequisitionDetails.price,
                    note: waExecuteOrderRequisitionDetails.note
                },
                    {
                        id: waExecuteOrderRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waCottonResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(waExecuteOrderRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWaRecord = await waQueries.selectOne({
                wa_execute_order_requisition_details_id: waExecuteOrderRequisitionDetails.id
            })

            if (selectOneWaRecord[0] != null) {

                const selectOldOneWaRecord = await waQueries.selectOne({
                    id: waExecuteOrderRequisitionDetailsWaSelectOneResult[0].wa_id
                })
                if (selectOldOneWaRecord[0] != null) {

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                        const sumCurrentQuantity = selectOldOneWaRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                            await waExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: waExecuteOrderRequisitionDetails.id
                            })

                            // Increment wa current_quantity
                            await waQueries.update({
                                current_quantity: selectOneWaRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWaRecord[0].id
                            })


                            let currentQuantity = selectOldOneWaRecord[0].current_quantity
                            let updatedQuantity = 0

                            // decrement wa CurrentQuantity
                            let returnedQuantityObj = await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, selectOldOneWaRecord[0], updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4.1 => Update Quantity in wa_execute_order_requisition_details_wa
                            updateResults = await waExecuteOrderRequisitionDetailsWaQueries.update({
                                quantity: waExecuteOrderRequisitionDetailsWaSelectOneResult[0].quantity + updatedQuantity
                            }, {
                                wa_execute_order_requisition_details_id: waExecuteOrderRequisitionDetails.id,
                                wa_id: waExecuteOrderRequisitionDetailsWaSelectOneResult[0].wa_id
                            })

                            // Step 4.1 => Update Quantity in wa_yarn_order_requisition_details
                            updateResults = await waYarnOrderRequisitionDetailsService.updateForExecuteOrder({
                                waYarnOrderRequisitionDetailsId: waExecuteOrderRequisitionDetails.waYarnOrderRequisitionDetailsId,
                                quantity: parseFloat((newQuantity - oldQuantity).toFixed(3))
                            })


                        } else {
                            return {
                                ...constants.wrongQuantity,
                                spentQuantity: sumCurrentQuantity,
                                newQuantity: defferenceQuantity
                            }
                        }

                    } else if (newQuantity < oldQuantity) {
                        defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                        if (selectOneWaRecord[0].current_quantity >= defferenceQuantity) {

                            // Step 1 => Decrement quantity in  wb_transition_between_wh_requisition_details
                            await waExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: waExecuteOrderRequisitionDetails.id
                            })

                            // Decrement wa current_quantity
                            await waQueries.update({
                                current_quantity: selectOneWaRecord[0].current_quantity - defferenceQuantity
                            }, {
                                id: selectOneWaRecord[0].id
                            })


                            let waExecuteOrderRequisitionDetailsWaQuantity = waExecuteOrderRequisitionDetailsWaSelectOneResult[0].quantity
                            let updatedQuantity = 0

                            if (waExecuteOrderRequisitionDetailsWaQuantity >= defferenceQuantity) {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await waExecuteOrderRequisitionDetailsWaQueries.update({
                                    quantity: waExecuteOrderRequisitionDetailsWaQuantity - defferenceQuantity
                                }, {
                                    wa_execute_order_requisition_details_id: waExecuteOrderRequisitionDetails.id,
                                    wa_id: waExecuteOrderRequisitionDetailsWaSelectOneResult[0].wa_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await waExecuteOrderRequisitionDetailsWaQueries.update({
                                    quantity: 0
                                }, {
                                    wa_execute_order_requisition_details_id: waExecuteOrderRequisitionDetails.id,
                                    wa_id: waExecuteOrderRequisitionDetailsWaSelectOneResult[0].wa_id
                                })
                                updatedQuantity = waExecuteOrderRequisitionDetailsWaQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - waExecuteOrderRequisitionDetailsWaQuantity).toFixed(3))
                            }

                            const oldCurrentQuantity = selectOldOneWaRecord[0].current_quantity

                            // Increment wa current_quantity
                            updateResults = await waQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: selectOldOneWaRecord[0].id
                            })

                            // Increment waYarnOrderRequisitionDetailsService current_quantity
                            updateResults = await waYarnOrderRequisitionDetailsService.updateIncrementForExecuteOrder({
                                waYarnOrderRequisitionDetailsId: waExecuteOrderRequisitionDetails.waYarnOrderRequisitionDetailsId,
                                quantity: parseFloat((oldQuantity - newQuantity).toFixed(3))
                            })

                        } else {
                            return {
                                ...constants.wrongQuantity,
                                spentQuantity: selectOneWaRecord[0].current_quantity,
                                newQuantity: defferenceQuantity
                            }
                        }
                    } else {
                        updateResults = true
                    }
                } else {
                    updateResults = false
                }
            } else {
                updateResults = false
            }
            if (updateResults) {
                return constants.updateSuccess;
            } else {
                return constants.updateError;
            }

        } else {
            updateResults = false
        }

    } else {
        return constants.itemNotFound;
    }
};
