// Queries
const wcSellRequisitionDetailsQueries = require("../../db/queries/wc/wc-sell-requisition-details");
const wcSellRequisitionQueries = require("../../db/queries/wc/wc-sell-requisition");
const wcSellRequisitionDetailsWaQueries = require("../../db/queries/wc/wc-sell-requisition-details-wc");
const wcQueries = require("../../db/queries/wc/wc");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const wcSellRequisitionDetailsWcTableName = require("../../util/database-tables-name").wcSellRequisitionDetailsWcTableName;
const wcSellRequisitionDetailsTableName = require("../../util/database-tables-name").wcSellRequisitionDetailsTableName;

// Services
const wcService = require("./wc");
const wcSellRequisitionDetailsWcService = require("./wc-sell-requisition-details-wc");

exports.create = async (wcSellRequisitionDetails) => {
    for (let i = 0; i < wcSellRequisitionDetails.items.length; i++) {
        wcSellRequisitionDetails.items[i].wcSellRequisitionDetailsId = trans.transform();

        const results = await wcSellRequisitionDetailsQueries.insert(wcSellRequisitionDetails, wcSellRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wcSellRequisitionDetails.items[i].quantity)

            // select Wc fabric for decrement current quantity
            const fabricsStoredInWcResult = await wcService.selectByFabricForSell(wcSellRequisitionDetails.warehouseId, wcSellRequisitionDetails.items[i].fabricId, wcSellRequisitionDetails.items[i].consigmentManufacturingId)
            if (fabricsStoredInWcResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWcResult.length; j++) {
                    const fabricStoredInWc = fabricsStoredInWcResult[j];
                    let currentQuantity = fabricStoredInWc.current_quantity
                    let updatedQuantity = 0

                    // decrement Wc fabric CurrentQuantity
                    let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wcSellRequisitionDetails.items[i].wcId = fabricStoredInWc.id
                    wcSellRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add wc yarn Sell Requisition Details Wc
                    await wcSellRequisitionDetailsWcService.create(wcSellRequisitionDetails, wcSellRequisitionDetails.items[i])

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
    }
    return { ...constants.insertSuccess, ...{ id: wcSellRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcSellRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wcSellRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcSellRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcSellRequisitionDetailsTableName}.id`] = wcSellRequisitionDetails.id;
    whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcSellRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

            wcSellRequisitionDetails.wcSellRequisitionId = isFound[0].wc_sell_requisition_id

            // Update wc fabric sell requisition Without Quantity
            callArray.push(wcSellRequisitionQueries.update({
                date: wcSellRequisitionDetails.date,
                note: wcSellRequisitionDetails.note
            },
                {
                    id: wcSellRequisitionDetails.wcSellRequisitionId
                }))


            // Update wc fabric sell requisition details Without Quantity
            callArray.push(
                wcSellRequisitionDetailsQueries.update({
                    price: wcSellRequisitionDetails.price,
                    price_dollar: wcSellRequisitionDetails.priceDollar,
                    fabric_piece: wcSellRequisitionDetails.numberFabricPieces,
                    document: wcSellRequisitionDetails.document,
                    statement: wcSellRequisitionDetails.statement
                },
                    {
                        id: wcSellRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(wcSellRequisitionDetails.quantity)
            let defferenceQuantity = 0

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wc fabric) by following Steps :
                // Step 1 => Check If has current quantity in store (wc fabric)
                const sumCurrentQuantityWc = await wcService.selectSumCurrentQuantityByWarehouseByFabricByConsigmentManufacturingLotWc(isFound[0].warehouse_id, isFound[0].fabric_id, isFound[0].consigment_manufacturing_id)
                if(sumCurrentQuantityWc[0] != null) {
                    console.log("sumCurrentQuantityWc ::: ", sumCurrentQuantityWc);
                    const sumCurrentQuantity = sumCurrentQuantityWc[0].current_quantity
                    if(sumCurrentQuantity >= defferenceQuantity) {
    
                        // Step 2 => Increment quantity in  wa_sell_requisition_details
                        await wcSellRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wcSellRequisitionDetails.id
                        })
    
                        // Step 3 => select from (WC fabric) Records for decrement current quantity
                        const wcRecords = await wcService.selectByFabricForSell(isFound[0].warehouse_id, isFound[0].fabric_id, isFound[0].consigment_manufacturing_id)
                        if(wcRecords[0] != null) {
                            console.log("wcRecords ::: ", wcRecords);
                            for (let i = 0; i < wcRecords.length; i++) {
                                const wcRecord = wcRecords[i];
                                let currentQuantity = wcRecord.current_quantity
                                let updatedQuantity = 0
    
                                // decrement Wa yarn CurrentQuantity
                                let returnedQuantityObj =  await wcService.decrementWcCurrentQuantity(defferenceQuantity, currentQuantity, wcRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity
    
                                // Step 4 => Check if wc_id existed in wc_sell_requisition_details_wc
                                // that has same wc_sell_requisition_details_id
                                const isExisitId = await wcSellRequisitionDetailsWcService.select({
                                    wc_sell_requisition_details_id: wcSellRequisitionDetails.id,
                                    wc_id: wcRecord.id
                                })
    
                                if(isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wc_sell_requisition_details_wc
                                    updateResults = await wcSellRequisitionDetailsWaQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wc_sell_requisition_details_id: wcSellRequisitionDetails.id,
                                        wc_id: isExisitId[0].wc_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wc_sell_requisition_details_wc
                                    updateResults = await wcSellRequisitionDetailsWcService.create(wcSellRequisitionDetails, {
                                        wcSellRequisitionDetailsId: wcSellRequisitionDetails.id,
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
                

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))
                
                // Step 1 => Decrement quantity in  wa_sell_requisition_details
                await wcSellRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wcSellRequisitionDetails.id
                })
                
                // Step 2 => Select From wc_sell_requisition_details_wc Records
                let whereCluseDetailsWc = {};
                whereCluseDetailsWc[`${wcSellRequisitionDetailsWcTableName}.wc_sell_requisition_details_id`] = wcSellRequisitionDetails.id;
                whereCluseDetailsWc[`${wcSellRequisitionDetailsWcTableName}.is_deleted`] = 0;
                whereCluseDetailsWc[`${wcSellRequisitionDetailsWcTableName}.is_active`] = 1;
                const wcSellRequisitionDetailsWcRecords = await wcSellRequisitionDetailsWcService.selectWithTwoCondition(whereCluseDetailsWc,
                    ["quantity", ">", "0"])
                if (wcSellRequisitionDetailsWcRecords[0] != null) {
                    for (let j = 0; j < wcSellRequisitionDetailsWcRecords.length; j++) {
                        const wcSellRequisitionDetailsWcRecord = wcSellRequisitionDetailsWcRecords[j];
                        let wcSellRequisitionDetailsWcQuantity = wcSellRequisitionDetailsWcRecord.quantity
                        let updatedQuantity = 0

                        if(wcSellRequisitionDetailsWcQuantity >= defferenceQuantity ) {
                            // Decrement wc_sell_requisition_details_wc quantity
                            await wcSellRequisitionDetailsWaQueries.update({
                                quantity: wcSellRequisitionDetailsWcQuantity - defferenceQuantity
                            }, {
                                wc_sell_requisition_details_id: wcSellRequisitionDetails.id,
                                wc_id: wcSellRequisitionDetailsWcRecord.wc_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wc_sell_requisition_details_wc quantity
                            await wcSellRequisitionDetailsWaQueries.update({
                                quantity: 0
                            }, {
                                wc_sell_requisition_details_id: wcSellRequisitionDetails.id,
                                wc_id: wcSellRequisitionDetailsWcRecord.wc_id
                            })
                            updatedQuantity = wcSellRequisitionDetailsWcQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wcSellRequisitionDetailsWcQuantity).toFixed(3))
                        }

                        // select wc yarn record
                        const wcRecord = await wcQueries.selectOne({
                            id: wcSellRequisitionDetailsWcRecord.wc_id
                        })
                        if(wcRecord[0] != null) {
                            const oldCurrentQuantity = wcRecord[0].current_quantity

                            // Increment wa current_quantity
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
            } else {
                updateResults = true
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
