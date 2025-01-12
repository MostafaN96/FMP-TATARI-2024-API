// Queries
const wcAddRequisitionDetailsFabricOrderQueries = require("../../db/queries/wc/wc-add-requisition-details-fabric-order");

// Util
const constants = require("../../util/constants");

exports.create = async (wcAddRequisitionDetailsFabricOrder, itemsOrder) => {

  const results = await wcAddRequisitionDetailsFabricOrderQueries.insert(wcAddRequisitionDetailsFabricOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};
