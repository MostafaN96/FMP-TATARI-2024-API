// Services
const wcExecuteOrderRequisitionDetailsService = require("./wc-execute-order-requisition-details");

// Queries
const wcExecuteOrderRequisitionQueries = require("../../db/queries/wc/wc-execute-order-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { wcExecuteOrderRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcExecuteOrderRequisition) => {
    wcExecuteOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcExecuteOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcExecuteOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcExecuteOrderRequisitionQueries.selectOne({ number: wcExecuteOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcExecuteOrderRequisitionQueries.insert(wcExecuteOrderRequisition);
    if (results) {
        return await wcExecuteOrderRequisitionDetailsService.create(wcExecuteOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcExecuteOrderRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wcExecuteOrderRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };