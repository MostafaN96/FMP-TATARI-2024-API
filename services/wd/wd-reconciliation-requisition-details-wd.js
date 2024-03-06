// Queries
const wdReconciliationRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-reconciliation-requisition-details-wd");

// Util
const constants = require("../../util/constants");

exports.createForOutput = async (wdReconciliationRequisitionDetailsWd, items) => {
  
    const results = await wdReconciliationRequisitionDetailsWdQueries.insertForOutput(wdReconciliationRequisitionDetailsWd, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.createForInput = async (wdReconciliationRequisitionDetailsWd, items) => {
  
    const results = await wdReconciliationRequisitionDetailsWdQueries.insertForInput(wdReconciliationRequisitionDetailsWd, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wdReconciliationRequisitionDetailsWdQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wdReconciliationRequisitionDetailsWdQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

  exports.selectForInput = async (whereCluse) => {
    const results = await wdReconciliationRequisitionDetailsWdQueries.selectForInput(whereCluse);
    return results;
  };

