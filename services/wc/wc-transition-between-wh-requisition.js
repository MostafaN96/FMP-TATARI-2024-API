// Services
const wcTransitionBetweenWHRequisitionDetailsService = require("./wc-transition-between-wh-requisition-details");

// Queries
const wcTransitionBetweenWHRequisitionQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { wcTransitionBetweenWHRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wcTransitionBetweenWHRequisition) => {
    wcTransitionBetweenWHRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcTransitionBetweenWHRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcTransitionBetweenWHRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcTransitionBetweenWHRequisitionQueries.selectOne({ number: wcTransitionBetweenWHRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcTransitionBetweenWHRequisitionQueries.insert(wcTransitionBetweenWHRequisition);
    if (results) {
        return await wcTransitionBetweenWHRequisitionDetailsService.create(wcTransitionBetweenWHRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcTransitionBetweenWHRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wcTransitionBetweenWHRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };