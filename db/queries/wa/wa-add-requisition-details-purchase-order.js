// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  waAddRequisitionDetailsPurchaseOrderTableName, waAddRequisitionDetailsTableName, 
  waAddRequisitionTableName, waPurchaseOrderTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (waAddRequisitionDetailsPurchaseOrder, item) => {
    let queryResults = false;
    await sqlFun
        .insert(waAddRequisitionDetailsPurchaseOrderTableName, {
          wa_add_requisition_details_id: waAddRequisitionDetailsPurchaseOrder.waRequisitionDetailsId,
          wa_add_purchase_order_id: waAddRequisitionDetailsPurchaseOrder.orderId,
          wa_add_purchase_order_details_id: item.orderDetailsId,
            quantity: item.quantity,
            creator_id: waAddRequisitionDetailsPurchaseOrder.personid,
            ip_address: waAddRequisitionDetailsPurchaseOrder.ipaddress,
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
      .limitedSelect(waAddRequisitionDetailsPurchaseOrderTableName, [
        "wa_add_purchase_order_details_id", 
        "wa_add_purchase_order_id", 
        "wa_add_requisition_details_id", 
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

exports.select = async (whereCluse) => {
  let queryResults = [];

  await knex.from(waAddRequisitionDetailsPurchaseOrderTableName)
    .select(
      [
        `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_details_id`,
        `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`,
        `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsPurchaseOrderTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
        `${waPurchaseOrderTableName}.name`,
        `${waAddRequisitionTableName}.supplier_id`,
      ],
    )
    .innerJoin(`${waAddRequisitionDetailsTableName}`, 
    `${waAddRequisitionDetailsTableName}.id`, 
    `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`, 
    `${waAddRequisitionTableName}.id`, 
    `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waPurchaseOrderTableName}`, 
    `${waPurchaseOrderTableName}.id`, 
    `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (waAddRequisitionDetailsPurchaseOrder, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waAddRequisitionDetailsPurchaseOrderTableName,
        waAddRequisitionDetailsPurchaseOrder,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };