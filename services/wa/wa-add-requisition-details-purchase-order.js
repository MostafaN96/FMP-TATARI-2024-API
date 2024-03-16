// Queries
const waAddRequisitionDetailsPurchaseOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-purchase-order");

// Util
const constants = require("../../util/constants");

exports.create = async (waAddRequisitionDetailsPurchaseOrder, itemsOrder) => {

  const results = await waAddRequisitionDetailsPurchaseOrderQueries.insert(waAddRequisitionDetailsPurchaseOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};
