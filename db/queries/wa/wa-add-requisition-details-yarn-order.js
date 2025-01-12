// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { waAddRequisitionDetailsYarnOrderTableName } = require("../../../util/database-tables-name");

exports.insert = async (waAddRequisitionDetailsYarnOrder, itemsOrder) => {
    let queryResults = false;
    await sqlFun
        .insert(waAddRequisitionDetailsYarnOrderTableName, {
          wa_add_requisition_details_id: waAddRequisitionDetailsYarnOrder.waRequisitionDetailsId,
            wa_yarn_order_requisition_id: waAddRequisitionDetailsYarnOrder.requisition_id,
            orders_requisitions_id: itemsOrder.ordersRequisitionsId,
            // quantity: itemsOrder.quantity,
            creator_id: waAddRequisitionDetailsYarnOrder.personid,
            ip_address: waAddRequisitionDetailsYarnOrder.ipaddress,
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
      .limitedSelect(waAddRequisitionDetailsYarnOrderTableName, ["id", "quantity"], whereCluse, 1)
      .then((data) => {
          queryResults = data;
      })
      .catch((error) => {
          console.log(error);
      });

  return queryResults;
};

exports.update = async (waAddRequisitionDetailsYarnOrder, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waAddRequisitionDetailsYarnOrderTableName,
        waAddRequisitionDetailsYarnOrder,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };