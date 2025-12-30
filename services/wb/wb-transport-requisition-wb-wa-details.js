// Queries
const wbTransportRequisitionWbWaDetailsQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details");
const wbTransportWbWaDetailsWbQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details-wb");
const wbTransportRequisitionWbWaQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa");
const wbQueries = require("../../db/queries/wb/wb");
const waQueries = require("../../db/queries/wa/wa");
const waYarnOrderRequisitionDetailsYarnOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-yarn-order");

// Services
const wbService = require("../wb/wb");
const wbTransportRequisitionWbWaDetailsWbService = require("./wb-transport-requisition-wb-wa-details-wb");
const waYarnOrderRequisitionDetailsService = require("../wa/wa-yarn-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbTransportRequisitionWbWaDetailsWbTableName,
    wbTransportRequisitionWbWaDetailsTableName,
    wbTransportRequisitionWbWaTableName,
    waYarnOrderRequisitionDetailsTableName,
    waAddRequisitionDetailsYarnOrderTableName
} = require("../../util/database-tables-name");

exports.create = async (wbTransportRequisitionWbWaDetails) => {
    for (let i = 0; i < wbTransportRequisitionWbWaDetails.items.length; i++) {
        wbTransportRequisitionWbWaDetails.items[i].wbTransportRequisitionWbWaDetailsId = trans.transform();
        wbTransportRequisitionWbWaDetails.items[i].waId = trans.transform();

        // Get yarn order requisitions details id
        let yarnOrderRequisitionDetailsWhereCluse = {};
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = wbTransportRequisitionWbWaDetails.items[i].yarnOrderId;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = wbTransportRequisitionWbWaDetails.items[i].yarnId;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsService.selectOne(yarnOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectYarnOrderRequisitionDetailsResult) && selectYarnOrderRequisitionDetailsResult.length > 0) {
            wbTransportRequisitionWbWaDetails.items[i].waYarnOrderRequisitionDetailsId = selectYarnOrderRequisitionDetailsResult[0].id

            // Get wa_yarn_order_requisition_id supplier_id
            let waAddRequisitionDetailsYarnOrderWhereCluse = {};
            waAddRequisitionDetailsYarnOrderWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = wbTransportRequisitionWbWaDetails.items[i].yarnOrderId;
            waAddRequisitionDetailsYarnOrderWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.is_deleted`] = 0;
            waAddRequisitionDetailsYarnOrderWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.is_active`] = 1;
            const selectWaAddRequisitionDetailsYarnOrderResult = await waYarnOrderRequisitionDetailsYarnOrderQueries.selectOne(waAddRequisitionDetailsYarnOrderWhereCluse)
            if (Array.isArray(selectWaAddRequisitionDetailsYarnOrderResult) && selectWaAddRequisitionDetailsYarnOrderResult.length > 0) {
                wbTransportRequisitionWbWaDetails.items[i].supplierId = selectWaAddRequisitionDetailsYarnOrderResult[0].supplier_id
                wbTransportRequisitionWbWaDetails.items[i].waAddRequisitionId = selectWaAddRequisitionDetailsYarnOrderResult[0].wa_add_requisition_id
            } else {
                wbTransportRequisitionWbWaDetails.items[i].supplierId = null
                wbTransportRequisitionWbWaDetails.items[i].waAddRequisitionId = null
            }

            const results = await wbTransportRequisitionWbWaDetailsQueries.insert(wbTransportRequisitionWbWaDetails, wbTransportRequisitionWbWaDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(wbTransportRequisitionWbWaDetails.items[i].quantity)

                // select Wb for decrement current quantity
                const yarnsStoredInWbResult = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                    wbTransportRequisitionWbWaDetails.industryId,
                    wbTransportRequisitionWbWaDetails.items[i].yarnId,
                    wbTransportRequisitionWbWaDetails.items[i].yarnLotId,
                    wbTransportRequisitionWbWaDetails.items[i].consigmentYarnId,
                    wbTransportRequisitionWbWaDetails.items[i].yarnOrderId
                )
                if (yarnsStoredInWbResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWbResult.length; j++) {
                        const yarnStoredInWb = yarnsStoredInWbResult[j];
                        let currentQuantity = yarnStoredInWb.current_quantity
                        let updatedQuantity = 0

                        // decrement Wb CurrentQuantity
                        let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWb, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wbTransportRequisitionWbWaDetails.items[i].wbId = yarnStoredInWb.id
                        wbTransportRequisitionWbWaDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wb Transport Wb Wa Requisition Details Wb
                        await wbTransportRequisitionWbWaDetailsWbService.create(wbTransportRequisitionWbWaDetails, wbTransportRequisitionWbWaDetails.items[i])

                        // update order quantity
                        await waYarnOrderRequisitionDetailsService.updateForIncrementQuantity(selectYarnOrderRequisitionDetailsResult[0].id, updatedQuantity)

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }
                    // Insert WA
                    await waQueries.insertForTransportRequisitionWbWa(wbTransportRequisitionWbWaDetails, wbTransportRequisitionWbWaDetails.items[i])
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
    return { ...constants.insertSuccess, ...{ id: wbTransportRequisitionWbWaDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbTransportRequisitionWbWaQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wbTransportRequisitionWbWaDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbTransportRequisitionWbWaQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wbTransportRequisitionWbWaDetailsQueries.selectWithFabricManufacturedByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wbTransportRequisitionWbWaDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.id`] = wbTransportRequisitionWbWaDetails.id;
    whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;
    const isFound = await wbTransportRequisitionWbWaDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbTransportRequisitionWbWaDetails.wbTransportRequisitionWbWaId = isFound[0].wb_transport_requisition_wb_wa_id

        // Update wb transport wa wb requisition Without Quantity
        callArray.push(wbTransportRequisitionWbWaQueries.update({
            date: wbTransportRequisitionWbWaDetails.date,
            note: wbTransportRequisitionWbWaDetails.note
        },
            {
                id: wbTransportRequisitionWbWaDetails.wbTransportRequisitionWbWaId
            }))


        // Update wb transport wa wb requisition details Without Quantity
        callArray.push(
            wbTransportRequisitionWbWaDetailsQueries.update({
                price: wbTransportRequisitionWbWaDetails.price,
                price_dollar: wbTransportRequisitionWbWaDetails.priceDollar,
                document: wbTransportRequisitionWbWaDetails.document,
                statement: wbTransportRequisitionWbWaDetails.statement
            },
                {
                    id: wbTransportRequisitionWbWaDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waCottonResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbTransportRequisitionWbWaDetails.quantity)
        let defferenceQuantity = 0

        const selectOneWaRecord = await waQueries.selectOne({
            wb_transport_requisition_wb_wa_details_id: wbTransportRequisitionWbWaDetails.id
        })

        if (selectOneWaRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wb) by following Steps :
                // Step 1 => Check If has current quantity in store (wb)
                const sumCurrentQuantityWb = await wbService.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(
                    isFound[0].industry_id,
                    isFound[0].yarn_id,
                    isFound[0].yarn_lot_id,
                    isFound[0].consigment_yarn_id,
                    isFound[0].wa_yarn_order_requisition_id
                )
                if (sumCurrentQuantityWb[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWb[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // update order quantity
                        await waYarnOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wa_yarn_order_requisition_details_id, defferenceQuantity)

                        // Step 2 => Increment quantity in  wb_transport_requisition_wb_wa_details
                        await wbTransportRequisitionWbWaDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wbTransportRequisitionWbWaDetails.id
                        })

                        // Step 3 => select from (WB) Records for decrement current quantity
                        const wbRecords = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                            isFound[0].industry_id,
                            isFound[0].yarn_id,
                            isFound[0].yarn_lot_id,
                            isFound[0].consigment_yarn_id,
                            isFound[0].wa_yarn_order_requisition_id
                        )
                        if (wbRecords[0] != null) {

                            // Increment Wa current_quantity
                            await waQueries.update({
                                current_quantity: selectOneWaRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWaRecord[0].id
                            })

                            for (let i = 0; i < wbRecords.length; i++) {
                                const wbRecord = wbRecords[i];
                                let currentQuantity = wbRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wb CurrentQuantity
                                let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(defferenceQuantity, currentQuantity, wbRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wb_id existed in wb_transport_requisition_wb_wa_details_wb
                                // that has same wb_transport_requisition_wb_wa_details_id
                                const isExisitId = await wbTransportRequisitionWbWaDetailsWbService.select({
                                    wb_transport_requisition_wb_wa_details_id: wbTransportRequisitionWbWaDetails.id,
                                    wb_id: wbRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wb_transport_requisition_wb_wa_details_wb
                                    updateResults = await wbTransportWbWaDetailsWbQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wb_transport_requisition_wb_wa_details_id: wbTransportRequisitionWbWaDetails.id,
                                        wb_id: isExisitId[0].wb_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wb_transport_requisition_wb_wa_details_wb
                                    updateResults = await wbTransportRequisitionWbWaDetailsWbService.create(wbTransportRequisitionWbWaDetails, {
                                        wbTransportRequisitionWbWaDetailsId: wbTransportRequisitionWbWaDetails.id,
                                        wbId: wbRecord.id,
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

                if (selectOneWaRecord[0].current_quantity >= defferenceQuantity) {

                    // update order quantity
                    await waYarnOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wa_yarn_order_requisition_details_id, defferenceQuantity)

                    // Step 1 => Decrement quantity in  wb_transport_requisition_wb_wa_details
                    await wbTransportRequisitionWbWaDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wbTransportRequisitionWbWaDetails.id
                    })

                    // Decrement wa current_quantity
                    await waQueries.update({
                        current_quantity: selectOneWaRecord[0].current_quantity - defferenceQuantity
                    }, {
                        id: selectOneWaRecord[0].id
                    })

                    // Step 2 => Select From wb_transport_requisition_wb_wa_details_wb Records
                    let whereCluseDetailsWb = {};
                    whereCluseDetailsWb[`${wbTransportRequisitionWbWaDetailsWbTableName}.wb_transport_requisition_wb_wa_details_id`] = wbTransportRequisitionWbWaDetails.id;
                    whereCluseDetailsWb[`${wbTransportRequisitionWbWaDetailsWbTableName}.is_deleted`] = 0;
                    whereCluseDetailsWb[`${wbTransportRequisitionWbWaDetailsWbTableName}.is_active`] = 1;
                    const wbTransportRequisitionWbWaDetailsWbRecords = await wbTransportRequisitionWbWaDetailsWbService.selectWithTwoCondition(whereCluseDetailsWb,
                        ["quantity", ">", "0"])
                    if (wbTransportRequisitionWbWaDetailsWbRecords[0] != null) {
                        for (let j = 0; j < wbTransportRequisitionWbWaDetailsWbRecords.length; j++) {
                            const wbTransportRequisitionWbWaDetailsWbRecord = wbTransportRequisitionWbWaDetailsWbRecords[j];
                            let wbTransportRequisitionWbWaDetailsWbQuantity = wbTransportRequisitionWbWaDetailsWbRecord.quantity
                            let updatedQuantity = 0

                            if (wbTransportRequisitionWbWaDetailsWbQuantity >= defferenceQuantity) {
                                // Decrement wb_transport_requisition_wb_wa_details_wb quantity
                                await wbTransportWbWaDetailsWbQueries.update({
                                    quantity: wbTransportRequisitionWbWaDetailsWbQuantity - defferenceQuantity
                                }, {
                                    wb_transport_requisition_wb_wa_details_id: wbTransportRequisitionWbWaDetails.id,
                                    wb_id: wbTransportRequisitionWbWaDetailsWbRecord.wb_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wb_transport_requisition_wb_wa_details_wb quantity
                                await wbTransportWbWaDetailsWbQueries.update({
                                    quantity: 0
                                }, {
                                    wb_transport_requisition_wb_wa_details_id: wbTransportRequisitionWbWaDetails.id,
                                    wb_id: wbTransportRequisitionWbWaDetailsWbRecord.wb_id
                                })
                                updatedQuantity = wbTransportRequisitionWbWaDetailsWbQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wbTransportRequisitionWbWaDetailsWbQuantity).toFixed(3))
                            }

                            // select wa record
                            const wbRecord = await wbQueries.selectOne({
                                id: wbTransportRequisitionWbWaDetailsWbRecord.wb_id
                            })
                            if (wbRecord[0] != null) {
                                const oldCurrentQuantity = wbRecord[0].current_quantity

                                // Increment wb current_quantity
                                await wbQueries.update({
                                    current_quantity: oldCurrentQuantity + updatedQuantity
                                }, {
                                    id: wbRecord[0].id
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
                        spentQuantity: selectOneWaRecord[0].current_quantity,
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
