// Queries
const waSellRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-sell-requisition-details-wa");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");

exports.create = async (waSellRequisitionDetailsWa, items) => {
  
    const results = await waSellRequisitionDetailsWaQueries.insert(waSellRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await waSellRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await waSellRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

