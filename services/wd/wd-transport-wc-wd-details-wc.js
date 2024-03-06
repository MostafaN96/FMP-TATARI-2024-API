// QuerieswaCottonSellRequisitionDetailsWa
const wdTransportWcWdRequisitionDetailsWcQueries = require("../../db/queries/wd/wd-transport-wc-wd-details-wc");

// Util
const constants = require("../../util/constants");

exports.create = async (wdTransportWcWdRequisitionDetailsWc, items) => {
  
    const results = await wdTransportWcWdRequisitionDetailsWcQueries.insert(wdTransportWcWdRequisitionDetailsWc, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wdTransportWcWdRequisitionDetailsWcQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wdTransportWcWdRequisitionDetailsWcQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

