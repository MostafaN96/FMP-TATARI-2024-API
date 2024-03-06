// Services
const waReturnRequisitionDetailsService = require("./wa-return-requisition-details");

// Queries
const waReturnRequisitionQueries = require("../../db/queries/wa/wa-return-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const waReturnRequisitionTableName = require("../../util/database-tables-name").waReturnRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waReturnRequisition) => {
    waReturnRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waReturnRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waReturnRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waReturnRequisitionQueries.selectOne({ number: waReturnRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waReturnRequisitionQueries.insert(waReturnRequisition);
    if (results) {
        return await waReturnRequisitionDetailsService.create(waReturnRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waReturnRequisitionQueries.select();
    return results;
  };