// Queries
const wcTransitionBetweenOrdersRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (wcTransitionBetweenOrdersRequisitionDetailsWc, items) => {
  
    const results = await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.insert(wcTransitionBetweenOrdersRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcTransitionBetweenOrdersRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

