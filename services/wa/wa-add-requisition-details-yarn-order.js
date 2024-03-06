// Queries
const waAddRequisitionDetailsYarnOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-yarn-order");

// Util
const constants = require("../../util/constants");

exports.create = async (waAddRequisitionDetailsYarnOrder, itemsOrder) => {

  const results = await waAddRequisitionDetailsYarnOrderQueries.insert(waAddRequisitionDetailsYarnOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};
