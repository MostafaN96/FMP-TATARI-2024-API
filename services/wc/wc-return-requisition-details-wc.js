// Queries
const wcReturnRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-return-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (waReturnRequisitionDetailsWa, items) => {
  
    const results = await wcReturnRequisitionDetailsWcQueries.insert(waReturnRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcReturnRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcReturnRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

