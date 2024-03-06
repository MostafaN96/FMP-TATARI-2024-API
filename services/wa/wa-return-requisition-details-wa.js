// Queries
const waReturnRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-return-requisition-details-wa");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");

exports.create = async (waReturnRequisitionDetailsWa, items) => {
  
    const results = await waReturnRequisitionDetailsWaQueries.insert(waReturnRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await waReturnRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await waReturnRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

