// Queries
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");
const wcFabricOrderRequisitionQueries = require("../../db/queries/wc/wc-fabric-order-requisition");
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");

// Services
// const ordersRequisitionsService = require("../general/orders-requisitions");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcFabricOrderRequisitionTableName, wcFabricOrderRequisitionDetailsTableName, 
    wcExecuteOrderRequisitionDetailsTableName, 
    ordersRequisitionsTableName 
} = require("../../util/database-tables-name");

exports.create = async (wcFabricOrderRequisitionDetails) => {
    for (let i = 0; i < wcFabricOrderRequisitionDetails.items.length; i++) {
        wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = trans.transform();

        const results = await wcFabricOrderRequisitionDetailsQueries.insert(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    if (wcFabricOrderRequisitionDetails.orderId != "") {
        // let ordersRequisitionsWhereCluse = {}
        // ordersRequisitionsWhereCluse[`${ordersRequisitionsTableName}.wd_form_dyeing_order_requisition_id`] = wcFabricOrderRequisitionDetails.orderId;
        await ordersRequisitionsQueries.insertForWcFabricOrder(wcFabricOrderRequisitionDetails)
    }
    return { ...constants.insertSuccess, ...{ id: wcFabricOrderRequisitionDetails.id } };
};

exports.createDetails = async (wcFabricOrderRequisitionDetails) => {
    for (let i = 0; i < wcFabricOrderRequisitionDetails.items.length; i++) {
        wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = trans.transform();

        const results = await wcFabricOrderRequisitionDetailsQueries.insert(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: wcFabricOrderRequisitionDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    console.log("requisitionId :::::::: ", requisitionId);
    // check is found
    const isFound = await wcFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wcFabricOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wcFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wcFabricOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.closeOrder = async (wcFabricOrderRequisitionDetailsId) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcFabricOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        // let whereCluse = {};
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await wcFabricOrderRequisitionDetailsQueries.update({ is_order: 0 }, whereCluse);
        if (results) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByFabricBySeller = async (fabricId, sellerId) => {

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${wcFabricOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await wcFabricOrderRequisitionDetailsQueries.selectByFabricBySeller(whereCluse);
    return results;
};

exports.updateForExecuteOrder = async (objectOrderData) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        if (selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity > parseFloat(objectOrderData.quantity)) {
            await wcFabricOrderRequisitionDetailsQueries.update({
                current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity)
            }, {
                id: objectOrderData.wcFabricOrderRequisitionDetailsId
            })
        } else {
            // here will increase needed quantity if excuted quantity greater than needed quantity
            let excessQuantity = parseFloat((objectOrderData.quantity - selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity).toFixed(3))
            await wcFabricOrderRequisitionDetailsQueries.update({
                // initial_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].initial_quantity + excessQuantity,
                // current_quantity: 0,
                // is_order: "0"
                current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity),
                is_order: "0"
            }, {
                id: objectOrderData.wcFabricOrderRequisitionDetailsId
            })
        }
        return true
    }
}

exports.updateIncrementForExecuteOrder = async (objectOrderData) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await wcFabricOrderRequisitionDetailsQueries.update({
            current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(objectOrderData.quantity)
        }, {
            id: objectOrderData.wcFabricOrderRequisitionDetailsId
        })
        return true
    }
}

exports.update = async (wcFabricOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetails.id
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await wcFabricOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {

        let updateResults = false

        wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId = isFound[0].wc_fabric_order_requisition_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(wcFabricOrderRequisitionQueries.update({
            date: wcFabricOrderRequisitionDetails.date,
            name: wcFabricOrderRequisitionDetails.name,
            note: wcFabricOrderRequisitionDetails.note
        },
            {
                id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
            }))

        // Update wcFabricOrderRequisitionDetails Without Quantity
        callArray.push(
            wcFabricOrderRequisitionDetailsQueries.update({
                fabric_width: wcFabricOrderRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wcFabricOrderRequisitionDetails.fabricQuantityM2,
                note: wcFabricOrderRequisitionDetails.note2,
            },
                {
                    id: wcFabricOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = wcFabricOrderRequisitionDetails.quantity
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // active order
            await wcFabricOrderRequisitionQueries.update({
                is_order: '1'
            },
                {
                    id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
                })

            // Update wb manufacturing order requisition details current quantity
            updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: wcFabricOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wb manufacturing order requisition details
            if (currentQuantity >= defferenceQuantity) {

                // active order
                await wcFabricOrderRequisitionQueries.update({
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
                    })

                // Update wb manufacturing order requisition details Quantity
                updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionDetails.id
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