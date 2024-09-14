// Services
const waExecuteOrderRequisitionDetailsService = require("./wa-execute-order-requisition-details");

// Queries
const waExecuteOrderRequisitionQueries = require("../../db/queries/wa/wa-execute-order-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { waExecuteOrderRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waExecuteOrderRequisition) => {
    waExecuteOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waExecuteOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waExecuteOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waExecuteOrderRequisitionQueries.selectOne({ number: waExecuteOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waExecuteOrderRequisitionQueries.insert(waExecuteOrderRequisition);
    if (results) {
        return await waExecuteOrderRequisitionDetailsService.create(waExecuteOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waExecuteOrderRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await waExecuteOrderRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };
