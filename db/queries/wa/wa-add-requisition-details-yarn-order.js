// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { waAddRequisitionDetailsYarnOrderTableName, waYarnOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");

exports.insert = async (waAddRequisitionDetailsYarnOrder, itemsOrder) => {
    let queryResults = false;
    await sqlFun
        .insert(waAddRequisitionDetailsYarnOrderTableName, {
          wa_add_requisition_details_id: waAddRequisitionDetailsYarnOrder.waRequisitionDetailsId,
            wa_yarn_order_requisition_id: waAddRequisitionDetailsYarnOrder.requisition_id,
            orders_requisitions_id: itemsOrder.ordersRequisitionsId,
            supplier_id: waAddRequisitionDetailsYarnOrder.supplierId,
            wa_add_requisition_id: waAddRequisitionDetailsYarnOrder.waAddRequisitionId,
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

exports.select = async (whereCluse, groupBy) => {
  let queryResults = [];
  await knex.from(waAddRequisitionDetailsYarnOrderTableName)
    .select(
      [
        `${waAddRequisitionDetailsYarnOrderTableName}.orders_requisitions_id as ordersRequisitionsId`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id as waYarnOrderRequisitionId`,
      ],
    )
    .where(whereCluse)
    .groupBy(groupBy)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
      .limitedSelect(waAddRequisitionDetailsYarnOrderTableName, [
        "wa_yarn_order_requisition_id", 
        "supplier_id", 
        "wa_add_requisition_id", 
      ], whereCluse, 1)
      .then((data) => {
          queryResults = data;
      })
      .catch((error) => {
          console.log(error);
      });

  return queryResults;
};

exports.selectDetails = async (whereCluse) => {
  let queryResults = false;
  await knex.from(waAddRequisitionDetailsYarnOrderTableName)
    .select(
      [
        `${waYarnOrderRequisitionDetailsTableName}.id as wa_yarn_order_requisition_details_id`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
        `${waAddRequisitionDetailsYarnOrderTableName}.orders_requisitions_id`,
      ],
    )
    .innerJoin(`${waYarnOrderRequisitionDetailsTableName}`,
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
    .where(whereCluse)
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