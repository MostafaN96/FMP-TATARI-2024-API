// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  wcTransitionBetweenOrdersRequisitionDetailsTableName, 
  wcTransitionBetweenOrdersRequisitionTableName, 
  warehouseTableName, 
  fabricTableName, 
  wcTableName, 
  consigmentManufacturingTableName,
  wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
  wcFabricOrderRequisitionTableName,
  wcFabricOrderRequisitionDetailsTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wcTransitionBetweenOrdersRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTransitionBetweenOrdersRequisitionDetailsTableName, {
      id: items.wcTransitionBetweenOrdersRequisitionDetailsId,
      wc_transition_between_orders_requisitions_id: wcTransitionBetweenOrdersRequisitionDetails.id,
      warehouse_id: items.warehouseId,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      from_consigment_manufacturing_id: items.fromConsigmentManufacturingId,
      from_wc_fabric_order_requisition_details_id: items.fromWcFabricOrderRequisitionDetailsId,
      from_wc_fabric_order_requisition_id: items.fromFabricOrderId,
      from_orders_requisitions_id: items.fromOrdersRequisitionsId,
      wc_fabric_order_requisition_details_id: items.toWcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: wcTransitionBetweenOrdersRequisitionDetails.fabricOrderId,
      orders_requisitions_id: wcTransitionBetweenOrdersRequisitionDetails.ordersRequisitionsId,
      wc_parent_fabric_order_requisition_id: wcTransitionBetweenOrdersRequisitionDetails.fabricOrderId,
      wc_parent_fabric_order_requisition_orders_requisitions_id: wcTransitionBetweenOrdersRequisitionDetails.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wcTransitionBetweenOrdersRequisitionDetails.personid,
      ip_address: wcTransitionBetweenOrdersRequisitionDetails.ipaddress,
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
    `warehouse_id`,
    `warehouse_name`,
    `fabric_name`,
    `fabric_code`,
    `consigment_manufacturing_number`,
    `from_consigment_manufacturing_number`,
    `fabric_code`,
    `from_orders_requisitions_id`,
    `orders_requisitions_id`,
    `from_wc_fabric_order_requisition_id`,
    `wc_fabric_order_requisition_id`,
    `to_wc_fabric_order_name`,
    `from_wc_fabric_order_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `from_consigment_manufacturing.number as from_consigment_manufacturing_number`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_orders_requisitions_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.orders_requisitions_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionTableName}.name as to_wc_fabric_order_name`,
      `from_fabric_order_requisition.name as from_wc_fabric_order_name`,
    ])
      .from(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
        .innerJoin(`${wcFabricOrderRequisitionTableName} as from_fabric_order_requisition`,
          `from_fabric_order_requisition.id`,
          `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .innerJoin(`${consigmentManufacturingTableName} as from_consigment_manufacturing`,
        `from_consigment_manufacturing.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
      .where(whereCluse)
      .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`,
    ])
    .from(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
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
    .selectWithJionWithLimit(wcTransitionBetweenOrdersRequisitionDetailsTableName, 
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
    ], 
      whereCluse,
      wcTransitionBetweenOrdersRequisitionTableName, 
    `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
     `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcTransitionBetweenOrdersRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcTransitionBetweenOrdersRequisitionDetailsTableName,
      wcTransitionBetweenOrdersRequisitionDetails,
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
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`, 
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`, 
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`, 
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`, 
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
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
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
    `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
    `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
  .innerJoin(`${wcTableName}`,
    `${wcTableName}.id`,
    `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
  .innerJoin(`${fabricTableName}`, 
  `${fabricTableName}.id`, 
  `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
  .innerJoin(`${warehouseTableName}`, 
  `${warehouseTableName}.id`, 
  `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
  .innerJoin(`${consigmentManufacturingTableName}`, 
  `${consigmentManufacturingTableName}.id`, 
  `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
      .where(`${wcTransitionBetweenOrdersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcTransitionBetweenOrdersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(`${wcTransitionBetweenOrdersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wcTransitionBetweenOrdersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
      .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wcTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
        `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${wcFabricOrderRequisitionTableName}.name as order_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_transition_between_orders_requisitions_details_id`,
      `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};