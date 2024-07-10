// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  waExecuteOrderRequisitionDetailsTableName, 
  waExecuteOrderRequisitionTableName, 
  warehouseTableName, 
  yarnTableName, 
  waTableName,
  consigmentYarnTableName,
  yarnLotTableName,
  waYarnOrderRequisitionTableName,
  waExecuteOrderRequisitionDetailsWaTableName
} = require("../../../util/database-tables-name");

exports.insert = async (waExecuteOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waExecuteOrderRequisitionDetailsTableName, {
      id: items.waExecuteOrderRequisitionDetailsId,
      wa_execute_order_requisition_id: waExecuteOrderRequisitionDetails.id,
      wa_yarn_order_requisition_id: items.waYarnOrderRequisitionId,
      wa_yarn_order_requisition_details_id: items.waYarnOrderRequisitionDetailsId,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      from_warehouse_id: items.fromWarehouseId,
      from_consigment_yarn_id: items.fromConsigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      note: items.note ?? '',
      creator_id: waExecuteOrderRequisitionDetails.personid,
      ip_address: waExecuteOrderRequisitionDetails.ipaddress,
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

  let columns = [
    `id`,
    `wa_yarn_order_requisition_id`,
    `wa_yarn_order_requisition_details_id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `requisition_note`,
    `warehouse_id`,
    `warehouse_name`,
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `yarn_order_name`,
    `wa_id`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${waExecuteOrderRequisitionDetailsTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.price`,
      `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
      `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${waExecuteOrderRequisitionDetailsTableName}.note`,
      `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
      `${waExecuteOrderRequisitionTableName}.number`,
      `${waExecuteOrderRequisitionTableName}.date`,
      `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${waYarnOrderRequisitionTableName}.name as yarn_order_name`,
      `${waTableName}.id as wa_id`,
    ])
      .from(`${waExecuteOrderRequisitionDetailsTableName}`)
      .innerJoin(`${waExecuteOrderRequisitionTableName}`, 
      `${waExecuteOrderRequisitionTableName}.id`, 
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${waExecuteOrderRequisitionTableName}.warehouse_id`)
      .innerJoin(`${yarnTableName}`, 
      `${yarnTableName}.id`, 
      `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_execute_order_requisition_details_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
        .innerJoin(`${waYarnOrderRequisitionTableName}`,
        `${waYarnOrderRequisitionTableName}.id`,
        `${waExecuteOrderRequisitionTableName}.wa_yarn_order_requisition_id`)
      .where(whereCluse)
      .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
  }).as('temp')

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
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${waExecuteOrderRequisitionTableName}.warehouse_id`,
      `${waTableName}.id as wa_id`,
    ])
    .from(`${waExecuteOrderRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_execute_order_requisition_details_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .selectWithJionWithLimit(waExecuteOrderRequisitionDetailsTableName, 
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
    ], 
      whereCluse,
      waExecuteOrderRequisitionTableName, 
    `${waExecuteOrderRequisitionTableName}.id`,
     `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (waExecuteOrderRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waExecuteOrderRequisitionDetailsTableName,
      waExecuteOrderRequisitionDetails,
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
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${waExecuteOrderRequisitionDetailsTableName}`, 
      `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`, 
      `${yarnLotTableName}.id`)
      .innerJoin(`${waExecuteOrderRequisitionTableName}`, 
      `${waExecuteOrderRequisitionTableName}.id`, 
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waTableName}`, 
      `${waTableName}.wa_execute_order_requisition_details_id`, 
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
      .where(`${waTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
      .sum(`${waTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectFromWarehouseTotalByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionTableName}.warehouse_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionTableName}.warehouse_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waTableName}`,
      `${waTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `to_consigment_yarn.number as to_consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.from_consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as to_consigment_yarn`, 
    `to_consigment_yarn.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output','1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waTableName}`,
      `${waTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.from_consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output','1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
    `${waExecuteOrderRequisitionTableName}.id`,
    `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
    .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
    `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
    `${waExecuteOrderRequisitionDetailsTableName}.id`)
  .innerJoin(`${waTableName}`,
    `${waTableName}.id`,
    `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
  .innerJoin(`${yarnTableName}`, 
  `${yarnTableName}.id`, 
  `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
  .innerJoin(`${yarnLotTableName}`, 
  `${yarnLotTableName}.id`, 
  `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
  .innerJoin(`${warehouseTableName}`, 
  `${warehouseTableName}.id`, 
  `${waExecuteOrderRequisitionTableName}.warehouse_id`)
  .innerJoin(`${consigmentYarnTableName}`, 
  `${consigmentYarnTableName}.id`, 
  `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${waExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${waExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.id`,
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionDetailsTableName}.note`,
        `${waExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${waExecuteOrderRequisitionTableName}.number`,
        `${waExecuteOrderRequisitionTableName}.date`,
        `${waExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output','1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waExecuteOrderRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${waExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${waExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehousePriceByWarehouseByYarnId = async (fromWarehouseId, yarnId) => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = fromWarehouseId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${waExecuteOrderRequisitionDetailsTableName}.price`,
        `${waExecuteOrderRequisitionDetailsTableName}.price_dollar`,
        `${waExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${waExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${waExecuteOrderRequisitionTableName}`,
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`)
      .innerJoin(`${waExecuteOrderRequisitionDetailsWaTableName}`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_execute_order_requisition_details_id`,
      `${waExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`)
    .where(whereCluse)
    .andWhere(`${waExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};