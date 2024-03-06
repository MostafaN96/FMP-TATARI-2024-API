// Queries
const weReturnRequisitionDetailsReturnDetailsQueries = require("../../db/queries/we/we-return-sell-requisition-details-return-details");

// Util
const constants = require("../../util/constants");

exports.create = async (weReturnSellRequisitionDetailsReturnDetails, items) => {
  
    const results = await weReturnRequisitionDetailsReturnDetailsQueries.insert(weReturnSellRequisitionDetailsReturnDetails, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weReturnRequisitionDetailsReturnDetailsQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weReturnRequisitionDetailsReturnDetailsQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

