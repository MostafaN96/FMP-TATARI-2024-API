// Queries
const wbTransportWaWbDetailsQueries = require("../../db/queries/wb/wb-transport-wa-wb-details");
const wbTransportWaWbDetailsWaQueries = require("../../db/queries/wb/wb-transport-wa-wb-details-wa");
const wbTransportWaWbQueries = require("../../db/queries/wb/wb-transport-wa-wb");
const wbQueries = require("../../db/queries/wb/wb");
const waQueries = require("../../db/queries/wa/wa");
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");

// Services
const waService = require("../wa/wa");
const wbService = require("./wb");
const wbTransportWaWbRequisitionDetailsWaService = require("./wb-transport-wa-wb-details-wa");
const waYarnOrderRequisitionDetailsService = require("../wa/wa-yarn-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wbTransportWaWbDetailsWaTableName, 
    wbTransportWaWbDetailsTableName, 
    waYarnOrderRequisitionDetailsTableName 
} = require("../../util/database-tables-name");

exports.create = async (wbTransportWaWbRequisitionDetails) => {
    for (let i = 0; i < wbTransportWaWbRequisitionDetails.items.length; i++) {
        wbTransportWaWbRequisitionDetails.items[i].wbTransportWaWbDetailsId = trans.transform();
        wbTransportWaWbRequisitionDetails.items[i].wbId = trans.transform();

        // Get from yarn order requisitions details id
        let fromYarnOrderRequisitionDetailsWhereCluse = {};
        fromYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = wbTransportWaWbRequisitionDetails.fromYarnOrderId;
        fromYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = wbTransportWaWbRequisitionDetails.items[i].yarnId;
        fromYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fromYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFromYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsService.selectOne(fromYarnOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFromYarnOrderRequisitionDetailsResult) && selectFromYarnOrderRequisitionDetailsResult.length > 0) {
            wbTransportWaWbRequisitionDetails.items[i].fromWaYarnOrderRequisitionDetailsId = selectFromYarnOrderRequisitionDetailsResult[0].id

            wbTransportWaWbRequisitionDetails.items[i].consigmentYarnId = trans.transform();
            // Check Consigment Yarn Dupplication
            const selectConsigmentYarnOneResult = await consigmentYarnQueries.selectOne({ number: wbTransportWaWbRequisitionDetails.items[i].consigmentYarnNumber })
            if (selectConsigmentYarnOneResult[0] != null) {
                wbTransportWaWbRequisitionDetails.items[i].consigmentYarnId = selectConsigmentYarnOneResult[0].id;
            } else {
                await consigmentYarnQueries.insertForTransportWaWb(wbTransportWaWbRequisitionDetails, wbTransportWaWbRequisitionDetails.items[i]);
            }
        
            // Get yarn order requisitions details id
            let yarnOrderRequisitionDetailsWhereCluse = {};
            yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = wbTransportWaWbRequisitionDetails.items[i].yarnOrderId;
            yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = wbTransportWaWbRequisitionDetails.items[i].yarnId;
            yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
            yarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
            const selectYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsService.selectOne(yarnOrderRequisitionDetailsWhereCluse)
            if (Array.isArray(selectYarnOrderRequisitionDetailsResult) && selectYarnOrderRequisitionDetailsResult.length > 0) {
                wbTransportWaWbRequisitionDetails.items[i].waYarnOrderRequisitionDetailsId = selectYarnOrderRequisitionDetailsResult[0].id

            const results = await wbTransportWaWbDetailsQueries.insert(wbTransportWaWbRequisitionDetails, wbTransportWaWbRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(wbTransportWaWbRequisitionDetails.items[i].quantity)

                // select Wa for decrement current quantity
                const yarnsStoredInWaResult = await waService.selectByYarnForSell(
                    wbTransportWaWbRequisitionDetails.warehouseId,
                    wbTransportWaWbRequisitionDetails.items[i].yarnId,
                    wbTransportWaWbRequisitionDetails.items[i].yarnLotId,
                    wbTransportWaWbRequisitionDetails.items[i].fromConsigmentYarnId,
                    wbTransportWaWbRequisitionDetails.fromYarnOrderId
                )
                if (yarnsStoredInWaResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                        const yarnStoredInWa = yarnsStoredInWaResult[j];
                        let currentQuantity = yarnStoredInWa.current_quantity
                        let updatedQuantity = 0

                        // decrement Wa CurrentQuantity
                        let returnedQuantityObj = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wbTransportWaWbRequisitionDetails.items[i].waId = yarnStoredInWa.id
                        wbTransportWaWbRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wa Sell Requisition Details Wa
                        await wbTransportWaWbRequisitionDetailsWaService.create(wbTransportWaWbRequisitionDetails, wbTransportWaWbRequisitionDetails.items[i])

                        // update order quantity
                        await waYarnOrderRequisitionDetailsService.updateForDecrementQuantity(wbTransportWaWbRequisitionDetails.items[i].waYarnOrderRequisitionDetailsId, updatedQuantity)

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }
                    // Insert WB
                    await wbQueries.insert(wbTransportWaWbRequisitionDetails, wbTransportWaWbRequisitionDetails.items[i])

                    
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
    return { ...constants.insertSuccess, ...{ id: wbTransportWaWbRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbTransportWaWbQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        let whereCluse = {};
        whereCluse[`${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`] = requisitionId;
        whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
        let results = await wbTransportWaWbDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length < 1) {
            results = await wbTransportWaWbDetailsQueries.selectOneByRequisitionId(whereCluse);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbTransportWaWbQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`] = requisitionId;
        whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
        let results = await wbTransportWaWbDetailsQueries.selectWithFabricManufacturedByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                element.yarnOrderRequisitions = await waService.selectRequisitionsForWaYarnOrderRequisition(
                    element.id
                )
                element.manufacturingRequisitions = await wbService.selectManufacturingRequisitionsForTransportWaWb(
                    element.wb_id
                )
            }
        } else {            
            results = await wbTransportWaWbDetailsQueries.selectOneWithFabricManufacturedByRequisitionId(whereCluse);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectWbConsigmentsYarn = async (whereCluse, consigmentsYarn) => {

    const results = await wbTransportWaWbDetailsQueries.selectWbConsigmentsYarn(whereCluse, consigmentsYarn);
    return results;

};

exports.update = async (wbTransportWaWbRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.id`] = wbTransportWaWbRequisitionDetails.id;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    const isFound = await wbTransportWaWbDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbTransportWaWbRequisitionDetails.wbTransportWaWbId = isFound[0].wb_transport_wa_wb_id

        // Update wb transport wa wb requisition Without Quantity
        callArray.push(wbTransportWaWbQueries.update({
            date: wbTransportWaWbRequisitionDetails.date,
            note: wbTransportWaWbRequisitionDetails.note
        },
            {
                id: wbTransportWaWbRequisitionDetails.wbTransportWaWbId
            }))


        // Update wb transport wa wb requisition details Without Quantity
        callArray.push(
            wbTransportWaWbDetailsQueries.update({
                price: wbTransportWaWbRequisitionDetails.price,
                price_dollar: wbTransportWaWbRequisitionDetails.priceDollar,
                document: wbTransportWaWbRequisitionDetails.document,
                statement: wbTransportWaWbRequisitionDetails.statement
            },
                {
                    id: wbTransportWaWbRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waCottonResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbTransportWaWbRequisitionDetails.quantity)
        let defferenceQuantity = 0

        const selectOneWbRecord = await wbQueries.selectOne({
            wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.id
        })

        // console.log("newQuantity ::: ", newQuantity);
        // console.log("oldQuantity ::: ", oldQuantity);
        if (selectOneWbRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wa) by following Steps :
                // Step 1 => Check If has current quantity in store (wa)
                const sumCurrentQuantityWa = await waService.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa(
                    isFound[0].warehouse_id,
                    isFound[0].yarn_id,
                    isFound[0].yarn_lot_id,
                    isFound[0].from_consigment_yarn_id,
                    isFound[0].from_wa_yarn_order_requisition_id
                )
                // console.log("sumCurrentQuantityWa ::: ", sumCurrentQuantityWa);
                if (sumCurrentQuantityWa[0] != null) {
                    // console.log("sumCurrentQuantityWa ::: ", sumCurrentQuantityWa);
                    const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // update order quantity
                        await waYarnOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wa_yarn_order_requisition_details_id, defferenceQuantity)

                        // Step 2 => Increment quantity in  wa_cotton_sell_requisition_details
                        await wbTransportWaWbDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wbTransportWaWbRequisitionDetails.id
                        })

                        // Step 3 => select from (WA) Records for decrement current quantity
                        const waRecords = await waService.selectByYarnForSell(
                            isFound[0].warehouse_id,
                            isFound[0].yarn_id,
                            isFound[0].yarn_lot_id,
                            isFound[0].from_consigment_yarn_id,
                            isFound[0].from_wa_yarn_order_requisition_id
                        )
                        if (waRecords[0] != null) {
                            // console.log("waRecords ::: ", waRecords);

                            // Increment Wb current_quantity
                            await wbQueries.update({
                                current_quantity: selectOneWbRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWbRecord[0].id
                            })

                            for (let i = 0; i < waRecords.length; i++) {
                                const waRecord = waRecords[i];
                                let currentQuantity = waRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wa CurrentQuantity
                                let returnedQuantityObj = await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, waRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wa_id existed in wa_cotton_sell_requisition_details_wa
                                // that has same wb_transport_wa_wb_details_id
                                const isExisitId = await wbTransportWaWbRequisitionDetailsWaService.select({
                                    wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.id,
                                    wa_id: waRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wb_transport_wa_wb_requisition_details_wa
                                    updateResults = await wbTransportWaWbDetailsWaQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.id,
                                        wa_id: isExisitId[0].wa_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wb_transport_wa_wb_requisition_details_wa
                                    updateResults = await wbTransportWaWbRequisitionDetailsWaService.create(wbTransportWaWbRequisitionDetails, {
                                        wbTransportWaWbDetailsId: wbTransportWaWbRequisitionDetails.id,
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
                // console.log("selectOneWbRecord[0].current_quantity ::: ", selectOneWbRecord[0].current_quantity);

                if (selectOneWbRecord[0].current_quantity >= defferenceQuantity) {

                    // update order quantity
                    await waYarnOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wa_yarn_order_requisition_details_id, defferenceQuantity)

                    // Step 1 => Decrement quantity in  wb_transport_wa_wb_details
                    await wbTransportWaWbDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wbTransportWaWbRequisitionDetails.id
                    })

                    // Decrement wb current_quantity
                    await wbQueries.update({
                        current_quantity: selectOneWbRecord[0].current_quantity - defferenceQuantity
                    }, {
                        id: selectOneWbRecord[0].id
                    })

                    // Step 2 => Select From wb_transport_wa_wb_details_wa Records
                    let whereCluseDetailsWa = {};
                    whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`] = wbTransportWaWbRequisitionDetails.id;
                    whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.is_deleted`] = 0;
                    whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.is_active`] = 1;
                    const wbTransportWaWbRequisitionDetailsWaRecords = await wbTransportWaWbRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
                        ["quantity", ">", "0"])
                    if (wbTransportWaWbRequisitionDetailsWaRecords[0] != null) {
                        for (let j = 0; j < wbTransportWaWbRequisitionDetailsWaRecords.length; j++) {
                            const wbTransportWaWbRequisitionDetailsWaRecord = wbTransportWaWbRequisitionDetailsWaRecords[j];
                            let wbTransportWaWbRequisitionDetailsWaQuantity = wbTransportWaWbRequisitionDetailsWaRecord.quantity
                            let updatedQuantity = 0

                            if (wbTransportWaWbRequisitionDetailsWaQuantity >= defferenceQuantity) {
                                // Decrement wb_transport_wa_wb_details_wa quantity
                                await wbTransportWaWbDetailsWaQueries.update({
                                    quantity: wbTransportWaWbRequisitionDetailsWaQuantity - defferenceQuantity
                                }, {
                                    wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.id,
                                    wa_id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wb_transport_wa_wb_details_wa quantity
                                await wbTransportWaWbDetailsWaQueries.update({
                                    quantity: 0
                                }, {
                                    wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.id,
                                    wa_id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
                                })
                                updatedQuantity = wbTransportWaWbRequisitionDetailsWaQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wbTransportWaWbRequisitionDetailsWaQuantity).toFixed(3))
                            }

                            // select wa record
                            const waRecord = await waQueries.selectOne({
                                id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
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
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: selectOneWbRecord[0].current_quantity,
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

exports.updateDecrement = async (wbTransportWaWbRequisitionDetails) => {
    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.id`] = wbTransportWaWbRequisitionDetails.requisition_details_id;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    const isFound = await wbTransportWaWbDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        // let currentQuantity = waCottonResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbTransportWaWbRequisitionDetails.quantity)
        let defferenceQuantity = 0

        defferenceQuantity = newQuantity

        const selectOneWbRecord = await wbQueries.selectOne({
            wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.requisition_details_id
        })

        // Step 1 => Decrement quantity in  wb_transport_wa_wb_details
        await wbTransportWaWbDetailsQueries.update({
            quantity: oldQuantity - defferenceQuantity
        }, {
            id: wbTransportWaWbRequisitionDetails.requisition_details_id
        })

        // Decrement wb current_quantity
        await wbQueries.update({
            current_quantity: selectOneWbRecord[0].current_quantity - defferenceQuantity
        }, {
            id: selectOneWbRecord[0].id
        })

        // Step 2 => Select From wb_transport_wa_wb_details_wa Records
        let whereCluseDetailsWa = {};
        whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`] = wbTransportWaWbRequisitionDetails.requisition_details_id;
        whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.is_deleted`] = 0;
        whereCluseDetailsWa[`${wbTransportWaWbDetailsWaTableName}.is_active`] = 1;
        const wbTransportWaWbRequisitionDetailsWaRecords = await wbTransportWaWbRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
            ["quantity", ">", "0"])
        if (wbTransportWaWbRequisitionDetailsWaRecords[0] != null) {
            for (let j = 0; j < wbTransportWaWbRequisitionDetailsWaRecords.length; j++) {
                const wbTransportWaWbRequisitionDetailsWaRecord = wbTransportWaWbRequisitionDetailsWaRecords[j];
                let wbTransportWaWbRequisitionDetailsWaQuantity = wbTransportWaWbRequisitionDetailsWaRecord.quantity
                let updatedQuantity = 0

                if (wbTransportWaWbRequisitionDetailsWaQuantity >= defferenceQuantity) {
                    // Decrement wb_transport_wa_wb_details_wa quantity
                    await wbTransportWaWbDetailsWaQueries.update({
                        quantity: wbTransportWaWbRequisitionDetailsWaQuantity - defferenceQuantity
                    }, {
                        wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.requisition_details_id,
                        wa_id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
                    })
                    updatedQuantity = defferenceQuantity
                    defferenceQuantity = 0
                } else {
                    // Decrement wb_transport_wa_wb_details_wa quantity
                    await wbTransportWaWbDetailsWaQueries.update({
                        quantity: 0
                    }, {
                        wb_transport_wa_wb_details_id: wbTransportWaWbRequisitionDetails.requisition_details_id,
                        wa_id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
                    })
                    updatedQuantity = wbTransportWaWbRequisitionDetailsWaQuantity
                    defferenceQuantity = parseFloat((defferenceQuantity - wbTransportWaWbRequisitionDetailsWaQuantity).toFixed(3))
                }

                // select wa record
                const waRecord = await waQueries.selectOne({
                    id: wbTransportWaWbRequisitionDetailsWaRecord.wa_id
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

        if (updateResults) {
            return updateResults;
        } else {
            return updateResults;
        }
    } else {
        return updateResults;
    }
}