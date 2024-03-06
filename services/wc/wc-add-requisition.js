// Services
const wcAddRequisitionDetailsService = require("./wc-add-requisition-details");

// Queries
const wcAddRequisitionQueries = require("../../db/queries/wc/wc-add-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wcAddRequisitionTableName = require("../../util/database-tables-name").wcAddRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcAddRequisition) => {
    wcAddRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcAddRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcAddRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcAddRequisitionQueries.selectOne({ number: wcAddRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcAddRequisitionQueries.insert(wcAddRequisition);
    if (results) {
        return await wcAddRequisitionDetailsService.create(wcAddRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcAddRequisitionQueries.select();
    return results;
  };