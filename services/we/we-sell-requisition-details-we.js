// Queries
const weSellRequisitionDetailsWeQueries = require("../../db/queries/we/we-sell-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.create = async (weSellRequisitionDetailsWe, items) => {
  
    const results = await weSellRequisitionDetailsWeQueries.insert(weSellRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weSellRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weSellRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

