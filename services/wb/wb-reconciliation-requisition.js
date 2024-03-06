// Services
const wbReconciliationRequisitionDetailsService = require("./wb-reconciliation-requisition-details");

// Queries
const wbReconciliationRequisitionQueries = require("../../db/queries/wb/wb-reconciliation-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbReconciliationRequisitionTableName = require("../../util/database-tables-name").wbReconciliationRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbReconciliationRequisition) => {
    wbReconciliationRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbReconciliationRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbReconciliationRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbReconciliationRequisitionQueries.selectOne({ number: wbReconciliationRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbReconciliationRequisitionQueries.insert(wbReconciliationRequisition);
    if (results) {
        return await wbReconciliationRequisitionDetailsService.create(wbReconciliationRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wbReconciliationRequisitionQueries.select();
    return results;
  };