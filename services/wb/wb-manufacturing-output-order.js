// Queries
const wbManufacturingOutputOrderQueries = require("../../db/queries/wb/wb-manufacturing-output-order");

// Util
const constants = require("../../util/constants");

exports.create = async (wbManufacturingOutputOrder, itemsOrder) => {

  const results = await wbManufacturingOutputOrderQueries.insert(wbManufacturingOutputOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};
