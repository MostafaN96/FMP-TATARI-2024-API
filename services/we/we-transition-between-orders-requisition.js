// Services
const weTransitionBetweenOrdersRequisitionDetailsService = require("./we-transition-between-orders-requisition-details");

// Queries
const weTransitionBetweenOrdersRequisitionQueries = require("../../db/queries/we/we-transition-between-orders-requisition");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const {weTransitionBetweenOrdersRequisitionTableName} = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weTransitionBetweenOrdersRequisition) => {
    weTransitionBetweenOrdersRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weTransitionBetweenOrdersRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weTransitionBetweenOrdersRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weTransitionBetweenOrdersRequisitionQueries.selectOne({ number: weTransitionBetweenOrdersRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weTransitionBetweenOrdersRequisitionQueries.insert(weTransitionBetweenOrdersRequisition);
    if (results) {
        return await weTransitionBetweenOrdersRequisitionDetailsService.create(weTransitionBetweenOrdersRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weTransitionBetweenOrdersRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await weTransitionBetweenOrdersRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };