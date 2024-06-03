// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weSellRequisitionDirectDetailsTableName,
  weSellRequisitionTableName, fabricTableName,
  warehouseTableName,
  bussinessmanTableName,
  deliveryCarTableName,
  colorCategoryTableName,
  colorTableName,
} = require("../../../util/database-tables-name");

exports.insert = async (weSellRequisitionDirectDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weSellRequisitionDirectDetailsTableName, {
      id: items.weSellRequisitionDirectDetailsId,
      we_sell_requisition_id: weSellRequisitionDirectDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      warehouse_id: items.warehouseId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,
      color_code: items.colorCode,
      quantity: items.quantity,
      work_order_number: items.workOrderNumber,
      fabric_piece: items.numberFabricPieces,
      document: items.document,
      statement: items.statement,
      creator_id: weSellRequisitionDirectDetails.personid,
      ip_address: weSellRequisitionDirectDetails.ipaddress,
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

  await knex.from(weSellRequisitionDirectDetailsTableName)
    .select(
      [
        `${weSellRequisitionDirectDetailsTableName}.id`,
        `${weSellRequisitionDirectDetailsTableName}.quantity`,
        `${weSellRequisitionDirectDetailsTableName}.fabric_piece`,
        `${weSellRequisitionDirectDetailsTableName}.document`,
        `${weSellRequisitionDirectDetailsTableName}.statement`,
        `${weSellRequisitionDirectDetailsTableName}.color_code`,
        `${weSellRequisitionDirectDetailsTableName}.is_direct`,
        `${weSellRequisitionTableName}.id as requisition_id`,
        `${weSellRequisitionTableName}.delivery_car_id`,
        `${weSellRequisitionTableName}.number`,
        `${weSellRequisitionTableName}.date`,
        `${weSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${fabricTableName}.id as dyed_fabric_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
          ' (', ${deliveryCarTableName}.plate_number, ') 
          ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.id as color_id`,
        `${colorTableName}.name as color_name`,
        `${weSellRequisitionDirectDetailsTableName}.work_order_number`,
      ],
    )
    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDirectDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.warehouse_id`)
    .leftOuterJoin(`${deliveryCarTableName}`,
      `${deliveryCarTableName}.id`,
      `${weSellRequisitionTableName}.delivery_car_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weSellRequisitionDirectDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weSellRequisitionDirectDetailsTableName)
    .select(
      [
        `${weSellRequisitionDirectDetailsTableName}.id`,
        `${weSellRequisitionDirectDetailsTableName}.quantity`,
        `${weSellRequisitionDirectDetailsTableName}.fabric_piece`,
        `${weSellRequisitionDirectDetailsTableName}.document`,
        `${weSellRequisitionDirectDetailsTableName}.statement`,
        `${weSellRequisitionDirectDetailsTableName}.color_code`,
        `${weSellRequisitionDirectDetailsTableName}.is_direct`,
        `${weSellRequisitionTableName}.id as requisition_id`,
        `${weSellRequisitionTableName}.delivery_car_id`,
        `${weSellRequisitionTableName}.number`,
        `${weSellRequisitionTableName}.date`,
        `${weSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${fabricTableName}.id as dyed_fabric_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
          ' (', ${deliveryCarTableName}.plate_number, ') 
          ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.id as color_id`,
        `${colorTableName}.name as color_name`,
        `${weSellRequisitionDirectDetailsTableName}.work_order_number`,
      ],
    )
    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDirectDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.warehouse_id`)
    .leftOuterJoin(`${deliveryCarTableName}`,
      `${deliveryCarTableName}.id`,
      `${weSellRequisitionTableName}.delivery_car_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weSellRequisitionDirectDetailsTableName}.color_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`,
      `${weSellRequisitionDirectDetailsTableName}.dyed_fabric_id`,
      `${weSellRequisitionDirectDetailsTableName}.warehouse_id`,
      `${weSellRequisitionDirectDetailsTableName}.quantity`,
    ])
    .from(`${weSellRequisitionDirectDetailsTableName}`)
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

exports.update = async (weSellRequisitionDirectDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weSellRequisitionDirectDetailsTableName,
      weSellRequisitionDirectDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};