// Services
const wcReturnRequisitionDetailsService = require("./wc-return-requisition-details");

// Queries
const wcReturnRequisitionQueries = require("../../db/queries/wc/wc-return-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wcReturnRequisitionTableName = require("../../util/database-tables-name").wcReturnRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcReturnRequisition) => {
    wcReturnRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcReturnRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcReturnRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcReturnRequisitionQueries.selectOne({ number: wcReturnRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcReturnRequisitionQueries.insert(wcReturnRequisition);
    if (results) {
        return await wcReturnRequisitionDetailsService.create(wcReturnRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcReturnRequisitionQueries.select();
    return results;
  };