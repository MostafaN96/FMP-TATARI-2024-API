// Services
const wbManufacturingOrderRequisitionDetailsService = require("./wb-manufacturing-order-requisition-details");

// Queries
const wbManufacturingOrderRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition");
const wbManufacturingOrderRequisitionDetailsQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbManufacturingOrderRequisitionTableName = require("../../util/database-tables-name").wbManufacturingOrderRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");
const { wbManufacturingOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wbManufacturingOrderRequisition) => {
    wbManufacturingOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbManufacturingOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbManufacturingOrderRequisitionQueries.selectOne({ number: wbManufacturingOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbManufacturingOrderRequisitionQueries.insert(wbManufacturingOrderRequisition);
    if (results) {
        return await wbManufacturingOrderRequisitionDetailsService.create(wbManufacturingOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await wbManufacturingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wbManufacturingOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await wbManufacturingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wbManufacturingOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`] = requisitionId;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await wbManufacturingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let wbManufacturingOrderRequisitionDetailsWhereCluse = {};
            wbManufacturingOrderRequisitionDetailsWhereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await wbManufacturingOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            wbManufacturingOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order
        let wbManufacturingOrderRequisitionWhereCluse = {};
        wbManufacturingOrderRequisitionWhereCluse[`${wbManufacturingOrderRequisitionTableName}.id`] = requisitionId;
        const wbManufacturingOrderRequisitionResult = await wbManufacturingOrderRequisitionQueries.update({
            is_order : 0
        },
        wbManufacturingOrderRequisitionWhereCluse)
        if(wbManufacturingOrderRequisitionResult) {
            result = constants.updateSuccess
        } else {
            result = constants.updateError
        }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}