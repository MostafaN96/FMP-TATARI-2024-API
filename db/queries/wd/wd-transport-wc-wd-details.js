// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Queries
const wdFormDyeingRequisitionDetailsQueries = require("./wd-form-dyeing-requisition-details");

// Util
const { wdTransportWcWdTableName, wdTransportWcWdDetailsTableName,
  warehouseTableName, fabricTableName, consigmentManufacturingTableName,
  bussinessmanTableName, wdTableName, consigmentDyeingTableName, wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName, 
  wcFabricOrderRequisitionTableName,
  ordersRequisitionsTableName} = require("../../../util/database-tables-name");
  const constantsPayloads = require("../../../util/constants-payloads");

exports.insert = async (wdTransportWcWd, items, trx = null) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransportWcWdDetailsTableName, {
      id: items.wdTransportWcWdDetailsId,
      wd_transport_wc_wd_id: wdTransportWcWd.id,
      fabric_id: items.fabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.wcFabricOrderRequisitionId,
      orders_requisitions_id: items.ordersRequisitionsId,
      parent_wc_fabric_order_requisition_details_id: items.parentWcFabricOrderRequisitionDetailsId || items.wcFabricOrderRequisitionDetailsId,
      parent_wc_fabric_order_requisition_id: items.parentWcFabricOrderRequisitionId || items.wcFabricOrderRequisitionId,
      parent_orders_requisitions_id: items.parentOrdersRequisitionsId || items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wdTransportWcWd.personid,
      ip_address: wdTransportWcWd.ipaddress,
    }, trx)
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
  whereCluse[`${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`] = requisitionId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wdTransportWcWdTableName}.id as requisition_id`,
    `${wdTransportWcWdTableName}.date`,
    `${wdTransportWcWdTableName}.number`,
    `${wdTransportWcWdTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
    `${wdTransportWcWdDetailsTableName}.id`,
    `${wdTransportWcWdDetailsTableName}.document`,
    `${wdTransportWcWdDetailsTableName}.fabric_piece`,
    `${wdTransportWcWdDetailsTableName}.statement`,
    `${wdTransportWcWdDetailsTableName}.price`,
    `${wdTransportWcWdDetailsTableName}.price_dollar`,
    `${bussinessmanTableName}.name as dyer_name`,
    `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
    `${wdTableName}.current_quantity`,
  ])
    .sum(`${wdTransportWcWdDetailsTableName}.quantity as quantity`)
    .sum(`${wdTableName}.current_quantity as current_quantity`)
    .from(`${wdTransportWcWdDetailsTableName}`)
    .innerJoin(`${wdTransportWcWdTableName}`,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${wdTableName}`,
      `${wdTableName}.wd_transport_wc_wd_details_id`,
      `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTableName}.dyeing_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.parent_wc_fabric_order_requisition_id`)
    .groupBy(
      `${wdTransportWcWdDetailsTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`,
      `${wdTransportWcWdDetailsTableName}.price`,
            `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`,
      `${bussinessmanTableName}.id`,
    )
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
//   let queryResults = [];
//   let whereCluse = {};
//   whereCluse[`${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`] = requisitionId;
//   whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
//   whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

//   await knex.select([
//     `${wdTransportWcWdDetailsTableName}.id`,
//     `${wdTransportWcWdDetailsTableName}.quantity`,
//     `${wdTransportWcWdDetailsTableName}.document`,
//     `${wdTransportWcWdDetailsTableName}.statement`,
//     `${wdTransportWcWdDetailsTableName}.price`,
//     `${wdTransportWcWdTableName}.date`,
//     `${wdTransportWcWdTableName}.number`,
//     `${wdTransportWcWdTableName}.note`,
//     `${warehouseTableName}.id as warehouse_id`,
//     `${warehouseTableName}.name as warehouse_name`,
//     `${fabricTableName}.id as fabric_id`,
//     `${fabricTableName}.name as fabric_name`,
//     `${fabricTableName}.code as fabric_code`,
//     `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
//     `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
//     `${bussinessmanTableName}.name as dyer_name`,
//     `${wdTableName}.current_quantity`,
//   ])
//     .from(`${wdTransportWcWdDetailsTableName}`)
//     .innerJoin(`${wdTransportWcWdTableName}`,
//       `${wdTransportWcWdTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
//     .innerJoin(`${fabricTableName}`,
//       `${fabricTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.fabric_id`)
//     .innerJoin(`${consigmentManufacturingTableName}`,
//       `${consigmentManufacturingTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
//     .innerJoin(`${warehouseTableName}`,
//       `${warehouseTableName}.id`,
//       `${wdTransportWcWdTableName}.warehouse_id`)
//     .innerJoin(`${wdTableName}`,
//       `${wdTableName}.wd_transport_wc_wd_details_id`,
//       `${wdTransportWcWdDetailsTableName}.id`)
//     .innerJoin(`${bussinessmanTableName}`,
//       `${bussinessmanTableName}.id`,
//       `${wdTableName}.dyeing_id`)
//     .where(whereCluse)
//     .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

