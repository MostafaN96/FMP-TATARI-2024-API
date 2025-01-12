// Queries
const weAddRequisitionDetailsDyedFabricOrderQueries = require("../../db/queries/we/we-add-requisition-details-dyed-fabric-order");

// Util
const constants = require("../../util/constants");

exports.create = async (weAddRequisitionDetailsDyedFabricOrder, itemsOrder) => {

  const results = await weAddRequisitionDetailsDyedFabricOrderQueries.insert(weAddRequisitionDetailsDyedFabricOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};
