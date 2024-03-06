// Services
const weReconciliationRequisitionDetailsService = require("./we-reconciliation-requisition-details");

// Queries
const weReconciliationRequisitionQueries = require("../../db/queries/we/we-reconciliation-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weReconciliationRequisitionTableName = require("../../util/database-tables-name").weReconciliationRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weReconciliationRequisition) => {
    weReconciliationRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weReconciliationRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weReconciliationRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weReconciliationRequisitionQueries.selectOne({ number: weReconciliationRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weReconciliationRequisitionQueries.insert(weReconciliationRequisition);
    if (results) {
        return await weReconciliationRequisitionDetailsService.create(weReconciliationRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weReconciliationRequisitionQueries.select();
    return results;
  };