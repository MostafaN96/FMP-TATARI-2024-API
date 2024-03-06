// Services
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");

// Queries
const waYarnOrderRequisitionQueries = require("../../db/queries/wa/wa-yarn-order-requisition");
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");

// Helper
const trans = require("../../helpers/transform");
const { waYarnOrderRequisitionTableName, waYarnOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (waYarnOrderRequisition) => {
    waYarnOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waYarnOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waYarnOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waYarnOrderRequisitionQueries.selectOne({ number: waYarnOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waYarnOrderRequisitionQueries.insert(waYarnOrderRequisition);
    if (results) {
        return await waYarnOrderRequisitionDetailsService.create(waYarnOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await waYarnOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waYarnOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await waYarnOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waYarnOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await waYarnOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order
        let waYarnOrderRequisitionWhereCluse = {};
        waYarnOrderRequisitionWhereCluse[`${waYarnOrderRequisitionTableName}.id`] = requisitionId;
        const waYarnOrderRequisitionResult = await waYarnOrderRequisitionQueries.update({
            is_order : 0
        },
        waYarnOrderRequisitionWhereCluse)
        if(waYarnOrderRequisitionResult) {
            result = constants.updateSuccess
        } else {
            result = constants.updateError
        }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}
  
  exports.selectYarnsOfYarnOrderRequisition = async (requisitionId) => {

    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

    let waYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(waYarnOrderRequisitionDetailsResult) && waYarnOrderRequisitionDetailsResult.length > 0) {
        return waYarnOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}