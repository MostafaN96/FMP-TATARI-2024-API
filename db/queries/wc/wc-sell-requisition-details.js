// Config
const { consigmentManufacturingTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wcSellRequisitionDetailsTableName = require("../../../util/database-tables-name").wcSellRequisitionDetailsTableName;
const wcSellRequisitionTableName = require("../../../util/database-tables-name").wcSellRequisitionTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const yarnLotTableName = require("../../../util/database-tables-name").yarnLotTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wcSellRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcSellRequisitionDetailsTableName, {
      id: items.wcSellRequisitionDetailsId,
      wc_sell_requisition_id: wcSellRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: wcSellRequisitionDetails.personid,
      ip_address: wcSellRequisitionDetails.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`] = requisitionId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.id`,
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionDetailsTableName}.document`,
        `${wcSellRequisitionDetailsTableName}.statement`,
        `${wcSellRequisitionTableName}.id as requisition_id`,
        `${wcSellRequisitionTableName}.number`,
        `${wcSellRequisitionTableName}.date`,
        `${wcSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as seller_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcSellRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcSellRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.id`,
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionDetailsTableName}.document`,
        `${wcSellRequisitionDetailsTableName}.statement`,
        `${wcSellRequisitionTableName}.id as requisition_id`,
        `${wcSellRequisitionTableName}.number`,
        `${wcSellRequisitionTableName}.date`,
        `${wcSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcSellRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcSellRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.id`,
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionDetailsTableName}.document`,
        `${wcSellRequisitionDetailsTableName}.statement`,
        `${wcSellRequisitionTableName}.id as requisition_id`,
        `${wcSellRequisitionTableName}.number`,
        `${wcSellRequisitionTableName}.date`,
        `${wcSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcSellRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcSellRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcSellRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
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
    `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`,
    `${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`, 
    `${wcSellRequisitionDetailsTableName}.fabric_id`, 
    `${wcSellRequisitionTableName}.warehouse_id`, 
    `${wcSellRequisitionDetailsTableName}.quantity`
  ])
  .from(`${wcSellRequisitionDetailsTableName}`)
  .innerJoin(`${wcSellRequisitionTableName}`,
  `${wcSellRequisitionTableName}.id`,
  `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
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

exports.update = async (wcSellRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcSellRequisitionDetailsTableName,
      wcSellRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcSellRequisitionDetailsTableName)
    .select(
      [
        `${wcSellRequisitionDetailsTableName}.id`,
        `${wcSellRequisitionDetailsTableName}.price`,
        `${wcSellRequisitionDetailsTableName}.price_dollar`,
        `${wcSellRequisitionDetailsTableName}.quantity`,
        `${wcSellRequisitionDetailsTableName}.document`,
        `${wcSellRequisitionDetailsTableName}.statement`,
        `${wcSellRequisitionTableName}.id as requisition_id`,
        `${wcSellRequisitionTableName}.number`,
        `${wcSellRequisitionTableName}.date`,
        `${wcSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcSellRequisitionTableName}`, `${wcSellRequisitionTableName}.id`, `${wcSellRequisitionDetailsTableName}.wc_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcSellRequisitionTableName}.seller_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcSellRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcSellRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcSellRequisitionTableName}.warehouse_id`)
    .where(`${wcSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wcSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};