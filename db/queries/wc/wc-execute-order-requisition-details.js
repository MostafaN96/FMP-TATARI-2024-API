// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  wcExecuteOrderRequisitionDetailsTableName, 
  wcExecuteOrderRequisitionTableName, 
  warehouseTableName, 
  fabricTableName, 
  wcTableName,
  consigmentManufacturingTableName,
  wcFabricOrderRequisitionTableName,
  wcExecuteOrderRequisitionDetailsWcTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wcExecuteOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcExecuteOrderRequisitionDetailsTableName, {
      id: items.wcExecuteOrderRequisitionDetailsId,
      wc_execute_order_requisition_id: wcExecuteOrderRequisitionDetails.id,
      wc_fabric_order_requisition_id: items.wcFabricOrderRequisitionId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      from_warehouse_id: items.fromWarehouseId,
      from_consigment_manufacturing_id: items.fromConsigmentManufacturingId,
      price: items.price,
      quantity: items.quantity,
      note: items.note ?? '',
      creator_id: wcExecuteOrderRequisitionDetails.personid,
      ip_address: wcExecuteOrderRequisitionDetails.ipaddress,
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
    `wc_fabric_order_requisition_id`,
    `wc_fabric_order_requisition_details_id`,
    `price`,
    `quantity`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `requisition_note`,
    `warehouse_id`,
    `warehouse_name`,
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `consigment_manufacturing_id`,
    `consigment_manufacturing_number`,
    `fabric_order_name`,
    `wc_id`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wcExecuteOrderRequisitionDetailsTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.price`,
      `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${wcExecuteOrderRequisitionDetailsTableName}.note`,
      `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
      `${wcExecuteOrderRequisitionTableName}.number`,
      `${wcExecuteOrderRequisitionTableName}.date`,
      `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `${wcFabricOrderRequisitionTableName}.name as fabric_order_name`,
      `${wcTableName}.id as wc_id`,
    ])
      .from(`${wcExecuteOrderRequisitionDetailsTableName}`)
      .innerJoin(`${wcExecuteOrderRequisitionTableName}`, 
      `${wcExecuteOrderRequisitionTableName}.id`, 
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_execute_order_requisition_details_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
        .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcExecuteOrderRequisitionTableName}.wc_fabric_order_requisition_id`)
      .where(whereCluse)
      .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${wcExecuteOrderRequisitionTableName}.warehouse_id`,
      `${wcTableName}.id as wc_id`,
    ])
    .from(`${wcExecuteOrderRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_execute_order_requisition_details_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.id`)
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
    .selectWithJionWithLimit(wcExecuteOrderRequisitionDetailsTableName, 
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`
    ], 
      whereCluse,
      wcExecuteOrderRequisitionTableName, 
    `${wcExecuteOrderRequisitionTableName}.id`,
     `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcExecuteOrderRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcExecuteOrderRequisitionDetailsTableName,
      wcExecuteOrderRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentManufacturingTableName)
      .select([
        `${consigmentManufacturingTableName}.id`, 
        `${consigmentManufacturingTableName}.number`, 
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`, 
      `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcExecuteOrderRequisitionTableName}`, 
      `${wcExecuteOrderRequisitionTableName}.id`, 
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wc_execute_order_requisition_details_id`, 
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .sum(`${wcTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectFromTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionTableName}.warehouse_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${wcExecuteOrderRequisitionDetailsWcTableName}`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionTableName}.warehouse_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcExecuteOrderRequisitionDetailsWcTableName}`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcExecuteOrderRequisitionDetailsWcTableName}`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
      .innerJoin(`${wcExecuteOrderRequisitionDetailsWcTableName}`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
    `${wcExecuteOrderRequisitionTableName}.id`,
    `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
    .innerJoin(`${wcExecuteOrderRequisitionDetailsWcTableName}`,
    `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_execute_order_requisition_details_id`,
    `${wcExecuteOrderRequisitionDetailsTableName}.id`)
  .innerJoin(`${wcTableName}`,
    `${wcTableName}.id`,
    `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`)
  .innerJoin(`${fabricTableName}`, 
  `${fabricTableName}.id`, 
  `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
  .innerJoin(`${warehouseTableName}`, 
  `${warehouseTableName}.id`, 
  `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
  .innerJoin(`${consigmentManufacturingTableName}`, 
  `${consigmentManufacturingTableName}.id`, 
  `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(`${wcExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${wcExecuteOrderRequisitionDetailsTableName}.id`,
        `${wcExecuteOrderRequisitionDetailsTableName}.price`,
        `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${wcExecuteOrderRequisitionDetailsTableName}.note`,
        `${wcExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${wcExecuteOrderRequisitionTableName}.number`,
        `${wcExecuteOrderRequisitionTableName}.date`,
        `${wcExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_execute_order_requisition_details_id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(`${wcExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};