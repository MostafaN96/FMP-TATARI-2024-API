// Config
const { yarnLotTableName, consigmentYarnTableName, waAddRequisitionTableName, waAddRequisitionDetailsYarnOrderTableName, waAddRequisitionDetailsTableName, waYarnOrderRequisitionDetailsTableName, waYarnOrderRequisitionTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waReturnRequisitionDetailsTableName = require("../../../util/database-tables-name").waReturnRequisitionDetailsTableName;
const waReturnRequisitionTableName = require("../../../util/database-tables-name").waReturnRequisitionTableName;
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;

exports.insert = async (waReturnRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waReturnRequisitionDetailsTableName, {
      id: items.waReturnRequisitionDetailsId,
      wa_return_requisition_id: waReturnRequisitionDetails.id,
      wa_yarn_order_requisition_details_id: items.waYarnOrderRequisitionDetailsId,
      wa_yarn_order_requisition_id: items.yarnOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      yarn_lot_id: items.yarnLotId,
      yarn_id: items.yarnId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      statement: items.statement,
      creator_id: waReturnRequisitionDetails.personid,
      ip_address: waReturnRequisitionDetails.ipaddress,
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
  whereCluse[`${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`] = requisitionId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionDetailsTableName}.statement`,
        `${waReturnRequisitionTableName}.id as requisition_id`,
        `${waReturnRequisitionTableName}.number`,
        `${waReturnRequisitionTableName}.date`,
        `${waReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as supplier_id`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReturnRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${waYarnOrderRequisitionDetailsTableName}`, 
      `${waYarnOrderRequisitionDetailsTableName}.id`, 
      `${waReturnRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionDetailsTableName}.statement`,
        `${waReturnRequisitionTableName}.id as requisition_id`,
        `${waReturnRequisitionTableName}.number`,
        `${waReturnRequisitionTableName}.date`,
        `${waReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReturnRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionDetailsTableName}.statement`,
        `${waReturnRequisitionTableName}.id as requisition_id`,
        `${waReturnRequisitionTableName}.number`,
        `${waReturnRequisitionTableName}.date`,
        `${waReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReturnRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByYarnByLot = async (
  warehouseId, yarnId, 
  yarnLotId, consigmentYarnId,
  yarnOrderId,
  supplierId
) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
      whereCluse[`${waReturnRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
      whereCluse[`${waReturnRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, 
      `${waReturnRequisitionTableName}.id`, 
      `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
      whereCluse[`${waReturnRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
      whereCluse[`${waReturnRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionDetailsTableName}.statement`,
        `${waReturnRequisitionTableName}.id as requisition_id`,
        `${waReturnRequisitionTableName}.number`,
        `${waReturnRequisitionTableName}.date`,
        `${waReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReturnRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waReturnRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`,
      `${waReturnRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
      `${waReturnRequisitionDetailsTableName}.yarn_lot_id`,
      `${waReturnRequisitionDetailsTableName}.yarn_id`,
      `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`,
      `${waReturnRequisitionTableName}.warehouse_id`,
      `${waReturnRequisitionDetailsTableName}.quantity`
    ])
    .from(`${waReturnRequisitionDetailsTableName}`)
    .innerJoin(`${waReturnRequisitionTableName}`,
      `${waReturnRequisitionTableName}.id`,
      `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
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

exports.update = async (waReturnRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waReturnRequisitionDetailsTableName,
      waReturnRequisitionDetails,
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

  await knex.from(waReturnRequisitionDetailsTableName)
    .select(
      [
        `${waReturnRequisitionDetailsTableName}.id`,
        `${waReturnRequisitionDetailsTableName}.price`,
        `${waReturnRequisitionDetailsTableName}.price_dollar`,
        `${waReturnRequisitionDetailsTableName}.quantity`,
        `${waReturnRequisitionDetailsTableName}.statement`,
        `${waReturnRequisitionTableName}.id as requisition_id`,
        `${waReturnRequisitionTableName}.number`,
        `${waReturnRequisitionTableName}.date`,
        `${waReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.id as yarn_lot_id`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waReturnRequisitionTableName}`, `${waReturnRequisitionTableName}.id`, `${waReturnRequisitionDetailsTableName}.wa_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waReturnRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waReturnRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waReturnRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(`${waReturnRequisitionTableName}.date`, `>=`, bodyPalod.startDate)
    .andWhere(`${waReturnRequisitionTableName}.date`, `<=`, bodyPalod.endDate)
    .andWhere(`${waReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};