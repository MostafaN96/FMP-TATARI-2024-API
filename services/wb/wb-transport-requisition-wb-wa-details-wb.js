// QuerieswaCottonSellRequisitionDetailsWa
const wbTransportRequisitionWbWaDetailsWbQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details-wb");

// Util
const constants = require("../../util/constants");

exports.create = async (wbTransportRequisitionWbWaDetailsWb, items) => {
  
    const results = await wbTransportRequisitionWbWaDetailsWbQueries.insert(wbTransportRequisitionWbWaDetailsWb, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wbTransportRequisitionWbWaDetailsWbQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wbTransportRequisitionWbWaDetailsWbQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

