// Queries
const wbManufacturingOrderRequisitionDetailsQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition-details");
const wbManufacturingOrderRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbManufacturingOrderRequisitionTableName, wbManufacturingOutputOrderTableName } = require("../../util/database-tables-name");
const wbManufacturingOrderRequisitionDetailsTableName = require("../../util/database-tables-name").wbManufacturingOrderRequisitionDetailsTableName;

exports.create = async (wbManufacturingOrderRequisitionDetails) => {
    for (let i = 0; i < wbManufacturingOrderRequisitionDetails.items.length; i++) {
        wbManufacturingOrderRequisitionDetails.items[i].wbManufacturingOrderRequisitionDetailsId = trans.transform();

        const results = await wbManufacturingOrderRequisitionDetailsQueries.insert(wbManufacturingOrderRequisitionDetails, wbManufacturingOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: wbManufacturingOrderRequisitionDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wbManufacturingOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`] = requisitionId;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await wbManufacturingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wbManufacturingOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wbManufacturingOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`] = requisitionId;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await wbManufacturingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wbManufacturingOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.closeOrder = async (wbManufacturingOrderRequisitionDetailsId) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = wbManufacturingOrderRequisitionDetailsId;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wbManufacturingOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        // let whereCluse = {};
        // whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = wbManufacturingOrderRequisitionDetailsId;
        // whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        // whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await wbManufacturingOrderRequisitionDetailsQueries.update({is_order: 0}, whereCluse);
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
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await wbManufacturingOrderRequisitionDetailsQueries.selectByFabricBySeller(whereCluse);
    return results;
};

exports.update = async (wbManufacturingOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []
    console.log("000000000000000");
    console.log("wbManufacturingOrderRequisitionDetails ::::: ", wbManufacturingOrderRequisitionDetails);

    // Check is found
    let whereCluse = {}
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = wbManufacturingOrderRequisitionDetails.id
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await wbManufacturingOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        console.log("1111111111111");

        let updateResults = false

        wbManufacturingOrderRequisitionDetails.wbManufacturingOrderRequisitionId = isFound[0].wb_manufacturing_order_requisition_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(wbManufacturingOrderRequisitionQueries.update({
            date: wbManufacturingOrderRequisitionDetails.date,
            name: wbManufacturingOrderRequisitionDetails.name,
            note: wbManufacturingOrderRequisitionDetails.note
        },
            {
                id: wbManufacturingOrderRequisitionDetails.wbManufacturingOrderRequisitionId
            }))

        // Update wbManufacturingOrderRequisitionDetails Without Quantity
        callArray.push(
            wbManufacturingOrderRequisitionDetailsQueries.update({
                note: wbManufacturingOrderRequisitionDetails.note2,
            },
                {
                    id: wbManufacturingOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = wbManufacturingOrderRequisitionDetails.quantity
        let defferenceQuantity = 0

        console.log("currentQuantity :::: ", currentQuantity);
        console.log("oldQuantity :::: ", oldQuantity);
        console.log("newQuantity :::: ", newQuantity);

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // Update wb manufacturing order requisition details current quantity
            updateResults = await wbManufacturingOrderRequisitionDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity
            },
                {
                    id: wbManufacturingOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wb manufacturing order requisition details
            if (currentQuantity >= defferenceQuantity) {
                // Update wb manufacturing order requisition details Quantity
                updateResults = await wbManufacturingOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity
                },
                    {
                        id: wbManufacturingOrderRequisitionDetails.id
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