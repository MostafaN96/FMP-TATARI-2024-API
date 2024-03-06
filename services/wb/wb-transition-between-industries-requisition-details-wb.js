// Queries
const wbTransitionBetweenIndustriesRequisitionDetailsWbQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition-details-wb");

// Util
const constants = require("../../util/constants");

exports.create = async (wbTransitionBetweenIndustriesRequisitionDetailsWb, items) => {
  
    const results = await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.insert(wbTransitionBetweenIndustriesRequisitionDetailsWb, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

