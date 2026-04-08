// Queries
const wbManufacturingInputOutputQueries = require("../../db/queries/wb/wb-manufacturing-input-output");

// Util
const constants = require("../../util/constants");

exports.create = async (wbManufacturingInputOutput, items, isOrder, trx = null) => {

  const results = await wbManufacturingInputOutputQueries.insert(wbManufacturingInputOutput, items, isOrder, trx);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }

};