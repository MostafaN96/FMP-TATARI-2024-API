// Queries
const waReconciliationRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details-wa");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");

exports.createForOutput = async (waReconciliationRequisitionDetailsWa, items) => {
  
    const results = await waReconciliationRequisitionDetailsWaQueries.insertForOutput(waReconciliationRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.createForInput = async (waReconciliationRequisitionDetailsWa, items) => {
  
    const results = await waReconciliationRequisitionDetailsWaQueries.insertForInput(waReconciliationRequisitionDetailsWa, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await waReconciliationRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await waReconciliationRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

  exports.selectForInput = async (whereCluse) => {
    const results = await waReconciliationRequisitionDetailsWaQueries.selectForInput(whereCluse);
    return results;
  };

