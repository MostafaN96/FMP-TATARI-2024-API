// QuerieswaCottonSellRequisitionDetailsWa
const wbTransportWaWbRequisitionDetailsWaQueries = require("../../db/queries/wb/wb-transport-wa-wb-details-wa");

// Util
const constants = require("../../util/constants");

exports.create = async (wbTransportWaWbRequisitionDetailsWaCotton, items) => {
  
    const results = await wbTransportWaWbRequisitionDetailsWaQueries.insert(wbTransportWaWbRequisitionDetailsWaCotton, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wbTransportWaWbRequisitionDetailsWaQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wbTransportWaWbRequisitionDetailsWaQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

