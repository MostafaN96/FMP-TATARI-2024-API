// Queries
const wbReconciliationRequisitionDetailsWbQueries = require("../../db/queries/wb/wb-reconciliation-requisition-details-wb");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");

exports.createForOutput = async (wbReconciliationRequisitionDetailsWb, items) => {
  
    const results = await wbReconciliationRequisitionDetailsWbQueries.insertForOutput(wbReconciliationRequisitionDetailsWb, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.createForInput = async (wbReconciliationRequisitionDetailsWb, items) => {
  
    const results = await wbReconciliationRequisitionDetailsWbQueries.insertForInput(wbReconciliationRequisitionDetailsWb, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wbReconciliationRequisitionDetailsWbQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wbReconciliationRequisitionDetailsWbQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

  exports.selectForInput = async (whereCluse) => {
    const results = await wbReconciliationRequisitionDetailsWbQueries.selectForInput(whereCluse);
    return results;
  };

