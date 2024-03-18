// Queries
const wcTransitionBetweenWHRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (wcTransitionBetweenWHRequisitionDetailsWc, items) => {
  
    const results = await wcTransitionBetweenWHRequisitionDetailsWcQueries.insert(wcTransitionBetweenWHRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcTransitionBetweenWHRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcTransitionBetweenWHRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

