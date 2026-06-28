// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbManufacturingOrderRequisitionDetailsTableName = require("../../../util/database-tables-name").wbManufacturingOrderRequisitionDetailsTableName;
const { wbManufacturingOrderRequisitionTableName, fabricTableName, bussinessmanTableName, wbManufacturingOutputOrderTableName, wbManufacturingOutputTableName, consigmentManufacturingTableName, warehouseTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingOrderRequisitionDetailsTableName, {
      id: items.wbManufacturingOrderRequisitionDetailsId,
      wb_manufacturing_order_requisition_id: wbManufacturingOrderRequisitionDetails.id,
      fabric_id: items.fabricId,
      initial_quantity: items.quantity,
      current_quantity: items.quantity,
      note: items.note,
      creator_id: wbManufacturingOrderRequisitionDetails.personid,
      ip_address: wbManufacturingOrderRequisitionDetails.ipaddress,
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
    `${wbManufacturingOrderRequisitionTableName}.id as requisition_id`,
    `${wbManufacturingOrderRequisitionTableName}.date`,
    `${wbManufacturingOrderRequisitionTableName}.number`,
    `${wbManufacturingOrderRequisitionTableName}.name as order_name`,
    `${wbManufacturingOrderRequisitionTableName}.note`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.note as note2`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wbManufacturingOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
      `${wbManufacturingOrderRequisitionTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
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
  .sum(`${wbManufacturingOutputTableName}.quantity as quantity`)
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${wbManufacturingOutputOrderTableName}`,
      `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbManufacturingOutputTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .groupBy(`${wbManufacturingOutputTableName}.fabric_id`, 
    `${wbManufacturingOutputTableName}.warehouse_id`)
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
      `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity`,
      `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputOrderTableName}.quantity`,
  ])
    .from(`${wbManufacturingOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wbManufacturingOutputOrderTableName}`,
      `${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_details_id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.id`)
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
      `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity`,
      // `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
      // `${wbManufacturingOutputOrderTableName}.quantity`,
  ])
    .from(`${wbManufacturingOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
      `${wbManufacturingOrderRequisitionTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
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

exports.update = async (wbManufacturingOrderRequisitionDetails, whereCluse, trx = null) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbManufacturingOrderRequisitionDetailsTableName,
      wbManufacturingOrderRequisitionDetails,
      whereCluse,
      trx
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectByFabricBySeller = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wbManufacturingOrderRequisitionTableName}.id as requisition_id`,
    `${wbManufacturingOrderRequisitionTableName}.date`,
    `${wbManufacturingOrderRequisitionTableName}.number`,
    `${wbManufacturingOrderRequisitionTableName}.name as order_name`,
    `${wbManufacturingOrderRequisitionTableName}.note`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.note as note2`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wbManufacturingOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
      `${wbManufacturingOrderRequisitionTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};
