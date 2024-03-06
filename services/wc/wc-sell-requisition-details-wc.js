// Queries
const wcSellRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-sell-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (wcSellRequisitionDetailsWc, items) => {
  
    const results = await wcSellRequisitionDetailsWcQueries.insert(wcSellRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcSellRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcSellRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

