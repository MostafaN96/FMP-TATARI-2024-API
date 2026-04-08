// Queries
const wcReconciliationRequisitionDetailsQueries = require("../../db/queries/wc/wc-reconciliation-requisition-details");
const wcReconciliationRequisitionQueries = require("../../db/queries/wc/wc-reconciliation-requisition");
const wcReconciliationRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-reconciliation-requisition-details-wc");
const wcQueries = require("../../db/queries/wc/wc");

// Services
const wcService = require("./wc");
const wcReconciliationRequisitionDetailsWcService = require("./wc-reconciliation-requisition-details-wc");
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const knex = require("../../db/config/connection").getConnection();

const { 
    wcReconciliationRequisitionDetailsWcTableName,
    wcReconciliationRequisitionDetailsTableName, 
    wcFabricOrderRequisitionDetailsTableName,
    wcFabricOrderRequisitionTableName
} = require("../../util/database-tables-name");

const getMergedOrderIds = async (parentOrderId) => {
    const mergedOrders = await knex(wcFabricOrderRequisitionTableName)
        .select("id")
        .where({
            is_deleted: 0,
            is_active: 1
        })
        .andWhere(function () {
            this.where("id", parentOrderId)
                .orWhere("parent_wc_fabric_order_requisition_id", parentOrderId);
        })
        .orderBy("date", "asc")
        .orderBy("number", "asc");

    return mergedOrders.length > 0
        ? mergedOrders.map((order) => order.id)
        : [parentOrderId];
};

