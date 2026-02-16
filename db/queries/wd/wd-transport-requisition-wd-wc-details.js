// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { wdTransportRequisitionWdWcTableName, wdTransportRequisitionWdWcDetailsTableName, 
  warehouseTableName, fabricTableName, consigmentManufacturingTableName, bussinessmanTableName, wdTableName, wcTableName, consigmentDyeingTableName, 
  wcFabricOrderRequisitionTableName,
  ordersRequisitionsTableName} = require("../../../util/database-tables-name");

exports.insert = async (wdTransportRequisitionWdWc, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransportRequisitionWdWcDetailsTableName, {
      id: items.wdTransportRequisitionWdWcDetailsId,
      wd_transport_requisition_wd_wc_id: wdTransportRequisitionWdWc.id,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      consigment_dyeing_id: items.consigmentDyeingId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.fabricOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: wdTransportRequisitionWdWc.personid,
      ip_address: wdTransportRequisitionWdWc.ipaddress,
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
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`] = requisitionId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
    `${wdTransportRequisitionWdWcTableName}.date`,
    `${wdTransportRequisitionWdWcTableName}.number`,
    `${wdTransportRequisitionWdWcTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${bussinessmanTableName}.id as dyeing_id`,
    `${bussinessmanTableName}.name as dyeing_name`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
    `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
    `${wdTransportRequisitionWdWcDetailsTableName}.id`,
    `${wdTransportRequisitionWdWcDetailsTableName}.document`,
    `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
    `${wdTransportRequisitionWdWcDetailsTableName}.price`,
    `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
    `${wcTableName}.current_quantity`,
  ])
  .sum(`${wdTransportRequisitionWdWcDetailsTableName}.quantity as quantity`)
  .sum(`${wcTableName}.current_quantity as current_quantity`)
    .from(`${wdTransportRequisitionWdWcDetailsTableName}`)
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
      `${wdTransportRequisitionWdWcTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
      .groupBy(`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`, 
      `${bussinessmanTableName}.id`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.price`,
      )
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`] = requisitionId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
    `${wdTransportRequisitionWdWcTableName}.date`,
    `${wdTransportRequisitionWdWcTableName}.number`,
    `${wdTransportRequisitionWdWcTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${bussinessmanTableName}.id as dyeing_id`,
    `${bussinessmanTableName}.name as dyeing_name`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
    `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
    `${wdTransportRequisitionWdWcDetailsTableName}.id`,
    `${wdTransportRequisitionWdWcDetailsTableName}.document`,
    `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
    `${wdTransportRequisitionWdWcDetailsTableName}.price`,
    `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
    `${wcTableName}.current_quantity`,
  ])
  .sum(`${wdTransportRequisitionWdWcDetailsTableName}.quantity as quantity`)
  .sum(`${wcTableName}.current_quantity as current_quantity`)
    .from(`${wdTransportRequisitionWdWcDetailsTableName}`)
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
      `${wdTransportRequisitionWdWcTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
      .innerJoin(`${wcTableName}`,
      `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
      .groupBy(`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`, 
      `${bussinessmanTableName}.id`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.price`,
      )
    .where(whereCluse)
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
    `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_details_id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.quantity`, 
    `${wdTransportRequisitionWdWcTableName}.warehouse_id`, 
    `${wdTransportRequisitionWdWcTableName}.dyeing_id`, 
])
  .from(`${wdTransportRequisitionWdWcDetailsTableName}`)
  .limit(1)
  .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
  `${wdTransportRequisitionWdWcTableName}.id`,
  `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
  .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdTransportRequisitionWdWc, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransportRequisitionWdWcDetailsTableName,
      wdTransportRequisitionWdWc,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByFabricIdForInput = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${ordersRequisitionsTableName}.name as order_name`,
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .innerJoin(`${ordersRequisitionsTableName}`, 
    `${ordersRequisitionsTableName}.id`, 
    `${wdTransportRequisitionWdWcDetailsTableName}.orders_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${wcTableName}.id as wc_id`,
        `${wcTableName}.storage_place`,
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(`${wdTransportRequisitionWdWcTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportRequisitionWdWcTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDateWd = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(`${wdTransportRequisitionWdWcTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportRequisitionWdWcTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentManufacturingTableName)
      .select([
        `${consigmentManufacturingTableName}.id`, 
        `${consigmentManufacturingTableName}.number`, 
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`
      ])
      .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, 
      `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wdTransportRequisitionWdWcTableName}`, 
      `${wdTransportRequisitionWdWcTableName}.id`, 
      `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, 
      `${wdTransportRequisitionWdWcDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
      .sum(`${wcTableName}.current_quantity as current_quantity`)
      .then(data => {
        console.log("data ::::::: ", data);
          queryResults = data
      })
      .catch(error => {
        console.log("error ::::::: ", error);
          queryResults = constants.errorPayload
      })
  return queryResults
}


exports.selectTotalByFabricIdForOutput = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportRequisitionWdWcDetailsTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdTransportRequisitionWdWcTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcTableName}`, `${wdTransportRequisitionWdWcTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdTransportRequisitionWdWcTableName)
    .select(
      [
        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price`,
        `${wdTransportRequisitionWdWcDetailsTableName}.price_dollar`,
        `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
        `${wdTransportRequisitionWdWcDetailsTableName}.document`,
        `${wdTransportRequisitionWdWcDetailsTableName}.statement`,
        `${wdTransportRequisitionWdWcTableName}.id as requisition_id`,
        `${wdTransportRequisitionWdWcTableName}.number`,
        `${wdTransportRequisitionWdWcTableName}.date`,
        `${wdTransportRequisitionWdWcTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (D) الى (C)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`, `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${wcTableName}`, `${wcTableName}.wd_transport_requisition_wd_wc_details_id`, `${wdTransportRequisitionWdWcDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportRequisitionWdWcDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};