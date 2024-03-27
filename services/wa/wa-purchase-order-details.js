// Queries
const waPurchaseOrderDetailsQueries = require("../../db/queries/wa/wa-purchase-order-details");
const waPurchaseOrderQueries = require("../../db/queries/wa/wa-purchase-order");

// Services
const waAddRequisitionDetailsService = require("./wa-add-requisition-details");
const waAddRequisitionService = require("./wa-add-requisition");
const waAddRequisitionDetailsPurchaseOrderService = require("./wa-add-requisition-details-purchase-order");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { waPurchaseOrderTableName, waPurchaseOrderDetailsTableName,
    waAddRequisitionDetailsPurchaseOrderTableName
} = require("../../util/database-tables-name");

exports.create = async (waPurchaseOrderDetails) => {
    const orderId = waPurchaseOrderDetails.id

    for (let i = 0; i < waPurchaseOrderDetails.items.length; i++) {
        waPurchaseOrderDetails.items[i].waPurchaseOrderDetailsId = trans.transform();

        // For Add wa requisition (optional)
        waPurchaseOrderDetails.items[i].orderDetailsId = waPurchaseOrderDetails.items[i].waPurchaseOrderDetailsId

        const results = await waPurchaseOrderDetailsQueries.insert(waPurchaseOrderDetails, waPurchaseOrderDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    // Add wa requisition (optional)
    if(waPurchaseOrderDetails.addType == "add") {
        await waAddRequisitionService.createForOrder(waPurchaseOrderDetails)
    } else if (waPurchaseOrderDetails.addType == "add_details") {
        const selectAddRequisitionDetailsPurchaseOrderResult = await waAddRequisitionDetailsPurchaseOrderService.selectByPurchaseOrderId(orderId)
        if (Array.isArray(selectAddRequisitionDetailsPurchaseOrderResult) && selectAddRequisitionDetailsPurchaseOrderResult.length > 0) {
            waPurchaseOrderDetails.id = selectAddRequisitionDetailsPurchaseOrderResult[0].wa_add_requisition_id

            await waAddRequisitionDetailsService.create(waPurchaseOrderDetails, 1)
        }
    }
    waPurchaseOrderDetails.id = orderId

    return { ...constants.insertSuccess, ...{ id: waPurchaseOrderDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // check is found
    const isFound = await waPurchaseOrderQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = requisitionId;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;

        let results = await waPurchaseOrderDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_details_id`] = element.id;
                element.warehouseDetails = await waPurchaseOrderDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await waPurchaseOrderQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = requisitionId;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 0;

        let results = await waPurchaseOrderDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_details_id`] = element.id;
                element.warehouseDetails = await waPurchaseOrderDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.closeOrder = async (waPurchaseOrderDetailsId) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${waPurchaseOrderDetailsTableName}.id`] = waPurchaseOrderDetailsId;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    const isFound = await waPurchaseOrderDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        // let whereCluse = {};
        // whereCluse[`${waPurchaseOrderDetailsTableName}.id`] = waPurchaseOrderDetailsId;
        // whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
        // whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;

        const results = await waPurchaseOrderDetailsQueries.update({ is_order: 0 }, whereCluse);
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
    whereCluse[`${waPurchaseOrderDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;
    whereCluse[`${waPurchaseOrderTableName}.seller_id`] = sellerId;

    const results = await waPurchaseOrderDetailsQueries.selectByYarnySeller(whereCluse);
    return results;
};

exports.yarnsOfPurchaseOrderWa = async (purchaseOrderId) => {

    let whereCluse = {};
    whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = purchaseOrderId;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;

    const results = await waPurchaseOrderDetailsQueries.selectByRequisitionId(whereCluse);
    return results;
};

exports.yarnsOfPurchaseOrderWaNotAdded = async (purchaseOrderId, addRequisitionId) => {

    let results = []
    // select added requisition yarns ids
    const selectAddRequisitionYarns = await waAddRequisitionDetailsService.selectByRequisitionIdForOrder(addRequisitionId)

    if (Array.isArray(selectAddRequisitionYarns) && selectAddRequisitionYarns.length > 0) {
        let yarnsIds = selectAddRequisitionYarns.map(function (a) { return a.yarn_id; });
        console.log("yarnsIds :: ", yarnsIds);
        let whereCluse = {};
        whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = purchaseOrderId;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
        whereCluse[`${waPurchaseOrderTableName}.is_order`] = 1;

        results = await waPurchaseOrderDetailsQueries.selectByRequisitionIdNotAddedYarns(whereCluse, yarnsIds);
    }

    return results;
};

exports.updateForDecremetQuantity = async (objectOrderData) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.id`] = objectOrderData.waPurchaseOrderDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waPurchaseOrderDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        if (selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity > parseFloat(objectOrderData.quantity)) {
            await waPurchaseOrderDetailsQueries.update({
                current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity)
            }, {
                id: objectOrderData.waPurchaseOrderDetailsId
            })
        } else {
            // here will increase needed quantity if excuted quantity greater than needed quantity
            let excessQuantity = parseFloat((objectOrderData.quantity - selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity).toFixed(3))
            await waPurchaseOrderDetailsQueries.update({
                initial_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].initial_quantity + excessQuantity,
                current_quantity: 0,
                is_order: "0"
            }, {
                id: objectOrderData.waPurchaseOrderDetailsId
            })
        }
        return true
    }
}

exports.updateIncrementForExecuteOrder = async (objectOrderData) => {
    let waYarnOrderRequisitionDetailsWhereCluse = {}
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.id`] = objectOrderData.waPurchaseOrderDetailsId;
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    const selectWaYarnOrderRequisitionDetailsQueriesOneResult = await waPurchaseOrderDetailsQueries.selectOne(waYarnOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWaYarnOrderRequisitionDetailsQueriesOneResult) && selectWaYarnOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await waPurchaseOrderDetailsQueries.update({
            current_quantity: selectWaYarnOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(objectOrderData.quantity)
        }, {
            id: objectOrderData.waPurchaseOrderDetailsId
        })
        return true
    }
}

exports.update = async (waPurchaseOrderDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${waPurchaseOrderDetailsTableName}.id`] = waPurchaseOrderDetails.id
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1
    const isFound = await waPurchaseOrderDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {

        let updateResults = false

        waPurchaseOrderDetails.waYarnOrderRequisitionId = isFound[0].wa_add_purchase_order_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(waPurchaseOrderQueries.update({
            date: waPurchaseOrderDetails.date,
            name: waPurchaseOrderDetails.name,
            note: waPurchaseOrderDetails.note
        },
            {
                id: waPurchaseOrderDetails.waYarnOrderRequisitionId
            }))

        // Update waPurchaseOrderDetails Without Quantity
        callArray.push(
            waPurchaseOrderDetailsQueries.update({
                price: waPurchaseOrderDetails.price,
                price_dollar: waPurchaseOrderDetails.priceDollar,
                note: waPurchaseOrderDetails.note2,
            },
                {
                    id: waPurchaseOrderDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = waPurchaseOrderDetails.quantity
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // Active Order
            await waPurchaseOrderQueries.update({
                is_order: '1'
            },
                {
                    id: waPurchaseOrderDetails.waYarnOrderRequisitionId
                })

            // Update wa purchase order requisition details current quantity
            updateResults = await waPurchaseOrderDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: waPurchaseOrderDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wa purchase order requisition details
            if (currentQuantity >= defferenceQuantity) {

                // Active Order
                await waPurchaseOrderQueries.update({
                    is_order: '1'
                },
                    {
                        id: waPurchaseOrderDetails.waYarnOrderRequisitionId
                    })

                // Update wb manufacturing order requisition details Quantity
                updateResults = await waPurchaseOrderDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: waPurchaseOrderDetails.id
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