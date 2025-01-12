// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { waYarnOrderRequisitionTableName, 
  waYarnOrderRequisitionDetailsTableName, 
  yarnTableName, 
  bussinessmanTableName, 
  waAddRequisitionDetailsYarnOrderTableName, 
  waAddRequisitionDetailsTableName, 
  warehouseTableName, 
  waExecuteOrderRequisitionDetailsTableName,
  waExecuteOrderRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (waYarnOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waYarnOrderRequisitionDetailsTableName, {
      id: items.waYarnOrderRequisitionDetailsId,
      wa_yarn_order_requisition_id: waYarnOrderRequisitionDetails.id,
      orders_requisitions_id: waYarnOrderRequisitionDetails.ordersRequisitionsId,
      yarn_id: items.yarnId,
      initial_quantity: items.quantity,
      current_quantity: items.quantity,
      note: items.note,
      creator_id: waYarnOrderRequisitionDetails.personid,
      ip_address: waYarnOrderRequisitionDetails.ipaddress,
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
    `${waYarnOrderRequisitionTableName}.id as requisition_id`,
    `${waYarnOrderRequisitionTableName}.date`,
    `${waYarnOrderRequisitionTableName}.number`,
    `${waYarnOrderRequisitionTableName}.name as order_name`,
    `${waYarnOrderRequisitionTableName}.note`,
    `${waYarnOrderRequisitionDetailsTableName}.id`,
    `${waYarnOrderRequisitionDetailsTableName}.note as note2`,
    `${waYarnOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    // `${waYarnOrderRequisitionDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${waYarnOrderRequisitionDetailsTableName}.current_quantity
      END as current_quantity`),
    knex.raw(
      `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${waYarnOrderRequisitionDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${waYarnOrderRequisitionDetailsTableName}`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.yarn_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${waYarnOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${waYarnOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOutputWarehouseByRequisitionDetailsId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${warehouseTableName}.name as warehouse_name`,
    `${warehouseTableName}.is_grade`,
  ])
  .sum(`${waExecuteOrderRequisitionDetailsTableName}.quantity as quantity`)
    .from(`${waExecuteOrderRequisitionDetailsTableName}`)
    .innerJoin(`${waYarnOrderRequisitionDetailsTableName}`,
      `${waYarnOrderRequisitionDetailsTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`)
      .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .groupBy(`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`, 
    `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .then((data) => {
      console.log(data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${waYarnOrderRequisitionDetailsTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.initial_quantity`,
      `${waYarnOrderRequisitionDetailsTableName}.current_quantity`,
  ])
    .from(`${waYarnOrderRequisitionDetailsTableName}`)
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

exports.selectOneForUpdate = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${waYarnOrderRequisitionDetailsTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionDetailsTableName}.initial_quantity`,
      `${waYarnOrderRequisitionDetailsTableName}.current_quantity`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.quantity`,
  ])
    .from(`${waYarnOrderRequisitionDetailsTableName}`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
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

exports.update = async (waYarnOrderRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waYarnOrderRequisitionDetailsTableName,
      waYarnOrderRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectByYarnySeller = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${waYarnOrderRequisitionTableName}.id as requisition_id`,
    `${waYarnOrderRequisitionTableName}.date`,
    `${waYarnOrderRequisitionTableName}.number`,
    `${waYarnOrderRequisitionTableName}.name as order_name`,
    `${waYarnOrderRequisitionTableName}.note`,
    `${waYarnOrderRequisitionDetailsTableName}.id`,
    `${waYarnOrderRequisitionDetailsTableName}.note as note2`,
    `${waYarnOrderRequisitionDetailsTableName}.initial_quantity`,
    `${waYarnOrderRequisitionDetailsTableName}.current_quantity`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${waYarnOrderRequisitionDetailsTableName}`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${waYarnOrderRequisitionDetailsTableName}.yarn_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${waYarnOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${waYarnOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};
