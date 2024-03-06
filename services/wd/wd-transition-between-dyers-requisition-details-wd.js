// Queries
const wdTransitionBetweenDyersRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition-details-wd");

// Util
const constants = require("../../util/constants");

exports.create = async (wbTransitionBetweenIndustriesRequisitionDetailsWb, items) => {
  
    const results = await wdTransitionBetweenDyersRequisitionDetailsWdQueries.insert(wbTransitionBetweenIndustriesRequisitionDetailsWb, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wdTransitionBetweenDyersRequisitionDetailsWdQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wdTransitionBetweenDyersRequisitionDetailsWdQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

