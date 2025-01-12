// Queries
const wdTransitionBetweenDyersRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition-details-wd");
const wdTransitionBetweenDyersRequisitionDetailsQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition-details");
const wdTransitionBetweenDyersRequisitionQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition");
const wdQueries = require("../../db/queries/wd/wd");

// Services
const wdTransitionBetweenDyersRequisitionDetailsWdService = require("./wd-transition-between-dyers-requisition-details-wd");
const wdService = require("./wd");
const wcFabricOrderRequisitionDetailsService = require("../wc/wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wdTransitionBetweenDyersRequisitionDetailsTableName, 
    wdTransitionBetweenDyersRequisitionDetailsWdTableName, 
    wcFabricOrderRequisitionDetailsTableName 
} = require("../../util/database-tables-name");

exports.create = async (wdTransitionBetweenDyersRequisitionDetails) => {

    for (let i = 0; i < wdTransitionBetweenDyersRequisitionDetails.items.length; i++) {
        wdTransitionBetweenDyersRequisitionDetails.wdId = trans.transform();
        wdTransitionBetweenDyersRequisitionDetails.items[i].wdTransitionBetweenDyersRequisitionDetailsId = trans.transform();

        // Get fabric order requisitions details id
        let fabricOrderRequisitionDetailsWhereCluse = {};
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = wdTransitionBetweenDyersRequisitionDetails.items[i].fabricOrderId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wdTransitionBetweenDyersRequisitionDetails.items[i].fabricId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            wdTransitionBetweenDyersRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = selectFabricOrderRequisitionDetailsResult[0].id

        const results = await wdTransitionBetweenDyersRequisitionDetailsQueries.insert(wdTransitionBetweenDyersRequisitionDetails, wdTransitionBetweenDyersRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wdTransitionBetweenDyersRequisitionDetails.items[i].quantity)

            // select wd for decrement current quantity
            const fabricsStoredInWdResult = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                wdTransitionBetweenDyersRequisitionDetails.fromDyeingId,
                wdTransitionBetweenDyersRequisitionDetails.items[i].fabricId,
                wdTransitionBetweenDyersRequisitionDetails.items[i].consigmentDyeingId,
                wdTransitionBetweenDyersRequisitionDetails.items[i].fabricOrderId
            )
            if (fabricsStoredInWdResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWdResult.length; j++) {
                    const fabricStoredInWd = fabricsStoredInWdResult[j];
                    let currentQuantity = fabricStoredInWd.current_quantity
                    let updatedQuantity = 0

                    // decrement wd CurrentQuantity
                    let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWd, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wdTransitionBetweenDyersRequisitionDetails.items[i].wdId = fabricStoredInWd.id
                    wdTransitionBetweenDyersRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add wd Transition Between Dyers Requisition Details wd
                    await wdTransitionBetweenDyersRequisitionDetailsWdService.create(wdTransitionBetweenDyersRequisitionDetails, wdTransitionBetweenDyersRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert wd
                await wdQueries.insertForTransitionBetween(wdTransitionBetweenDyersRequisitionDetails, wdTransitionBetweenDyersRequisitionDetails.items[i])
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
    }
    return { ...constants.insertSuccess, ...{ id: wdTransitionBetweenDyersRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdTransitionBetweenDyersRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        const results = await wdTransitionBetweenDyersRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wdTransitionBetweenDyersRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`] = wdTransitionBetweenDyersRequisitionDetails.id;
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdTransitionBetweenDyersRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdTransitionBetweenDyersRequisitionDetails.wdTransitionBetweenDyersRequisitionId = isFound[0].wd_transition_between_dyers_requisition_id

        // Update wb transition between dyers requisition Without Quantity
        callArray.push(wdTransitionBetweenDyersRequisitionQueries.update({
            date: wdTransitionBetweenDyersRequisitionDetails.date,
            note: wdTransitionBetweenDyersRequisitionDetails.note
        },
            {
                id: wdTransitionBetweenDyersRequisitionDetails.wdTransitionBetweenDyersRequisitionId
            }))

        // Update wb transition between dyers requisition details Without Quantity
        callArray.push(
            wdTransitionBetweenDyersRequisitionDetailsQueries.update({
                price: wdTransitionBetweenDyersRequisitionDetails.price,
                price_dollar: wdTransitionBetweenDyersRequisitionDetails.priceDollar,
                document: wdTransitionBetweenDyersRequisitionDetails.document,
                statement: wdTransitionBetweenDyersRequisitionDetails.statement
            },
                {
                    id: wdTransitionBetweenDyersRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wdTransitionBetweenDyersRequisitionDetails.quantity)
        let defferenceQuantity = 0

        const selectOneWdRecord = await wdQueries.selectOne({
            wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.id
        })

        if (selectOneWdRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wd) by following Steps :
                // Step 1 => Check If has current quantity in store (wd)
                const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
                    isFound[0].dyeing_id,
                    isFound[0].fabric_id,
                    isFound[0].consigment_dyeing_id,
                    isFound[0].wc_fabric_order_requisition_id
                )
                if (sumCurrentQuantityWd[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wd_transition_between_dyers_requisition_details
                        await wdTransitionBetweenDyersRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wdTransitionBetweenDyersRequisitionDetails.id
                        })

                        // Step 3 => select from (wd) Records for decrement current quantity
                        const wdRecords = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                            isFound[0].dyeing_id,
                            isFound[0].fabric_id,
                            isFound[0].consigment_dyeing_id,
                            isFound[0].wc_fabric_order_requisition_id
                        )
                        if (wdRecords[0] != null) {

                            // Increment Wb current_quantity
                            await wdQueries.update({
                                current_quantity: selectOneWdRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWdRecord[0].id
                            })

                            for (let i = 0; i < wdRecords.length; i++) {
                                const wdRecord = wdRecords[i];
                                let currentQuantity = wdRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement wd CurrentQuantity
                                let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(defferenceQuantity, currentQuantity, wdRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wd_id existed in wd_transition_between_dyers_requisition_details_wd
                                // that has same wd_transition_between_dyers_requisition_details_id
                                const isExisitId = await wdTransitionBetweenDyersRequisitionDetailsWdService.select({
                                    wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.id,
                                    wd_id: wdRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wd_transition_between_dyers_requisition_details_wd
                                    updateResults = await wdTransitionBetweenDyersRequisitionDetailsWdQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.id,
                                        wd_id: isExisitId[0].wd_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wd_transition_between_dyers_requisition_details_wd
                                    updateResults = await wdTransitionBetweenDyersRequisitionDetailsWdService.create(wdTransitionBetweenDyersRequisitionDetails, {
                                        wdTransitionBetweenDyersRequisitionDetailsId: wdTransitionBetweenDyersRequisitionDetails.id,
                                        wdId: wdRecord.id,
                                        updatedQuantity
                                    })
                                }

                                // Enter to if condition when stock runs out
                                if (defferenceQuantity == 0) {
                                    break;
                                }
                            }
                        } else {
                            updateResults = false
                        }
                    } else {
                        return {
                            ...constants.wrongQuantity,
                            spentQuantity: sumCurrentQuantity,
                            newQuantity: defferenceQuantity
                        }
                    }
                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: 0,
                        newQuantity: defferenceQuantity
                    }
                }

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                if (selectOneWdRecord[0].current_quantity >= defferenceQuantity) {

                    // Step 1 => Decrement quantity in  wd_transition_between_dyers_requisition_details
                    await wdTransitionBetweenDyersRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wdTransitionBetweenDyersRequisitionDetails.id
                    })

                    // Decrement wb current_quantity
                    await wdQueries.update({
                        current_quantity: selectOneWdRecord[0].current_quantity - defferenceQuantity
                    }, {
                        id: selectOneWdRecord[0].id
                    })

                    // Step 2 => Select From wd_transition_between_dyers_requisition_details_wd Records
                    let whereCluseDetailsWd = {};
                    whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_transition_between_dyers_requisition_details_id`] = wdTransitionBetweenDyersRequisitionDetails.id;
                    whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.is_deleted`] = 0;
                    whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.is_active`] = 1;
                    const wdTransitionBetweenDyersRequisitionDetailsWdRecords = await wdTransitionBetweenDyersRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                        ["quantity", ">", "0"])
                    if (wdTransitionBetweenDyersRequisitionDetailsWdRecords[0] != null) {
                        for (let j = 0; j < wdTransitionBetweenDyersRequisitionDetailsWdRecords.length; j++) {
                            const wdTransitionBetweenDyersRequisitionDetailsWdRecord = wdTransitionBetweenDyersRequisitionDetailsWdRecords[j];
                            let wdTransitionBetweenDyersRequisitionDetailsWdQuantity = wdTransitionBetweenDyersRequisitionDetailsWdRecord.quantity
                            let updatedQuantity = 0

                            if (wdTransitionBetweenDyersRequisitionDetailsWdQuantity >= defferenceQuantity) {
                                // Decrement wd_transition_between_dyers_requisition_details_wd quantity
                                await wdTransitionBetweenDyersRequisitionDetailsWdQueries.update({
                                    quantity: wdTransitionBetweenDyersRequisitionDetailsWdQuantity - defferenceQuantity
                                }, {
                                    wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.id,
                                    wd_id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wd_transition_between_dyers_requisition_details_wd quantity
                                await wdTransitionBetweenDyersRequisitionDetailsWdQueries.update({
                                    quantity: 0
                                }, {
                                    wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.id,
                                    wd_id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                                })
                                updatedQuantity = wdTransitionBetweenDyersRequisitionDetailsWdQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wdTransitionBetweenDyersRequisitionDetailsWdQuantity).toFixed(3))
                            }

                            // select wd record
                            const wdRecord = await wdQueries.selectOne({
                                id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                            })
                            if (wdRecord[0] != null) {
                                const oldCurrentQuantity = wdRecord[0].current_quantity

                                // Increment wd current_quantity
                                await wdQueries.update({
                                    current_quantity: oldCurrentQuantity + updatedQuantity
                                }, {
                                    id: wdRecord[0].id
                                })
                            }

                            if (defferenceQuantity == 0) {
                                updateResults = true
                                break;
                            }
                        }

                    } else {
                        updateResults = false
                    }
                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: selectOneWdRecord[0].current_quantity,
                        newQuantity: defferenceQuantity
                    }
                }
            } else {
                updateResults = true
            }
        }
        if (updateResults) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }

    } else {
        return constants.itemNotFound;
    }
};


