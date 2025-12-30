// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { weAddRequisitionDetailsDyedFabricOrderTableName } = require("../../../util/database-tables-name");

exports.insert = async (weAddRequisitionDetailsFabricOrder, itemsOrder) => {
  let queryResults = false;
  await sqlFun
    .insert(weAddRequisitionDetailsDyedFabricOrderTableName, {
      we_add_requisition_details_id: weAddRequisitionDetailsFabricOrder.weRequisitionDetailsId,
      we_dyed_fabric_order_requisition_id: weAddRequisitionDetailsFabricOrder.requisition_id,
      orders_requisitions_id: itemsOrder.ordersRequisitionsId,
      // quantity: itemsOrder.quantity,
      creator_id: weAddRequisitionDetailsFabricOrder.personid,
      ip_address: weAddRequisitionDetailsFabricOrder.ipaddress,
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
    .limitedSelect(
      weAddRequisitionDetailsDyedFabricOrderTableName, [
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

exports.update = async (weAddRequisitionDetailsFabricOrder, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weAddRequisitionDetailsDyedFabricOrderTableName,
      weAddRequisitionDetailsFabricOrder,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};