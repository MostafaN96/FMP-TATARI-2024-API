// Services
const wdReconciliationRequisitionDetailsService = require("./wd-reconciliation-requisition-details");

// Queries
const wdReconciliationRequisitionQueries = require("../../db/queries/wd/wd-reconciliation-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdReconciliationRequisitionTableName = require("../../util/database-tables-name").wdReconciliationRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdReconciliationRequisition) => {
    wdReconciliationRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdReconciliationRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdReconciliationRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdReconciliationRequisitionQueries.selectOne({ number: wdReconciliationRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdReconciliationRequisitionQueries.insert(wdReconciliationRequisition);
    if (results) {
        return await wdReconciliationRequisitionDetailsService.create(wdReconciliationRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdReconciliationRequisitionQueries.select();
    return results;
  };