exports.updateDecrement = async (wdTransitionBetweenDyersRequisitionDetails) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`] = wdTransitionBetweenDyersRequisitionDetails.requisition_details_id;
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdTransitionBetweenDyersRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdRecord.fromDyeingId = isFound[0].dyeing_id

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wdTransitionBetweenDyersRequisitionDetails.quantity)
        let defferenceQuantity = 0

        defferenceQuantity = newQuantity

        // Step 1 => Decrement quantity in  wd_transition_between_dyers_requisition_details
        await wdTransitionBetweenDyersRequisitionDetailsQueries.update({
            quantity: oldQuantity - defferenceQuantity
        }, {
            id: wdTransitionBetweenDyersRequisitionDetails.requisition_details_id
        })

        // Decrement wd current_quantity
        await wdQueries.update({
            current_quantity: selectOneWdRecord[0].current_quantity - defferenceQuantity
        }, {
            id: selectOneWdRecord[0].id
        })

        // Step 2 => Select From wd_transition_between_dyers_requisition_details_wd Records
        let whereCluseDetailsWd = {};
        whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_transition_between_dyers_requisition_details_id`] = wdTransitionBetweenDyersRequisitionDetails.requisition_details_id;
        whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.is_deleted`] = 0;
        whereCluseDetailsWd[`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.is_active`] = 1;
        const wdTransitionBetweenDyersRequisitionDetailsWdRecords = await wdTransitionBetweenDyersRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
            ["quantity", ">", "0"])
        if (wdTransitionBetweenDyersRequisitionDetailsWdRecords[0] != null) {
            for (let j = 0; j < wdTransitionBetweenDyersRequisitionDetailsWdRecords.length; j++) {
                const wdTransitionBetweenDyersRequisitionDetailsWdRecord = wdTransitionBetweenDyersRequisitionDetailsWdRecords[j];
                let wdTransitionBetweenDyersRequisitionDetailsWdQuantity = wdTransitionBetweenDyersRequisitionDetailsWdRecord.quantity
                let updatedQuantity = 0

                if (wdTransitionBetweenDyersRequisitionDetailsWdQuantity >= defferenceQuantity) {
                    // Decrement wd_transition_between_dyers_requisition_details_wd quantity
                    await wdTransitionBetweenDyersRequisitionDetailsWdQueries.update({
                        quantity: wdTransitionBetweenDyersRequisitionDetailsWdQuantity - defferenceQuantity
                    }, {
                        wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.requisition_details_id,
                        wd_id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                    })
                    updatedQuantity = defferenceQuantity
                    defferenceQuantity = 0
                } else {
                    // Decrement wd_transition_between_dyers_requisition_details_wd quantity
                    await wdTransitionBetweenDyersRequisitionDetailsWdQueries.update({
                        quantity: 0
                    }, {
                        wd_transition_between_dyers_requisition_details_id: wdTransitionBetweenDyersRequisitionDetails.requisition_details_id,
                        wd_id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                    })
                    updatedQuantity = wdTransitionBetweenDyersRequisitionDetailsWdQuantity
                    defferenceQuantity = parseFloat((defferenceQuantity - wdTransitionBetweenDyersRequisitionDetailsWdQuantity).toFixed(3))
                }

                // select wd record
                const wdRecord = await wdQueries.selectOne({
                    id: wdTransitionBetweenDyersRequisitionDetailsWdRecord.wd_id
                })
                if (wdRecord[0] != null) {
                    const oldCurrentQuantity = wdRecord[0].current_quantity

                    // Increment wd current_quantity
                    await wdQueries.update({
                        current_quantity: oldCurrentQuantity + updatedQuantity
                    }, {
                        id: wdRecord[0].id
                    })
                }

                if (defferenceQuantity == 0) {
                    updateResults = true
                    break;
                }
            }

        } else {
            updateResults = false
        }

        if (updateResults) {
            return updateResults;
        } else {
            return updateResults;
        }

    } else {
        return updateResults;
    }
};