exports.create = async (wcReconciliationRequisitionDetails) => {
    for (let i = 0; i < wcReconciliationRequisitionDetails.items.length; i++) {
        wcReconciliationRequisitionDetails.items[i].wcReconciliationRequisitionDetailsId = trans.transform();

        // Get merged order ids for searching fabric order requisition details
        const orderIdsToSearch = await getMergedOrderIds(
            wcReconciliationRequisitionDetails.items[i].fabricOrderId
        );

        // Get fabric order requisitions details id for any of the merged orders
        let fabricOrderRequisitionDetailsWhereCluse = {};
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = orderIdsToSearch;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcReconciliationRequisitionDetails.items[i].fabricId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            wcReconciliationRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = selectFabricOrderRequisitionDetailsResult[0].id
            wcReconciliationRequisitionDetails.items[i].fabricOrderId = selectFabricOrderRequisitionDetailsResult[0].wc_fabric_order_requisition_id
            wcReconciliationRequisitionDetails.items[i].ordersRequisitionsId = selectFabricOrderRequisitionDetailsResult[0].orders_requisitions_id

        const results = await wcReconciliationRequisitionDetailsQueries.insert(wcReconciliationRequisitionDetails, wcReconciliationRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // Check Reconciliation Type is it Input or Output
            // Output
            if (wcReconciliationRequisitionDetails.items[i].inputOutput == 0) {
                let newQuantity = parseFloat(wcReconciliationRequisitionDetails.items[i].quantity)
                // select Wc fabric for decrement current quantity using FIFO across merged orders
                // orderIdsToConsume reuses orderIdsToSearch resolved above
                const orderIdsToConsume = orderIdsToSearch;
                let foundStock = false;
                const originalQuantity = newQuantity;

                for (let orderIndex = 0; orderIndex < orderIdsToConsume.length; orderIndex++) {
                    const currentOrderId = orderIdsToConsume[orderIndex];
                    if (newQuantity == 0) {
                        break;
                    }

                    const fabricsStoredInWcResult = await wcService.selectByFabricForSell(
                        wcReconciliationRequisitionDetails.warehouseId,
                        wcReconciliationRequisitionDetails.items[i].fabricId,
                        wcReconciliationRequisitionDetails.items[i].consigmentManufacturingId,
                        currentOrderId
                    );

                    if (fabricsStoredInWcResult[0] == null) {
                        continue;
                    }

                    foundStock = true;

                    for (let j = 0; j < fabricsStoredInWcResult.length; j++) {
                        const fabricStoredInWc = fabricsStoredInWcResult[j];
                        let currentQuantity = fabricStoredInWc.current_quantity;
                        let updatedQuantity = 0;

                        // decrement Wc fabric CurrentQuantity
                        let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(
                            newQuantity,
                            currentQuantity,
                            fabricStoredInWc,
                            updatedQuantity
                        );
                        newQuantity = returnedQuantityObj.newQuantity;
                        updatedQuantity = returnedQuantityObj.updatedQuantity;
                        wcReconciliationRequisitionDetails.items[i].wcId = fabricStoredInWc.id;
                        wcReconciliationRequisitionDetails.items[i].updatedQuantity = updatedQuantity;

                        // Add wc fabric Reconciliation Requisition Details wc
                        await wcReconciliationRequisitionDetailsWcService.createForOutput(
                            wcReconciliationRequisitionDetails,
                            wcReconciliationRequisitionDetails.items[i]
                        );

                        // update order quantity
                        await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(
                            selectFabricOrderRequisitionDetailsResult[0].id,
                            updatedQuantity
                        );

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }
                }

                if (!foundStock || newQuantity > 0) {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: parseFloat((originalQuantity - newQuantity).toFixed(3)),
                        newQuantity: newQuantity
                    };
                }
            } else if (wcReconciliationRequisitionDetails.items[i].inputOutput == 1) {
                // Add Wc Fabric Result
                const wcResult = await wcService.createForReconciliation(wcReconciliationRequisitionDetails, wcReconciliationRequisitionDetails.items[i])
                if (wcResult) {
                    // Add wc Fabric Reconciliation Requisition Details wc
                    await wcReconciliationRequisitionDetailsWcService.createForInput(wcReconciliationRequisitionDetails, wcReconciliationRequisitionDetails.items[i])

                    // update order quantity
                    await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(selectFabricOrderRequisitionDetailsResult[0].id, wcReconciliationRequisitionDetails.items[i].quantity)

                } else {
                    return constants.insertError;
                }

            }
        }
    } else {

    }
    }
    return { ...constants.insertSuccess, ...{ id: wcReconciliationRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcReconciliationRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wcReconciliationRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcReconciliationRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcReconciliationRequisitionDetailsTableName}.id`] = wcReconciliationRequisitionDetails.id;
    whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcReconciliationRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wcReconciliationRequisitionDetails.wcReconciliationRequisitionId = isFound[0].wc_reconcilition_requisition_id
        // Update wa Yarn reconciliation requisition Without Quantity
        callArray.push(wcReconciliationRequisitionQueries.update({
            date: wcReconciliationRequisitionDetails.date,
            note: wcReconciliationRequisitionDetails.note
        },
            {
                id: wcReconciliationRequisitionDetails.wcReconciliationRequisitionId
            }))

        // Update wa Yarn reconciliation requisition details Without Quantity
        callArray.push(
            wcReconciliationRequisitionDetailsQueries.update({
                price: wcReconciliationRequisitionDetails.price,
                price_dollar: wcReconciliationRequisitionDetails.priceDollar,
                fabric_piece: wcReconciliationRequisitionDetails.numberFabricPieces,
                statement: wcReconciliationRequisitionDetails.statement
            },
                {
                    id: wcReconciliationRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wcReconciliationRequisitionDetails.quantity)
        let defferenceQuantity = 0

        if (wcReconciliationRequisitionDetails.inputOutput == '0') {
            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wa Yarn) by following Steps :
                // Step 1 => Check If has current quantity in store (wa Yarn)
                const sumCurrentQuantityWc = await wcService.selectSumCurrentQuantityByWarehouseByFabricByConsigmentManufacturingLotWc(
                    isFound[0].warehouse_id, 
                    isFound[0].fabric_id, 
                    isFound[0].consigment_manufacturing_id,
                    isFound[0].wc_fabric_order_requisition_id
                )
                if (sumCurrentQuantityWc[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWc[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // update order quantity
                        await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                        // Step 2 => Increment quantity in  wa_reconciliation_requisition_details
                        await wcReconciliationRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wcReconciliationRequisitionDetails.id
                        })

                        // Step 3 => select from (WC fabric) Records for decrement current quantity using FIFO across merged orders
                        const orderIdsToConsume = await getMergedOrderIds(isFound[0].wc_fabric_order_requisition_id);
                        let foundStock = false;

                        for (let orderIndex = 0; orderIndex < orderIdsToConsume.length; orderIndex++) {
                            const currentOrderId = orderIdsToConsume[orderIndex];
                            if (defferenceQuantity == 0) {
                                break;
                            }

                            const wcRecords = await wcService.selectByFabricForSell(
                                isFound[0].warehouse_id,
                                isFound[0].fabric_id,
                                isFound[0].consigment_manufacturing_id,
                                currentOrderId
                            );
                            if (wcRecords[0] == null) {
                                continue;
                            }

                            foundStock = true;

                            for (let i = 0; i < wcRecords.length; i++) {
                                const wcRecord = wcRecords[i];
                                let currentQuantity = wcRecord.current_quantity;
                                let updatedQuantity = 0;

                                // decrement Wa Yarn CurrentQuantity
                                let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(
                                    defferenceQuantity,
                                    currentQuantity,
                                    wcRecord,
                                    updatedQuantity
                                );
                                defferenceQuantity = returnedQuantityObj.newQuantity;
                                updatedQuantity = returnedQuantityObj.updatedQuantity;

                                // Step 4 => Check if wc_id existed in wa_reconciliation_requisition_details_wa
                                // that has same wc_reconcilition_requisition_details_id
                                const isExisitId = await wcReconciliationRequisitionDetailsWcService.select({
                                    wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                                    wc_id: wcRecord.id
                                });

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wa_reconciliation_requisition_details_wa
                                    updateResults = await wcReconciliationRequisitionDetailsWcQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                                        wc_id: isExisitId[0].wc_id
                                    });
                                } else {
                                    // Step 4.2 Add Record in wa_reconciliation_requisition_details_wa
                                    updateResults = await wcReconciliationRequisitionDetailsWcService.createForOutput(wcReconciliationRequisitionDetails, {
                                        wcReconciliationRequisitionDetailsId: wcReconciliationRequisitionDetails.id,
                                        wcId: wcRecord.id,
                                        updatedQuantity
                                    });
                                }

                                // Enter to if condition when stock runs out
                                if (defferenceQuantity == 0) {
                                    break;
                                }
                            }
                        }

                        if (!foundStock || defferenceQuantity > 0) {
                            updateResults = false;
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
                await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                // Step 1 => Decrement quantity in  wa_reconciliation_requisition_details
                await wcReconciliationRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: wcReconciliationRequisitionDetails.id
                })

                // Step 2 => Select From wa_reconciliation_requisition_details_wa Records
                let whereCluseDetailsWc = {};
                whereCluseDetailsWc[`${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`] = wcReconciliationRequisitionDetails.id;
                whereCluseDetailsWc[`${wcReconciliationRequisitionDetailsWcTableName}.is_deleted`] = 0;
                whereCluseDetailsWc[`${wcReconciliationRequisitionDetailsWcTableName}.is_active`] = 1;
                const wcReconciliationRequisitionDetailsWcRecords = await wcReconciliationRequisitionDetailsWcService.selectWithTwoCondition(whereCluseDetailsWc,
                    ["quantity", ">", "0"])
                if (wcReconciliationRequisitionDetailsWcRecords[0] != null) {
                    for (let j = 0; j < wcReconciliationRequisitionDetailsWcRecords.length; j++) {
                        const waReconciliationRequisitionDetailsWaRecord = wcReconciliationRequisitionDetailsWcRecords[j];
                        let wcReconciliationRequisitionDetailsWcQuantity = waReconciliationRequisitionDetailsWaRecord.quantity
                        let updatedQuantity = 0

                        if (wcReconciliationRequisitionDetailsWcQuantity >= defferenceQuantity) {
                            // Decrement wa_reconciliation_requisition_details_wa quantity
                            await wcReconciliationRequisitionDetailsWcQueries.update({
                                quantity: wcReconciliationRequisitionDetailsWcQuantity - defferenceQuantity
                            }, {
                                wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                                wc_id: waReconciliationRequisitionDetailsWaRecord.wc_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wa_reconciliation_requisition_details_wa quantity
                            await wcReconciliationRequisitionDetailsWcQueries.update({
                                quantity: 0
                            }, {
                                wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                                wc_id: waReconciliationRequisitionDetailsWaRecord.wc_id
                            })
                            updatedQuantity = wcReconciliationRequisitionDetailsWcQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wcReconciliationRequisitionDetailsWcQuantity).toFixed(3))
                        }

                        // select wa Yarn record
                        const wcRecord = await wcQueries.selectOne({
                            id: waReconciliationRequisitionDetailsWaRecord.wc_id
                        })
                        if (wcRecord[0] != null) {
                            const oldCurrentQuantity = wcRecord[0].current_quantity

                            // Increment wa current_quantity
                            await wcQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: wcRecord[0].id
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
        } else if (wcReconciliationRequisitionDetails.inputOutput == '1') {
            // Select from wc_reconciliation_requisition_details_wc to update quantity
            let whereCluse = {};
            whereCluse[`${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`] = wcReconciliationRequisitionDetails.id;
            whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
            whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
            whereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;
            const wcReconciliationRequisitionDetailsWcResult = await wcReconciliationRequisitionDetailsWcService.selectForInput(whereCluse)
            if (wcReconciliationRequisitionDetailsWcResult[0] != null) {
                let wcReconciliationRequisitionDetailsWcQuantity = wcReconciliationRequisitionDetailsWcResult[0].quantity

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // update order quantity
                    await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                    // increase quantity in  wa_reconciliation_requisition_details
                    updateResults = await wcReconciliationRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: wcReconciliationRequisitionDetails.id
                    })

                    // increase wa_reconciliation_requisition_details_wa quantity
                    updateResults = await wcReconciliationRequisitionDetailsWcQueries.update({
                        quantity: wcReconciliationRequisitionDetailsWcQuantity + defferenceQuantity
                    }, {
                        wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                        wc_id: wcReconciliationRequisitionDetailsWcResult[0].wc_id
                    })

                    // select from wa to update quantity
                    const wcResult = await wcQueries.selectOne({
                        id: wcReconciliationRequisitionDetailsWcResult[0].wc_id
                    })
                    if (wcResult[0] != null) {
                        // increase current quantity from wa
                        updateResults = await wcQueries.update({
                            current_quantity: wcResult[0].current_quantity + defferenceQuantity
                        }, {
                            id: wcResult[0].id
                        })
                    }
                } else if (newQuantity < oldQuantity) {
                    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // update order quantity
                    await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                    // Check current quantity in stock (wa Yarn) can decrease 
                    // select from wa to update quantity
                    const wcResult = await wcQueries.selectOne({
                        id: wcReconciliationRequisitionDetailsWcResult[0].wc_id
                    })
                    if (wcResult[0] != null) {
                        let currentQuantity = wcResult[0].current_quantity
                        if (currentQuantity >= defferenceQuantity) {

                            // decrease quantity in  wa_reconciliation_requisition_details
                            updateResults = await wcReconciliationRequisitionDetailsQueries.update({
                                quantity: oldQuantity - defferenceQuantity
                            }, {
                                id: wcReconciliationRequisitionDetails.id
                            })

                            // decrease wa_reconciliation_requisition_details_wa quantity
                            updateResults = await wcReconciliationRequisitionDetailsWcQueries.update({
                                quantity: wcReconciliationRequisitionDetailsWcQuantity - defferenceQuantity
                            }, {
                                wc_reconcilition_requisition_details_id: wcReconciliationRequisitionDetails.id,
                                wc_id: wcReconciliationRequisitionDetailsWcResult[0].wc_id
                            })


                            // decrease current quantity from wa
                            updateResults = await wcQueries.update({
                                current_quantity: currentQuantity - defferenceQuantity
                            }, {
                                id: wcResult[0].id
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
