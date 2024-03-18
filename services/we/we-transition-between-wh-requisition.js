// Services
const weTransitionBetweenWHRequisitionDetailsService = require("./we-transition-between-wh-requisition-details");

// Queries
const weTransitionBetweenWHRequisitionQueries = require("../../db/queries/we/we-transition-between-wh-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const weTransitionBetweenWHRequisitionTableName = require("../../util/database-tables-name").weTransitionBetweenWHRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weTransitionBetweenWHRequisition) => {
    weTransitionBetweenWHRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weTransitionBetweenWHRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weTransitionBetweenWHRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weTransitionBetweenWHRequisitionQueries.selectOne({ number: weTransitionBetweenWHRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weTransitionBetweenWHRequisitionQueries.insert(weTransitionBetweenWHRequisition);
    if (results) {
        return await weTransitionBetweenWHRequisitionDetailsService.create(weTransitionBetweenWHRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weTransitionBetweenWHRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await weTransitionBetweenWHRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };