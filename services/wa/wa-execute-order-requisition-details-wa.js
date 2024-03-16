// Queries
const waExecuteOrderRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-execute-order-requisition-details-wa");

// Util
const constants = require("../../util/constants");

exports.create = async (waExecuteOrderRequisitionDetailsWa, items) => {
  
    const results = await waExecuteOrderRequisitionDetailsWaQueries.insert(waExecuteOrderRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await waExecuteOrderRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await waExecuteOrderRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

