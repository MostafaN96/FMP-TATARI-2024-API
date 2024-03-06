// Queries
const weSellRequisitionDirectDetailsQueries = require("../../db/queries/we/we-sell-requisition-direct-details");
const weSellRequisitionDirectQueries = require("../../db/queries/we/we-sell-requisition-direct");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weSellRequisitionDirectDetailsTableName, weSellRequisitionTableName } = require("../../util/database-tables-name");

exports.create = async (weSellRequisitionDirectDetails) => {
    for (let i = 0; i < weSellRequisitionDirectDetails.items.length; i++) {
        weSellRequisitionDirectDetails.items[i].weSellRequisitionDirectDetailsId = trans.transform();
        await weSellRequisitionDirectDetailsQueries.insert(weSellRequisitionDirectDetails, weSellRequisitionDirectDetails.items[i]);

        if(i == weSellRequisitionDirectDetails.items.length-1) {
            return { ...constants.insertSuccess, ...{ id: weSellRequisitionDirectDetails.id } };
        }
    }
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weSellRequisitionDirectQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`] = requisitionId;
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_active`] = 1;

        let results = await weSellRequisitionDirectDetailsQueries.selectByRequisitionId(whereCluse);
        if(Array.isArray(results) && results.length < 1) {
            results = await weSellRequisitionDirectDetailsQueries.selectOneByRequisitionId(whereCluse);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdForConfirm = async (requisitionId) => {
    // check is found
    const isFound = await weSellRequisitionDirectQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`] = requisitionId;
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_active`] = 1;
        whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_direct`] = 1;

        const results = await weSellRequisitionDirectDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weSellRequisitionDirectDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.id`] = weSellRequisitionDirectDetails.id;
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_active`] = 1;
    const isFound = await weSellRequisitionDirectDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        weSellRequisitionDirectDetails.weSellRequisitionId = isFound[0].we_sell_requisition_id

        // Update we sell requisition Without Quantity
        callArray.push(weSellRequisitionDirectQueries.update({
            delivery_car_id: weSellRequisitionDirectDetails.deliveryCarId,
            date: weSellRequisitionDirectDetails.date,
            note: weSellRequisitionDirectDetails.note
        },
            {
                id: weSellRequisitionDirectDetails.weSellRequisitionId
            }))


        // Update we sell requisition details Without Quantity
        callArray.push(
            weSellRequisitionDirectDetailsQueries.update({
                color_id: weSellRequisitionDirectDetails.colorId,
                color_category_id: weSellRequisitionDirectDetails.colorCategoryId,
                color_code: weSellRequisitionDirectDetails.colorCode,
                quantity: weSellRequisitionDirectDetails.quantity,
                fabric_piece: weSellRequisitionDirectDetails.numberFabricPieces,
                work_order_number: weSellRequisitionDirectDetails.workOrderNumber,
                document: weSellRequisitionDirectDetails.document,
                statement: weSellRequisitionDirectDetails.statement
            },
                {
                    id: weSellRequisitionDirectDetails.id
                })
        )
        await Promise.all(callArray)
        updateResults = true


        if (updateResults) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }

    } else {
        return constants.itemNotFound;
    }
};
