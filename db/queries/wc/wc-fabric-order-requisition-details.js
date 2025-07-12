// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wcFabricOrderRequisitionTableName, 
  wcFabricOrderRequisitionDetailsTableName, 
  fabricTableName, 
  bussinessmanTableName, 
  warehouseTableName, 
  wcExecuteOrderRequisitionDetailsTableName,
  wcExecuteOrderRequisitionTableName,
  wcAddRequisitionDetailsFabricOrderTableName} = require("../../../util/database-tables-name");

exports.insert = async (wcFabricOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcFabricOrderRequisitionDetailsTableName, {
      id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: wcFabricOrderRequisitionDetails.id,
      orders_requisitions_id: wcFabricOrderRequisitionDetails.ordersRequisitionsId,
      fabric_id: items.fabricId,
      initial_quantity: items.quantity,
      current_quantity: items.quantity,
      fabric_width: items.fabricWidth,
      fabric_quantity_m2: items.fabricQuantityM2,
      note: items.note,
      creator_id: wcFabricOrderRequisitionDetails.personid,
      ip_address: wcFabricOrderRequisitionDetails.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForPurchaseOrder = async (wcFabricOrderRequisition, wcFabricOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcFabricOrderRequisitionDetailsTableName, {
      id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId,
      orders_requisitions_id: wcFabricOrderRequisitionDetails.ordersRequisitionsId,
      fabric_id: items.fabricId,
      initial_quantity: items.quantity,
      current_quantity: items.quantity,
      fabric_width: items.fabricWidth,
      fabric_quantity_m2: items.fabricQuantityM2,
      note: items.note,
      creator_id: wcFabricOrderRequisition.personid,
      ip_address: wcFabricOrderRequisition.ipaddress,
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

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    // `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${wcFabricOrderRequisitionDetailsTableName}.current_quantity
      END as current_quantity`),
        knex.raw(
                                        `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
                                        THEN coalesce( (${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1) + ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity )
                                        ELSE coalesce( ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity - ${wcFabricOrderRequisitionDetailsTableName}.current_quantity )
                                        END as net_current_quantity`),
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
            knex.raw(
            `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
            THEN coalesce( ((${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1) / ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity) * 100 )
            ELSE ${0}
            END as over_current_quantity_ratio`),
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    // `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${wcFabricOrderRequisitionDetailsTableName}.current_quantity
      END as current_quantity`),
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectForCheckOpenedOrderNotExecutedWc = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    // `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${wcFabricOrderRequisitionDetailsTableName}.current_quantity
      END as current_quantity`),
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, "<>", `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionIdForWcAddRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
    // `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN ${0}
      ELSE ${wcFabricOrderRequisitionDetailsTableName}.current_quantity
      END as current_quantity`),
    knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
      ELSE ${0}
      END as over_current_quantity`),
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
      .innerJoin(`${wcAddRequisitionDetailsFabricOrderTableName}`,
        `${wcAddRequisitionDetailsFabricOrderTableName}.wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOutputWarehouseByRequisitionDetailsId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${warehouseTableName}.name as warehouse_name`,
    `${warehouseTableName}.is_grade`,
  ])
  .sum(`${wcExecuteOrderRequisitionDetailsTableName}.quantity as quantity`)
    .from(`${wcExecuteOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionDetailsTableName}`,
      `${wcFabricOrderRequisitionDetailsTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`)
      .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .groupBy(`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`, 
    `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .then((data) => {
      console.log(data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wcFabricOrderRequisitionDetailsTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`,
      `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      // console.log("data ::: ", data);
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectOneForUpdate = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wcFabricOrderRequisitionDetailsTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`,
      `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
      // `${waAddRequisitionDetailsYarnOrderTableName}.quantity`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
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

exports.update = async (wcFabricOrderRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcFabricOrderRequisitionDetailsTableName,
      wcFabricOrderRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectByFabricBySeller = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`,
    `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByFabricByOrderRequisitions = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcFabricOrderRequisitionTableName}.id as requisition_id`,
    `${wcFabricOrderRequisitionTableName}.date`,
    `${wcFabricOrderRequisitionTableName}.number`,
    `${wcFabricOrderRequisitionTableName}.name as order_name`,
    `${wcFabricOrderRequisitionTableName}.note`,
    `${wcFabricOrderRequisitionDetailsTableName}.id`,
    `${wcFabricOrderRequisitionDetailsTableName}.note as note2`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_width`,
    `${wcFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
    `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`,
    `${wcFabricOrderRequisitionDetailsTableName}.current_quantity`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${bussinessmanTableName}.id as seller_id`,
    `${bussinessmanTableName}.name as seller_name`,
    `${bussinessmanTableName}.phone as seller_phone`,
  ])
  .sum(`${wcFabricOrderRequisitionDetailsTableName}.current_quantity as current_quantity`)
    .from(`${wcFabricOrderRequisitionDetailsTableName}`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcFabricOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
    .groupBy(
      `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`, 
      `${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};
