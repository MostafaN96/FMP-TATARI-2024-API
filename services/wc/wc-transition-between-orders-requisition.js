// Services
const wcTransitionBetweenOrdersRequisitionDetailsService = require("./wc-transition-between-orders-requisition-details");

// Queries
const wcTransitionBetweenOrdersRequisitionQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition");
const generalQueries = require("../../db/queries/general/general");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const { wcTransitionBetweenOrdersRequisitionTableName } = require("../../util/database-tables-name");


exports.create = async (wcTransitionBetweenWHRequisition) => {
    wcTransitionBetweenWHRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcTransitionBetweenOrdersRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcTransitionBetweenWHRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcTransitionBetweenOrdersRequisitionQueries.selectOne({ number: wcTransitionBetweenWHRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wcTransitionBetweenOrdersRequisitionQueries.insert(wcTransitionBetweenWHRequisition);
    if (results) {
        return await wcTransitionBetweenOrdersRequisitionDetailsService.create(wcTransitionBetweenWHRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wcTransitionBetweenOrdersRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wcTransitionBetweenOrdersRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };