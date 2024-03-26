// Queries
const weTransitionBetweenWHRequisitionDetailsWeQueries = require("../../db/queries/we/we-transition-between-wh-requisition-details-we");
const weTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/we/we-transition-between-wh-requisition-details");
const weTransitionBetweenWHRequisitionQueries = require("../../db/queries/we/we-transition-between-wh-requisition");
const weQueries = require("../../db/queries/we/we");
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const weTransitionBetweenWHRequisitionDetailsWeService = require("./we-transition-between-wh-requisition-details-we");
const weService = require("./we");
const { weTransitionBetweenWHRequisitionDetailsTableName,
    weTransitionBetweenWHRequisitionDetailsWeTableName,
    weTableName
} = require("../../util/database-tables-name");

exports.create = async (weTransitionBetweenWHRequisitionDetails) => {

    for (let i = 0; i < weTransitionBetweenWHRequisitionDetails.items.length; i++) {
        weTransitionBetweenWHRequisitionDetails.weId = trans.transform();

        weTransitionBetweenWHRequisitionDetails.items[i].weTransitionBetweenWHRequisitionDetailsId = trans.transform();

        // Check Consigment Dyeing Dupplication
        const selectConsigmentDyeingOneResult = await consigmentDyeingQueries.selectOne({ number: weTransitionBetweenWHRequisitionDetails.items[i].newConsigmentDyeingNumber })
        if (Array.isArray(selectConsigmentDyeingOneResult ) && selectConsigmentDyeingOneResult.length > 0) {
            weTransitionBetweenWHRequisitionDetails.items[i].consigmentDyeingId = selectConsigmentDyeingOneResult[0].id;
        } else {
            weTransitionBetweenWHRequisitionDetails.items[i].consigmentDyeingId = trans.transform();
            await consigmentDyeingQueries.insertForTransitionBetween(weTransitionBetweenWHRequisitionDetails, weTransitionBetweenWHRequisitionDetails.items[i]);
        }

        const results = await weTransitionBetweenWHRequisitionDetailsQueries.insert(weTransitionBetweenWHRequisitionDetails, weTransitionBetweenWHRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(weTransitionBetweenWHRequisitionDetails.items[i].quantity)

            // select we for decrement current quantity
            let weWhereCluse = {}
            weWhereCluse[`${weTableName}.id`] = weTransitionBetweenWHRequisitionDetails.items[i].weId
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
                    weTransitionBetweenWHRequisitionDetails.items[i].weId = fabricStoredInWe.id
                    weTransitionBetweenWHRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add we Transition Between Industries Requisition Details wb
                    await weTransitionBetweenWHRequisitionDetailsWeService.create(weTransitionBetweenWHRequisitionDetails, weTransitionBetweenWHRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert we
                await weQueries.insertForTransitionBetweenWHRequisition(weTransitionBetweenWHRequisitionDetails, weTransitionBetweenWHRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: weTransitionBetweenWHRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weTransitionBetweenWHRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`] = requisitionId;
        whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
        const results = await weTransitionBetweenWHRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weTransitionBetweenWHRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.id`] = weTransitionBetweenWHRequisitionDetails.id;
    whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weTransitionBetweenWHRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false
        weTransitionBetweenWHRequisitionDetails.weTransitionBetweenWarehousesRequisitionId = isFound[0].we_transition_between_wh_requisitions_id

        let weTransitionBetweenWHRequisitionDetailsWeWhereCluse = {}
        weTransitionBetweenWHRequisitionDetailsWeWhereCluse[`${weTransitionBetweenWHRequisitionDetailsWeTableName}.we_transition_between_wh_requisitions_details_id`] = weTransitionBetweenWHRequisitionDetails.id
        const weTransitionBetweenWHRequisitionDetailsWeSelectOneResult = await weTransitionBetweenWHRequisitionDetailsWeQueries.selectOne(weTransitionBetweenWHRequisitionDetailsWeWhereCluse)
        if (weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0] != null) {

            // Update wb transition between industries requisition Without Quantity
            callArray.push(weTransitionBetweenWHRequisitionQueries.update({
                date: weTransitionBetweenWHRequisitionDetails.date,
                note: weTransitionBetweenWHRequisitionDetails.note,
            },
                {
                    id: weTransitionBetweenWHRequisitionDetails.weTransitionBetweenWarehousesRequisitionId
                }))

            // Update wb transition between industries requisition details Without Quantity
            callArray.push(
                weTransitionBetweenWHRequisitionDetailsQueries.update({
                    price: weTransitionBetweenWHRequisitionDetails.price,
                    price_dollar: weTransitionBetweenWHRequisitionDetails.priceDollar,
                    color_code: weTransitionBetweenWHRequisitionDetails.colorCode,
                    fabric_piece: weTransitionBetweenWHRequisitionDetails.numberFabricPieces,
                    document: weTransitionBetweenWHRequisitionDetails.document,
                    statement: weTransitionBetweenWHRequisitionDetails.statement
                },
                    {
                        id: weTransitionBetweenWHRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waCottonResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(weTransitionBetweenWHRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWeRecord = await weQueries.selectOne({
                we_transition_between_wh_requisitions_details_id: weTransitionBetweenWHRequisitionDetails.id
            })

            if (selectOneWeRecord[0] != null) {

                const selectOldOneWeRecord = await weQueries.selectOne({
                    id: weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].we_id
                })
                if (selectOldOneWeRecord[0] != null) {

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                        const sumCurrentQuantity = selectOldOneWeRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                            await weTransitionBetweenWHRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: weTransitionBetweenWHRequisitionDetails.id
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
                            updateResults = await weTransitionBetweenWHRequisitionDetailsWeQueries.update({
                                quantity: weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].quantity + updatedQuantity
                            }, {
                                we_transition_between_wh_requisitions_details_id: weTransitionBetweenWHRequisitionDetails.id,
                                we_id: weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].we_id
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
                            await weTransitionBetweenWHRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: weTransitionBetweenWHRequisitionDetails.id
                            })

                            // Decrement we current_quantity
                            await weQueries.update({
                                current_quantity: selectOneWeRecord[0].current_quantity - defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })


                            let weTransitionBetweenWarehousesRequisitionDetailsWeQuantity = weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].quantity
                            let updatedQuantity = 0

                            if (weTransitionBetweenWarehousesRequisitionDetailsWeQuantity >= defferenceQuantity) {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await weTransitionBetweenWHRequisitionDetailsWeQueries.update({
                                    quantity: weTransitionBetweenWarehousesRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_transition_between_wh_requisitions_details_id: weTransitionBetweenWHRequisitionDetails.id,
                                    we_id: weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].we_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await weTransitionBetweenWHRequisitionDetailsWeQueries.update({
                                    quantity: 0
                                }, {
                                    we_transition_between_wh_requisitions_details_id: weTransitionBetweenWHRequisitionDetails.id,
                                    we_id: weTransitionBetweenWHRequisitionDetailsWeSelectOneResult[0].we_id
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
