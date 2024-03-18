// Queries
const weTransitionBetweenWHRequisitionDetailsWeQueries = require("../../db/queries/we/we-transition-between-wh-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.create = async (weTransitionBetweenWHRequisitionDetailsWe, items) => {
  
    const results = await weTransitionBetweenWHRequisitionDetailsWeQueries.insert(weTransitionBetweenWHRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weTransitionBetweenWHRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weTransitionBetweenWHRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

