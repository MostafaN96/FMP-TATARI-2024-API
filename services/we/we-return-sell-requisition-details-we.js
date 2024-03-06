// Queries
const weReturnRequisitionDetailsWeQueries = require("../../db/queries/we/we-return-sell-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.create = async (weReturnSellRequisitionDetailsReturnDetails, items) => {
  
    const results = await weReturnRequisitionDetailsWeQueries.insert(weReturnSellRequisitionDetailsReturnDetails, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weReturnRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weReturnRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

