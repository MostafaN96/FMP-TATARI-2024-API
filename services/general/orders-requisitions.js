
// Queries
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Helpers
const trans = require("../../helpers/transform");
const { ordersRequisitionsTableName } = require("../../util/database-tables-name");

exports.create = async (orderRequisitions) => {
  const results = await ordersRequisitionsQueries.insertForDyeingOrder(orderRequisitions);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.selectByDyeingIdForYarnOrder = async (dyeingOrderId) => {
  let whereCluse = {};
  whereCluse[`${ordersRequisitionsTableName}.wd_form_dyeing_order_requisition_id`] = dyeingOrderId;
  whereCluse[`${ordersRequisitionsTableName}.is_deleted`] = 0;
  whereCluse[`${ordersRequisitionsTableName}.is_active`] = 1;

    const results = await ordersRequisitionsQueries.selectByDyeingIdForYarnOrder(whereCluse);
    return results;

};