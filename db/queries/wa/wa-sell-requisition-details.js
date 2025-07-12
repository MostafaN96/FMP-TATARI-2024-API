// Config
const { consigmentYarnTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waSellRequisitionDetailsTableName = require("../../../util/database-tables-name").waSellRequisitionDetailsTableName;
const waSellRequisitionTableName = require("../../../util/database-tables-name").waSellRequisitionTableName;
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;
const yarnLotTableName = require("../../../util/database-tables-name").yarnLotTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (waSellRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waSellRequisitionDetailsTableName, {
      id: items.waSellRequisitionDetailsId,
      wa_sell_requisition_id: waSellRequisitionDetails.id,
      yarn_lot_id: items.yarnLotId,
      yarn_id: items.yarnId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: waSellRequisitionDetails.personid,
      ip_address: waSellRequisitionDetails.ipaddress,
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
  whereCluse[`${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`] = requisitionId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as seller_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
        .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
        .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByYarnByLot = async (
  warehouseId, yarnId, 
  yarnLotId, consigmentYarnId,
  yarnOrderId
) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waSellRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${waSellRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${waSellRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
        .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
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
    `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`,
    `${waSellRequisitionDetailsTableName}.yarn_lot_id`, 
    `${waSellRequisitionDetailsTableName}.yarn_id`, 
    `${waSellRequisitionDetailsTableName}.consigment_yarn_id`, 
    `${waSellRequisitionTableName}.warehouse_id`, 
    `${waSellRequisitionDetailsTableName}.quantity`
  ])
  .from(`${waSellRequisitionDetailsTableName}`)
  .innerJoin(`${waSellRequisitionTableName}`,
  `${waSellRequisitionTableName}.id`,
  `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
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

exports.selectOneByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`] = requisitionId;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as seller_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (waSellRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waSellRequisitionDetailsTableName,
      waSellRequisitionDetails,
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

  await knex.from(waSellRequisitionDetailsTableName)
    .select(
      [
        `${waSellRequisitionDetailsTableName}.id`,
        `${waSellRequisitionDetailsTableName}.price`,
        `${waSellRequisitionDetailsTableName}.price_dollar`,
        `${waSellRequisitionDetailsTableName}.quantity`,
        `${waSellRequisitionDetailsTableName}.document`,
        `${waSellRequisitionDetailsTableName}.statement`,
        `${waSellRequisitionTableName}.id as requisition_id`,
        `${waSellRequisitionTableName}.number`,
        `${waSellRequisitionTableName}.date`,
        `${waSellRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waSellRequisitionTableName}`, `${waSellRequisitionTableName}.id`, `${waSellRequisitionDetailsTableName}.wa_sell_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waSellRequisitionTableName}.seller_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waSellRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waSellRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waSellRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(`${waSellRequisitionTableName}.date`, `>=`, bodyPalod.startDate)
    .andWhere(`${waSellRequisitionTableName}.date`, `<=`, bodyPalod.endDate)
    .andWhere(`${waSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};