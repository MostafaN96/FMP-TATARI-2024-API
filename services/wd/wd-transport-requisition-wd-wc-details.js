// Queries
const wdTransportRequisitionWdWcDetailsQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details");
const wdTransportWdWcDetailsWdQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details-wd");
const wdTransportRequisitionWdWcQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc");
const wdQueries = require("../../db/queries/wd/wd");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");

// Services
const wdService = require("../wd/wd");
const wdTransportRequisitionWdWcDetailsWdService = require("./wd-transport-requisition-wd-wc-details-wd");
const wcFabricOrderRequisitionDetailsService = require("../wc/wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Config
const knex = require("../../db/config/connection").getConnection();

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wdTransportRequisitionWdWcDetailsWdTableName, 
    wdTransportRequisitionWdWcDetailsTableName, 
    wcFabricOrderRequisitionDetailsTableName,
    wcFabricOrderRequisitionTableName
} = require("../../util/database-tables-name");

exports.create = async (wdTransportRequisitionWdWcDetails) => {
    for (let i = 0; i < wdTransportRequisitionWdWcDetails.items.length; i++) {
        wdTransportRequisitionWdWcDetails.items[i].wdTransportRequisitionWdWcDetailsId = trans.transform();
        wdTransportRequisitionWdWcDetails.items[i].wcId = trans.transform();

        // Check Consigment Manufacturing Dupplication
        const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wdTransportRequisitionWdWcDetails.items[i].consigmentManufacturingNumber })
        if (selectConsigmentManufacturingOneResult[0] != null) {
            wdTransportRequisitionWdWcDetails.items[i].consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
        } else {
            wdTransportRequisitionWdWcDetails.items[i].consigmentManufacturingId = trans.transform();
            await consigmentManufacturingQueries.insertForWdTransportRequisitionWdWc(wdTransportRequisitionWdWcDetails, wdTransportRequisitionWdWcDetails.items[i]);
        }

        // Resolve parent/child orders to include all merged orders
        const parentResult = await knex(wcFabricOrderRequisitionTableName)
          .select("id", "parent_wc_fabric_order_requisition_id")
          .where({ id: wdTransportRequisitionWdWcDetails.items[i].fabricOrderId, is_deleted: 0, is_active: 1 })
          .limit(1);

        const parentOrderId = parentResult && parentResult.length > 0
          ? (parentResult[0].parent_wc_fabric_order_requisition_id || wdTransportRequisitionWdWcDetails.items[i].fabricOrderId)
          : wdTransportRequisitionWdWcDetails.items[i].fabricOrderId;

        const mergedOrders = await knex(wcFabricOrderRequisitionTableName)
          .select("id")
          .where({ is_deleted: 0, is_active: 1 })
          .andWhere(function () {
            this.where("id", parentOrderId)
              .orWhere("parent_wc_fabric_order_requisition_id", parentOrderId);
          })
          .orderBy("date", "asc")
          .orderBy("number", "asc");

        const orderIdsToConsume = mergedOrders.length > 0
          ? mergedOrders.map((order) => order.id)
          : [parentOrderId];

        // Get fabric order requisitions details id for one of the merged orders (first match)
        let selectFabricOrderRequisitionDetailsResult = [];
        for (let orderIndex = 0; orderIndex < orderIdsToConsume.length; orderIndex++) {
            const currentOrderId = orderIdsToConsume[orderIndex];
            let fabricOrderRequisitionDetailsWhereCluse = {};
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = currentOrderId;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wdTransportRequisitionWdWcDetails.items[i].fabricId;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
            const result = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse);
            if (Array.isArray(result) && result.length > 0) {
                selectFabricOrderRequisitionDetailsResult = result;
                break;
            }
        }

        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            const selectedFabricOrderDetail = selectFabricOrderRequisitionDetailsResult[0];
            wdTransportRequisitionWdWcDetails.items[i].wcFabricOrderRequisitionDetailsId = selectedFabricOrderDetail.id;
            wdTransportRequisitionWdWcDetails.items[i].fabricOrderId = selectedFabricOrderDetail.wc_fabric_order_requisition_id || wdTransportRequisitionWdWcDetails.items[i].fabricOrderId;
            wdTransportRequisitionWdWcDetails.items[i].ordersRequisitionsId = selectedFabricOrderDetail.orders_requisitions_id || wdTransportRequisitionWdWcDetails.items[i].ordersRequisitionsId;

        const results = await wdTransportRequisitionWdWcDetailsQueries.insert(wdTransportRequisitionWdWcDetails, wdTransportRequisitionWdWcDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wdTransportRequisitionWdWcDetails.items[i].quantity)
            const originalQuantity = newQuantity;
            let foundStock = false;

            // Iterate through merged orders to consume quantity
            for (let orderIndex = 0; orderIndex < orderIdsToConsume.length; orderIndex++) {
                const currentOrderId = orderIdsToConsume[orderIndex];
                if (newQuantity == 0) {
                    break;
                }

                // select wd for decrement current quantity
                const fabricsStoredInWdResult = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                    wdTransportRequisitionWdWcDetails.dyeingId,
                    wdTransportRequisitionWdWcDetails.items[i].fabricId,
                    wdTransportRequisitionWdWcDetails.items[i].consigmentDyeingId,
                    currentOrderId
                )
                
                if (fabricsStoredInWdResult[0] != null) {
                    foundStock = true;

                    for (let j = 0; j < fabricsStoredInWdResult.length; j++) {
                        const fabricStoredInWd = fabricsStoredInWdResult[j];
                        let currentQuantity = fabricStoredInWd.current_quantity
                        let updatedQuantity = 0

                        // decrement wd CurrentQuantity
                        let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWd, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wdTransportRequisitionWdWcDetails.items[i].wdId = fabricStoredInWd.id
                        wdTransportRequisitionWdWcDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wd Transport wd wc Requisition Details wd
                        await wdTransportRequisitionWdWcDetailsWdService.create(wdTransportRequisitionWdWcDetails, wdTransportRequisitionWdWcDetails.items[i])

                            // update order quantity
                            // await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(selectFabricOrderRequisitionDetailsResult[0].id, updatedQuantity)

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
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

            // Insert WC
            await wcQueries.insertForTransportRequisitionWdWc(wdTransportRequisitionWdWcDetails, wdTransportRequisitionWdWcDetails.items[i])

        } 
    } else {
        return constants.itemNotFound;
    }
    }
    return { ...constants.insertSuccess, ...{ id: wdTransportRequisitionWdWcDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdTransportRequisitionWdWcQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        let results = await wdTransportRequisitionWdWcDetailsQueries.selectByRequisitionId(requisitionId);
        if(results[0] == null) {
            results = await wdTransportRequisitionWdWcDetailsQueries.selectOneByRequisitionId(requisitionId);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdTransportRequisitionWdWcQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wdTransportRequisitionWdWcDetailsQueries.selectWithFabricManufacturedByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wdTransportRequisitionWdWcDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.id`] = wdTransportRequisitionWdWcDetails.id;
    whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    const isFound = await wdTransportRequisitionWdWcDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdTransportRequisitionWdWcDetails.wdTransportRequisitionWdWcId = isFound[0].wd_transport_requisition_wd_wc_id

        // Update wd transport wd wc requisition Without Quantity
        callArray.push(wdTransportRequisitionWdWcQueries.update({
            date: wdTransportRequisitionWdWcDetails.date,
            note: wdTransportRequisitionWdWcDetails.note
        },
            {
                id: wdTransportRequisitionWdWcDetails.wdTransportRequisitionWdWcId
            }))


        // Update wd transport wd wc requisition details Without Quantity
        callArray.push(
            wdTransportRequisitionWdWcDetailsQueries.update({
                price: wdTransportRequisitionWdWcDetails.price,
                price_dollar: wdTransportRequisitionWdWcDetails.priceDollar,
                document: wdTransportRequisitionWdWcDetails.document,
                statement: wdTransportRequisitionWdWcDetails.statement
            },
                {
                    id: wdTransportRequisitionWdWcDetails.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wdTransportRequisitionWdWcDetails.quantity)
        let defferenceQuantity = 0

        const selectOneWcRecord = await wcQueries.selectOne({
            wd_transport_requisition_wd_wc_details_id: wdTransportRequisitionWdWcDetails.id
        })

        if (selectOneWcRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wd) by following Steps :
                // Step 1 => Check If has current quantity in store (wd)
                const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
                    isFound[0].dyeing_id,
                    isFound[0].fabric_id,
                    isFound[0].consigment_dyeing_id,
                    isFound[0].wc_fabric_order_requisition_id
                )
                if (sumCurrentQuantityWd[0] != null) {
                    const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // update order quantity
                        // await wcFabricOrderRequisitionDetailsService.updateForIncrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                        // Step 2 => Increment quantity in  wd_transport_requisition_wd_wc_details
                        await wdTransportRequisitionWdWcDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wdTransportRequisitionWdWcDetails.id
                        })

                        // Step 3 => select from (Wd) Records for decrement current quantity
                        const wdRecords = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                            isFound[0].dyeing_id,
                            isFound[0].fabric_id,
                            isFound[0].consigment_dyeing_id,
                            isFound[0].wc_fabric_order_requisition_id
                        )
                        if (wdRecords[0] != null) {

                            // Increment Wc current_quantity
                            await wcQueries.update({
                                current_quantity: selectOneWcRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWcRecord[0].id
                            })

                            for (let i = 0; i < wdRecords.length; i++) {
                                const wdRecord = wdRecords[i];
                                let currentQuantity = wdRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement Wd CurrentQuantity
                                let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(defferenceQuantity, currentQuantity, wdRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wd_id existed in wd_transport_requisition_wd_wc_details_wd
                                // that has same wd_transport_requisition_wd_wc_details_id
                                const isExisitId = await wdTransportRequisitionWdWcDetailsWdService.select({
                                    wd_transport_requisition_wd_wc_details_id: wdTransportRequisitionWdWcDetails.id,
                                    wd_id: wdRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wd_transport_requisition_wd_wc_details_wd
                                    updateResults = await wdTransportWdWcDetailsWdQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wd_transport_requisition_wd_wc_details_id: wdTransportRequisitionWdWcDetails.id,
                                        wd_id: isExisitId[0].wd_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wd_transport_requisition_wd_wc_details_wd
                                    updateResults = await wdTransportRequisitionWdWcDetailsWdService.create(wdTransportRequisitionWdWcDetails, {
                                        wdTransportRequisitionWdWcDetailsId: wdTransportRequisitionWdWcDetails.id,
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

                if (selectOneWcRecord[0].current_quantity >= defferenceQuantity) {

                    // update order quantity
                    // await wcFabricOrderRequisitionDetailsService.updateForDecrementQuantity(isFound[0].wc_fabric_order_requisition_details_id, defferenceQuantity)

                    // Step 1 => Decrement quantity in  wd_transport_requisition_wd_wc_details
                    await wdTransportRequisitionWdWcDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wdTransportRequisitionWdWcDetails.id
                    })

                    // Decrement wc current_quantity
                    await wcQueries.update({
                        current_quantity: selectOneWcRecord[0].current_quantity - defferenceQuantity
                    }, {
                        id: selectOneWcRecord[0].id
                    })

                    // Step 2 => Select From wd_transport_requisition_wd_wc_details_wd Records
                    let whereCluseDetailsWd = {};
                    whereCluseDetailsWd[`${wdTransportRequisitionWdWcDetailsWdTableName}.wd_transport_requisition_wd_wc_details_id`] = wdTransportRequisitionWdWcDetails.id;
                    whereCluseDetailsWd[`${wdTransportRequisitionWdWcDetailsWdTableName}.is_deleted`] = 0;
                    whereCluseDetailsWd[`${wdTransportRequisitionWdWcDetailsWdTableName}.is_active`] = 1;
                    const wdTransportRequisitionWdWcDetailsWdRecords = await wdTransportRequisitionWdWcDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                        ["quantity", ">", "0"])
                    if (wdTransportRequisitionWdWcDetailsWdRecords[0] != null) {
                        for (let j = 0; j < wdTransportRequisitionWdWcDetailsWdRecords.length; j++) {
                            const wdTransportRequisitionWdWcDetailsWdRecord = wdTransportRequisitionWdWcDetailsWdRecords[j];
                            let wdTransportRequisitionWdWcDetailsWdQuantity = wdTransportRequisitionWdWcDetailsWdRecord.quantity
                            let updatedQuantity = 0

                            if (wdTransportRequisitionWdWcDetailsWdQuantity >= defferenceQuantity) {
                                // Decrement wd_transport_requisition_wd_wc_details_wd quantity
                                await wdTransportWdWcDetailsWdQueries.update({
                                    quantity: wdTransportRequisitionWdWcDetailsWdQuantity - defferenceQuantity
                                }, {
                                    wd_transport_requisition_wd_wc_details_id: wdTransportRequisitionWdWcDetails.id,
                                    wd_id: wdTransportRequisitionWdWcDetailsWdRecord.wd_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wd_transport_requisition_wd_wc_details_wd quantity
                                await wdTransportWdWcDetailsWdQueries.update({
                                    quantity: 0
                                }, {
                                    wd_transport_requisition_wd_wc_details_id: wdTransportRequisitionWdWcDetails.id,
                                    wd_id: wdTransportRequisitionWdWcDetailsWdRecord.wd_id
                                })
                                updatedQuantity = wdTransportRequisitionWdWcDetailsWdQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wdTransportRequisitionWdWcDetailsWdQuantity).toFixed(3))
                            }

                            // select wd record
                            const wdRecord = await wdQueries.selectOne({
                                id: wdTransportRequisitionWdWcDetailsWdRecord.wd_id
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
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: selectOneWcRecord[0].current_quantity,
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
