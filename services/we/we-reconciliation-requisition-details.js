// Queries
const weReconciliationRequisitionDetailsQueries = require("../../db/queries/we/we-reconciliation-requisition-details");
const weReconciliationRequisitionQueries = require("../../db/queries/we/we-reconciliation-requisition");
const weReconciliationRequisitionDetailsWeQueries = require("../../db/queries/we/we-reconciliation-requisition-details-we");
const weQueries = require("../../db/queries/we/we");
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");

// Services
const weService = require("./we");
const weReconciliationRequisitionDetailsWeService = require("./we-reconciliation-requisition-details-we");
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weReconciliationRequisitionDetailsWeTableName, 
    weReconciliationRequisitionDetailsTableName, 
    weTableName, 
    weDyedFabricOrderRequisitionDetailsTableName 
} = require("../../util/database-tables-name");

exports.create = async (weReconciliationRequisitionDetails) => {
    for (let i = 0; i < weReconciliationRequisitionDetails.items.length; i++) {
        weReconciliationRequisitionDetails.items[i].weReconciliationRequisitionDetailsId = trans.transform();

        // Check Consigment Dyeing Dupplication
        const selectConsigmentDyeingOneResult = await consigmentDyeingQueries.selectOne({ number: weReconciliationRequisitionDetails.items[i].consigmentDyeingNumber })
        if (Array.isArray(selectConsigmentDyeingOneResult) && selectConsigmentDyeingOneResult.length > 0) {
            weReconciliationRequisitionDetails.items[i].consigmentDyeingId = selectConsigmentDyeingOneResult[0].id;
        } else {
            weReconciliationRequisitionDetails.items[i].consigmentDyeingId = trans.transform();
            await consigmentDyeingQueries.insertForAdd(weReconciliationRequisitionDetails, weReconciliationRequisitionDetails.items[i]);
        }

        // Get we fabric order by order requisition id
        let weDyedFabricOrderRequisitionDetailsWhereCluse = {};
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        // weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = weReconciliationRequisitionDetails.items[i].ordersRequisitionsId;
        weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`] = weReconciliationRequisitionDetails.items[i].dyedFabricId;

        const selectWeDyedFabricOrderRequisitionDetailsResult = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(weDyedFabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectWeDyedFabricOrderRequisitionDetailsResult) && selectWeDyedFabricOrderRequisitionDetailsResult.length > 0) {
            weReconciliationRequisitionDetails.items[i].weDyedFabricOrderRequisitionDetailsId = selectWeDyedFabricOrderRequisitionDetailsResult[0].id

        const results = await weReconciliationRequisitionDetailsQueries.insert(weReconciliationRequisitionDetails, weReconciliationRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // Check Reconciliation Type is it Input or Output
            // Output
            if (weReconciliationRequisitionDetails.items[i].inputOutput == 0) {
                let newQuantity = parseFloat(weReconciliationRequisitionDetails.items[i].quantity)
                // select Wc fabric for decrement current quantity
                let weWhereCluse = {}
                weWhereCluse[`${weTableName}.id`] = weReconciliationRequisitionDetails.items[i].weId
                const fabricsStoredInWeResult = await weQueries.selectOne(weWhereCluse)
                if (fabricsStoredInWeResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWeResult.length; j++) {
                        const fabricStoredInWe = fabricsStoredInWeResult[j];
                        let currentQuantity = fabricStoredInWe.current_quantity
                        let updatedQuantity = 0

                        // decrement Wc fabric CurrentQuantity
                        let returnedQuantityObj = await weService.decrementWeCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        weReconciliationRequisitionDetails.items[i].weId = fabricStoredInWe.id
                        weReconciliationRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wc fabric Reconciliation Requisition Details wc
                        await weReconciliationRequisitionDetailsWeService.createForOutput(weReconciliationRequisitionDetails, weReconciliationRequisitionDetails.items[i])

                        // update order quantity
                        await weDyedFabricOrderRequisitionDetailsService.updateForIncrementQuantity(selectWeDyedFabricOrderRequisitionDetailsResult[0].id, updatedQuantity)

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
            } else if (weReconciliationRequisitionDetails.items[i].inputOutput == 1) {

                // Add Wc Fabric Result
                const weResult = await weService.createForReconciliation(weReconciliationRequisitionDetails, weReconciliationRequisitionDetails.items[i])
                if (weResult) {
                    // Add wc Fabric Reconciliation Requisition Details wc
                    await weReconciliationRequisitionDetailsWeService.createForInput(weReconciliationRequisitionDetails, weReconciliationRequisitionDetails.items[i])
                
                    // update order quantity
                    await weDyedFabricOrderRequisitionDetailsService.updateForDecrementQuantity(selectWeDyedFabricOrderRequisitionDetailsResult[0].id, weReconciliationRequisitionDetails.items[i].quantity)

                } else {
                    return constants.insertError;
                }

            }
        }
    } else {

    }
    }
    return { ...constants.insertSuccess, ...{ id: weReconciliationRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weReconciliationRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await weReconciliationRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weReconciliationRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weReconciliationRequisitionDetailsTableName}.id`] = weReconciliationRequisitionDetails.id;
    whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let weReconciliationRequisitionDetailsWeWhereCluse = {}
        weReconciliationRequisitionDetailsWeWhereCluse[`${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`] = weReconciliationRequisitionDetails.id
        const weReconciliationRequisitionDetailsWeSelectOneResult = await weReconciliationRequisitionDetailsWeQueries.selectOne(weReconciliationRequisitionDetailsWeWhereCluse)
        if (weReconciliationRequisitionDetailsWeSelectOneResult[0] != null) {

            weReconciliationRequisitionDetails.weReconciliationRequisitionId = isFound[0].we_reconcilition_requisition_id
            // Update we reconciliation requisition Without Quantity
            callArray.push(weReconciliationRequisitionQueries.update({
                date: weReconciliationRequisitionDetails.date,
                note: weReconciliationRequisitionDetails.note
            },
                {
                    id: weReconciliationRequisitionDetails.weReconciliationRequisitionId
                }))

            // Update we reconciliation requisition details Without Quantity
            callArray.push(
                weReconciliationRequisitionDetailsQueries.update({
                    color_id: weReconciliationRequisitionDetails.colorId,
                    color_category_id: weReconciliationRequisitionDetails.colorCategoryId,
                    color_code: weReconciliationRequisitionDetails.colorCode,
                    fabric_piece: weReconciliationRequisitionDetails.numberFabricPieces,
                    work_order_number: weReconciliationRequisitionDetails.workOrderNumber,
                    price: weReconciliationRequisitionDetails.price,
                    price_dollar: weReconciliationRequisitionDetails.priceDollar,
                    statement: weReconciliationRequisitionDetails.statement
                },
                    {
                        id: weReconciliationRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(weReconciliationRequisitionDetails.quantity)
            let defferenceQuantity = 0

            if (weReconciliationRequisitionDetails.inputOutput == '0') {
                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // we will decrement current quantity from store (we) by following Steps :
                    // Step 1 => Check If has current quantity in store (we)
                    let weWhereCluse = {}
                    weWhereCluse[`${weTableName}.id`] = weReconciliationRequisitionDetailsWeSelectOneResult[0].we_id
                    const sumCurrentQuantityWe = await weQueries.selectOne(weWhereCluse)
                    if (sumCurrentQuantityWe[0] != null) {
                        const sumCurrentQuantity = sumCurrentQuantityWe[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                        // update order quantity
                        await weDyedFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                            // Step 2 => Increment quantity in  we_reconciliation_requisition_details
                            await weReconciliationRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: weReconciliationRequisitionDetails.id
                            })

                            // Step 3 => select from (we) Records for decrement current quantity
                            let weRecordWhereCluse = {}
                            weRecordWhereCluse[`${weTableName}.id`] = weReconciliationRequisitionDetailsWeSelectOneResult[0].we_id
                            const weRecords = await weQueries.selectOne(weRecordWhereCluse)
                            if (weRecords[0] != null) {
                                for (let i = 0; i < weRecords.length; i++) {
                                    const weRecord = weRecords[i];
                                    let currentQuantity = weRecord.current_quantity
                                    let updatedQuantity = 0

                                    // decrement we CurrentQuantity
                                    let returnedQuantityObj = await weService.decrementWeCurrentQuantity(defferenceQuantity, currentQuantity, weRecord, updatedQuantity);
                                    defferenceQuantity = returnedQuantityObj.newQuantity
                                    updatedQuantity = returnedQuantityObj.updatedQuantity

                                    // Step 4 => Check if we_id existed in we_reconciliation_requisition_details_we
                                    // that has same we_reconcilition_requisition_details_id
                                    const isExisitId = await weReconciliationRequisitionDetailsWeService.select({
                                        we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                                        we_id: weRecord.id
                                    })

                                    if (isExisitId[0] != null) {
                                        // Step 4.1 => Update Quantity in we_reconciliation_requisition_details_we
                                        updateResults = await weReconciliationRequisitionDetailsWeQueries.update({
                                            quantity: isExisitId[0].quantity + updatedQuantity
                                        }, {
                                            we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                                            we_id: isExisitId[0].we_id
                                        })
                                    } else {
                                        // Step 4.2 Add Record in we_reconciliation_requisition_details_we
                                        updateResults = await weReconciliationRequisitionDetailsWeService.createForOutput(weReconciliationRequisitionDetails, {
                                            weReconciliationRequisitionDetailsId: weReconciliationRequisitionDetails.id,
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

                // update order quantity
                await weDyedFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                    // Step 1 => Decrement quantity in  we_reconciliation_requisition_details
                    await weReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: weReconciliationRequisitionDetails.id
                    })

                    // Step 2 => Select From we_reconciliation_requisition_details_we Records
                    let whereCluseDetailsWe = {};
                    whereCluseDetailsWe[`${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`] = weReconciliationRequisitionDetails.id;
                    whereCluseDetailsWe[`${weReconciliationRequisitionDetailsWeTableName}.is_deleted`] = 0;
                    whereCluseDetailsWe[`${weReconciliationRequisitionDetailsWeTableName}.is_active`] = 1;
                    const weReconciliationRequisitionDetailsWeRecords = await weReconciliationRequisitionDetailsWeService.selectWithTwoCondition(whereCluseDetailsWe,
                        ["quantity", ">", "0"])
                    if (weReconciliationRequisitionDetailsWeRecords[0] != null) {
                        for (let j = 0; j < weReconciliationRequisitionDetailsWeRecords.length; j++) {
                            const weReconciliationRequisitionDetailsWeRecord = weReconciliationRequisitionDetailsWeRecords[j];
                            let weReconciliationRequisitionDetailsWeQuantity = weReconciliationRequisitionDetailsWeRecord.quantity
                            let updatedQuantity = 0

                            if (weReconciliationRequisitionDetailsWeQuantity >= defferenceQuantity) {
                                // Decrement we_reconciliation_requisition_details_we quantity
                                await weReconciliationRequisitionDetailsWeQueries.update({
                                    quantity: weReconciliationRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                                    we_id: weReconciliationRequisitionDetailsWeRecord.we_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement we_reconciliation_requisition_details_we quantity
                                await weReconciliationRequisitionDetailsWeQueries.update({
                                    quantity: 0
                                }, {
                                    we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                                    we_id: weReconciliationRequisitionDetailsWeRecord.we_id
                                })
                                updatedQuantity = weReconciliationRequisitionDetailsWeQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - weReconciliationRequisitionDetailsWeQuantity).toFixed(3))
                            }

                            // select we record
                            const weRecord = await weQueries.selectOne({
                                id: weReconciliationRequisitionDetailsWeRecord.we_id
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
                    updateResults = true
                }
            } else if (weReconciliationRequisitionDetails.inputOutput == '1') {
                // Select from we_reconciliation_requisition_details_we to update quantity
                let whereCluse = {};
                whereCluse[`${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`] = weReconciliationRequisitionDetails.id;
                whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
                whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;
                whereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;
                const weReconciliationRequisitionDetailsWeResult = await weReconciliationRequisitionDetailsWeService.selectForInput(whereCluse)
                if (weReconciliationRequisitionDetailsWeResult[0] != null) {
                    let weReconciliationRequisitionDetailsWeQuantity = weReconciliationRequisitionDetailsWeResult[0].quantity

                    // Check Quantity
                    if (newQuantity > oldQuantity) {
                        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // update order quantity
                    await weDyedFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                        // increase quantity in  we_reconciliation_requisition_details
                        updateResults = await weReconciliationRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: weReconciliationRequisitionDetails.id
                        })

                        // increase we_reconciliation_requisition_details_we quantity
                        updateResults = await weReconciliationRequisitionDetailsWeQueries.update({
                            quantity: weReconciliationRequisitionDetailsWeQuantity + defferenceQuantity
                        }, {
                            we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                            we_id: weReconciliationRequisitionDetailsWeResult[0].we_id
                        })

                        // select from we to update quantity
                        const weResult = await weQueries.selectOne({
                            id: weReconciliationRequisitionDetailsWeResult[0].we_id
                        })
                        if (weResult[0] != null) {
                            // increase current quantity from we
                            updateResults = await weQueries.update({
                                current_quantity: weResult[0].current_quantity + defferenceQuantity
                            }, {
                                id: weResult[0].id
                            })
                        }
                    } else if (newQuantity < oldQuantity) {
                        defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // update order quantity
                    await weDyedFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].we_dyed_fabric_order_requisition_details_id, defferenceQuantity)

                        // Check current quantity in stock (we) can decrease 
                        // select from we to update quantity
                        const weResult = await weQueries.selectOne({
                            id: weReconciliationRequisitionDetailsWeResult[0].we_id
                        })
                        if (weResult[0] != null) {
                            let currentQuantity = weResult[0].current_quantity
                            if (currentQuantity >= defferenceQuantity) {

                                // decrease quantity in  we_reconciliation_requisition_details
                                updateResults = await weReconciliationRequisitionDetailsQueries.update({
                                    quantity: oldQuantity - defferenceQuantity
                                }, {
                                    id: weReconciliationRequisitionDetails.id
                                })

                                // decrease we_reconciliation_requisition_details_we quantity
                                updateResults = await weReconciliationRequisitionDetailsWeQueries.update({
                                    quantity: weReconciliationRequisitionDetailsWeQuantity - defferenceQuantity
                                }, {
                                    we_reconcilition_requisition_details_id: weReconciliationRequisitionDetails.id,
                                    we_id: weReconciliationRequisitionDetailsWeResult[0].we_id
                                })

                                // decrease current quantity from we
                                updateResults = await weQueries.update({
                                    current_quantity: currentQuantity - defferenceQuantity
                                }, {
                                    id: weResult[0].id
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
            updateResults = false
        }
    } else {
        return constants.itemNotFound;
    }

};
