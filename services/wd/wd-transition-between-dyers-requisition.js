// Services
const wdTransitionBetweenDyersRequisitionDetailsService = require("./wd-transition-between-dyers-requisition-details");

// Queries
const wdTransitionBetweenDyersRequisitionQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdTransitionBetweenDyersRequisitionTableName = require("../../util/database-tables-name").wdTransitionBetweenDyersRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdTransitionBetweenDyersRequisition) => {
    wdTransitionBetweenDyersRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdTransitionBetweenDyersRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdTransitionBetweenDyersRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdTransitionBetweenDyersRequisitionQueries.selectOne({ number: wdTransitionBetweenDyersRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdTransitionBetweenDyersRequisitionQueries.insert(wdTransitionBetweenDyersRequisition);
    if (results) {
        return await wdTransitionBetweenDyersRequisitionDetailsService.create(wdTransitionBetweenDyersRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdTransitionBetweenDyersRequisitionQueries.select();
    return results;
  };