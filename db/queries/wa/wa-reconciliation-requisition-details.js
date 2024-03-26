// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const waReconciliationRequisitionTableName = require("../../../util/database-tables-name").waReconciliationRequisitionTableName;
const waReconciliationRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const yarnLotTableName = require("../../../util/database-tables-name").yarnLotTableName;
const waTableName = require("../../../util/database-tables-name").waTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const constants = require("../../../util/constants");
const { consigmentYarnTableName } = require("../../../util/database-tables-name");

exports.insert = async (waReconciliationRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waReconciliationRequisitionDetailsTableName, {
      id: items.waReconciliationRequisitionDetailsId,
      wa_reconcilition_requisition_id: waReconciliationRequisitionDetails.id,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      statement: items.statement,
      input_output: items.inputOutput,
      creator_id: waReconciliationRequisitionDetails.personid,
      ip_address: waReconciliationRequisitionDetails.ipaddress,
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
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionDetailsTableName}.statement`,
        `${waReconciliationRequisitionDetailsTableName}.input_output`,
        `${waReconciliationRequisitionTableName}.id as requisition_id`,
        `${waReconciliationRequisitionTableName}.number`,
        `${waReconciliationRequisitionTableName}.date`,
        `${waReconciliationRequisitionTableName}.note`,
        `${waReconciliationRequisitionTableName}.creator_id`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReconciliationRequisitionTableName}.warehouse_id`)
            .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionDetailsTableName}.statement`,
        `${waReconciliationRequisitionTableName}.id as requisition_id`,
        `${waReconciliationRequisitionTableName}.number`,
        `${waReconciliationRequisitionTableName}.date`,
        `${waReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReconciliationRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionDetailsTableName}.statement`,
        `${waReconciliationRequisitionTableName}.id as requisition_id`,
        `${waReconciliationRequisitionTableName}.number`,
        `${waReconciliationRequisitionTableName}.date`,
        `${waReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReconciliationRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
        whereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
        whereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionDetailsTableName}.statement`,
        `${waReconciliationRequisitionTableName}.id as requisition_id`,
        `${waReconciliationRequisitionTableName}.number`,
        `${waReconciliationRequisitionTableName}.date`,
        `${waReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReconciliationRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
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
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
      ])
      .innerJoin(`${waReconciliationRequisitionDetailsTableName}`, 
      `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`, 
      `${yarnLotTableName}.id`)
      .innerJoin(`${waReconciliationRequisitionTableName}`, 
      `${waReconciliationRequisitionTableName}.id`, 
      `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
      .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`, 
      `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`, 
      `${waReconciliationRequisitionDetailsTableName}.id`)
      .innerJoin(`${waTableName}`, 
      `${waTableName}.id`, 
      `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
      .where(`${waTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
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
    `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`,
    `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`, 
    `${waReconciliationRequisitionDetailsTableName}.yarn_id`, 
    `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`, 
    `${waReconciliationRequisitionTableName}.warehouse_id`, 
    `${waReconciliationRequisitionDetailsTableName}.quantity`
  ])
  .from(`${waReconciliationRequisitionDetailsTableName}`)
  .innerJoin(`${waReconciliationRequisitionTableName}`,
  `${waReconciliationRequisitionTableName}.id`,
  `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
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

exports.update = async (waReconciliationRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waReconciliationRequisitionDetailsTableName,
      waReconciliationRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPalod) => {
  let queryResults = [];

  await knex.from(waReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${waReconciliationRequisitionDetailsTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.price`,
        `${waReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${waReconciliationRequisitionDetailsTableName}.quantity`,
        `${waReconciliationRequisitionDetailsTableName}.statement`,
        `${waReconciliationRequisitionTableName}.id as requisition_id`,
        `${waReconciliationRequisitionTableName}.number`,
        `${waReconciliationRequisitionTableName}.date`,
        `${waReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${waReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReconciliationRequisitionTableName}`, `${waReconciliationRequisitionTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReconciliationRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(`${waReconciliationRequisitionTableName}.date`, `>=`, bodyPalod.startDate)
    .andWhere(`${waReconciliationRequisitionTableName}.date`, `<=`, bodyPalod.endDate)
    .andWhere(`${waReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};