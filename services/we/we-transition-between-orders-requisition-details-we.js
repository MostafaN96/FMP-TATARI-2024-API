// Queries
const weTransitionBetweenOrdersRequisitionDetailsWeQueries = require("../../db/queries/we/we-transition-between-orders-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.create = async (weTransitionBetweenOrdersRequisitionDetailsWe, items) => {
  
    const results = await weTransitionBetweenOrdersRequisitionDetailsWeQueries.insert(weTransitionBetweenOrdersRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weTransitionBetweenOrdersRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weTransitionBetweenOrdersRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

