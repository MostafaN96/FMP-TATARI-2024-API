// Queries
const waAddRequisitionDetailsPurchaseOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-purchase-order");

// Util
const constants = require("../../util/constants");
const { waAddRequisitionDetailsPurchaseOrderTableName } = require("../../util/database-tables-name");

exports.create = async (waAddRequisitionDetailsPurchaseOrder, itemsOrder) => {

  const results = await waAddRequisitionDetailsPurchaseOrderQueries.insert(waAddRequisitionDetailsPurchaseOrder, itemsOrder);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.selectByPurchaseOrderId = async (data) => {
  
  let whereCluse = {};
    whereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`] = data;
    whereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.is_deleted`] = 0;
    whereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.is_active`] = 1;

    const results = await waAddRequisitionDetailsPurchaseOrderQueries.select(whereCluse);
    return results;
};