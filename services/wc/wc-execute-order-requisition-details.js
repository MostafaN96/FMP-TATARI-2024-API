// Queries
const wcExecuteOrderRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-execute-order-requisition-details-wc");
const wcExecuteOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-execute-order-requisition-details");
const wcExecuteOrderRequisitionQueries = require("../../db/queries/wc/wc-execute-order-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");

// Helper
const trans = require("../../helpers/transform");

// Services
const wcExecuteOrderRequisitionDetailsWcService = require("./wc-execute-order-requisition-details-wc");
const wcService = require("./wc");
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");


// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const {
    wcExecuteOrderRequisitionDetailsTableName,
    wcExecuteOrderRequisitionDetailsWcTableName,
    wcTableName
} = require("../../util/database-tables-name");

exports.create = async (wcExecuteOrderRequisitionDetails) => {

    for (let i = 0; i < wcExecuteOrderRequisitionDetails.items.length; i++) {
        wcExecuteOrderRequisitionDetails.wcId = trans.transform();


        wcExecuteOrderRequisitionDetails.items[i].wcExecuteOrderRequisitionDetailsId = trans.transform();

        // Check Consigment Manufacturing Dupplication
        const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wcExecuteOrderRequisitionDetails.items[i].newConsigmentManufacturingNumber })
        if (Array.isArray(selectConsigmentManufacturingOneResult) && selectConsigmentManufacturingOneResult.length > 0) {
            wcExecuteOrderRequisitionDetails.items[i].consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
        } else {
            wcExecuteOrderRequisitionDetails.items[i].consigmentManufacturingId = trans.transform();
            await consigmentManufacturingQueries.insertForWcExecuteOrder(wcExecuteOrderRequisitionDetails, wcExecuteOrderRequisitionDetails.items[i]);
        }

        const results = await wcExecuteOrderRequisitionDetailsQueries.insert(wcExecuteOrderRequisitionDetails, wcExecuteOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wcExecuteOrderRequisitionDetails.items[i].quantity)

            // select wc for decrement current quantity
            let wcWhereCluse = {}
            wcWhereCluse[`${wcTableName}.id`] = wcExecuteOrderRequisitionDetails.items[i].wcId
            const fabricsStoredInWcResult = await wcQueries.selectOne(wcWhereCluse)
            if (fabricsStoredInWcResult[0] != null) {

                const fabricStoredInWc = fabricsStoredInWcResult[0];
                let currentQuantity = fabricStoredInWc.current_quantity
                let updatedQuantity = 0

                // decrement wa CurrentQuantity
                let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity);
                newQuantity = returnedQuantityObj.newQuantity
                updatedQuantity = returnedQuantityObj.updatedQuantity
                wcExecuteOrderRequisitionDetails.items[i].wcId = fabricStoredInWc.id
                wcExecuteOrderRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                // Add wa execute order Requisition Details wa
                await wcExecuteOrderRequisitionDetailsWcService.create(wcExecuteOrderRequisitionDetails, wcExecuteOrderRequisitionDetails.items[i])

                // Insert wa
                await wcQueries.insertForExecuteOrderRequisition(wcExecuteOrderRequisitionDetails, wcExecuteOrderRequisitionDetails.items[i])

                // update order requisition quantity
                await wcFabricOrderRequisitionDetailsService.updateForExecuteOrder(wcExecuteOrderRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: wcExecuteOrderRequisitionDetails.id } };
};


exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcExecuteOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`] = requisitionId;
        whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
        const results = await wcExecuteOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcExecuteOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.id`] = wcExecuteOrderRequisitionDetails.id;
    whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcExecuteOrderRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false
        wcExecuteOrderRequisitionDetails.wcExecuteOrderRequisitionId = isFound[0].wc_execute_order_requisition_id

        let wcExecuteOrderRequisitionDetailsWcWhereCluse = {}
        wcExecuteOrderRequisitionDetailsWcWhereCluse[`${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`] = wcExecuteOrderRequisitionDetails.id
        const wcExecuteOrderRequisitionDetailsWcSelectOneResult = await wcExecuteOrderRequisitionDetailsWcQueries.selectOne(wcExecuteOrderRequisitionDetailsWcWhereCluse)
        if (wcExecuteOrderRequisitionDetailsWcSelectOneResult[0] != null) {

            // Update wb transition between industries requisition Without Quantity
            callArray.push(wcExecuteOrderRequisitionQueries.update({
                date: wcExecuteOrderRequisitionDetails.date,
                note: wcExecuteOrderRequisitionDetails.requisitionNote,
            },
                {
                    id: wcExecuteOrderRequisitionDetails.wcExecuteOrderRequisitionId
                }))

            // Update wb transition between industries requisition details Without Quantity
            callArray.push(
                wcExecuteOrderRequisitionDetailsQueries.update({
                    price: wcExecuteOrderRequisitionDetails.price,
                    note: wcExecuteOrderRequisitionDetails.note
                },
                    {
                        id: wcExecuteOrderRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waCottonResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(wcExecuteOrderRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWcRecord = await wcQueries.selectOne({
                wc_execute_order_requisition_details_id: wcExecuteOrderRequisitionDetails.id
            })

            if (selectOneWcRecord[0] != null) {

                const selectOldOneWcRecord = await wcQueries.selectOne({
                    id: wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].wc_id
                })
                if (selectOldOneWcRecord[0] != null) {

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                        const sumCurrentQuantity = selectOldOneWcRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                            await wcExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: wcExecuteOrderRequisitionDetails.id
                            })

                            // Increment wa current_quantity
                            await wcQueries.update({
                                current_quantity: selectOneWcRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWcRecord[0].id
                            })


                            let currentQuantity = selectOldOneWcRecord[0].current_quantity
                            let updatedQuantity = 0

                            // decrement wa CurrentQuantity
                            let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(defferenceQuantity, currentQuantity, selectOldOneWcRecord[0], updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4.1 => Update Quantity in wa_execute_order_requisition_details_wa
                            updateResults = await wcExecuteOrderRequisitionDetailsWcQueries.update({
                                quantity: wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].quantity + updatedQuantity
                            }, {
                                wc_execute_order_requisition_details_id: wcExecuteOrderRequisitionDetails.id,
                                wc_id: wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].wc_id
                            })

                            // Step 4.1 => Update Quantity in wa_yarn_order_requisition_details
                            updateResults = await wcFabricOrderRequisitionDetailsService.updateForExecuteOrder({
                                wcFabricOrderRequisitionDetailsId: wcExecuteOrderRequisitionDetails.wcFabricOrderRequisitionDetailsId,
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

                        if (selectOneWcRecord[0].current_quantity >= defferenceQuantity) {

                            // Step 1 => Decrement quantity in  wb_transition_between_wh_requisition_details
                            await wcExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: wcExecuteOrderRequisitionDetails.id
                            })

                            // Decrement wa current_quantity
                            await wcQueries.update({
                                current_quantity: selectOneWcRecord[0].current_quantity - defferenceQuantity
                            }, {
                                id: selectOneWcRecord[0].id
                            })


                            let wcExecuteOrderRequisitionDetailsWcQuantity = wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].quantity
                            let updatedQuantity = 0

                            if (wcExecuteOrderRequisitionDetailsWcQuantity >= defferenceQuantity) {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await wcExecuteOrderRequisitionDetailsWcQueries.update({
                                    quantity: wcExecuteOrderRequisitionDetailsWcQuantity - defferenceQuantity
                                }, {
                                    wc_execute_order_requisition_details_id: wcExecuteOrderRequisitionDetails.id,
                                    wc_id: wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].wc_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await wcExecuteOrderRequisitionDetailsWcQueries.update({
                                    quantity: 0
                                }, {
                                    wc_execute_order_requisition_details_id: wcExecuteOrderRequisitionDetails.id,
                                    wc_id: wcExecuteOrderRequisitionDetailsWcSelectOneResult[0].wc_id
                                })
                                updatedQuantity = wcExecuteOrderRequisitionDetailsWcQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wcExecuteOrderRequisitionDetailsWcQuantity).toFixed(3))
                            }

                            const oldCurrentQuantity = selectOldOneWcRecord[0].current_quantity

                            // Increment wa current_quantity
                            updateResults = await wcQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: selectOldOneWcRecord[0].id
                            })

                            // Increment wcFabricOrderRequisitionDetailsService current_quantity
                            updateResults = await wcFabricOrderRequisitionDetailsService.updateIncrementForExecuteOrder({
                                wcFabricOrderRequisitionDetailsId: wcExecuteOrderRequisitionDetails.wcFabricOrderRequisitionDetailsId,
                                quantity: parseFloat((oldQuantity - newQuantity).toFixed(3))
                            })

                        } else {
                            return {
                                ...constants.wrongQuantity,
                                spentQuantity: selectOneWcRecord[0].current_quantity,
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
