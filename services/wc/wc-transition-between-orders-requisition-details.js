// Queries
const wcTransitionBetweenOrdersRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition-details-wc");
const wcTransitionBetweenOrdersRequisitionDetailsQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition-details");
const wcTransitionBetweenOrdersRequisitionQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");

// Services
const wcTransitionBetweenOrdersRequisitionDetailsWcService = require("./wc-transition-between-orders-requisition-details-wc");
const wcService = require("./wc");
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcTransitionBetweenOrdersRequisitionDetailsTableName,
    wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
    wcFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wcTransitionBetweenOrdersRequisitionDetails) => {

    for (let i = 0; i < wcTransitionBetweenOrdersRequisitionDetails.items.length; i++) {
        wcTransitionBetweenOrdersRequisitionDetails.items[i].wcTransitionBetweenOrdersRequisitionDetailsId = trans.transform();
        wcTransitionBetweenOrdersRequisitionDetails.wcId = trans.transform();

        // Check Consigment Yarn Dupplication
        const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wcTransitionBetweenOrdersRequisitionDetails.items[i].newConsigmentManufacturingNumber })
        if (Array.isArray(selectConsigmentManufacturingOneResult) && selectConsigmentManufacturingOneResult.length > 0) {
            wcTransitionBetweenOrdersRequisitionDetails.items[i].consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
        } else {
            wcTransitionBetweenOrdersRequisitionDetails.items[i].consigmentManufacturingId = trans.transform();
            await consigmentManufacturingQueries.insertForWcExecuteOrder(wcTransitionBetweenOrdersRequisitionDetails, wcTransitionBetweenOrdersRequisitionDetails.items[i]);
        }

        // Get fabric order requisitions details id
        let fabricOrderRequisitionDetailsWhereCluse = {};
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = wcTransitionBetweenOrdersRequisitionDetails.fabricOrderId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse)
        // console.log("wcTransitionBetweenOrdersRequisitionDetails.fabricOrderId :::: ", wcTransitionBetweenOrdersRequisitionDetails.fabricOrderId);
        // console.log("wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId :::: ", wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId);
        // console.log("selectFabricOrderRequisitionDetailsResult :::: ", selectFabricOrderRequisitionDetailsResult);
        
        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            wcTransitionBetweenOrdersRequisitionDetails.items[i].toWcFabricOrderRequisitionDetailsId = selectFabricOrderRequisitionDetailsResult[0].id

        // Get fabric order requisitions details id
        let fromFabricOrderRequisitionDetailsWhereCluse = {};
        fromFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = wcTransitionBetweenOrdersRequisitionDetails.items[i].fromFabricOrderId;
        fromFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId;
        fromFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fromFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFromFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fromFabricOrderRequisitionDetailsWhereCluse)
            //    console.log("wcTransitionBetweenOrdersRequisitionDetails.items[i].fromFabricOrderId :::: ", wcTransitionBetweenOrdersRequisitionDetails.items[i].fromFabricOrderId);
            //    console.log("wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId :::: ", wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId);
            //    console.log("selectFromFabricOrderRequisitionDetailsResult :::: ", selectFromFabricOrderRequisitionDetailsResult);

        if (Array.isArray(selectFromFabricOrderRequisitionDetailsResult) && selectFromFabricOrderRequisitionDetailsResult.length > 0) {
            wcTransitionBetweenOrdersRequisitionDetails.items[i].fromWcFabricOrderRequisitionDetailsId = selectFromFabricOrderRequisitionDetailsResult[0].id

        const results = await wcTransitionBetweenOrdersRequisitionDetailsQueries.insert(wcTransitionBetweenOrdersRequisitionDetails, wcTransitionBetweenOrdersRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wcTransitionBetweenOrdersRequisitionDetails.items[i].quantity)

            // select Wc fabric for decrement current quantity
            const fabricsStoredInWcResult = await wcService.selectByFabricForSell(
                wcTransitionBetweenOrdersRequisitionDetails.items[i].warehouseId, 
                wcTransitionBetweenOrdersRequisitionDetails.items[i].fabricId, 
                wcTransitionBetweenOrdersRequisitionDetails.items[i].fromConsigmentManufacturingId,
                wcTransitionBetweenOrdersRequisitionDetails.items[i].fromFabricOrderId
            )
            if (fabricsStoredInWcResult[0] != null) {
                // console.log("fabricsStoredInWcResult ::::::::::::::::::::::: ", fabricsStoredInWcResult);
                

                for (let j = 0; j < fabricsStoredInWcResult.length; j++) {
                    const fabricStoredInWc = fabricsStoredInWcResult[j];
                    let currentQuantity = fabricStoredInWc.current_quantity
                    let updatedQuantity = 0

                    // decrement Wc fabric CurrentQuantity
                    let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wcTransitionBetweenOrdersRequisitionDetails.items[i].wcId = fabricStoredInWc.id
                    wcTransitionBetweenOrdersRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add Wc fabric transition between wh Requisition Details Wc
                    await wcTransitionBetweenOrdersRequisitionDetailsWcService.create(wcTransitionBetweenOrdersRequisitionDetails, wcTransitionBetweenOrdersRequisitionDetails.items[i])

                    // update order quantity
                    await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(selectFabricOrderRequisitionDetailsResult[0].id, updatedQuantity)

                    // update order quantity
                    await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(wcTransitionBetweenOrdersRequisitionDetails.items[i].fromWcFabricOrderRequisitionDetailsId, updatedQuantity)

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert WB
                await wcQueries.insertForTransitionBetweenOrdersRequisition(wcTransitionBetweenOrdersRequisitionDetails, wcTransitionBetweenOrdersRequisitionDetails.items[i])
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
    return { ...constants.insertSuccess, ...{ id: wcTransitionBetweenOrdersRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcTransitionBetweenOrdersRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`] = requisitionId;
        whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
        const results = await wcTransitionBetweenOrdersRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcTransitionBetweenOrdersRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`] = wcTransitionBetweenOrdersRequisitionDetails.id;
    whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcTransitionBetweenOrdersRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

            wcTransitionBetweenOrdersRequisitionDetails.wcTransitionBetweenOrdersRequisitionsId = isFound[0].wc_transition_between_orders_requisitions_id

            let waTransitionBetweenOrdersRequisitionDetailsWaWhereCluse = {}
        waTransitionBetweenOrdersRequisitionDetailsWaWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`] = wcTransitionBetweenOrdersRequisitionDetails.id
        const wcTransitionBetweenOrdersRequisitionDetailsWcSelectOneResult = await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.selectOne(waTransitionBetweenOrdersRequisitionDetailsWaWhereCluse)
        if (wcTransitionBetweenOrdersRequisitionDetailsWcSelectOneResult[0] != null) {

            // Update wc fabric transition between wh requisition Without Quantity
            callArray.push(wcTransitionBetweenOrdersRequisitionQueries.update({
                date: wcTransitionBetweenOrdersRequisitionDetails.date,
                note: wcTransitionBetweenOrdersRequisitionDetails.note
            },
                {
                    id: wcTransitionBetweenOrdersRequisitionDetails.wcTransitionBetweenOrdersRequisitionsId
                }))


            // Update wc fabric transition between wh requisition details Without Quantity
            callArray.push(
                wcTransitionBetweenOrdersRequisitionDetailsQueries.update({
                    price: wcTransitionBetweenOrdersRequisitionDetails.price,
                    price_dollar: wcTransitionBetweenOrdersRequisitionDetails.priceDollar,
                    fabric_piece: wcTransitionBetweenOrdersRequisitionDetails.numberFabricPieces,
                    document: wcTransitionBetweenOrdersRequisitionDetails.document,
                    statement: wcTransitionBetweenOrdersRequisitionDetails.statement
                },
                    {
                        id: wcTransitionBetweenOrdersRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(wcTransitionBetweenOrdersRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWaRecord = await wcQueries.selectOne({
                wc_transition_between_orders_requisitions_details_id: wcTransitionBetweenOrdersRequisitionDetails.id
            })

            if (selectOneWaRecord[0] != null) {

                const selectOldOneWaRecord = await wcQueries.selectOne({
                    id: wcTransitionBetweenOrdersRequisitionDetailsWcSelectOneResult[0].wc_id
                })
                if (selectOldOneWaRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                const sumCurrentQuantity = selectOldOneWaRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                // we will decrement current quantity from store (wa yarn) by following Steps :
                // Step 1 => Check If has current quantity in store (wa yarn)
                const sumCurrentQuantityWc = await wcService.selectSumCurrentQuantityByWarehouseByFabricByConsigmentManufacturingLotWc(
                    isFound[0].warehouse_id, 
                    isFound[0].fabric_id, 
                    isFound[0].from_consigment_manufacturing_id,
                    isFound[0].from_wc_fabric_order_requisition_id
                    )
                if(sumCurrentQuantityWc[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWc[0].current_quantity
                    if(sumCurrentQuantity >= defferenceQuantity) {
    
                        // Step 2 => Increment quantity in  wa_sell_requisition_details
                        await wcTransitionBetweenOrdersRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wcTransitionBetweenOrdersRequisitionDetails.id
                        })

                        // Increment wc current_quantity
                        await wcQueries.update({
                            current_quantity: selectOneWaRecord[0].current_quantity + defferenceQuantity
                        }, {
                            id: selectOneWaRecord[0].id
                        })

                        // update order quantity
                        await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                        // update order quantity
                        await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].from_wc_fabric_order_requisition_details_id, defferenceQuantity)

    
                        // Step 3 => select from (WA yarn) Records for decrement current quantity
                        const wcRecords = await wcService.selectByFabricForSell(
                            isFound[0].warehouse_id, 
                            isFound[0].fabric_id, 
                            isFound[0].from_consigment_manufacturing_id,
                            isFound[0].from_wc_fabric_order_requisition_id
                            )
                        if(wcRecords[0] != null) {
                            for (let i = 0; i < wcRecords.length; i++) {
                                const wcRecord = wcRecords[i];
                                let currentQuantity = wcRecord.current_quantity
                                let updatedQuantity = 0
    
                                // decrement wc fabric CurrentQuantity
                                let returnedQuantityObj =  await wcService.decrementWcCurrentQuantity(defferenceQuantity, currentQuantity, wcRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity
    
                                // Step 4 => Check if wc_id existed in wa_sell_requisition_details_wa
                                // that has same wc_transition_between_orders_requisitions_details_id
                                const isExisitId = await wcTransitionBetweenOrdersRequisitionDetailsWcService.select({
                                    wc_transition_between_orders_requisitions_details_id: wcTransitionBetweenOrdersRequisitionDetails.id,
                                    wc_id: wcRecord.id
                                })
    
                                if(isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wa_sell_requisition_details_wa
                                    updateResults = await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wc_transition_between_orders_requisitions_details_id: wcTransitionBetweenOrdersRequisitionDetails.id,
                                        wc_id: isExisitId[0].wc_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wa_sell_requisition_details_wa
                                    updateResults = await wcTransitionBetweenOrdersRequisitionDetailsWcService.create(wcTransitionBetweenOrdersRequisitionDetails, {
                                        wcTransitionBetweenOrdersRequisitionDetailsId: wcTransitionBetweenOrdersRequisitionDetails.id,
                                        wcId: wcRecord.id,
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
                // Step 1 => Decrement quantity in  wa_sell_requisition_details
                await wcTransitionBetweenOrdersRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wcTransitionBetweenOrdersRequisitionDetails.id
                })

                // Decrement wa current_quantity
                await wcQueries.update({
                    current_quantity: selectOneWaRecord[0].current_quantity - defferenceQuantity
                }, {
                    id: selectOneWaRecord[0].id
                })

                // update order quantity
                await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].from_wc_fabric_order_requisition_details_id, defferenceQuantity)

                // update order quantity
                await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                
                // Step 2 => Select From wa_sell_requisition_details_wa Records
                let whereCluseDetailsWc = {};
                whereCluseDetailsWc[`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`] = wcTransitionBetweenOrdersRequisitionDetails.id;
                whereCluseDetailsWc[`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.is_deleted`] = 0;
                whereCluseDetailsWc[`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.is_active`] = 1;
                const wcTransitionBetweenOrdersRequisitionDetailsWcRecords = await wcTransitionBetweenOrdersRequisitionDetailsWcService.selectWithTwoCondition(whereCluseDetailsWc,
                    ["quantity", ">", "0"])
                if (wcTransitionBetweenOrdersRequisitionDetailsWcRecords[0] != null) {
                    for (let j = 0; j < wcTransitionBetweenOrdersRequisitionDetailsWcRecords.length; j++) {
                        const wcTransitionBetweenWhRequisitionDetailsWcRecord = wcTransitionBetweenOrdersRequisitionDetailsWcRecords[j];
                        let wcTransitionBetweenWhRequisitionDetailsWcQuantity = wcTransitionBetweenWhRequisitionDetailsWcRecord.quantity
                        let updatedQuantity = 0

                        if(wcTransitionBetweenWhRequisitionDetailsWcQuantity >= defferenceQuantity ) {
                            // Decrement wa_sell_requisition_details_wa quantity
                            await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.update({
                                quantity: wcTransitionBetweenWhRequisitionDetailsWcQuantity - defferenceQuantity
                            }, {
                                wc_transition_between_orders_requisitions_details_id: wcTransitionBetweenOrdersRequisitionDetails.id,
                                wc_id: wcTransitionBetweenWhRequisitionDetailsWcRecord.wc_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wcTransitionBetweenWHRequisitionDetailsWc quantity
                            await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.update({
                                quantity: 0
                            }, {
                                wc_transition_between_orders_requisitions_details_id: wcTransitionBetweenOrdersRequisitionDetails.id,
                                wc_id: wcTransitionBetweenWhRequisitionDetailsWcRecord.wc_id
                            })
                            updatedQuantity = wcTransitionBetweenWhRequisitionDetailsWcQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wcTransitionBetweenWhRequisitionDetailsWcQuantity).toFixed(3))
                        }

                        // select wc fabric record
                        const wcRecord = await wcQueries.selectOne({
                            id: wcTransitionBetweenWhRequisitionDetailsWcRecord.wc_id
                        })
                        if(wcRecord[0] != null) {
                            const oldCurrentQuantity = wcRecord[0].current_quantity

                            // Increment wc current_quantity
                            await wcQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: wcRecord[0].id
                            })
                        }

                        if(defferenceQuantity == 0) {
                            updateResults = true
                            break;
                        }
                    }

                } else {
                    updateResults = false
                }

                ///
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
