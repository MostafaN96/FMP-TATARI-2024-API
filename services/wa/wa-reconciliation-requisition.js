// Services
const waReconciliationRequisitionDetailsService = require("./wa-reconciliation-requisition-details");

// Queries
const waReconciliationRequisitionQueries = require("../../db/queries/wa/wa-reconciliation-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const waReconciliationRequisitionTableName = require("../../util/database-tables-name").waReconciliationRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waReconciliationRequisition) => {
    waReconciliationRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waReconciliationRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waReconciliationRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waReconciliationRequisitionQueries.selectOne({ number: waReconciliationRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waReconciliationRequisitionQueries.insert(waReconciliationRequisition);
    if (results) {
        return await waReconciliationRequisitionDetailsService.create(waReconciliationRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waReconciliationRequisitionQueries.select();
    return results;
  };