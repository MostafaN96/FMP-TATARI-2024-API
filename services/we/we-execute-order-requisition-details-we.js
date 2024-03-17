// Queries
const weExecuteOrderRequisitionDetailsWeQueries = require("../../db/queries/we/we-execute-order-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.create = async (weExecuteOrderRequisitionDetailsWe, items) => {
  
    const results = await weExecuteOrderRequisitionDetailsWeQueries.insert(weExecuteOrderRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weExecuteOrderRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weExecuteOrderRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

