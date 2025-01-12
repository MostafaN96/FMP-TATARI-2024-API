// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").wbReconciliationRequisitionDetailsTableName;
const wbReconciliationRequisitionTableName = require("../../../util/database-tables-name").wbReconciliationRequisitionTableName;
const waReconciliationRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const yarnLotTableName = require("../../../util/database-tables-name").yarnLotTableName;
const waTableName = require("../../../util/database-tables-name").waTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const constants = require("../../../util/constants");
const { consigmentYarnTableName, waYarnOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbReconciliationRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbReconciliationRequisitionDetailsTableName, {
      id: items.wbReconciliationRequisitionDetailsId,
      wb_reconcilition_requisition_id: wbReconciliationRequisitionDetails.id,
      wa_yarn_order_requisition_details_id: items.waYarnOrderRequisitionDetailsId,
      wa_yarn_order_requisition_id: items.yarnOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      statement: items.statement ?? '',
      input_output: items.inputOutput,
      creator_id: wbReconciliationRequisitionDetails.personid,
      ip_address: wbReconciliationRequisitionDetails.ipaddress,
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
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        `${wbReconciliationRequisitionTableName}.creator_id`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${bussinessmanTableName}.id as industry_id`,
        `${bussinessmanTableName}.name as industry_name`,
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        `${wbReconciliationRequisitionTableName}.creator_id`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${bussinessmanTableName}.id as industry_id`,
        `${bussinessmanTableName}.name as industry_name`,
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByIndustryByYarnByLot = async (industryId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionTableName}.industry_id`] = industryId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
      whereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
      whereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnIdByIndustryId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByYarnWa = async (whereCluse) => {
  let queryResults = []

  await knex(yarnLotTableName)
    .select([
      `${yarnLotTableName}.id`,
      `${yarnLotTableName}.code`,
      `${wbReconciliationRequisitionDetailsTableName}.quantity`,
    ])
    .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
      `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`,
      `${yarnLotTableName}.id`)
    .innerJoin(`${wbReconciliationRequisitionTableName}`,
      `${wbReconciliationRequisitionTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
      `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
      `${wbReconciliationRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
    .where(`${waTableName}.current_quantity`, ">", "0")
    .andWhere(whereCluse)
    .groupBy(`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .sum(`${waTableName}.current_quantity as current_quantity`)
    .then(data => {
      console.log("Reconcilition selectSumCurrentQuantityByWarehouseByYarnWa ::: ", data);
      queryResults = data
    })
    .catch(error => {
      console.log(error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectOne = async (whereCluse) => {
  let queryResults = false;

  await knex
    .select([
      `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`,
      `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
      `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`,
      `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`,
      `${wbReconciliationRequisitionDetailsTableName}.yarn_id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`,
      `${wbReconciliationRequisitionTableName}.industry_id`,
      `${wbReconciliationRequisitionDetailsTableName}.quantity`
    ])
    .from(`${wbReconciliationRequisitionDetailsTableName}`)
    .innerJoin(`${wbReconciliationRequisitionTableName}`,
      `${wbReconciliationRequisitionTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
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

exports.update = async (wbReconciliationRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbReconciliationRequisitionDetailsTableName,
      wbReconciliationRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbReconciliationRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
      whereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
      whereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${wbReconciliationRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wbReconciliationRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentYarnForDyedFabricOrder = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex.from(wbReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wbReconciliationRequisitionDetailsTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.price`,
        `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wbReconciliationRequisitionDetailsTableName}.quantity`,
        `${wbReconciliationRequisitionDetailsTableName}.statement`,
        `${wbReconciliationRequisitionTableName}.id as requisition_id`,
        `${wbReconciliationRequisitionTableName}.number`,
        `${wbReconciliationRequisitionTableName}.date`,
        `${wbReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wbReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbReconciliationRequisitionTableName}`, `${wbReconciliationRequisitionTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbReconciliationRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`, consigmentsYarn)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};