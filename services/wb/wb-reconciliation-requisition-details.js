// Queries
const wbReconciliationRequisitionDetailsQueries = require("../../db/queries/wb/wb-reconciliation-requisition-details");
const wbReconciliationRequisitionQueries = require("../../db/queries/wb/wb-reconciliation-requisition");
const wbReconciliationRequisitionDetailsWbQueries = require("../../db/queries/wb/wb-reconciliation-requisition-details-wb");
const wbQueries = require("../../db/queries/wb/wb");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const wbReconciliationRequisitionDetailsWbTableName = require("../../util/database-tables-name").wbReconciliationRequisitionDetailsWbTableName;
const wbReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").wbReconciliationRequisitionDetailsTableName;

// Services
const wbService = require("./wb");
const wbReconciliationRequisitionDetailsWbService = require("./wb-reconciliation-requisition-details-wb");

exports.create = async (wbReconciliationRequisitionDetails) => {
    for (let i = 0; i < wbReconciliationRequisitionDetails.items.length; i++) {
        wbReconciliationRequisitionDetails.items[i].wbReconciliationRequisitionDetailsId = trans.transform();

        const results = await wbReconciliationRequisitionDetailsQueries.insert(wbReconciliationRequisitionDetails, wbReconciliationRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // Check Reconciliation Type is it Input or Output
            // Output
            if (wbReconciliationRequisitionDetails.items[i].inputOutput == 0) {
                let newQuantity = parseFloat(wbReconciliationRequisitionDetails.items[i].quantity)
                // select wb Yarn for decrement current quantity
                const yarnsStoredInWaResult = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                    wbReconciliationRequisitionDetails.industryId, 
                    wbReconciliationRequisitionDetails.items[i].yarnId, 
                    wbReconciliationRequisitionDetails.items[i].yarnLotId,
                    wbReconciliationRequisitionDetails.items[i].consigmentYarnId)
                if (yarnsStoredInWaResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                        const yarnStoredInWb = yarnsStoredInWaResult[j];
                        let currentQuantity = yarnStoredInWb.current_quantity
                        let updatedQuantity = 0

                        // decrement wb Yarn CurrentQuantity
                        let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWb, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wbReconciliationRequisitionDetails.items[i].wbId = yarnStoredInWb.id
                        wbReconciliationRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wb Yarn Reconciliation Requisition Details wb
                        await wbReconciliationRequisitionDetailsWbService.createForOutput(wbReconciliationRequisitionDetails, wbReconciliationRequisitionDetails.items[i])

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
            } else if (wbReconciliationRequisitionDetails.items[i].inputOutput == 1) {
                // Add wb Yarn Result
                const wbResult = await wbService.createForReconciliation(wbReconciliationRequisitionDetails, wbReconciliationRequisitionDetails.items[i])
                if (wbResult) {
                    // Add wb Yarn Reconciliation Requisition Details wb
                    await wbReconciliationRequisitionDetailsWbService.createForInput(wbReconciliationRequisitionDetails, wbReconciliationRequisitionDetails.items[i])
                } else {
                    return constants.insertError;
                }

            }
        }
    }
    return { ...constants.insertSuccess, ...{ id: wbReconciliationRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbReconciliationRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        let results = await wbReconciliationRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        if(results[0] == null) {
            results = await wbReconciliationRequisitionDetailsQueries.selectOneByRequisitionId(requisitionId);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wbReconciliationRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.id`] = wbReconciliationRequisitionDetails.id;
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wbReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbReconciliationRequisitionDetails.wbReconciliationRequisitionId = isFound[0].wb_reconcilition_requisition_id
        // Update wa Yarn reconciliation requisition Without Quantity
        callArray.push(wbReconciliationRequisitionQueries.update({
            date: wbReconciliationRequisitionDetails.date,
            note: wbReconciliationRequisitionDetails.note
        },
            {
                id: wbReconciliationRequisitionDetails.wbReconciliationRequisitionId
            }))

        // Update wa Yarn reconciliation requisition details Without Quantity
        callArray.push(
            wbReconciliationRequisitionDetailsQueries.update({
                price: wbReconciliationRequisitionDetails.price,
                price_dollar: wbReconciliationRequisitionDetails.priceDollar,
                statement: wbReconciliationRequisitionDetails.statement
            },
                {
                    id: wbReconciliationRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        if (wbReconciliationRequisitionDetails.inputOutput == '0') {
            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wb Yarn) by following Steps :
                // Step 1 => Check If has current quantity in store (wb Yarn)
                const sumCurrentQuantityWa = await wbService.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(
                    isFound[0].industry_id, 
                    isFound[0].yarn_id, 
                    isFound[0].yarn_lot_id,
                    isFound[0].consigment_yarn_id)
                if (sumCurrentQuantityWa[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wb_reconciliation_requisition_details
                        await wbReconciliationRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wbReconciliationRequisitionDetails.id
                        })

                        // Step 3 => select from (WB Yarn) Records for decrement current quantity
                        const wbRecords = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                            isFound[0].industry_id, 
                            isFound[0].yarn_id, 
                            isFound[0].yarn_lot_id,
                            isFound[0].consigment_yarn_id
                            )
                        if (wbRecords[0] != null) {
                            for (let i = 0; i < wbRecords.length; i++) {
                                const wbRecord = wbRecords[i];
                                let currentQuantity = wbRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wb Yarn CurrentQuantity
                                let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(defferenceQuantity, currentQuantity, wbRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wb_id existed in wb_reconciliation_requisition_details_wb
                                // that has same wb_reconcilition_requisition_details_id
                                const isExisitId = await wbReconciliationRequisitionDetailsWbService.select({
                                    wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                                    wb_id: wbRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wb_reconciliation_requisition_details_wb
                                    updateResults = await wbReconciliationRequisitionDetailsWbQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                                        wb_id: isExisitId[0].wb_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wb_reconciliation_requisition_details_wb
                                    updateResults = await wbReconciliationRequisitionDetailsWbService.createForOutput(wbReconciliationRequisitionDetails, {
                                        wbReconciliationRequisitionDetailsId: wbReconciliationRequisitionDetails.id,
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

                // Step 1 => Decrement quantity in  wb_reconciliation_requisition_details
                await wbReconciliationRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wbReconciliationRequisitionDetails.id
                })

                // Step 2 => Select From wb_reconciliation_requisition_details_wb Records
                let whereCluseDetailsWb = {};
                whereCluseDetailsWb[`${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`] = wbReconciliationRequisitionDetails.id;
                whereCluseDetailsWb[`${wbReconciliationRequisitionDetailsWbTableName}.is_deleted`] = 0;
                whereCluseDetailsWb[`${wbReconciliationRequisitionDetailsWbTableName}.is_active`] = 1;
                const wbReconciliationRequisitionDetailsWbRecords = await wbReconciliationRequisitionDetailsWbService.selectWithTwoCondition(whereCluseDetailsWb,
                    ["quantity", ">", "0"])
                if (wbReconciliationRequisitionDetailsWbRecords[0] != null) {
                    for (let j = 0; j < wbReconciliationRequisitionDetailsWbRecords.length; j++) {
                        const wbReconciliationRequisitionDetailsWbRecord = wbReconciliationRequisitionDetailsWbRecords[j];
                        let wbReconciliationRequisitionDetailsWbQuantity = wbReconciliationRequisitionDetailsWbRecord.quantity
                        let updatedQuantity = 0

                        if (wbReconciliationRequisitionDetailsWbQuantity >= defferenceQuantity) {
                            // Decrement wb_reconciliation_requisition_details_wb quantity
                            await wbReconciliationRequisitionDetailsWbQueries.update({
                                quantity: wbReconciliationRequisitionDetailsWbQuantity - defferenceQuantity
                            }, {
                                wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                                wb_id: wbReconciliationRequisitionDetailsWbRecord.wb_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wb_reconciliation_requisition_details_wb quantity
                            await wbReconciliationRequisitionDetailsWbQueries.update({
                                quantity: 0
                            }, {
                                wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                                wb_id: wbReconciliationRequisitionDetailsWbRecord.wb_id
                            })
                            updatedQuantity = wbReconciliationRequisitionDetailsWbQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wbReconciliationRequisitionDetailsWbQuantity).toFixed(3))
                        }

                        // select wb Yarn record
                        const wbRecord = await wbQueries.selectOne({
                            id: wbReconciliationRequisitionDetailsWbRecord.wb_id
                        })
                        if (wbRecord[0] != null) {
                            const oldCurrentQuantity = wbRecord[0].current_quantity

                            // Increment wa current_quantity
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
                updateResults = true
            }
        } else if (wbReconciliationRequisitionDetails.inputOutput == '1') {
            // Select from wb_reconciliation_requisition_details_wb to update quantity
            let whereCluse = {};
            whereCluse[`${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`] = wbReconciliationRequisitionDetails.id;
            whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
            whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;
            whereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
            const wbReconciliationRequisitionDetailsWbResult = await wbReconciliationRequisitionDetailsWbService.selectForInput(whereCluse)
            if (wbReconciliationRequisitionDetailsWbResult[0] != null) {
                let wbReconciliationRequisitionDetailsWbQuantity = wbReconciliationRequisitionDetailsWbResult[0].quantity

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // increase quantity in  wb_reconciliation_requisition_details
                    updateResults = await wbReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: wbReconciliationRequisitionDetails.id
                    })

                    // increase wb_reconciliation_requisition_details_wb quantity
                    updateResults = await wbReconciliationRequisitionDetailsWbQueries.update({
                        quantity: wbReconciliationRequisitionDetailsWbQuantity + defferenceQuantity
                    }, {
                        wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                        wb_id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
                    })

                    // select from wb to update quantity
                    const wbResult = await wbQueries.selectOne({
                        id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
                    })
                    if (wbResult[0] != null) {
                        // increase current quantity from wb
                        updateResults = await wbQueries.update({
                            current_quantity: wbResult[0].current_quantity + defferenceQuantity
                        }, {
                            id: wbResult[0].id
                        })
                    }
                } else if (newQuantity < oldQuantity) {
                    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // Check current quantity in stock (wb Yarn) can decrease 
                    // select from wb to update quantity
                    const wbResult = await wbQueries.selectOne({
                        id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
                    })
                    if (wbResult[0] != null) {
                        let currentQuantity = wbResult[0].current_quantity
                        if (currentQuantity >= defferenceQuantity) {

                            // decrease quantity in  wb_reconciliation_requisition_details
                            updateResults = await wbReconciliationRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: wbReconciliationRequisitionDetails.id
                            })

                            // decrease wb_reconciliation_requisition_details_wb quantity
                            updateResults = await wbReconciliationRequisitionDetailsWbQueries.update({
                                quantity: wbReconciliationRequisitionDetailsWbQuantity - defferenceQuantity
                            }, {
                                wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.id,
                                wb_id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
                            })


                            // decrease current quantity from wb
                            updateResults = await wbQueries.update({
                                current_quantity: currentQuantity - defferenceQuantity
                            }, {
                                id: wbResult[0].id
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


exports.updateDecrement = async (wbReconciliationRequisitionDetails) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.id`] = wbReconciliationRequisitionDetails.requisition_details_id;
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wbReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Select from wb_reconciliation_requisition_details_wb to update quantity
        let whereCluse = {};
        whereCluse[`${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`] = wbReconciliationRequisitionDetails.requisition_details_id;
        whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
        const wbReconciliationRequisitionDetailsWbResult = await wbReconciliationRequisitionDetailsWbService.selectForInput(whereCluse)
        if (wbReconciliationRequisitionDetailsWbResult[0] != null) {
            let wbReconciliationRequisitionDetailsWbQuantity = wbReconciliationRequisitionDetailsWbResult[0].quantity

            defferenceQuantity = newQuantity

            // Check current quantity in stock (wb Yarn) can decrease 
            // select from wb to update quantity
            const wbResult = await wbQueries.selectOne({
                id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
            })
            if (wbResult[0] != null) {
                let currentQuantity = wbResult[0].current_quantity
                if (currentQuantity >= defferenceQuantity) {

                    // decrease quantity in  wb_reconciliation_requisition_details
                    updateResults = await wbReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wbReconciliationRequisitionDetails.requisition_details_id
                    })

                    // decrease wb_reconciliation_requisition_details_wb quantity
                    updateResults = await wbReconciliationRequisitionDetailsWbQueries.update({
                        quantity: wbReconciliationRequisitionDetailsWbQuantity - defferenceQuantity
                    }, {
                        wb_reconcilition_requisition_details_id: wbReconciliationRequisitionDetails.requisition_details_id,
                        wb_id: wbReconciliationRequisitionDetailsWbResult[0].wb_id
                    })


                    // decrease current quantity from wb
                    updateResults = await wbQueries.update({
                        current_quantity: currentQuantity - defferenceQuantity
                    }, {
                        id: wbResult[0].id
                    })
                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: currentQuantity,
                        newQuantity: defferenceQuantity
                    }
                }
            }

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
