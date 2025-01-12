// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { wcAddRequisitionDetailsFabricOrderTableName } = require("../../../util/database-tables-name");

exports.insert = async (wcAddRequisitionDetailsFabricOrder, itemsOrder) => {
  let queryResults = false;
  await sqlFun
    .insert(wcAddRequisitionDetailsFabricOrderTableName, {
      wc_add_requisition_details_id: wcAddRequisitionDetailsFabricOrder.wcRequisitionDetailsId,
      wc_fabric_order_requisition_id: wcAddRequisitionDetailsFabricOrder.requisition_id,
      orders_requisitions_id: itemsOrder.ordersRequisitionsId,
      // quantity: itemsOrder.quantity,
      creator_id: wcAddRequisitionDetailsFabricOrder.personid,
      ip_address: wcAddRequisitionDetailsFabricOrder.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcAddRequisitionDetailsFabricOrderTableName, [
      "id",
      "quantity"
    ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcAddRequisitionDetailsFabricOrder, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcAddRequisitionDetailsFabricOrderTableName,
      wcAddRequisitionDetailsFabricOrder,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};