exports.selectByRequisitionIds = async (requisitionIds) => {
  if (!requisitionIds || requisitionIds.length === 0) return {};
  const data = await knex
    .select([
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
      `${wdTransportWcWdDetailsTableName}.document`,
      `${wdTransportWcWdDetailsTableName}.fabric_piece`,
      `${fabricTableName}.name as fabric_name`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `${bussinessmanTableName}.name as dyer_name`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
    ])
    .sum(`${wdTransportWcWdDetailsTableName}.quantity as quantity`)
    .from(`${wdTransportWcWdDetailsTableName}`)
    .innerJoin(`${wdTransportWcWdTableName}`,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${wdTableName}`,
      `${wdTableName}.wd_transport_wc_wd_details_id`,
      `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTableName}.dyeing_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.parent_wc_fabric_order_requisition_id`)
    .where(`${wdTransportWcWdDetailsTableName}.is_deleted`, 0)
    .where(`${wdTransportWcWdDetailsTableName}.is_active`, 1)
    .whereIn(`${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`, requisitionIds)
    .groupBy(`${wdTransportWcWdDetailsTableName}.id`)
    .catch(err => { console.error(err); return []; });
  const map = {};
  (data || []).forEach(row => {
    const pid = row.wd_transport_wc_wd_id;
    if (!map[pid]) map[pid] = [];
    map[pid].push(row);
  });
  return map;
};

exports.selectWdConsigmentsDyeing = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex
  .pluck(`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
    .from(`${wdTransportWcWdDetailsTableName}`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .groupBy( `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
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
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`,
      `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`,
      `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_details_id`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTransportWcWdTableName}.warehouse_id`,
    ])
    .from(`${wdTransportWcWdDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wdTransportWcWdTableName}`,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
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
  await knex(wdTransportWcWdDetailsTableName)
    .select([
      "wd_transport_wc_wd_details.id", 
      "wd_transport_wc_wd_details.price",
      "wd_transport_wc_wd_details.price_dollar",
    ])
    .innerJoin(wdTransportWcWdTableName,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(wdTableName,
      `${wdTableName}.wd_transport_wc_wd_details_id`,
      `${wdTransportWcWdDetailsTableName}.id`)
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

exports.update = async (wdTransportWcWd, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransportWcWdDetailsTableName,
      wdTransportWcWd,
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
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportWcWdDetailsTableName}.quantity`,
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    // .distinct()
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityPrepareDyeingByWdId(data) ;
      } else {
        queryResults = data
      }    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentManufacturing = async (dyeingId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    // .distinct(`${wdTransportWcWdTableName}.id`)
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityPrepareDyeingByWdId(data) ;
      } else {
        queryResults = data
      }    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentManufacturing = async (dyeingId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.price_dollar`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.price_dollar`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${ordersRequisitionsTableName}.name as order_name`,

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .innerJoin(`${ordersRequisitionsTableName}`, 
    `${ordersRequisitionsTableName}.id`, 
    `${wdTransportWcWdDetailsTableName}.orders_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, 
      `${wdTransportWcWdTableName}.id`, 
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.price_dollar`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.price_dollar`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransportWcWdTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportWcWdTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDateWd = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransportWcWdTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportWcWdTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};


exports.selectInputTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportWcWdDetailsTableName}.quantity`,
        knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .distinct()
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.fabric_piece`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransportWcWdTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};

exports.selectRequisitionsForWcFabricOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsWdTableName)
    .select(
      [
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id as requisition_id`,
        `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن نقل من الخام الى المصبغة'),
      ],
    )
    .innerJoin(`${wdTableName}`, 
      `${wdTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`, 
        `${wdTransportWcWdDetailsTableName}.id`, 
        `${wdTableName}.wd_transport_wc_wd_details_id`)
    .innerJoin(`${wdTransportWcWdTableName}`, 
      `${wdTransportWcWdTableName}.id`, 
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wdFormDyeingRequisitionDetailsWdTableName}.quantity`, ">", 0)
    .groupBy(
      `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};