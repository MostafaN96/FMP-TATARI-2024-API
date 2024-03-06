// Config
const { consigmentManufacturingTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wcReturnRequisitionDetailsTableName = require("../../../util/database-tables-name").wcReturnRequisitionDetailsTableName;
const wcReturnRequisitionTableName = require("../../../util/database-tables-name").wcReturnRequisitionTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;

exports.insert = async (wcReturnRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcReturnRequisitionDetailsTableName, {
      id: items.wcReturnRequisitionDetailsId,
      wc_return_requisition_id: wcReturnRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      price: items.price,
      quantity: items.quantity,
      statement: items.statement,
      creator_id: wcReturnRequisitionDetails.personid,
      ip_address: wcReturnRequisitionDetails.ipaddress,
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
  whereCluse[`${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`] = requisitionId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.id`,
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionDetailsTableName}.statement`,
        `${wcReturnRequisitionTableName}.id as requisition_id`,
        `${wcReturnRequisitionTableName}.number`,
        `${wcReturnRequisitionTableName}.date`,
        `${wcReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as supplier_id`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReturnRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReturnRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.id`,
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionDetailsTableName}.statement`,
        `${wcReturnRequisitionTableName}.id as requisition_id`,
        `${wcReturnRequisitionTableName}.number`,
        `${wcReturnRequisitionTableName}.date`,
        `${wcReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReturnRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReturnRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.id`,
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionDetailsTableName}.statement`,
        `${wcReturnRequisitionTableName}.id as requisition_id`,
        `${wcReturnRequisitionTableName}.number`,
        `${wcReturnRequisitionTableName}.date`,
        `${wcReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReturnRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReturnRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReturnRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`,
      `${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`,
      `${wcReturnRequisitionDetailsTableName}.fabric_id`,
      `${wcReturnRequisitionTableName}.warehouse_id`,
      `${wcReturnRequisitionDetailsTableName}.quantity`
    ])
    .from(`${wcReturnRequisitionDetailsTableName}`)
    .innerJoin(`${wcReturnRequisitionTableName}`,
      `${wcReturnRequisitionTableName}.id`,
      `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
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

exports.update = async (wcReturnRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcReturnRequisitionDetailsTableName,
      wcReturnRequisitionDetails,
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

  await knex.from(wcReturnRequisitionDetailsTableName)
    .select(
      [
        `${wcReturnRequisitionDetailsTableName}.id`,
        `${wcReturnRequisitionDetailsTableName}.price`,
        `${wcReturnRequisitionDetailsTableName}.quantity`,
        `${wcReturnRequisitionDetailsTableName}.statement`,
        `${wcReturnRequisitionTableName}.id as requisition_id`,
        `${wcReturnRequisitionTableName}.number`,
        `${wcReturnRequisitionTableName}.date`,
        `${wcReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReturnRequisitionTableName}`, `${wcReturnRequisitionTableName}.id`, `${wcReturnRequisitionDetailsTableName}.wc_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReturnRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReturnRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReturnRequisitionTableName}.warehouse_id`)
    .where(`${wcReturnRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wcReturnRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};