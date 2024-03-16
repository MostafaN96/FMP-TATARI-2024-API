// Queries
const waTransitionBetweenWHRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details-wa");

// Util
const constants = require("../../util/constants");

exports.create = async (waTransitionBetweenWHRequisitionDetailsWa, items) => {
  
    const results = await waTransitionBetweenWHRequisitionDetailsWaQueries.insert(waTransitionBetweenWHRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await waTransitionBetweenWHRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await waTransitionBetweenWHRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

