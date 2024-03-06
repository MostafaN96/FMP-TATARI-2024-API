// Queries
const wdReconciliationRequisitionDetailsQueries = require("../../db/queries/wd/wd-reconciliation-requisition-details");
const wdReconciliationRequisitionQueries = require("../../db/queries/wd/wd-reconciliation-requisition");
const wdReconciliationRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-reconciliation-requisition-details-wd");
const wdQueries = require("../../db/queries/wd/wd");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const wdReconciliationRequisitionDetailsWdTableName = require("../../util/database-tables-name").wdReconciliationRequisitionDetailsWdTableName;
const wdReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").wdReconciliationRequisitionDetailsTableName;

// Services
const wdService = require("./wd");
const wdReconciliationRequisitionDetailsWdService = require("./wd-reconciliation-requisition-details-wd");

exports.create = async (wdReconciliationRequisitionDetails) => {
    for (let i = 0; i < wdReconciliationRequisitionDetails.items.length; i++) {
        wdReconciliationRequisitionDetails.items[i].wdReconciliationRequisitionDetailsId = trans.transform();

        const results = await wdReconciliationRequisitionDetailsQueries.insert(wdReconciliationRequisitionDetails, wdReconciliationRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // Check Reconciliation Type is it Input or Output
            // Output
            if (wdReconciliationRequisitionDetails.items[i].inputOutput == 0) {
                let newQuantity = parseFloat(wdReconciliationRequisitionDetails.items[i].quantity)
                // select wd for decrement current quantity
                const fabricsStoredInWdResult = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(wdReconciliationRequisitionDetails.dyeingId, wdReconciliationRequisitionDetails.items[i].fabricId, wdReconciliationRequisitionDetails.items[i].consigmentDyeingId)
                if (fabricsStoredInWdResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWdResult.length; j++) {
                        const fabricStoredInWb = fabricsStoredInWdResult[j];
                        let currentQuantity = fabricStoredInWb.current_quantity
                        let updatedQuantity = 0

                        // decrement wd CurrentQuantity
                        let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWb, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wdReconciliationRequisitionDetails.items[i].wdId = fabricStoredInWb.id
                        wdReconciliationRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wd Reconciliation Requisition Details wd
                        await wdReconciliationRequisitionDetailsWdService.createForOutput(wdReconciliationRequisitionDetails, wdReconciliationRequisitionDetails.items[i])

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
            } else if (wdReconciliationRequisitionDetails.items[i].inputOutput == 1) {
                // Add wd Result
                const wdResult = await wdService.createForReconciliation(wdReconciliationRequisitionDetails, wdReconciliationRequisitionDetails.items[i])
                if (wdResult) {
                    // Add wd Reconciliation Requisition Details wd
                    await wdReconciliationRequisitionDetailsWdService.createForInput(wdReconciliationRequisitionDetails, wdReconciliationRequisitionDetails.items[i])
                } else {
                    return constants.insertError;
                }

            }
        }
    }
    return { ...constants.insertSuccess, ...{ id: wdReconciliationRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdReconciliationRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wdReconciliationRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wdReconciliationRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.id`] = wdReconciliationRequisitionDetails.id;
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdReconciliationRequisitionDetails.wdReconciliationRequisitionId = isFound[0].wd_reconcilition_requisition_id
        // Update wd reconciliation requisition Without Quantity
        callArray.push(wdReconciliationRequisitionQueries.update({
            date: wdReconciliationRequisitionDetails.date,
            note: wdReconciliationRequisitionDetails.note
        },
            {
                id: wdReconciliationRequisitionDetails.wdReconciliationRequisitionId
            }))

        // Update wd reconciliation requisition details Without Quantity
        callArray.push(
            wdReconciliationRequisitionDetailsQueries.update({
                price: wdReconciliationRequisitionDetails.price,
                statement: wdReconciliationRequisitionDetails.statement
            },
                {
                    id: wdReconciliationRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wdReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        if (wdReconciliationRequisitionDetails.inputOutput == '0') {
            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wd) by following Steps :
                // Step 1 => Check If has current quantity in store (wd)
                const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(isFound[0].dyeing_id, isFound[0].fabric_id, isFound[0].consigment_dyeing_id)
                if (sumCurrentQuantityWd[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wd_reconciliation_requisition_details
                        await wdReconciliationRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wdReconciliationRequisitionDetails.id
                        })

                        // Step 3 => select from (Wd) Records for decrement current quantity
                        const wdRecords = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(isFound[0].dyeing_id, isFound[0].fabric_id, isFound[0].consigment_dyeing_id)
                        if (wdRecords[0] != null) {
                            for (let i = 0; i < wdRecords.length; i++) {
                                const wdRecord = wdRecords[i];
                                let currentQuantity = wdRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wd CurrentQuantity
                                let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(defferenceQuantity, currentQuantity, wdRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wd_id existed in wd_reconciliation_requisition_details_wd
                                // that has same wd_reconcilition_requisition_details_id
                                const isExisitId = await wdReconciliationRequisitionDetailsWdService.select({
                                    wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                                    wd_id: wdRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wd_reconciliation_requisition_details_wd
                                    updateResults = await wdReconciliationRequisitionDetailsWdQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                                        wd_id: isExisitId[0].wd_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wd_reconciliation_requisition_details_wd
                                    updateResults = await wdReconciliationRequisitionDetailsWdService.createForOutput(wdReconciliationRequisitionDetails, {
                                        wdReconciliationRequisitionDetailsId: wdReconciliationRequisitionDetails.id,
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

                // Step 1 => Decrement quantity in  wb_reconciliation_requisition_details
                await wdReconciliationRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wdReconciliationRequisitionDetails.id
                })

                // Step 2 => Select From wd_reconciliation_requisition_details_wd Records
                let whereCluseDetailsWd = {};
                whereCluseDetailsWd[`${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`] = wdReconciliationRequisitionDetails.id;
                whereCluseDetailsWd[`${wdReconciliationRequisitionDetailsWdTableName}.is_deleted`] = 0;
                whereCluseDetailsWd[`${wdReconciliationRequisitionDetailsWdTableName}.is_active`] = 1;
                const wdReconciliationRequisitionDetailsWdRecords = await wdReconciliationRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                    ["quantity", ">", "0"])
                if (wdReconciliationRequisitionDetailsWdRecords[0] != null) {
                    for (let j = 0; j < wdReconciliationRequisitionDetailsWdRecords.length; j++) {
                        const wdReconciliationRequisitionDetailsWdRecord = wdReconciliationRequisitionDetailsWdRecords[j];
                        let wdReconciliationRequisitionDetailsWdQuantity = wdReconciliationRequisitionDetailsWdRecord.quantity
                        let updatedQuantity = 0

                        if (wdReconciliationRequisitionDetailsWdQuantity >= defferenceQuantity) {
                            // Decrement wd_reconciliation_requisition_details_wd quantity
                            await wdReconciliationRequisitionDetailsWdQueries.update({
                                quantity: wdReconciliationRequisitionDetailsWdQuantity - defferenceQuantity
                            }, {
                                wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                                wd_id: wdReconciliationRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wd_reconciliation_requisition_details_wd quantity
                            await wdReconciliationRequisitionDetailsWdQueries.update({
                                quantity: 0
                            }, {
                                wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                                wd_id: wdReconciliationRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = wdReconciliationRequisitionDetailsWdQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wdReconciliationRequisitionDetailsWdQuantity).toFixed(3))
                        }

                        // select wd record
                        const wdRecord = await wdQueries.selectOne({
                            id: wdReconciliationRequisitionDetailsWdRecord.wd_id
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
                updateResults = true
            }
        } else if (wdReconciliationRequisitionDetails.inputOutput == '1') {
            // Select from wd_reconciliation_requisition_details_wd to update quantity
            let whereCluse = {};
            whereCluse[`${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`] = wdReconciliationRequisitionDetails.id;
            whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
            whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;
            whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
            const wdReconciliationRequisitionDetailsWdResult = await wdReconciliationRequisitionDetailsWdService.selectForInput(whereCluse)
            if (wdReconciliationRequisitionDetailsWdResult[0] != null) {
                let wdReconciliationRequisitionDetailsWdQuantity = wdReconciliationRequisitionDetailsWdResult[0].quantity

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // increase quantity in  wd_reconciliation_requisition_details
                    updateResults = await wdReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: wdReconciliationRequisitionDetails.id
                    })

                    // increase wd_reconciliation_requisition_details_wd quantity
                    updateResults = await wdReconciliationRequisitionDetailsWdQueries.update({
                        quantity: wdReconciliationRequisitionDetailsWdQuantity + defferenceQuantity
                    }, {
                        wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                        wd_id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
                    })

                    // select from wd to update quantity
                    const wdResult = await wdQueries.selectOne({
                        id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
                    })
                    if (wdResult[0] != null) {
                        // increase current quantity from wd
                        updateResults = await wdQueries.update({
                            current_quantity: wdResult[0].current_quantity + defferenceQuantity
                        }, {
                            id: wdResult[0].id
                        })
                    }
                } else if (newQuantity < oldQuantity) {
                    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // Check current quantity in stock (wd) can decrease 
                    // select from wd to update quantity
                    const wdResult = await wdQueries.selectOne({
                        id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
                    })
                    if (wdResult[0] != null) {
                        let currentQuantity = wdResult[0].current_quantity
                        if (currentQuantity >= defferenceQuantity) {

                            // decrease quantity in  wd_reconciliation_requisition_details
                            updateResults = await wdReconciliationRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: wdReconciliationRequisitionDetails.id
                            })

                            // decrease wd_reconciliation_requisition_details_wd quantity
                            updateResults = await wdReconciliationRequisitionDetailsWdQueries.update({
                                quantity: wdReconciliationRequisitionDetailsWdQuantity - defferenceQuantity
                            }, {
                                wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.id,
                                wd_id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
                            })


                            // decrease current quantity from wd
                            updateResults = await wdQueries.update({
                                current_quantity: currentQuantity - defferenceQuantity
                            }, {
                                id: wdResult[0].id
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


exports.updateDecrement = async (wdReconciliationRequisitionDetails) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.id`] = wdReconciliationRequisitionDetails.requisition_details_id;
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wdReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Select from wd_reconciliation_requisition_details_wd to update quantity
        let whereCluse = {};
        whereCluse[`${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`] = wdReconciliationRequisitionDetails.requisition_details_id;
        whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
        const wdReconciliationRequisitionDetailsWdResult = await wdReconciliationRequisitionDetailsWdService.selectForInput(whereCluse)
        if (wdReconciliationRequisitionDetailsWdResult[0] != null) {
            let wdReconciliationRequisitionDetailsWdQuantity = wdReconciliationRequisitionDetailsWdResult[0].quantity

            defferenceQuantity = newQuantity

            // Check current quantity in stock (wd) can decrease 
            // select from wd to update quantity
            const wdResult = await wdQueries.selectOne({
                id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
            })
            if (wdResult[0] != null) {
                let currentQuantity = wdResult[0].current_quantity
                if (currentQuantity >= defferenceQuantity) {

                    // decrease quantity in  wd_reconciliation_requisition_details
                    updateResults = await wdReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wdReconciliationRequisitionDetails.requisition_details_id
                    })

                    // decrease wd_reconciliation_requisition_details_wd quantity
                    updateResults = await wdReconciliationRequisitionDetailsWdQueries.update({
                        quantity: wdReconciliationRequisitionDetailsWdQuantity - defferenceQuantity
                    }, {
                        wd_reconcilition_requisition_details_id: wdReconciliationRequisitionDetails.requisition_details_id,
                        wd_id: wdReconciliationRequisitionDetailsWdResult[0].wd_id
                    })


                    // decrease current quantity from wd
                    updateResults = await wdQueries.update({
                        current_quantity: currentQuantity - defferenceQuantity
                    }, {
                        id: wdResult[0].id
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
