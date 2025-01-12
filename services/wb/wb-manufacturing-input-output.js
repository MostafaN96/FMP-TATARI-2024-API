// Queries
const wbManufacturingInputOutputQueries = require("../../db/queries/wb/wb-manufacturing-input-output");

// Util
const constants = require("../../util/constants");

exports.create = async (wbManufacturingInputOutput, items, isOrder) => {

  const results = await wbManufacturingInputOutputQueries.insert(wbManufacturingInputOutput, items, isOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }

};