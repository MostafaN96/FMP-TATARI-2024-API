// Queries
const wbManufacturingInputWbQueries = require("../../db/queries/wb/wb-manufacturing-input-wb");

// Util
const constants = require("../../util/constants");

exports.create = async (wbManufacturingInputWb, items, trx = null) => {

  const results = await wbManufacturingInputWbQueries.insert(wbManufacturingInputWb, items, trx);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async (whereCluse) => {
  const results = await wbManufacturingInputWbQueries.select(whereCluse);
  return results;
};

exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
  const results = await wbManufacturingInputWbQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
  return results;
};
