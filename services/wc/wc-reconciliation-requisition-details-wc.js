// Queries
const wcReconciliationRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-reconciliation-requisition-details-wc");

// Util
const constants = require("../../util/constants");

exports.createForOutput = async (wcReconciliationRequisitionDetailsWc, items) => {
  
    const results = await wcReconciliationRequisitionDetailsWcQueries.insertForOutput(wcReconciliationRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.createForInput = async (wcReconciliationRequisitionDetailsWc, items) => {
  
    const results = await wcReconciliationRequisitionDetailsWcQueries.insertForInput(wcReconciliationRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wcReconciliationRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wcReconciliationRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

  exports.selectForInput = async (whereCluse) => {
    const results = await wcReconciliationRequisitionDetailsWcQueries.selectForInput(whereCluse);
    return results;
  };

