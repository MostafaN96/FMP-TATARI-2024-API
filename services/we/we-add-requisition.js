// Services
const weAddRequisitionDetailsService = require("./we-add-requisition-details");

// Queries
const weAddRequisitionQueries = require("../../db/queries/we/we-add-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weAddRequisitionTableName = require("../../util/database-tables-name").weAddRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weAddRequisition) => {
    weAddRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weAddRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weAddRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weAddRequisitionQueries.selectOne({ number: weAddRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weAddRequisitionQueries.insert(weAddRequisition);
    if (results) {
        return await weAddRequisitionDetailsService.create(weAddRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weAddRequisitionQueries.select();
    return results;
  };