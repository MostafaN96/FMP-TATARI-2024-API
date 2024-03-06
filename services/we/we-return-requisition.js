// Services
const weReturnRequisitionDetailsService = require("./we-return-requisition-details");

// Queries
const weReturnRequisitionQueries = require("../../db/queries/we/we-return-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weReturnRequisitionTableName = require("../../util/database-tables-name").weReturnRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weReturnRequisition) => {
    weReturnRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weReturnRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weReturnRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weReturnRequisitionQueries.selectOne({ number: weReturnRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weReturnRequisitionQueries.insert(weReturnRequisition);
    if (results) {
        return await weReturnRequisitionDetailsService.create(weReturnRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weReturnRequisitionQueries.select();
    return results;
  };