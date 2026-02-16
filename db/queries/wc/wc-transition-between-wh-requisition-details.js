// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  wcTransitionBetweenWHRequisitionDetailsTableName, 
  wcTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  fabricTableName, 
  wcTableName, 
  consigmentManufacturingTableName,
  wcTransitionBetweenWHRequisitionDetailsWcTableName,
  wcFabricOrderRequisitionTableName,
  wdTransportWcWdDetailsWcTableName,
  ordersRequisitionsTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wcTransitionBetweenWHRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTransitionBetweenWHRequisitionDetailsTableName, {
      id: items.wcTransitionBetweenWHRequisitionDetailsId,
      wc_transition_between_wh_requisitions_id: wcTransitionBetweenWHRequisitionDetails.id,
      from_warehouse_id: items.fromWarehouseId,
      from_consigment_manufacturing_id: items.fromConsigmentManufacturingId,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.fabricOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wcTransitionBetweenWHRequisitionDetails.personid,
      ip_address: wcTransitionBetweenWHRequisitionDetails.ipaddress,
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
    `price`,
    `price_dollar`,
    `fabric_piece`,
    `quantity`,
    `document`,
    `statement`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `from_warehouse_id`,
    `from_warehouse_name`,
    `to_warehouse_name`,
    `to_warehouse_id`,
    `fabric_name`,
    `fabric_code`,
    `consigment_manufacturing_number`,
    `from_consigment_manufacturing_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
      `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
      `${wcTransitionBetweenWHRequisitionTableName}.number`,
      `${wcTransitionBetweenWHRequisitionTableName}.date`,
      `${wcTransitionBetweenWHRequisitionTableName}.note`,
      `${warehouseTableName}.id as from_warehouse_id`,
      `${warehouseTableName}.name as from_warehouse_name`,
      `to_warehouse.name as to_warehouse_name`,
      `to_warehouse.id as to_warehouse_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `from_consigment_manufacturing.number as from_consigment_manufacturing_number`,
    ])
      .from(`${wcTransitionBetweenWHRequisitionDetailsTableName}`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`, 
      `${wcTransitionBetweenWHRequisitionTableName}.id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${warehouseTableName} as to_warehouse`,
      `to_warehouse.id`,
      `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
      .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
        .innerJoin(`${consigmentManufacturingTableName} as from_consigment_manufacturing`,
      `from_consigment_manufacturing.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
      .where(whereCluse)
      .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_manufacturing_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
      `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`,
    ])
    .from(`${wcTransitionBetweenWHRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
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
    .selectWithJionWithLimit(wcTransitionBetweenWHRequisitionDetailsTableName, 
      ["wc_transition_between_wh_requisitions_details.id", 
      "wc_transition_between_wh_requisitions_details.price",
      "wc_transition_between_wh_requisitions_details.price_dollar",
    ], 
      whereCluse,
      wcTransitionBetweenWHRequisitionTableName, 
    `${wcTransitionBetweenWHRequisitionTableName}.id`,
     `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcTransitionBetweenWHRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcTransitionBetweenWHRequisitionDetailsTableName,
      wcTransitionBetweenWHRequisitionDetails,
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
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`, 
      `${wcTransitionBetweenWHRequisitionTableName}.id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
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
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id as warehouse_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id as warehouse_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${ordersRequisitionsTableName}.name as wc_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${ordersRequisitionsTableName}`, 
    `${ordersRequisitionsTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.orders_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${ordersRequisitionsTableName}.name as order_name`,
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${ordersRequisitionsTableName}`, 
    `${ordersRequisitionsTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.orders_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${wcTableName}.id as wc_id`,
        `${wcTableName}.storage_place`,
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
    `${wcTransitionBetweenWHRequisitionTableName}.id`,
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
    `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
  .innerJoin(`${wcTableName}`,
    `${wcTableName}.id`,
    `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
  .innerJoin(`${fabricTableName}`, 
  `${fabricTableName}.id`, 
  `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
  .innerJoin(`${warehouseTableName}`, 
  `${warehouseTableName}.id`, 
  `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
  .innerJoin(`${consigmentManufacturingTableName}`, 
  `${consigmentManufacturingTableName}.id`, 
  `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(`${wcTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(`${wcTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionTableName}.date`,
        `${wcTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wcTransitionBetweenWHRequisitionDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToRequisitionsForWcFabricOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsWcTableName)
    .select(
      [
        `${wcTransitionBetweenWHRequisitionTableName}.number`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id as requisition_id`,
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
      ],
    )
    .innerJoin(`${wcTableName}`, 
      `${wcTableName}.id`, 
      `${wdTransportWcWdDetailsWcTableName}.wc_id`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`, 
        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`, 
        `${wcTableName}.wc_transition_between_wh_requisitions_details_id`)
    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`, 
      `${wcTransitionBetweenWHRequisitionTableName}.id`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wdTransportWcWdDetailsWcTableName}.quantity`, ">", 0)
    .groupBy(`${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};