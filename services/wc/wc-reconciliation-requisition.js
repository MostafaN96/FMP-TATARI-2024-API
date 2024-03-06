// Services
const wcReconciliationRequisitionDetailsService = require("./wc-reconciliation-requisition-details");

// Queries
const wcReconciliationRequisitionQueries = require("../../db/queries/wc/wc-reconciliation-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wcReconciliationRequisitionTableName = require("../../util/database-tables-name").wcReconciliationRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcReconciliationRequisition) => {
    wcReconciliationRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcReconciliationRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcReconciliationRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcReconciliationRequisitionQueries.selectOne({ number: wcReconciliationRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcReconciliationRequisitionQueries.insert(wcReconciliationRequisition);
    if (results) {
        return await wcReconciliationRequisitionDetailsService.create(wcReconciliationRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcReconciliationRequisitionQueries.select();
    return results;
  };