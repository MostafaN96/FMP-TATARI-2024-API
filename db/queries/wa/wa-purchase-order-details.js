// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { waPurchaseOrderTableName, 
  waPurchaseOrderDetailsTableName, 
  yarnTableName, 
  waAddRequisitionDetailsTableName, 
  warehouseTableName,
  waAddRequisitionDetailsPurchaseOrderTableName,
  waAddRequisitionTableName, 
} = require("../../../util/database-tables-name");

exports.insert = async (waPurchaseOrderDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waPurchaseOrderDetailsTableName, {
      id: items.waPurchaseOrderDetailsId,
      wa_add_purchase_order_id: waPurchaseOrderDetails.id,
      yarn_id: items.yarnId,
      initial_quantity: items.quantity,
      current_quantity: items.quantity,
      price: items.price,
      price_dollar: items.priceDollar,
      note: items.note,
      creator_id: waPurchaseOrderDetails.personid,
      ip_address: waPurchaseOrderDetails.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${waPurchaseOrderTableName}.id as requisition_id`,
    `${waPurchaseOrderTableName}.date`,
    `${waPurchaseOrderTableName}.number`,
    `${waPurchaseOrderTableName}.name as order_name`,
    `${waPurchaseOrderTableName}.note`,
    `${waPurchaseOrderDetailsTableName}.id`,
    `${waPurchaseOrderDetailsTableName}.price`,
    `${waPurchaseOrderDetailsTableName}.price_dollar`,
    `${waPurchaseOrderDetailsTableName}.note as note2`,
    `${waPurchaseOrderDetailsTableName}.initial_quantity  as quantity`,
    // `${waPurchaseOrderDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${waPurchaseOrderDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${waPurchaseOrderDetailsTableName}.current_quantity
      END as current_quantity`),
    knex.raw(
      `CASE WHEN ${waPurchaseOrderDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${waPurchaseOrderDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
  ])
    .from(`${waPurchaseOrderDetailsTableName}`)
    .innerJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.yarn_id`)
    .where(whereCluse)
    .andWhere(`${waPurchaseOrderDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionIdNotAddedYarns = async (whereCluse, yarnsIds) => {
  let queryResults = [];

  await knex.select([
    `${waPurchaseOrderTableName}.id as requisition_id`,
    `${waPurchaseOrderTableName}.date`,
    `${waPurchaseOrderTableName}.number`,
    `${waPurchaseOrderTableName}.name as order_name`,
    `${waPurchaseOrderTableName}.note`,
    `${waPurchaseOrderDetailsTableName}.id`,
    `${waPurchaseOrderDetailsTableName}.price`,
    `${waPurchaseOrderDetailsTableName}.price_dollar`,
    `${waPurchaseOrderDetailsTableName}.note as note2`,
    `${waPurchaseOrderDetailsTableName}.initial_quantity  as quantity`,
    `${waPurchaseOrderDetailsTableName}.current_quantity`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
  ])
    .from(`${waPurchaseOrderDetailsTableName}`)
    .innerJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.yarn_id`)
    .where(whereCluse)
    .andWhere(`${waPurchaseOrderDetailsTableName}.initial_quantity`, ">", 0)
    .whereNotIn(`${yarnTableName}.id`, yarnsIds)
    .then((data) => {
      console.log("data :::: selectByRequisitionIdNotAddedYarns", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${waPurchaseOrderDetailsTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.initial_quantity`,
      `${waPurchaseOrderDetailsTableName}.current_quantity`,
  ])
    .from(`${waPurchaseOrderDetailsTableName}`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      console.log("data ::: ", data);
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectOneForUpdate = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${waPurchaseOrderDetailsTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`,
      `${waPurchaseOrderDetailsTableName}.initial_quantity`,
      `${waPurchaseOrderDetailsTableName}.current_quantity`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.quantity`,
  ])
    .from(`${waPurchaseOrderDetailsTableName}`)
    .innerJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (waPurchaseOrderDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waPurchaseOrderDetailsTableName,
      waPurchaseOrderDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectOutputWarehouseByRequisitionDetailsId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${warehouseTableName}.name as warehouse_name`,
    `${warehouseTableName}.is_grade`,
  ])
  .sum(`${waAddRequisitionDetailsTableName}.quantity as quantity`)
    .from(`${waAddRequisitionDetailsTableName}`)
    .innerJoin(`${waAddRequisitionDetailsPurchaseOrderTableName}`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`, 
    `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByYarnySeller = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${waPurchaseOrderTableName}.id as requisition_id`,
    `${waPurchaseOrderTableName}.date`,
    `${waPurchaseOrderTableName}.number`,
    `${waPurchaseOrderTableName}.name as order_name`,
    `${waPurchaseOrderTableName}.note`,
    `${waPurchaseOrderDetailsTableName}.id`,
    `${waPurchaseOrderDetailsTableName}.price`,
    `${waPurchaseOrderDetailsTableName}.price_dollar`,
    `${waPurchaseOrderDetailsTableName}.note as note2`,
    `${waPurchaseOrderDetailsTableName}.initial_quantity`,
    `${waPurchaseOrderDetailsTableName}.current_quantity`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
  ])
    .from(`${waPurchaseOrderDetailsTableName}`)
    .innerJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${waPurchaseOrderDetailsTableName}.yarn_id`)
    .where(whereCluse)
    .andWhere(`${waPurchaseOrderDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};
