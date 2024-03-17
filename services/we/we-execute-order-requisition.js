// Services
const weExecuteOrderRequisitionDetailsService = require("./we-execute-order-requisition-details");

// Queries
const weExecuteOrderRequisitionQueries = require("../../db/queries/we/we-execute-order-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { weExecuteOrderRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weExecuteOrderRequisition) => {
    weExecuteOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weExecuteOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weExecuteOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weExecuteOrderRequisitionQueries.selectOne({ number: weExecuteOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weExecuteOrderRequisitionQueries.insert(weExecuteOrderRequisition);
    if (results) {
        return await weExecuteOrderRequisitionDetailsService.create(weExecuteOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weExecuteOrderRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await weExecuteOrderRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };