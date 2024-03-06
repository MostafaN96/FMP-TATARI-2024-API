// Queries
const waReconciliationRequisitionDetailsQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details");
const waReconciliationRequisitionQueries = require("../../db/queries/wa/wa-reconciliation-requisition");
const waReconciliationRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details-wa");
const waQueries = require("../../db/queries/wa/wa");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const waReconciliationRequisitionDetailsWaTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;
const waReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;

// Services
const waService = require("./wa");
const waReconciliationRequisitionDetailsWaService = require("./wa-reconciliation-requisition-details-wa");

exports.create = async (waReconciliationRequisitionDetails) => {
    for (let i = 0; i < waReconciliationRequisitionDetails.items.length; i++) {
        waReconciliationRequisitionDetails.items[i].waReconciliationRequisitionDetailsId = trans.transform();

        const results = await waReconciliationRequisitionDetailsQueries.insert(waReconciliationRequisitionDetails, waReconciliationRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // Check Reconciliation Type is it Input or Output
            // Output
            if (waReconciliationRequisitionDetails.items[i].inputOutput == 0) {
                let newQuantity = parseFloat(waReconciliationRequisitionDetails.items[i].quantity)
                // select Wa Yarn for decrement current quantity
                const yarnsStoredInWaResult = await waService.selectByYarnForSell(
                    waReconciliationRequisitionDetails.warehouseId, 
                    waReconciliationRequisitionDetails.items[i].yarnId, 
                    waReconciliationRequisitionDetails.items[i].yarnLotId,
                    waReconciliationRequisitionDetails.items[i].consigmentYarnId)
                if (yarnsStoredInWaResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                        const yarnStoredInWa = yarnsStoredInWaResult[j];
                        let currentQuantity = yarnStoredInWa.current_quantity
                        let updatedQuantity = 0

                        // decrement Wa Yarn CurrentQuantity
                        let returnedQuantityObj = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        waReconciliationRequisitionDetails.items[i].waId = yarnStoredInWa.id
                        waReconciliationRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wa Yarn Reconciliation Requisition Details Wa
                        await waReconciliationRequisitionDetailsWaService.createForOutput(waReconciliationRequisitionDetails, waReconciliationRequisitionDetails.items[i])

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
            } else if (waReconciliationRequisitionDetails.items[i].inputOutput == 1) {
                // Add Wa Yarn Result
                const waResult = await waService.createForReconciliation(waReconciliationRequisitionDetails, waReconciliationRequisitionDetails.items[i])
                if (waResult) {
                    // Add wa Yarn Reconciliation Requisition Details Wa
                    await waReconciliationRequisitionDetailsWaService.createForInput(waReconciliationRequisitionDetails, waReconciliationRequisitionDetails.items[i])
                } else {
                    return constants.insertError;
                }

            }
        }
    }
    return { ...constants.insertSuccess, ...{ id: waReconciliationRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await waReconciliationRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await waReconciliationRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (waReconciliationRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${waReconciliationRequisitionDetailsTableName}.id`] = waReconciliationRequisitionDetails.id;
    whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        waReconciliationRequisitionDetails.waReconciliationRequisitionId = isFound[0].wa_reconcilition_requisition_id
        // Update wa Yarn reconciliation requisition Without Quantity
        callArray.push(waReconciliationRequisitionQueries.update({
            date: waReconciliationRequisitionDetails.date,
            note: waReconciliationRequisitionDetails.note
        },
            {
                id: waReconciliationRequisitionDetails.waReconciliationRequisitionId
            }))

        // Update wa Yarn reconciliation requisition details Without Quantity
        callArray.push(
            waReconciliationRequisitionDetailsQueries.update({
                price: waReconciliationRequisitionDetails.price,
                statement: waReconciliationRequisitionDetails.statement
            },
                {
                    id: waReconciliationRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(waReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        if (waReconciliationRequisitionDetails.inputOutput == '0') {
            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wa Yarn) by following Steps :
                // Step 1 => Check If has current quantity in store (wa Yarn)
                const sumCurrentQuantityWa = await waService.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa(
                    isFound[0].warehouse_id, 
                    isFound[0].yarn_id, 
                    isFound[0].yarn_lot_id,
                    isFound[0].consigment_yarn_id)
                if (sumCurrentQuantityWa[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wa_reconciliation_requisition_details
                        await waReconciliationRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: waReconciliationRequisitionDetails.id
                        })

                        // Step 3 => select from (WA Yarn) Records for decrement current quantity
                        const waRecords = await waService.selectByYarnForSell(
                            isFound[0].warehouse_id, 
                            isFound[0].yarn_id, 
                            isFound[0].yarn_lot_id,
                            isFound[0].consigment_yarn_id)
                        if (waRecords[0] != null) {
                            for (let i = 0; i < waRecords.length; i++) {
                                const waRecord = waRecords[i];
                                let currentQuantity = waRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wa Yarn CurrentQuantity
                                let returnedQuantityObj = await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, waRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wa_id existed in wa_reconciliation_requisition_details_wa
                                // that has same wa_reconcilition_requisition_details_id
                                const isExisitId = await waReconciliationRequisitionDetailsWaService.select({
                                    wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                                    wa_id: waRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wa_reconciliation_requisition_details_wa
                                    updateResults = await waReconciliationRequisitionDetailsWaQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                                        wa_id: isExisitId[0].wa_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wa_reconciliation_requisition_details_wa
                                    updateResults = await waReconciliationRequisitionDetailsWaService.createForOutput(waReconciliationRequisitionDetails, {
                                        waReconciliationRequisitionDetailsId: waReconciliationRequisitionDetails.id,
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

                // Step 1 => Decrement quantity in  wa_reconciliation_requisition_details
                await waReconciliationRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: waReconciliationRequisitionDetails.id
                })

                // Step 2 => Select From wa_reconciliation_requisition_details_wa Records
                let whereCluseDetailsWa = {};
                whereCluseDetailsWa[`${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`] = waReconciliationRequisitionDetails.id;
                whereCluseDetailsWa[`${waReconciliationRequisitionDetailsWaTableName}.is_deleted`] = 0;
                whereCluseDetailsWa[`${waReconciliationRequisitionDetailsWaTableName}.is_active`] = 1;
                const waReconciliationRequisitionDetailsWaRecords = await waReconciliationRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
                    ["quantity", ">", "0"])
                if (waReconciliationRequisitionDetailsWaRecords[0] != null) {
                    for (let j = 0; j < waReconciliationRequisitionDetailsWaRecords.length; j++) {
                        const waReconciliationRequisitionDetailsWaRecord = waReconciliationRequisitionDetailsWaRecords[j];
                        let waReconciliationRequisitionDetailsWaQuantity = waReconciliationRequisitionDetailsWaRecord.quantity
                        let updatedQuantity = 0

                        if (waReconciliationRequisitionDetailsWaQuantity >= defferenceQuantity) {
                            // Decrement wa_reconciliation_requisition_details_wa quantity
                            await waReconciliationRequisitionDetailsWaQueries.update({
                                quantity: waReconciliationRequisitionDetailsWaQuantity - defferenceQuantity
                            }, {
                                wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                                wa_id: waReconciliationRequisitionDetailsWaRecord.wa_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wa_reconciliation_requisition_details_wa quantity
                            await waReconciliationRequisitionDetailsWaQueries.update({
                                quantity: 0
                            }, {
                                wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                                wa_id: waReconciliationRequisitionDetailsWaRecord.wa_id
                            })
                            updatedQuantity = waReconciliationRequisitionDetailsWaQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - waReconciliationRequisitionDetailsWaQuantity).toFixed(3))
                        }

                        // select wa Yarn record
                        const waRecord = await waQueries.selectOne({
                            id: waReconciliationRequisitionDetailsWaRecord.wa_id
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
        } else if (waReconciliationRequisitionDetails.inputOutput == '1') {
            // Select from wa_reconciliation_requisition_details_wa to update quantity
            let whereCluse = {};
            whereCluse[`${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`] = waReconciliationRequisitionDetails.id;
            whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
            whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;
            whereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
            const waReconciliationRequisitionDetailsWaResult = await waReconciliationRequisitionDetailsWaService.selectForInput(whereCluse)
            if (waReconciliationRequisitionDetailsWaResult[0] != null) {
                let waReconciliationRequisitionDetailsWaQuantity = waReconciliationRequisitionDetailsWaResult[0].quantity

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // increase quantity in  wa_reconciliation_requisition_details
                    updateResults = await waReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: waReconciliationRequisitionDetails.id
                    })

                    // increase wa_reconciliation_requisition_details_wa quantity
                    updateResults = await waReconciliationRequisitionDetailsWaQueries.update({
                        quantity: waReconciliationRequisitionDetailsWaQuantity + defferenceQuantity
                    }, {
                        wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                        wa_id: waReconciliationRequisitionDetailsWaResult[0].wa_id
                    })

                    // select from wa to update quantity
                    const waResult = await waQueries.selectOne({
                        id: waReconciliationRequisitionDetailsWaResult[0].wa_id
                    })
                    if (waResult[0] != null) {
                        // increase current quantity from wa
                        updateResults = await waQueries.update({
                            current_quantity: waResult[0].current_quantity + defferenceQuantity
                        }, {
                            id: waResult[0].id
                        })
                    }
                } else if (newQuantity < oldQuantity) {
                    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // Check current quantity in stock (wa Yarn) can decrease 
                    // select from wa to update quantity
                    const waResult = await waQueries.selectOne({
                        id: waReconciliationRequisitionDetailsWaResult[0].wa_id
                    })
                    if (waResult[0] != null) {
                        let currentQuantity = waResult[0].current_quantity
                        if (currentQuantity >= defferenceQuantity) {

                            // decrease quantity in  wa_reconciliation_requisition_details
                            updateResults = await waReconciliationRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: waReconciliationRequisitionDetails.id
                            })

                            // decrease wa_reconciliation_requisition_details_wa quantity
                            updateResults = await waReconciliationRequisitionDetailsWaQueries.update({
                                quantity: waReconciliationRequisitionDetailsWaQuantity - defferenceQuantity
                            }, {
                                wa_reconcilition_requisition_details_id: waReconciliationRequisitionDetails.id,
                                wa_id: waReconciliationRequisitionDetailsWaResult[0].wa_id
                            })


                            // decrease current quantity from wa
                            updateResults = await waQueries.update({
                                current_quantity: currentQuantity - defferenceQuantity
                            }, {
                                id: waResult[0].id
                            })
                        } else {
                            return {
                                ...constants.wrongQuantity,
                                spentQuantity: currentQuantity,
                                newQuantity: defferenceQuantity
                            }
                        }
                    }

                } else {
                    updateResults = true
                }
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
