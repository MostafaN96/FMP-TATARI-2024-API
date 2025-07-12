// Queries
const weSellRequisitionDetailsQueries = require("../../db/queries/we/we-sell-requisition-details");
const weSellRequisitionQueries = require("../../db/queries/we/we-sell-requisition");
const weSellRequisitionDetailsWeQueries = require("../../db/queries/we/we-sell-requisition-details-we");
const weSellRequisitionDirectDetailsQueries = require("../../db/queries/we/we-sell-requisition-direct-details");
const weSellRequisitionDirectQueries = require("../../db/queries/we/we-sell-requisition-direct");
const weQueries = require("../../db/queries/we/we");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");

// Services
const weService = require("./we");
const weSellRequisitionDetailsWeService = require("./we-sell-requisition-details-we");
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weSellRequisitionDetailsTableName,
    weSellRequisitionDetailsWeTableName,
    weTableName,
    weAddRequisitionDetailsTableName,
    weReconciliationRequisitionDetailsTableName,
    wdDyeingRequisitionDetailsTableName,
    anointedColorsPricesTableName,
    weTransitionBetweenWHRequisitionDetailsTableName,
    weExecuteOrderRequisitionDetailsTableName,
    weReturnSellRequisitionDetailsTableName,
    wdDyeingRequisitionTableName,
    weTransitionBetweenWHRequisitionTableName,
    weExecuteOrderRequisitionTableName,
    weDyedFabricOrderRequisitionDetailsTableName,
    weTransitionBetweenOrdersRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (weSellRequisitionDetails) => {
    for (let i = 0; i < weSellRequisitionDetails.items.length; i++) {
        weSellRequisitionDetails.items[i].weSellRequisitionDetailsId = trans.transform();

        // Get we fabric order by order requisition id
        let weDyedFabricOrderRequisitionDetailsWhereCluse = {};
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        // weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = weSellRequisitionDetails.items[i].ordersRequisitionsId;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;

        const selectWeDyedFabricOrderRequisitionDetailsResult = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(weDyedFabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectWeDyedFabricOrderRequisitionDetailsResult) && selectWeDyedFabricOrderRequisitionDetailsResult.length > 0) {
            weSellRequisitionDetails.items[i].weDyedFabricOrderRequisitionDetailsId = selectWeDyedFabricOrderRequisitionDetailsResult[0].id

            const results = await weSellRequisitionDetailsQueries.insert(weSellRequisitionDetails, weSellRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(weSellRequisitionDetails.items[i].quantity)

                // select we for decrement current quantity
                let weWhereCluse = {}
                weWhereCluse[`${weTableName}.id`] = weSellRequisitionDetails.items[i].weId
                const fabricsStoredInWeResult = await weQueries.selectOne(weWhereCluse)
                if (fabricsStoredInWeResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWeResult.length; j++) {
                        const fabricStoredInWe = fabricsStoredInWeResult[j];
                        let currentQuantity = fabricStoredInWe.current_quantity
                        let updatedQuantity = 0

                        // decrement we fabric CurrentQuantity
                        let returnedQuantityObj = await weService.decrementWeCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        weSellRequisitionDetails.items[i].weId = fabricStoredInWe.id
                        weSellRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add we Sell Requisition Details we
                        await weSellRequisitionDetailsWeService.create(weSellRequisitionDetails, weSellRequisitionDetails.items[i])

                        // update order quantity
                        await weDyedFabricOrderRequisitionDetailsService.updateForDecrementQuantity(selectWeDyedFabricOrderRequisitionDetailsResult[0].id, updatedQuantity)

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }
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
    return { ...constants.insertSuccess, ...{ id: weSellRequisitionDetails.id } };
};

exports.createForConfirmDirect = async (weSellRequisitionDetails) => {
    for (let i = 0; i < weSellRequisitionDetails.items.length; i++) {

        weSellRequisitionDetails.items[i].weSellRequisitionDetailsId = trans.transform();

        const results = await weSellRequisitionDetailsQueries.insert(weSellRequisitionDetails, weSellRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(weSellRequisitionDetails.items[i].quantity)

            // select we for decrement current quantity
            let whereCluse = {};
            whereCluse[`${weAddRequisitionDetailsTableName}.warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            whereCluse[`${weAddRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            whereCluse[`${weAddRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            whereCluse[`${weTableName}.is_deleted`] = 0;
            whereCluse[`${weTableName}.is_active`] = 1;

            let reconciliationWhereCluse = {};
            reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
            reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
            reconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
            reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

            let dyeingWhereCluse = {};
            dyeingWhereCluse[`${wdDyeingRequisitionTableName}.warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            dyeingWhereCluse[`${anointedColorsPricesTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
            dyeingWhereCluse[`${weTableName}.is_active`] = 1;
            dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

            let transitionBetweenWhWhereCluse = {};
            transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
            transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;

            let returnSellWhereCluse = {};
            returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
            returnSellWhereCluse[`${weTableName}.is_active`] = 1;

            let transitionBetweenOrderWhereCluse = {};
            transitionBetweenOrderWhereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = weSellRequisitionDetails.items[i].warehouseId;
            transitionBetweenOrderWhereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = weSellRequisitionDetails.items[i].dyedFabricId;
            transitionBetweenOrderWhereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`] = weSellRequisitionDetails.items[i].workOrderNumber;
            transitionBetweenOrderWhereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`] = weSellRequisitionDetails.items[i].colorId;
            transitionBetweenOrderWhereCluse[`${weTableName}.is_deleted`] = 0;
            transitionBetweenOrderWhereCluse[`${weTableName}.is_active`] = 1;

            let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
            let whereCluseArray = [
                whereCluse, reconciliationWhereCluse, andWhereCluse,
                dyeingWhereCluse, transitionBetweenWhWhereCluse,
                returnSellWhereCluse, transitionBetweenOrderWhereCluse
            ]
            let orderByCluse = { attributeName: `date`, value: "desc" }

            // let weWhereCluse = {}
            // weWhereCluse[`${weTableName}.id`] = weSellRequisitionDetails.items[i].weId
            // console.log("weSellRequisitionDetails.items[i].weId ::: ", weSellRequisitionDetails.items[i].weId);
            const fabricsStoredInWeResult = await weQueries.selectStoreWe(whereCluseArray, orderByCluse)
            if (fabricsStoredInWeResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWeResult.length; j++) {
                    const fabricStoredInWe = fabricsStoredInWeResult[j];
                    let currentQuantity = fabricStoredInWe.current_quantity
                    let updatedQuantity = 0

                    // decrement we fabric CurrentQuantity
                    let returnedQuantityObj = await weService.decrementWeCurrentQuantityDirect(newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    weSellRequisitionDetails.items[i].weId = fabricStoredInWe.we_id
                    weSellRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add we Sell Requisition Details we
                    await weSellRequisitionDetailsWeService.create(weSellRequisitionDetails, weSellRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
        // Update Sell Requisition Direct Details
        await weSellRequisitionDirectDetailsQueries.update({
            is_direct: '0'
        }, {
            id: weSellRequisitionDetails.items[i].weSellRequisitionDirectDetailsId
        })
    }
    // Update Sell Requisition 
    await weSellRequisitionDirectQueries.update({
        is_direct: '0'
    }, {
        id: weSellRequisitionDetails.id
    })

    return { ...constants.insertSuccess, ...{ id: weSellRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weSellRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await weSellRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weSellRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weSellRequisitionDetailsTableName}.id`] = weSellRequisitionDetails.id;
    whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weSellRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let weSellRequisitionDetailsWeWhereCluse = {}
        weSellRequisitionDetailsWeWhereCluse[`${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`] = weSellRequisitionDetails.id
        const weSellRequisitionDetailsWeSelectOneResult = await weSellRequisitionDetailsWeQueries.selectOne(weSellRequisitionDetailsWeWhereCluse)
        if (weSellRequisitionDetailsWeSelectOneResult[0] != null) {
            weSellRequisitionDetails.weSellRequisitionId = isFound[0].we_sell_requisition_id

            // Update we sell requisition Without Quantity
            callArray.push(weSellRequisitionQueries.update({
                delivery_car_id: weSellRequisitionDetails.deliveryCarId,
                date: weSellRequisitionDetails.date,
                note: weSellRequisitionDetails.note,
            },
                {
                    id: weSellRequisitionDetails.weSellRequisitionId
                }))


            // Update we sell requisition details Without Quantity
            callArray.push(
                weSellRequisitionDetailsQueries.update({
                    price: weSellRequisitionDetails.price,
                    price_dollar: weSellRequisitionDetails.priceDollar,
                    fabric_piece: weSellRequisitionDetails.numberFabricPieces,
                    document: weSellRequisitionDetails.document,
                    statement: weSellRequisitionDetails.statement
                },
                    {
                        id: weSellRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let sellCurrentQuantity = isFound[0].current_quantity
            let newQuantity = parseFloat(weSellRequisitionDetails.quantity)
            let defferenceQuantity = 0

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wc fabric) by following Steps :
                // Step 1 => Check If has current quantity in store (wc fabric)
                let weWhereCluse = {}
                weWhereCluse[`${weTableName}.id`] = weSellRequisitionDetailsWeSelectOneResult[0].we_id
                const selectCurrentQuantityWe = await weQueries.selectOne(weWhereCluse)
                if (selectCurrentQuantityWe[0] != null) {
                    const currentQuantityWe = selectCurrentQuantityWe[0].current_quantity
                    if (currentQuantityWe >= defferenceQuantity) {

                        // update order quantity
                        await weDyedFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                        // Step 2 => Increment quantity in  we_sell_requisition_details
                        await weSellRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity,
                            current_quantity: sellCurrentQuantity + defferenceQuantity
                        }, {
                            id: weSellRequisitionDetails.id
                        })

                        // Step 3 => select from (WE) Records for decrement current quantity
                        let weRecordWhereCluse = {}
                        weRecordWhereCluse[`${weTableName}.id`] = weSellRequisitionDetailsWeSelectOneResult[0].we_id
                        const weRecords = await weQueries.selectOne(weRecordWhereCluse)
                        if (weRecords[0] != null) {
                            console.log("weRecords ::: ", weRecords);
                            for (let i = 0; i < weRecords.length; i++) {
                                const weRecord = weRecords[i];
                                let currentQuantity = weRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement we CurrentQuantity
                                let returnedQuantityObj = await weService.decrementWeCurrentQuantity(defferenceQuantity, currentQuantity, weRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if we_id existed in we_sell_requisition_details_we
                                // that has same we_sell_requisition_details_id
                                const isExisitId = await weSellRequisitionDetailsWeService.select({
                                    we_sell_requisition_details_id: weSellRequisitionDetails.id,
                                    we_id: weRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in we_sell_requisition_details_we
                                    updateResults = await weSellRequisitionDetailsWeQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        we_sell_requisition_details_id: weSellRequisitionDetails.id,
                                        we_id: isExisitId[0].we_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in we_sell_requisition_details_we
                                    updateResults = await weSellRequisitionDetailsWeService.create(weSellRequisitionDetails, {
                                        weSellRequisitionDetailsId: weSellRequisitionDetails.id,
                                        weId: weRecord.id,
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
                            spentQuantity: currentQuantityWe,
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

                if (sellCurrentQuantity >= defferenceQuantity) {

                    // update order quantity
                    await weDyedFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                    // Step 1 => Decrement quantity in  we_sell_requisition_details
                    await weSellRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity,
                        current_quantity: sellCurrentQuantity - defferenceQuantity
                    }, {
                        id: weSellRequisitionDetails.id
                    })

                    // Step 2 => Select From we_sell_requisition_details_we Records
                    let whereCluseDetailsWe = {};
                    whereCluseDetailsWe[`${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`] = weSellRequisitionDetails.id;
                    whereCluseDetailsWe[`${weSellRequisitionDetailsWeTableName}.is_deleted`] = 0;
                    whereCluseDetailsWe[`${weSellRequisitionDetailsWeTableName}.is_active`] = 1;
                    const weSellRequisitionDetailsWeRecords = await weSellRequisitionDetailsWeService.selectWithTwoCondition(whereCluseDetailsWe,
                        ["quantity", ">", "0"])
                    if (weSellRequisitionDetailsWeRecords[0] != null) {
                        for (let j = 0; j < weSellRequisitionDetailsWeRecords.length; j++) {
                            const weSellRequisitionDetailsWeRecord = weSellRequisitionDetailsWeRecords[j];
                            let weSellRequisitionDetailsWeQuantity = weSellRequisitionDetailsWeRecord.quantity
                            let updatedQuantity = 0

                            if (weSellRequisitionDetailsWeQuantity >= defferenceQuantity) {
                                // Decrement we_sell_requisition_details_we quantity
                                await weSellRequisitionDetailsWeQueries.update({
                                    quantity: weSellRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_sell_requisition_details_id: weSellRequisitionDetails.id,
                                    we_id: weSellRequisitionDetailsWeRecord.we_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement we_sell_requisition_details_we quantity
                                await weSellRequisitionDetailsWeQueries.update({
                                    quantity: 0
                                }, {
                                    we_sell_requisition_details_id: weSellRequisitionDetails.id,
                                    we_id: weSellRequisitionDetailsWeRecord.we_id
                                })
                                updatedQuantity = weSellRequisitionDetailsWeQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - weSellRequisitionDetailsWeQuantity).toFixed(3))
                            }

                            // select we record
                            const weRecord = await weQueries.selectOne({
                                id: weSellRequisitionDetailsWeRecord.we_id
                            })
                            if (weRecord[0] != null) {
                                const oldCurrentQuantity = weRecord[0].current_quantity

                                // Increment we current_quantity
                                await weQueries.update({
                                    current_quantity: oldCurrentQuantity + updatedQuantity
                                }, {
                                    id: weRecord[0].id
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
                        spentQuantity: sellCurrentQuantity,
                        newQuantity: defferenceQuantity
                    }
                }


            } else {
                updateResults = true
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
        return constants.itemNotFound;
    }
};


exports.decrementWeSellRequisitionDetailsCurrentQuantity = async (newQuantity, currentQuantity, fabricStoredInSellRequisitionDetails, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await weSellRequisitionDetailsQueries.update({
            current_quantity: 0
        }, {
            id: fabricStoredInSellRequisitionDetails.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await weSellRequisitionDetailsQueries.update({
                current_quantity: 0
            }, {
                id: fabricStoredInSellRequisitionDetails.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await weSellRequisitionDetailsQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: fabricStoredInSellRequisitionDetails.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}