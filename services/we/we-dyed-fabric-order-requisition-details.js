// QuerieswbManufacturingOrderRequisitionDetailsTableName
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const weDyedFabricOrderRequisitionQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition");
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weDyedFabricOrderRequisitionTableName, weDyedFabricOrderRequisitionDetailsTableName, weExecuteOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (weDyedFabricOrderRequisitionDetails) => {
    for (let i = 0; i < weDyedFabricOrderRequisitionDetails.items.length; i++) {
        weDyedFabricOrderRequisitionDetails.items[i].weDyedFabricOrderRequisitionDetailsId = trans.transform();

        const results = await weDyedFabricOrderRequisitionDetailsQueries.insert(weDyedFabricOrderRequisitionDetails, weDyedFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    await ordersRequisitionsQueries.insertForDyedFabricOrderwe(weDyedFabricOrderRequisitionDetails)

    return { ...constants.insertSuccess, ...{ id: weDyedFabricOrderRequisitionDetails.id } };
};

exports.createDetails = async (weDyedFabricOrderRequisitionDetails) => {
    for (let i = 0; i < weDyedFabricOrderRequisitionDetails.items.length; i++) {
        weDyedFabricOrderRequisitionDetails.items[i].weDyedFabricOrderRequisitionDetailsId = trans.transform();

        const results = await weDyedFabricOrderRequisitionDetailsQueries.insert(weDyedFabricOrderRequisitionDetails, weDyedFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: weDyedFabricOrderRequisitionDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // check is found
    const isFound = await weDyedFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                // console.log("element.id ::: ", element.id);
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${weExecuteOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await weDyedFabricOrderRequisitionDetailsQueries.selectWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await weDyedFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${weExecuteOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await weDyedFabricOrderRequisitionDetailsQueries.selectWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.closeOrder = async (weDyedFabricOrderRequisitionDetailsId) => {
    // check is found
    const isFound = await weDyedFabricOrderRequisitionDetailsQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: weDyedFabricOrderRequisitionDetailsId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.id`] = weDyedFabricOrderRequisitionDetailsId;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await weDyedFabricOrderRequisitionDetailsQueries.update({ is_order: 0 }, whereCluse);
        if (results) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }
    } else {
        return constants.itemNotFound;
    }
};

exports.selectOrdersBySeller = async (sellerId) => {

    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await weDyedFabricOrderRequisitionDetailsQueries.selectOrdersBySeller(whereCluse);
    return results;
};


exports.updateForExecuteOrder = async (objectOrderData) => {
    let weDyedFabricOrderRequisitionDetailsWhereCluse = {}
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.weDyedFabricOrderRequisitionDetailsId;
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    const selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult = await weDyedFabricOrderRequisitionDetailsQueries.selectOne(weDyedFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult) && selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        if (selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity > parseFloat(objectOrderData.quantity)) {
            await weDyedFabricOrderRequisitionDetailsQueries.update({
                current_quantity: selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity)
            }, {
                id: objectOrderData.weDyedFabricOrderRequisitionDetailsId
            })
        } else {
            // here will increase needed quantity if excuted quantity greater than needed quantity
            let excessQuantity = parseFloat((objectOrderData.quantity - selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity).toFixed(3))
            await weDyedFabricOrderRequisitionDetailsQueries.update({
                // initial_quantity: selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].initial_quantity + excessQuantity,
                // current_quantity: 0,
                // is_order: "0"
                current_quantity: selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity),
                is_order: "0"
            }, {
                id: objectOrderData.weDyedFabricOrderRequisitionDetailsId
            })
        }
        return true
    }
}

exports.updateIncrementForExecuteOrder = async (objectOrderData) => {
    let weDyedFabricOrderRequisitionDetailsWhereCluse = {}
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.weDyedFabricOrderRequisitionDetailsId;
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult = await weDyedFabricOrderRequisitionDetailsQueries.selectOne(weDyedFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult) && selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await weDyedFabricOrderRequisitionDetailsQueries.update({
            current_quantity: selectWeDyedFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(objectOrderData.quantity)
        }, {
            id: objectOrderData.weDyedFabricOrderRequisitionDetailsId
        })
        return true
    }
}


exports.update = async (weDyedFabricOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.id`] = weDyedFabricOrderRequisitionDetails.id
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await weDyedFabricOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {

        let updateResults = false

        weDyedFabricOrderRequisitionDetails.weDyedFabricOrderRequisitionId = isFound[0].we_dyed_fabric_order_requisition_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(weDyedFabricOrderRequisitionQueries.update({
            date: weDyedFabricOrderRequisitionDetails.date,
            name: weDyedFabricOrderRequisitionDetails.name,
            note: weDyedFabricOrderRequisitionDetails.note
        },
            {
                id: weDyedFabricOrderRequisitionDetails.weDyedFabricOrderRequisitionId
            }))

        // Update weDyedFabricOrderRequisitionDetails Without Quantity
        callArray.push(
            weDyedFabricOrderRequisitionDetailsQueries.update({
                fabric_width: weDyedFabricOrderRequisitionDetails.fabricWidth,
                fabric_quantity_m2: weDyedFabricOrderRequisitionDetails.fabricQuantityM2,
                note: weDyedFabricOrderRequisitionDetails.note2,
            },
                {
                    id: weDyedFabricOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = weDyedFabricOrderRequisitionDetails.quantity
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // active order
            await weDyedFabricOrderRequisitionQueries.update({
                is_order: '1'
            },
                {
                    id: weDyedFabricOrderRequisitionDetails.weDyedFabricOrderRequisitionId
                })

            // Update wb manufacturing order requisition details current quantity
            updateResults = await weDyedFabricOrderRequisitionDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: weDyedFabricOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wb manufacturing order requisition details
            if (currentQuantity >= defferenceQuantity) {

                // active order
                await weDyedFabricOrderRequisitionQueries.update({
                    is_order: '1'
                },
                    {
                        id: weDyedFabricOrderRequisitionDetails.weDyedFabricOrderRequisitionId
                    })

                // Update we dyed fabric order requisition details Quantity
                updateResults = await weDyedFabricOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: weDyedFabricOrderRequisitionDetails.id
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