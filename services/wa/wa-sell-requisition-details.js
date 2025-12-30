// Queries
const waSellRequisitionDetailsQueries = require("../../db/queries/wa/wa-sell-requisition-details");
const waSellRequisitionQueries = require("../../db/queries/wa/wa-sell-requisition");
const waSellRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-sell-requisition-details-wa");
const waQueries = require("../../db/queries/wa/wa");

// Services
const waService = require("./wa");
const waSellRequisitionDetailsWaService = require("./wa-sell-requisition-details-wa");
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");
const wayarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { waYarnOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");
const waSellRequisitionDetailsWaTableName = require("../../util/database-tables-name").waSellRequisitionDetailsWaTableName;
const waSellRequisitionDetailsTableName = require("../../util/database-tables-name").waSellRequisitionDetailsTableName;

exports.create = async (waSellRequisitionDetails) => {
    for (let i = 0; i < waSellRequisitionDetails.items.length; i++) {
        waSellRequisitionDetails.items[i].waSellRequisitionDetailsId = trans.transform();

        // Get yarn order requisitions details id
        let yarnOrderRequisitionDetailsWhereCluse = {};
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = waSellRequisitionDetails.yarnOrderId;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = waSellRequisitionDetails.items[i].yarnId;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsService.selectOne(yarnOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectYarnOrderRequisitionDetailsResult) && selectYarnOrderRequisitionDetailsResult.length > 0) {
            waSellRequisitionDetails.items[i].waYarnOrderRequisitionDetailsId = selectYarnOrderRequisitionDetailsResult[0].id

            const results = await waSellRequisitionDetailsQueries.insert(waSellRequisitionDetails, waSellRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {

                let newQuantity = parseFloat(waSellRequisitionDetails.items[i].quantity)

                // select Wa yarn for decrement current quantity
                const yarnsStoredInWaResult = await waService.selectByYarnForSell(
                    waSellRequisitionDetails.warehouseId,
                    waSellRequisitionDetails.items[i].yarnId,
                    waSellRequisitionDetails.items[i].yarnLotId,
                    waSellRequisitionDetails.items[i].consigmentYarnId,
                    waSellRequisitionDetails.yarnOrderId)
                if (yarnsStoredInWaResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                        const yarnStoredInWa = yarnsStoredInWaResult[j];
                        let currentQuantity = yarnStoredInWa.current_quantity
                        let updatedQuantity = 0

                        // decrement Wa yarn CurrentQuantity
                        let returnedQuantityObj = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        waSellRequisitionDetails.items[i].waId = yarnStoredInWa.id
                        waSellRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wa yarn Sell Requisition Details Wa
                        await waSellRequisitionDetailsWaService.create(waSellRequisitionDetails, waSellRequisitionDetails.items[i])

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
    return { ...constants.insertSuccess, ...{ id: waSellRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await waSellRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        let results = await waSellRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        if (results[0] == null) {
            results = await waSellRequisitionDetailsQueries.selectOneByRequisitionId(requisitionId);
        }
        if (Array.isArray(results) && results.length > 0) {
            results[0].orders = await wayarnOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrderForWaAddRequisition(results[0].id)

        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (waSellRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${waSellRequisitionDetailsTableName}.id`] = waSellRequisitionDetails.id;
    whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waSellRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        waSellRequisitionDetails.waSellRequisitionId = isFound[0].wa_sell_requisition_id

        // Update wa yarn sell requisition Without Quantity
        callArray.push(waSellRequisitionQueries.update({
            date: waSellRequisitionDetails.date,
            note: waSellRequisitionDetails.note
        },
            {
                id: waSellRequisitionDetails.waSellRequisitionId
            }))


        // Update wa yarn sell requisition details Without Quantity
        callArray.push(
            waSellRequisitionDetailsQueries.update({
                price: waSellRequisitionDetails.price,
                price_dollar: waSellRequisitionDetails.priceDollar,
                document: waSellRequisitionDetails.document,
                statement: waSellRequisitionDetails.statement
            },
                {
                    id: waSellRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(waSellRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wa yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wa yarn)
            const sumCurrentQuantityWa = await waService.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa(
                isFound[0].warehouse_id,
                isFound[0].yarn_id,
                isFound[0].yarn_lot_id,
                isFound[0].consigment_yarn_id
            )
            if (sumCurrentQuantityWa[0] != null) {
                console.log("sumCurrentQuantityWa ::: ", sumCurrentQuantityWa);
                const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  wa_sell_requisition_details
                    await waSellRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: waSellRequisitionDetails.id
                    })

                    // Step 3 => select from (WA yarn) Records for decrement current quantity
                    const waRecords = await waService.selectByYarnForSell(
                        isFound[0].warehouse_id,
                        isFound[0].yarn_id,
                        isFound[0].yarn_lot_id,
                        isFound[0].consigment_yarn_id
                    )
                    if (waRecords[0] != null) {
                        console.log("waRecords ::: ", waRecords);
                        for (let i = 0; i < waRecords.length; i++) {
                            const waRecord = waRecords[i];
                            let currentQuantity = waRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wa yarn CurrentQuantity
                            let returnedQuantityObj = await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, waRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wa_id existed in wa_sell_requisition_details_wa
                            // that has same wa_sell_requisition_details_id
                            const isExisitId = await waSellRequisitionDetailsWaService.select({
                                wa_sell_requisition_details_id: waSellRequisitionDetails.id,
                                wa_id: waRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wa_sell_requisition_details_wa
                                updateResults = await waSellRequisitionDetailsWaQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wa_sell_requisition_details_id: waSellRequisitionDetails.id,
                                    wa_id: isExisitId[0].wa_id
                                })
                            } else {
                                // Step 4.2 Add Record in wa_sell_requisition_details_wa
                                updateResults = await waSellRequisitionDetailsWaService.create(waSellRequisitionDetails, {
                                    waSellRequisitionDetailsId: waSellRequisitionDetails.id,
                                    waId: waRecord.id,
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
            await waSellRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceQuantity
            }, {
                id: waSellRequisitionDetails.id
            })

            // Step 2 => Select From wa_sell_requisition_details_wa Records
            let whereCluseDetailsWa = {};
            whereCluseDetailsWa[`${waSellRequisitionDetailsWaTableName}.wa_sell_requisition_details_id`] = waSellRequisitionDetails.id;
            whereCluseDetailsWa[`${waSellRequisitionDetailsWaTableName}.is_deleted`] = 0;
            whereCluseDetailsWa[`${waSellRequisitionDetailsWaTableName}.is_active`] = 1;
            const waSellRequisitionDetailsWaRecords = await waSellRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
                ["quantity", ">", "0"])
            if (waSellRequisitionDetailsWaRecords[0] != null) {
                for (let j = 0; j < waSellRequisitionDetailsWaRecords.length; j++) {
                    const waSellRequisitionDetailsWaRecord = waSellRequisitionDetailsWaRecords[j];
                    let waSellRequisitionDetailsWaQuantity = waSellRequisitionDetailsWaRecord.quantity
                    let updatedQuantity = 0

                    if (waSellRequisitionDetailsWaQuantity >= defferenceQuantity) {
                        // Decrement wa_sell_requisition_details_wa quantity
                        await waSellRequisitionDetailsWaQueries.update({
                            quantity: waSellRequisitionDetailsWaQuantity - defferenceQuantity
                        }, {
                            wa_sell_requisition_details_id: waSellRequisitionDetails.id,
                            wa_id: waSellRequisitionDetailsWaRecord.wa_id
                        })
                        updatedQuantity = defferenceQuantity
                        defferenceQuantity = 0
                    } else {
                        // Decrement wa_sell_requisition_details_wa quantity
                        await waSellRequisitionDetailsWaQueries.update({
                            quantity: 0
                        }, {
                            wa_sell_requisition_details_id: waSellRequisitionDetails.id,
                            wa_id: waSellRequisitionDetailsWaRecord.wa_id
                        })
                        updatedQuantity = waSellRequisitionDetailsWaQuantity
                        defferenceQuantity = parseFloat((defferenceQuantity - waSellRequisitionDetailsWaQuantity).toFixed(3))
                    }

                    // select wa yarn record
                    const waRecord = await waQueries.selectOne({
                        id: waSellRequisitionDetailsWaRecord.wa_id
                    })
                    if (waRecord[0] != null) {
                        const oldCurrentQuantity = waRecord[0].current_quantity

                        // Increment wa current_quantity
                        await waQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: waRecord[0].id
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
