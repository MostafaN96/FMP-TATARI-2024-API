// Queries
const weExecuteOrderRequisitionDetailsWeQueries = require("../../db/queries/we/we-execute-order-requisition-details-we");
const weExecuteOrderRequisitionDetailsQueries = require("../../db/queries/we/we-execute-order-requisition-details");
const weExecuteOrderRequisitionQueries = require("../../db/queries/we/we-execute-order-requisition");
const weQueries = require("../../db/queries/we/we");
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");

// Helper
const trans = require("../../helpers/transform");

// Services
const weExecuteOrderRequisitionDetailsWeService = require("./we-execute-order-requisition-details-we");
const weService = require("./we");
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");


// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const {
    weExecuteOrderRequisitionDetailsTableName,
    weExecuteOrderRequisitionDetailsWeTableName,
    weTableName
} = require("../../util/database-tables-name");

exports.create = async (weExecuteOrderRequisitionDetails) => {

    for (let i = 0; i < weExecuteOrderRequisitionDetails.items.length; i++) {
        weExecuteOrderRequisitionDetails.weId = trans.transform();


        weExecuteOrderRequisitionDetails.items[i].weExecuteOrderRequisitionDetailsId = trans.transform();

        // Check Consigment Manufacturing Dupplication
        const selectConsigmentDyeingOneResult = await consigmentDyeingQueries.selectOne({ number: weExecuteOrderRequisitionDetails.items[i].newConsigmentDyeingNumber })
        if (Array.isArray(selectConsigmentDyeingOneResult) && selectConsigmentDyeingOneResult.length > 0) {
            weExecuteOrderRequisitionDetails.items[i].consigmentDyeingId = selectConsigmentDyeingOneResult[0].id;
        } else {
            weExecuteOrderRequisitionDetails.items[i].consigmentDyeingId = trans.transform();
            await consigmentDyeingQueries.insertForWeExecuteOrder(weExecuteOrderRequisitionDetails, weExecuteOrderRequisitionDetails.items[i]);
        }

        const results = await weExecuteOrderRequisitionDetailsQueries.insert(weExecuteOrderRequisitionDetails, weExecuteOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(weExecuteOrderRequisitionDetails.items[i].quantity)

            // select wc for decrement current quantity
            let weWhereCluse = {}
            weWhereCluse[`${weTableName}.id`] = weExecuteOrderRequisitionDetails.items[i].weId
            const dyedFabricsStoredInWeResult = await weQueries.selectOne(weWhereCluse)
            if (dyedFabricsStoredInWeResult[0] != null) {

                const dyedFabricStoredInWe = dyedFabricsStoredInWeResult[0];
                let currentQuantity = dyedFabricStoredInWe.current_quantity
                let updatedQuantity = 0

                // decrement wa CurrentQuantity
                let returnedQuantityObj = await weService.decrementWeCurrentQuantity(newQuantity, currentQuantity, dyedFabricStoredInWe, updatedQuantity);
                newQuantity = returnedQuantityObj.newQuantity
                updatedQuantity = returnedQuantityObj.updatedQuantity
                weExecuteOrderRequisitionDetails.items[i].weId = dyedFabricStoredInWe.id
                weExecuteOrderRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                // Add wa execute order Requisition Details wa
                await weExecuteOrderRequisitionDetailsWeService.create(weExecuteOrderRequisitionDetails, weExecuteOrderRequisitionDetails.items[i])

                // Insert wa
                await weQueries.insertForExecuteOrderRequisitionWe(weExecuteOrderRequisitionDetails, weExecuteOrderRequisitionDetails.items[i])

                // update order requisition quantity
                await weDyedFabricOrderRequisitionDetailsService.updateForExecuteOrder(weExecuteOrderRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: weExecuteOrderRequisitionDetails.id } };
};


exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weExecuteOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`] = requisitionId;
        whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
        const results = await weExecuteOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weExecuteOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.id`] = weExecuteOrderRequisitionDetails.id;
    whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weExecuteOrderRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false
        weExecuteOrderRequisitionDetails.weExecuteOrderRequisitionId = isFound[0].we_execute_order_requisition_id

        let wcExecuteOrderRequisitionDetailsWcWhereCluse = {}
        wcExecuteOrderRequisitionDetailsWcWhereCluse[`${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`] = weExecuteOrderRequisitionDetails.id
        const weExecuteOrderRequisitionDetailsWeSelectOneResult = await weExecuteOrderRequisitionDetailsWeQueries.selectOne(wcExecuteOrderRequisitionDetailsWcWhereCluse)
        if (weExecuteOrderRequisitionDetailsWeSelectOneResult[0] != null) {

            // Update wb transition between industries requisition Without Quantity
            callArray.push(weExecuteOrderRequisitionQueries.update({
                date: weExecuteOrderRequisitionDetails.date,
                note: weExecuteOrderRequisitionDetails.requisitionNote,
            },
                {
                    id: weExecuteOrderRequisitionDetails.weExecuteOrderRequisitionId
                }))

            // Update wb transition between industries requisition details Without Quantity
            callArray.push(
                weExecuteOrderRequisitionDetailsQueries.update({
                    price: weExecuteOrderRequisitionDetails.price,
                    price_dollar: weExecuteOrderRequisitionDetails.priceDollar,
                    fabric_piece: weExecuteOrderRequisitionDetails.numberFabricPieces,
                    note: weExecuteOrderRequisitionDetails.note
                },
                    {
                        id: weExecuteOrderRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waCottonResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(weExecuteOrderRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWeRecord = await weQueries.selectOne({
                we_execute_order_requisition_details_id: weExecuteOrderRequisitionDetails.id
            })

            if (selectOneWeRecord[0] != null) {

                const selectOldOneWeRecord = await weQueries.selectOne({
                    id: weExecuteOrderRequisitionDetailsWeSelectOneResult[0].we_id
                })
                if (selectOldOneWeRecord[0] != null) {

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                        const sumCurrentQuantity = selectOldOneWeRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                            await weExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: weExecuteOrderRequisitionDetails.id
                            })

                            // Increment wa current_quantity
                            await weQueries.update({
                                current_quantity: selectOneWeRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })


                            let currentQuantity = selectOldOneWeRecord[0].current_quantity
                            let updatedQuantity = 0

                            // decrement wa CurrentQuantity
                            let returnedQuantityObj = await weService.decrementWeCurrentQuantity(defferenceQuantity, currentQuantity, selectOldOneWeRecord[0], updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4.1 => Update Quantity in wa_execute_order_requisition_details_wa
                            updateResults = await weExecuteOrderRequisitionDetailsWeQueries.update({
                                quantity: weExecuteOrderRequisitionDetailsWeSelectOneResult[0].quantity + updatedQuantity
                            }, {
                                we_execute_order_requisition_details_id: weExecuteOrderRequisitionDetails.id,
                                we_id: weExecuteOrderRequisitionDetailsWeSelectOneResult[0].we_id
                            })

                            // Step 4.1 => Update Quantity in wa_yarn_order_requisition_details
                            updateResults = await weDyedFabricOrderRequisitionDetailsService.updateForExecuteOrder({
                                weDyedFabricOrderRequisitionDetailsId: weExecuteOrderRequisitionDetails.weDyedFabricOrderRequisitionDetailsId,
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

                        if (selectOneWeRecord[0].current_quantity >= defferenceQuantity) {

                            // Step 1 => Decrement quantity in  wb_transition_between_wh_requisition_details
                            await weExecuteOrderRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: weExecuteOrderRequisitionDetails.id
                            })

                            // Decrement wa current_quantity
                            await weQueries.update({
                                current_quantity: selectOneWeRecord[0].current_quantity - defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })


                            let weExecuteOrderRequisitionDetailsWeQuantity = weExecuteOrderRequisitionDetailsWeSelectOneResult[0].quantity
                            let updatedQuantity = 0

                            if (weExecuteOrderRequisitionDetailsWeQuantity >= defferenceQuantity) {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await weExecuteOrderRequisitionDetailsWeQueries.update({
                                    quantity: weExecuteOrderRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_execute_order_requisition_details_id: weExecuteOrderRequisitionDetails.id,
                                    we_id: weExecuteOrderRequisitionDetailsWeSelectOneResult[0].we_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wa_execute_order_requisition_details_wa quantity
                                await weExecuteOrderRequisitionDetailsWeQueries.update({
                                    quantity: 0
                                }, {
                                    we_execute_order_requisition_details_id: weExecuteOrderRequisitionDetails.id,
                                    we_id: weExecuteOrderRequisitionDetailsWeSelectOneResult[0].we_id
                                })
                                updatedQuantity = weExecuteOrderRequisitionDetailsWeQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - weExecuteOrderRequisitionDetailsWeQuantity).toFixed(3))
                            }

                            const oldCurrentQuantity = selectOldOneWeRecord[0].current_quantity

                            // Increment wa current_quantity
                            updateResults = await weQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: selectOldOneWeRecord[0].id
                            })

                            // Increment weDyedFabricOrderRequisitionDetailsService current_quantity
                            updateResults = await weDyedFabricOrderRequisitionDetailsService.updateIncrementForExecuteOrder({
                                weDyedFabricOrderRequisitionDetailsId: weExecuteOrderRequisitionDetails.weDyedFabricOrderRequisitionDetailsId,
                                quantity: parseFloat((oldQuantity - newQuantity).toFixed(3)),
                                is_order: 1
                            })

                        } else {
                            return {
                                ...constants.wrongQuantity,
                                spentQuantity: selectOneWeRecord[0].current_quantity,
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
