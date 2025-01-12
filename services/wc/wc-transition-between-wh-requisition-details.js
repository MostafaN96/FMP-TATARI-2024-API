// Queries
const wcTransitionBetweenWHRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition-details-wc");
const wcTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition-details");
const wcTransitionBetweenWHRequisitionQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");

// Services
const wcTransitionBetweenWHRequisitionDetailsWcService = require("./wc-transition-between-wh-requisition-details-wc");
const wcService = require("./wc");
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcTransitionBetweenWHRequisitionDetailsTableName,
    wcTransitionBetweenWHRequisitionDetailsWcTableName,
    wcFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wcTransitionBetweenWHRequisitionDetails) => {

    for (let i = 0; i < wcTransitionBetweenWHRequisitionDetails.items.length; i++) {
        wcTransitionBetweenWHRequisitionDetails.items[i].wcTransitionBetweenWHRequisitionDetailsId = trans.transform();
        wcTransitionBetweenWHRequisitionDetails.wcId = trans.transform();

        // Check Consigment Yarn Dupplication
        const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wcTransitionBetweenWHRequisitionDetails.items[i].newConsigmentManufacturingNumber })
        if (Array.isArray(selectConsigmentManufacturingOneResult) && selectConsigmentManufacturingOneResult.length > 0) {
            wcTransitionBetweenWHRequisitionDetails.items[i].consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
        } else {
            wcTransitionBetweenWHRequisitionDetails.items[i].consigmentManufacturingId = trans.transform();
            await consigmentManufacturingQueries.insertForWcExecuteOrder(wcTransitionBetweenWHRequisitionDetails, wcTransitionBetweenWHRequisitionDetails.items[i]);
        }

        // Get fabric order requisitions details id
        let fabricOrderRequisitionDetailsWhereCluse = {};
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = wcTransitionBetweenWHRequisitionDetails.items[i].fabricOrderId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcTransitionBetweenWHRequisitionDetails.items[i].fabricId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            wcTransitionBetweenWHRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = selectFabricOrderRequisitionDetailsResult[0].id

        const results = await wcTransitionBetweenWHRequisitionDetailsQueries.insert(wcTransitionBetweenWHRequisitionDetails, wcTransitionBetweenWHRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wcTransitionBetweenWHRequisitionDetails.items[i].quantity)

            // select Wc fabric for decrement current quantity
            const fabricsStoredInWcResult = await wcService.selectByFabricForSell(
                wcTransitionBetweenWHRequisitionDetails.items[i].fromWarehouseId, 
                wcTransitionBetweenWHRequisitionDetails.items[i].fabricId, 
                wcTransitionBetweenWHRequisitionDetails.items[i].fromConsigmentManufacturingId,
                wcTransitionBetweenWHRequisitionDetails.items[i].fabricOrderId
            )
            if (fabricsStoredInWcResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWcResult.length; j++) {
                    const fabricStoredInWc = fabricsStoredInWcResult[j];
                    let currentQuantity = fabricStoredInWc.current_quantity
                    let updatedQuantity = 0

                    // decrement Wc fabric CurrentQuantity
                    let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wcTransitionBetweenWHRequisitionDetails.items[i].wcId = fabricStoredInWc.id
                    wcTransitionBetweenWHRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add Wc fabric transition between wh Requisition Details Wc
                    await wcTransitionBetweenWHRequisitionDetailsWcService.create(wcTransitionBetweenWHRequisitionDetails, wcTransitionBetweenWHRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert WB
                await wcQueries.insertForTransitionBetweenWhRequisition(wcTransitionBetweenWHRequisitionDetails, wcTransitionBetweenWHRequisitionDetails.items[i])
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
    return { ...constants.insertSuccess, ...{ id: wcTransitionBetweenWHRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcTransitionBetweenWHRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`] = requisitionId;
        whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
        const results = await wcTransitionBetweenWHRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcTransitionBetweenWHRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.id`] = wcTransitionBetweenWHRequisitionDetails.id;
    whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcTransitionBetweenWHRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

            wcTransitionBetweenWHRequisitionDetails.wcTransitionBetweenWhRequisitionsId = isFound[0].wc_transition_between_wh_requisitions_id

            let waTransitionBetweenWHRequisitionDetailsWaWhereCluse = {}
        waTransitionBetweenWHRequisitionDetailsWaWhereCluse[`${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`] = wcTransitionBetweenWHRequisitionDetails.id
        const wcTransitionBetweenWHRequisitionDetailsWcSelectOneResult = await wcTransitionBetweenWHRequisitionDetailsWcQueries.selectOne(waTransitionBetweenWHRequisitionDetailsWaWhereCluse)
        if (wcTransitionBetweenWHRequisitionDetailsWcSelectOneResult[0] != null) {

            // Update wc fabric transition between wh requisition Without Quantity
            callArray.push(wcTransitionBetweenWHRequisitionQueries.update({
                date: wcTransitionBetweenWHRequisitionDetails.date,
                note: wcTransitionBetweenWHRequisitionDetails.note
            },
                {
                    id: wcTransitionBetweenWHRequisitionDetails.wcTransitionBetweenWhRequisitionsId
                }))


            // Update wc fabric transition between wh requisition details Without Quantity
            callArray.push(
                wcTransitionBetweenWHRequisitionDetailsQueries.update({
                    price: wcTransitionBetweenWHRequisitionDetails.price,
                    price_dollar: wcTransitionBetweenWHRequisitionDetails.priceDollar,
                    fabric_piece: wcTransitionBetweenWHRequisitionDetails.numberFabricPieces,
                    document: wcTransitionBetweenWHRequisitionDetails.document,
                    statement: wcTransitionBetweenWHRequisitionDetails.statement
                },
                    {
                        id: wcTransitionBetweenWHRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(wcTransitionBetweenWHRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWaRecord = await wcQueries.selectOne({
                wc_transition_between_wh_requisitions_details_id: wcTransitionBetweenWHRequisitionDetails.id
            })

            if (selectOneWaRecord[0] != null) {

                const selectOldOneWaRecord = await wcQueries.selectOne({
                    id: wcTransitionBetweenWHRequisitionDetailsWcSelectOneResult[0].wc_id
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
                    isFound[0].from_warehouse_id, 
                    isFound[0].fabric_id, 
                    isFound[0].from_consigment_manufacturing_id,
                    isFound[0].wc_fabric_order_requisition_id
                    )
                if(sumCurrentQuantityWc[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWc[0].current_quantity
                    if(sumCurrentQuantity >= defferenceQuantity) {
    
                        // Step 2 => Increment quantity in  wa_sell_requisition_details
                        await wcTransitionBetweenWHRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wcTransitionBetweenWHRequisitionDetails.id
                        })

                        // Increment wc current_quantity
                        await wcQueries.update({
                            current_quantity: selectOneWaRecord[0].current_quantity + defferenceQuantity
                        }, {
                            id: selectOneWaRecord[0].id
                        })
    
                        // Step 3 => select from (WA yarn) Records for decrement current quantity
                        const wcRecords = await wcService.selectByFabricForSell(
                            isFound[0].from_warehouse_id, 
                            isFound[0].fabric_id, 
                            isFound[0].from_consigment_manufacturing_id,
                            isFound[0].wc_fabric_order_requisition_id
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
                                // that has same wc_transition_between_wh_requisitions_details_id
                                const isExisitId = await wcTransitionBetweenWHRequisitionDetailsWcService.select({
                                    wc_transition_between_wh_requisitions_details_id: wcTransitionBetweenWHRequisitionDetails.id,
                                    wc_id: wcRecord.id
                                })
    
                                if(isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wa_sell_requisition_details_wa
                                    updateResults = await wcTransitionBetweenWHRequisitionDetailsWcQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wc_transition_between_wh_requisitions_details_id: wcTransitionBetweenWHRequisitionDetails.id,
                                        wc_id: isExisitId[0].wc_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wa_sell_requisition_details_wa
                                    updateResults = await wcTransitionBetweenWHRequisitionDetailsWcService.create(wcTransitionBetweenWHRequisitionDetails, {
                                        wcTransitionBetweenWHRequisitionDetailsId: wcTransitionBetweenWHRequisitionDetails.id,
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
                await wcTransitionBetweenWHRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wcTransitionBetweenWHRequisitionDetails.id
                })

                // Decrement wa current_quantity
                await wcQueries.update({
                    current_quantity: selectOneWaRecord[0].current_quantity - defferenceQuantity
                }, {
                    id: selectOneWaRecord[0].id
                })
                
                // Step 2 => Select From wa_sell_requisition_details_wa Records
                let whereCluseDetailsWc = {};
                whereCluseDetailsWc[`${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`] = wcTransitionBetweenWHRequisitionDetails.id;
                whereCluseDetailsWc[`${wcTransitionBetweenWHRequisitionDetailsWcTableName}.is_deleted`] = 0;
                whereCluseDetailsWc[`${wcTransitionBetweenWHRequisitionDetailsWcTableName}.is_active`] = 1;
                const wcTransitionBetweenWhRequisitionDetailsWcRecords = await wcTransitionBetweenWHRequisitionDetailsWcService.selectWithTwoCondition(whereCluseDetailsWc,
                    ["quantity", ">", "0"])
                if (wcTransitionBetweenWhRequisitionDetailsWcRecords[0] != null) {
                    for (let j = 0; j < wcTransitionBetweenWhRequisitionDetailsWcRecords.length; j++) {
                        const wcTransitionBetweenWhRequisitionDetailsWcRecord = wcTransitionBetweenWhRequisitionDetailsWcRecords[j];
                        let wcTransitionBetweenWhRequisitionDetailsWcQuantity = wcTransitionBetweenWhRequisitionDetailsWcRecord.quantity
                        let updatedQuantity = 0

                        if(wcTransitionBetweenWhRequisitionDetailsWcQuantity >= defferenceQuantity ) {
                            // Decrement wa_sell_requisition_details_wa quantity
                            await wcTransitionBetweenWHRequisitionDetailsWcQueries.update({
                                quantity: wcTransitionBetweenWhRequisitionDetailsWcQuantity - defferenceQuantity
                            }, {
                                wc_transition_between_wh_requisitions_details_id: wcTransitionBetweenWHRequisitionDetails.id,
                                wc_id: wcTransitionBetweenWhRequisitionDetailsWcRecord.wc_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wcTransitionBetweenWHRequisitionDetailsWc quantity
                            await wcTransitionBetweenWHRequisitionDetailsWcQueries.update({
                                quantity: 0
                            }, {
                                wc_transition_between_wh_requisitions_details_id: wcTransitionBetweenWHRequisitionDetails.id,
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
