// Queries
const weTransitionBetweenOrdersRequisitionDetailsWeQueries = require("../../db/queries/we/we-transition-between-orders-requisition-details-we");
const weTransitionBetweenOrdersRequisitionDetailsQueries = require("../../db/queries/we/we-transition-between-orders-requisition-details");
const weTransitionBetweenOrdersRequisitionQueries = require("../../db/queries/we/we-transition-between-orders-requisition");
const weQueries = require("../../db/queries/we/we");
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");

// Services
const weTransitionBetweenOrdersRequisitionDetailsWeService = require("./we-transition-between-orders-requisition-details-we");
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");
const weService = require("./we");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weTransitionBetweenOrdersRequisitionDetailsTableName,
    weTransitionBetweenOrdersRequisitionDetailsWeTableName,
    weTableName,
    weDyedFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (weTransitionBetweenOrdersRequisitionDetails) => {

    for (let i = 0; i < weTransitionBetweenOrdersRequisitionDetails.items.length; i++) {
        weTransitionBetweenOrdersRequisitionDetails.weId = trans.transform();

        weTransitionBetweenOrdersRequisitionDetails.items[i].weTransitionBetweenOrdersRequisitionDetailsId = trans.transform();

        // Check Consigment Dyeing Dupplication
        const selectConsigmentDyeingOneResult = await consigmentDyeingQueries.selectOne({ number: weTransitionBetweenOrdersRequisitionDetails.items[i].newConsigmentDyeingNumber })
        if (Array.isArray(selectConsigmentDyeingOneResult ) && selectConsigmentDyeingOneResult.length > 0) {
            weTransitionBetweenOrdersRequisitionDetails.items[i].consigmentDyeingId = selectConsigmentDyeingOneResult[0].id;
        } else {
            weTransitionBetweenOrdersRequisitionDetails.items[i].consigmentDyeingId = trans.transform();
            await consigmentDyeingQueries.insertForTransitionBetween(weTransitionBetweenOrdersRequisitionDetails, weTransitionBetweenOrdersRequisitionDetails.items[i]);
        }

        // Get fabric order requisitions details id
        let dyedFabricOrderRequisitionDetailsWhereCluse = {};
        dyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`] = weTransitionBetweenOrdersRequisitionDetails.fabricOrderId;
        dyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`] = weTransitionBetweenOrdersRequisitionDetails.items[i].dyedFabricId;
        dyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        dyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectDyedFabricOrderRequisitionDetailsResult = await weDyedFabricOrderRequisitionDetailsService.selectOne(dyedFabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectDyedFabricOrderRequisitionDetailsResult) && selectDyedFabricOrderRequisitionDetailsResult.length > 0) {
            weTransitionBetweenOrdersRequisitionDetails.items[i].toWeDyedFabricOrderRequisitionDetailsId = selectDyedFabricOrderRequisitionDetailsResult[0].id

        // Get we dyed fabric order requisitions details id
        let fromDyedFabricOrderRequisitionDetailsWhereCluse = {};
        fromDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`] = weTransitionBetweenOrdersRequisitionDetails.items[i].fromDyedFabricOrderId;
        fromDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`] = weTransitionBetweenOrdersRequisitionDetails.items[i].dyedFabricId;
        fromDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fromDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFromDyedFabricOrderRequisitionDetailsResult = await weDyedFabricOrderRequisitionDetailsService.selectOne(fromDyedFabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFromDyedFabricOrderRequisitionDetailsResult) && selectFromDyedFabricOrderRequisitionDetailsResult.length > 0) {
            weTransitionBetweenOrdersRequisitionDetails.items[i].fromWeDyedFabricOrderRequisitionDetailsId = selectFromDyedFabricOrderRequisitionDetailsResult[0].id

        const results = await weTransitionBetweenOrdersRequisitionDetailsQueries.insert(weTransitionBetweenOrdersRequisitionDetails, weTransitionBetweenOrdersRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(weTransitionBetweenOrdersRequisitionDetails.items[i].quantity)

            // select we for decrement current quantity
            let weWhereCluse = {}
            weWhereCluse[`${weTableName}.id`] = weTransitionBetweenOrdersRequisitionDetails.items[i].weId
            const fabricsStoredInWeResult = await weQueries.selectOne(weWhereCluse)
            if (fabricsStoredInWeResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWeResult.length; j++) {
                    const fabricStoredInWe = fabricsStoredInWeResult[j];
                    let currentQuantity = fabricStoredInWe.current_quantity
                    let updatedQuantity = 0

                    // decrement we CurrentQuantity
                    let returnedQuantityObj = await weService.decrementWeCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    weTransitionBetweenOrdersRequisitionDetails.items[i].weId = fabricStoredInWe.id
                    weTransitionBetweenOrdersRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add we Transition Between Industries Requisition Details wb
                    await weTransitionBetweenOrdersRequisitionDetailsWeService.create(weTransitionBetweenOrdersRequisitionDetails, weTransitionBetweenOrdersRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert we
                await weQueries.insertForTransitionBetweenOrdersRequisition(weTransitionBetweenOrdersRequisitionDetails, weTransitionBetweenOrdersRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    } else {

    }
} else {

}
    }
    return { ...constants.insertSuccess, ...{ id: weTransitionBetweenOrdersRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weTransitionBetweenOrdersRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`] = requisitionId;
        whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
        let results = await weTransitionBetweenOrdersRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length < 1) {
            results = await weTransitionBetweenOrdersRequisitionDetailsQueries.selectOneByRequisitionId(whereCluse);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weTransitionBetweenOrdersRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`] = weTransitionBetweenOrdersRequisitionDetails.id;
    whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weTransitionBetweenOrdersRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false
        weTransitionBetweenOrdersRequisitionDetails.weTransitionBetweenWarehousesRequisitionId = isFound[0].we_transition_between_orders_requisitions_id

        let weTransitionBetweenOrdersRequisitionDetailsWeWhereCluse = {}
        weTransitionBetweenOrdersRequisitionDetailsWeWhereCluse[`${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.we_transition_between_orders_requisitions_details_id`] = weTransitionBetweenOrdersRequisitionDetails.id
        const weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult = await weTransitionBetweenOrdersRequisitionDetailsWeQueries.selectOne(weTransitionBetweenOrdersRequisitionDetailsWeWhereCluse)
        if (weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0] != null) {

            // Update wb transition between industries requisition Without Quantity
            callArray.push(weTransitionBetweenOrdersRequisitionQueries.update({
                date: weTransitionBetweenOrdersRequisitionDetails.date,
                note: weTransitionBetweenOrdersRequisitionDetails.note,
            },
                {
                    id: weTransitionBetweenOrdersRequisitionDetails.weTransitionBetweenWarehousesRequisitionId
                }))

            // Update wb transition between industries requisition details Without Quantity
            callArray.push(
                weTransitionBetweenOrdersRequisitionDetailsQueries.update({
                    price: weTransitionBetweenOrdersRequisitionDetails.price,
                    price_dollar: weTransitionBetweenOrdersRequisitionDetails.priceDollar,
                    fabric_piece: weTransitionBetweenOrdersRequisitionDetails.numberFabricPieces,
                    document: weTransitionBetweenOrdersRequisitionDetails.document,
                    statement: weTransitionBetweenOrdersRequisitionDetails.statement
                },
                    {
                        id: weTransitionBetweenOrdersRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waCottonResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(weTransitionBetweenOrdersRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWeRecord = await weQueries.selectOne({
                we_transition_between_orders_requisitions_details_id: weTransitionBetweenOrdersRequisitionDetails.id
            })

            if (selectOneWeRecord[0] != null) {

                const selectOldOneWeRecord = await weQueries.selectOne({
                    id: weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].we_id
                })
                if (selectOldOneWeRecord[0] != null) {

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                        const sumCurrentQuantity = selectOldOneWeRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                            await weTransitionBetweenOrdersRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: weTransitionBetweenOrdersRequisitionDetails.id
                            })

                            // Increment Wb current_quantity
                            await weQueries.update({
                                current_quantity: selectOneWeRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })


                            let currentQuantity = selectOldOneWeRecord[0].current_quantity
                            let updatedQuantity = 0

                            // decrement we CurrentQuantity
                            let returnedQuantityObj = await weService.decrementWeCurrentQuantity(defferenceQuantity, currentQuantity, selectOldOneWeRecord[0], updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4.1 => Update Quantity in we_transition_between_wh_requisition_details_we
                            updateResults = await weTransitionBetweenOrdersRequisitionDetailsWeQueries.update({
                                quantity: weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].quantity + updatedQuantity
                            }, {
                                we_transition_between_orders_requisitions_details_id: weTransitionBetweenOrdersRequisitionDetails.id,
                                we_id: weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].we_id
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
                            await weTransitionBetweenOrdersRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: weTransitionBetweenOrdersRequisitionDetails.id
                            })

                            // Decrement we current_quantity
                            await weQueries.update({
                                current_quantity: selectOneWeRecord[0].current_quantity - defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })


                            let weTransitionBetweenWarehousesRequisitionDetailsWeQuantity = weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].quantity
                            let updatedQuantity = 0

                            if (weTransitionBetweenWarehousesRequisitionDetailsWeQuantity >= defferenceQuantity) {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await weTransitionBetweenOrdersRequisitionDetailsWeQueries.update({
                                    quantity: weTransitionBetweenWarehousesRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_transition_between_orders_requisitions_details_id: weTransitionBetweenOrdersRequisitionDetails.id,
                                    we_id: weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].we_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await weTransitionBetweenOrdersRequisitionDetailsWeQueries.update({
                                    quantity: 0
                                }, {
                                    we_transition_between_orders_requisitions_details_id: weTransitionBetweenOrdersRequisitionDetails.id,
                                    we_id: weTransitionBetweenOrdersRequisitionDetailsWeSelectOneResult[0].we_id
                                })
                                updatedQuantity = weTransitionBetweenWarehousesRequisitionDetailsWeQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - weTransitionBetweenWarehousesRequisitionDetailsWeQuantity).toFixed(3))
                            }

                            const oldCurrentQuantity = selectOldOneWeRecord[0].current_quantity

                            // Increment wb current_quantity
                            updateResults = await weQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: selectOldOneWeRecord[0].id
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
