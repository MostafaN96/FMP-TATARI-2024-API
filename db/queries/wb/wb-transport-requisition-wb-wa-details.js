// Config
const { warehouseTableName, yarnTableName, yarnLotTableName, bussinessmanTableName, wbTableName, waTableName, fabricTableName, consigmentYarnTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbTransportRequisitionWbWaTableName = require("../../../util/database-tables-name").wbTransportRequisitionWbWaTableName;
const wbTransportRequisitionWbWaDetailsTableName = require("../../../util/database-tables-name").wbTransportRequisitionWbWaDetailsTableName;

exports.insert = async (wbTransportRequisitionWbWa, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransportRequisitionWbWaDetailsTableName, {
      id: items.wbTransportRequisitionWbWaDetailsId,
      wb_transport_requisition_wb_wa_id: wbTransportRequisitionWbWa.id,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: wbTransportRequisitionWbWa.personid,
      ip_address: wbTransportRequisitionWbWa.ipaddress,
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
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`] = requisitionId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
    `${wbTransportRequisitionWbWaTableName}.date`,
    `${wbTransportRequisitionWbWaTableName}.number`,
    `${wbTransportRequisitionWbWaTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${bussinessmanTableName}.id as industry_id`,
    `${bussinessmanTableName}.name as industry_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `${wbTransportRequisitionWbWaDetailsTableName}.id`,
    `${wbTransportRequisitionWbWaDetailsTableName}.document`,
    `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
    `${wbTransportRequisitionWbWaDetailsTableName}.price`,
    `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
    `${waTableName}.current_quantity`,
  ])
    .sum(`${wbTransportRequisitionWbWaDetailsTableName}.quantity as quantity`)
    .sum(`${waTableName}.current_quantity as current_quantity`)
    .from(`${wbTransportRequisitionWbWaDetailsTableName}`)
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
      `${wbTransportRequisitionWbWaTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .groupBy(`${wbTransportRequisitionWbWaDetailsTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
      `${bussinessmanTableName}.id`,
    )
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`] = requisitionId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wbTransportRequisitionWbWaDetailsTableName}.id`,
    `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
    `${wbTransportRequisitionWbWaDetailsTableName}.document`,
    `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
    `${wbTransportRequisitionWbWaDetailsTableName}.price`,
    `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
    `${wbTransportRequisitionWbWaTableName}.date`,
    `${wbTransportRequisitionWbWaTableName}.number`,
    `${wbTransportRequisitionWbWaTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `${bussinessmanTableName}.name as manufacturer_name`,
    `${wbTableName}.current_quantity`,
    `${fabricTableName}.name as fabric_to_be_manufactured_name`,
    `${fabricTableName}.code as fabric_to_be_manufactured_code`,
  ])
    .from(`${wbTransportRequisitionWbWaDetailsTableName}`)
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
      `${wbTransportRequisitionWbWaTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbTableName}.fabric_to_be_manufactured_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
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
      `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
      `${wbTransportRequisitionWbWaTableName}.warehouse_id`,
      `${wbTransportRequisitionWbWaTableName}.industry_id`,
    ])
    .from(`${wbTransportRequisitionWbWaDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
      `${wbTransportRequisitionWbWaTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wbTransportRequisitionWbWa, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransportRequisitionWbWaDetailsTableName,
      wbTransportRequisitionWbWa,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectSumCurrentQuantityByWarehouseByYarnWa = async (whereCluse) => {
  let queryResults = []

  await knex(yarnLotTableName)
      .select([
        `${yarnLotTableName}.id`, 
        `${yarnLotTableName}.code`, 
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
      ])
      .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, 
      `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`, 
      `${yarnLotTableName}.id`)
      .innerJoin(`${wbTransportRequisitionWbWaTableName}`, 
      `${wbTransportRequisitionWbWaTableName}.id`, 
      `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
      .innerJoin(`${waTableName}`, 
      `${waTableName}.wb_transport_requisition_wb_wa_details_id`, 
      `${wbTransportRequisitionWbWaDetailsTableName}.id`)
      .where(`${waTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
      .sum(`${waTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
        console.log(error);
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportRequisitionWbWaDetailsTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaTableName}`, `${wbTransportRequisitionWbWaTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPalod) => {
  let queryResults = [];

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
      .where(`${wbTransportRequisitionWbWaTableName}.date`, `>=`, bodyPalod.startDate)
      .andWhere(`${wbTransportRequisitionWbWaTableName}.date`, `<=`, bodyPalod.endDate)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDateWb = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(`${wbTransportRequisitionWbWaTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wbTransportRequisitionWbWaTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentYarnForDyedFabricOrder = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex.from(wbTransportRequisitionWbWaTableName)
    .select(
      [
        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price`,
        `${wbTransportRequisitionWbWaDetailsTableName}.price_dollar`,
        `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
        `${wbTransportRequisitionWbWaDetailsTableName}.document`,
        `${wbTransportRequisitionWbWaDetailsTableName}.statement`,
        `${wbTransportRequisitionWbWaTableName}.id as requisition_id`,
        `${wbTransportRequisitionWbWaTableName}.number`,
        `${wbTransportRequisitionWbWaTableName}.date`,
        `${wbTransportRequisitionWbWaTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (B) الى (A)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`, `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wb_transport_requisition_wb_wa_details_id`, `${wbTransportRequisitionWbWaDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportRequisitionWbWaDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`, consigmentsYarn)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};