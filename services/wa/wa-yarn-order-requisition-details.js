// Queries
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");
const waYarnOrderRequisitionQueries = require("../../db/queries/wa/wa-yarn-order-requisition");
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");

// Services
// const ordersRequisitionsService = require("../general/orders-requisitions");
const wcFabricOrderRequisitionDetailsService = require("../wc/wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { waYarnOrderRequisitionTableName, waYarnOrderRequisitionDetailsTableName, waAddRequisitionDetailsYarnOrderTableName, waExecuteOrderRequisitionDetailsTableName, ordersRequisitionsTableName } = require("../../util/database-tables-name");

exports.create = async (waYarnOrderRequisitionDetails) => {
    for (let i = 0; i < waYarnOrderRequisitionDetails.items.length; i++) {
        waYarnOrderRequisitionDetails.items[i].waYarnOrderRequisitionDetailsId = trans.transform();

        const results = await waYarnOrderRequisitionDetailsQueries.insert(waYarnOrderRequisitionDetails, waYarnOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }

    // create raw fabric order (wc)
    await wcFabricOrderRequisitionDetailsService.createOrderWithYarnOrder(waYarnOrderRequisitionDetails)

    return { ...constants.insertSuccess, ...{ id: waYarnOrderRequisitionDetails.id } };
};

exports.createDetails = async (waYarnOrderRequisitionDetails) => {
    for (let i = 0; i < waYarnOrderRequisitionDetails.items.length; i++) {
        waYarnOrderRequisitionDetails.items[i].waYarnOrderRequisitionDetailsId = trans.transform();

        const results = await waYarnOrderRequisitionDetailsQueries.insert(waYarnOrderRequisitionDetails, waYarnOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: waYarnOrderRequisitionDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // check is found
    const isFound = await waYarnOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${waExecuteOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await waYarnOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await waYarnOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${waExecuteOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await waYarnOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectOne = async (whereCluse) => {
    const results = await waYarnOrderRequisitionDetailsQueries.selectOne(whereCluse);
    return results;
};

exports.closeOrder = async (waYarnOrderRequisitionDetailsId) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOrderRequisitionDetailsId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waYarnOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        // let whereCluse = {};
        // whereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOrderRequisitionDetailsId;
        // whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        // whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await waYarnOrderRequisitionDetailsQueries.update({ is_order: 0 }, whereCluse);
        if (results) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByYarnySeller = async (yarnId, sellerId) => {

    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${waYarnOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await waYarnOrderRequisitionDetailsQueries.selectByYarnySeller(whereCluse);
    return results;
};

exports.updateForExecuteOrder = async (objectOrderData) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = objectOrderData.waYarnOrderRequisitionDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waYarnOrderRequisitionDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        if (selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity > parseFloat(objectOrderData.quantity)) {
            await waYarnOrderRequisitionDetailsQueries.update({
                current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity)
            }, {
                id: objectOrderData.waYarnOrderRequisitionDetailsId
            })
        } else {
            // here will increase needed quantity if excuted quantity greater than needed quantity
            let excessQuantity = parseFloat((objectOrderData.quantity - selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity).toFixed(3))
            await waYarnOrderRequisitionDetailsQueries.update({
                // initial_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].initial_quantity + excessQuantity,
                // current_quantity: 0,
                // is_order: "0"
                current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity),
                is_order: "0"
            }, {
                id: objectOrderData.waYarnOrderRequisitionDetailsId
            })
        }
        return true
    }
}

exports.updateIncrementForExecuteOrder = async (objectOrderData) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = objectOrderData.waYarnOrderRequisitionDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waYarnOrderRequisitionDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await waYarnOrderRequisitionDetailsQueries.update({
            current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(objectOrderData.quantity)
        }, {
            id: objectOrderData.waYarnOrderRequisitionDetailsId
        })
        return true
    }
}

exports.updateForIncrementQuantity = async (waYarnOrderRequisitionDetailsId, newQuantity) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOrderRequisitionDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waYarnOrderRequisitionDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await waYarnOrderRequisitionDetailsQueries.update({
            current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(newQuantity)
        }, {
            id: waYarnOrderRequisitionDetailsId
        })
        return true
    }
}
exports.updateForDecrementQuantity = async (waYarnOrderRequisitionDetailsId, newQuantity) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOrderRequisitionDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waYarnOrderRequisitionDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await waYarnOrderRequisitionDetailsQueries.update({
            current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(newQuantity)
        }, {
            id: waYarnOrderRequisitionDetailsId
        })
        return true
    }
}

exports.update = async (waYarnOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOrderRequisitionDetails.id
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await waYarnOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {

        let updateResults = false

        waYarnOrderRequisitionDetails.waYarnOrderRequisitionId = isFound[0].wa_yarn_order_requisition_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(waYarnOrderRequisitionQueries.update({
            date: waYarnOrderRequisitionDetails.date,
            name: waYarnOrderRequisitionDetails.name,
            note: waYarnOrderRequisitionDetails.note,
            is_order: 1,
        },
            {
                id: waYarnOrderRequisitionDetails.waYarnOrderRequisitionId
            }))

        // Update waYarnOrderRequisitionDetails Without Quantity
        callArray.push(
            waYarnOrderRequisitionDetailsQueries.update({
                note: waYarnOrderRequisitionDetails.note2,
                is_order: 1,
            },
                {
                    id: waYarnOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = waYarnOrderRequisitionDetails.quantity
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // active order
            await waYarnOrderRequisitionQueries.update({
                is_order: '1'
            },
                {
                    id: waYarnOrderRequisitionDetails.waYarnOrderRequisitionId
                })

            // Update wb manufacturing order requisition details current quantity
            updateResults = await waYarnOrderRequisitionDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: waYarnOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wb manufacturing order requisition details
            if (currentQuantity >= defferenceQuantity) {

                // active order
                await waYarnOrderRequisitionQueries.update({
                    is_order: '1'
                },
                    {
                        id: waYarnOrderRequisitionDetails.waYarnOrderRequisitionId
                    })

                // Update wb manufacturing order requisition details Quantity
                updateResults = await waYarnOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: waYarnOrderRequisitionDetails.id
                    })

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: currentQuantity,
                    newQuantity: newQuantity
                }
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