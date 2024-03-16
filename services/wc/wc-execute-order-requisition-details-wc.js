// Queries
const wcExecuteOrderRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-execute-order-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (wcExecuteOrderRequisitionDetailsWc, items) => {
  
    const results = await wcExecuteOrderRequisitionDetailsWcQueries.insert(wcExecuteOrderRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcExecuteOrderRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcExecuteOrderRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

