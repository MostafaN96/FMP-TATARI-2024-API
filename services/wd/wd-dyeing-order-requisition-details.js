// QuerieswbManufacturingOrderRequisitionDetailsTableName
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const wdDyeingOrderRequisitionQueries = require("../../db/queries/wd/wd-dyeing-order-requisition");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wdDyeingOrderRequisitionTableName, wdDyeingOrderRequisitionDetailsTableName, wdFormOrderDetailsWdFormDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wdDyeingOrderRequisitionDetails) => {
    for (let i = 0; i < wdDyeingOrderRequisitionDetails.items.length; i++) {
        wdDyeingOrderRequisitionDetails.items[i].wdDyeingOrderRequisitionDetailsId = trans.transform();

        const results = await wdDyeingOrderRequisitionDetailsQueries.insert(wdDyeingOrderRequisitionDetails, wdDyeingOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: wdDyeingOrderRequisitionDetails.id } };
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wdDyeingOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`] = requisitionId;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await wdDyeingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                // console.log("element.id ::: ", element.id);
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wdDyeingOrderRequisitionDetailsQueries.selectWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wdDyeingOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`] = requisitionId;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await wdDyeingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`] = element.id;
                element.warehouseDetails = await wdDyeingOrderRequisitionDetailsQueries.selectWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.closeOrder = async (wdDyeingOrderRequisitionDetailsId) => {
    // check is found
    const isFound = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: wdDyeingOrderRequisitionDetailsId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.id`] = wdDyeingOrderRequisitionDetailsId;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await wdDyeingOrderRequisitionDetailsQueries.update({ is_order: 0 }, whereCluse);
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
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${wdDyeingOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await wdDyeingOrderRequisitionDetailsQueries.selectOrdersBySeller(whereCluse);
    return results;
};

exports.selectFormDyeingRequisitionDetailsByFormDyeingOrderDetails = async (requisitionDetailsId) => {
    let whereCluse = {};
    whereCluse[`${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`] = requisitionDetailsId;
    whereCluse[`${wdFormOrderDetailsWdFormDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormOrderDetailsWdFormDetailsTableName}.is_active`] = 1;

    const results = await wdDyeingOrderRequisitionDetailsQueries.selectFormDyeingRequisitionDetailsByFormDyeingOrderDetails(whereCluse);
    return results;
};

// exports.selectByFabricBySeller = async (fabricId, sellerId) => {

//     let whereCluse = {};
//     whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
//     whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
//     whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
//     whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 1;
//     whereCluse[`${wdDyeingOrderRequisitionTableName}.seller_id`] = sellerId;

//     const results = await wdDyeingOrderRequisitionDetailsQueries.selectByFabricBySeller(whereCluse);
//     return results;
// };


exports.update = async (wdDyeingOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.id`] = wdDyeingOrderRequisitionDetails.id
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await wdDyeingOrderRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdDyeingOrderRequisitionDetails.wdDyeingOrderRequisitionId = isFound[0].wd_form_dyeing_order_requisition_id

        // Update wdDyeingOrderRequisition Without Quantity
        callArray.push(wdDyeingOrderRequisitionQueries.update({
            date: wdDyeingOrderRequisitionDetails.date,
            name: wdDyeingOrderRequisitionDetails.name,
            note: wdDyeingOrderRequisitionDetails.note
        },
            {
                id: wdDyeingOrderRequisitionDetails.wdDyeingOrderRequisitionId
            }))

        // Update wdDyeingOrderRequisitionDetails Without Quantity
        callArray.push(
            wdDyeingOrderRequisitionDetailsQueries.update({
                fabric_width: wdDyeingOrderRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wdDyeingOrderRequisitionDetails.fabricQuantityM2,
                note: wdDyeingOrderRequisitionDetails.detailsNote
            },
                {
                    id: wdDyeingOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let formCurrentQuantity = isFound[0].form_current_quantity
        let dyeingCurrentQuantity = isFound[0].dyeing_current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = wdDyeingOrderRequisitionDetails.quantity
        let defferenceQuantity = 0


        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // Update wd dyeing order requisition details current quantity
            updateResults = await wdDyeingOrderRequisitionDetailsQueries.update({
                quantity: oldQuantity + defferenceQuantity,
                form_current_quantity: formCurrentQuantity + defferenceQuantity,
                dyeing_current_quantity: dyeingCurrentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: wdDyeingOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wd dyeing order requisition details
            if (formCurrentQuantity >= defferenceQuantity) {
                // Update wd dyeing order requisition details Quantity
                updateResults = await wdDyeingOrderRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity,
                    form_current_quantity: formCurrentQuantity - defferenceQuantity,
                    dyeing_current_quantity: dyeingCurrentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: wdDyeingOrderRequisitionDetails.id
                    })

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: formCurrentQuantity,
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