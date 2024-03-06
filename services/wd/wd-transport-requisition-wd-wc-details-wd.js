// QuerieswaCottonSellRequisitionDetailsWa
const wdTransportRequisitionWdWcDetailsWdQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details-wd");

// Util
const constants = require("../../util/constants");

exports.create = async (wdTransportRequisitionWdWcDetailsWd, items) => {
  
    const results = await wdTransportRequisitionWdWcDetailsWdQueries.insert(wdTransportRequisitionWdWcDetailsWd, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wdTransportRequisitionWdWcDetailsWdQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wdTransportRequisitionWdWcDetailsWdQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

