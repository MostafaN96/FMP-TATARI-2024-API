// Queries
const weReconciliationRequisitionDetailsWeQueries = require("../../db/queries/we/we-reconciliation-requisition-details-we");

// Util
const constants = require("../../util/constants");

exports.createForOutput = async (weReconciliationRequisitionDetailsWe, items) => {
  
    const results = await weReconciliationRequisitionDetailsWeQueries.insertForOutput(weReconciliationRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.createForInput = async (weReconciliationRequisitionDetailsWe, items) => {
  
    const results = await weReconciliationRequisitionDetailsWeQueries.insertForInput(weReconciliationRequisitionDetailsWe, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await weReconciliationRequisitionDetailsWeQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await weReconciliationRequisitionDetailsWeQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

  exports.selectForInput = async (whereCluse) => {
    const results = await weReconciliationRequisitionDetailsWeQueries.selectForInput(whereCluse);
    return results;
  };

