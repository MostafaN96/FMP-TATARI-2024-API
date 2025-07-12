// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { 
  consigmentYarnTableName, 
  waAddRequisitionDetailsYarnOrderTableName, 
  waYarnOrderRequisitionTableName, 
  waPurchaseOrderDetailsTableName, 
  waAddRequisitionDetailsPurchaseOrderTableName, 
  waPurchaseOrderTableName, 
  wbTransportWaWbDetailsWaTableName, 
  waAddRequisitionDetailsTableName,
  yarnTableName,
  yarnLotTableName,
  warehouseTableName,
  waAddRequisitionTableName,
  bussinessmanTableName,
  waTableName,
  waTransitionBetweenWHRequisitionDetailsWaTableName
} = require("../../../util/database-tables-name");

exports.insert = async (waAddRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waAddRequisitionDetailsTableName, {
      id: waAddRequisitionDetails.waRequisitionDetailsId,
      wa_add_requisition_id: waAddRequisitionDetails.id,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      warehouse_id: items.warehouseId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: waAddRequisitionDetails.personid,
      ip_address: waAddRequisitionDetails.ipaddress,
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
  whereCluse[`${waAddRequisitionDetailsTableName}.wa_add_requisition_id`] = requisitionId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionIdForOrder = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.wa_add_requisition_id`] = requisitionId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;
  whereCluse[`${waAddRequisitionTableName}.is_order`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id as requisition_id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${yarnTableName}.id as yarn_id`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${waPurchaseOrderTableName}.number as order_number`,
        `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_details_id`,
        `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`,
            knex.raw(
              `CASE WHEN ${waPurchaseOrderDetailsTableName}.current_quantity < ${0}
              THEN ${0}
              ELSE ${waPurchaseOrderDetailsTableName}.current_quantity
              END as current_quantity`),
            knex.raw(
              `CASE WHEN ${waPurchaseOrderDetailsTableName}.current_quantity < ${0}
              THEN coalesce( ${waPurchaseOrderDetailsTableName}.current_quantity * -1 )
              ELSE ${0}
              END as over_current_quantity`),
      ],
    )
    // .distinct()
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .leftOuterJoin(`${waAddRequisitionDetailsPurchaseOrderTableName}`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`)
    .leftOuterJoin(`${waPurchaseOrderDetailsTableName}`,
      `${waPurchaseOrderDetailsTableName}.id`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_details_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionTableName}.id as requisition_id`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionTableName}.id as requisition_id`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${waAddRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${waPurchaseOrderTableName}.name as order_purchase_name`,
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .leftOuterJoin(`${waAddRequisitionDetailsPurchaseOrderTableName}`, 
    `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`, 
    `${waAddRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${waPurchaseOrderTableName}`, 
    `${waPurchaseOrderTableName}.id`, 
    `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
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
  whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, 
      `${waAddRequisitionTableName}.id`, 
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
        `${waAddRequisitionTableName}.id as requisition_id`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${waAddRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
`${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${waPurchaseOrderTableName}.name as order_purchase_name`,
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, 
      `${waAddRequisitionTableName}.id`, 
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`, 
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`, 
      `${waAddRequisitionDetailsTableName}.id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .leftOuterJoin(`${waAddRequisitionDetailsPurchaseOrderTableName}`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${waPurchaseOrderTableName}`,
      `${waPurchaseOrderTableName}.id`,
      `${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_purchase_order_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .selectWithJionWithLimit(waAddRequisitionDetailsTableName, 
      [
        "wa_add_requisition_details.id", 
      "wa_add_requisition_details.price",
      "wa_add_requisition_details.price_dollar",
    ], 
      whereCluse,
    waAddRequisitionTableName, 
    `${waAddRequisitionTableName}.id`,
     `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByYarnWa = async (whereCluse) => {
  let queryResults = []

  await knex(yarnLotTableName)
      .select([
        `${yarnLotTableName}.id`, 
        `${yarnLotTableName}.code`, 
        `${waAddRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${waAddRequisitionDetailsTableName}`, 
      `${waAddRequisitionDetailsTableName}.yarn_lot_id`, 
      `${yarnLotTableName}.id`)
      .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`, 
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`, 
        `${waAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${waTableName}`, 
      `${waTableName}.wa_add_requisition_details_id`, 
      `${waAddRequisitionDetailsTableName}.id`)
      .where(`${waTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .sum(`${waTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(waAddRequisitionDetailsTableName, [
      "wa_add_requisition_id", 
      "yarn_id", 
      "quantity", 
      "is_deleted"
    ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (waAddRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waAddRequisitionDetailsTableName,
      waAddRequisitionDetails,
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

  await knex.from(waAddRequisitionDetailsTableName)
    .select(
      [
        `${waAddRequisitionDetailsTableName}.id`,
        `${waAddRequisitionDetailsTableName}.price`,
        `${waAddRequisitionDetailsTableName}.price_dollar`,
        `${waAddRequisitionDetailsTableName}.quantity`,
        `${waAddRequisitionDetailsTableName}.document`,
        `${waAddRequisitionDetailsTableName}.statement`,
        `${waAddRequisitionTableName}.id as requisition_id`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${waAddRequisitionTableName}`, `${waAddRequisitionTableName}.id`, `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${waAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${waAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(`${waAddRequisitionTableName}.date`, `>=`, bodyPalod.startDate)
    .andWhere(`${waAddRequisitionTableName}.date`, `<=`, bodyPalod.endDate)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectRequisitionsForWaYarnOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wbTransportWaWbDetailsWaTableName)
    .select(
      [
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.is_order`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id as requisition_id`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
      ],
    )
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${wbTransportWaWbDetailsWaTableName}.wa_id`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.id`,
      `${waTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wbTransportWaWbDetailsWaTableName}.quantity`, ">", 0)
    .groupBy(
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTransitionBetweenWhRequisitionsForWaYarnOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(waTransitionBetweenWHRequisitionDetailsWaTableName)
    .select(
      [
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.is_order`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id as requisition_id`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
      ],
    )
    .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_id`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.id`,
      `${waTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsWaTableName}.quantity`, ">", 0)
    .groupBy(
      `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};