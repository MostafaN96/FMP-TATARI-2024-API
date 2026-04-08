// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Queries
const wbManufacturingOutputQueries = require("../wb/wb-manufacturing-output");

// Util
const { wbTransportWaWbTableName, wbTransportWaWbDetailsTableName, warehouseTableName, yarnTableName, yarnLotTableName, bussinessmanTableName, wbTableName, wbTransportWaWbDetailsWaTableName, waTableName, fabricTableName, consigmentYarnTableName, waYarnOrderRequisitionTableName, wbManufacturingInputWbTableName, wbManufacturingInputTableName, wbManufacturingInputOutputTableName, wbManufacturingRequisitionTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, waAddRequisitionTableName, waAddRequisitionDetailsYarnOrderTableName, waAddRequisitionDetailsTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbTransportWaWb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransportWaWbDetailsTableName, {
      id: items.wbTransportWaWbDetailsId,
      wb_transport_wa_wb_id: wbTransportWaWb.id,
      wa_yarn_order_requisition_details_id: items.waYarnOrderRequisitionDetailsId,
      wa_yarn_order_requisition_id: items.yarnOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      from_wa_yarn_order_requisition_details_id: items.fromWaYarnOrderRequisitionDetailsId,
      from_wa_yarn_order_requisition_id: wbTransportWaWb.fromYarnOrderId,
      from_orders_requisitions_id: wbTransportWaWb.fromOrdersRequisitionsId,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      from_consigment_yarn_id: items.fromConsigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      exceeded_ratio: items.exceededRatio,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wbTransportWaWb.personid,
      ip_address: wbTransportWaWb.ipaddress,
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
    `${wbTransportWaWbTableName}.id as requisition_id`,
    `${wbTransportWaWbTableName}.date`,
    `${wbTransportWaWbTableName}.number`,
    `${wbTransportWaWbTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnTableName}.weight`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${wbTransportWaWbDetailsTableName}.id`,
    `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_details_id`,
    `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
    `${wbTransportWaWbDetailsTableName}.document`,
    `${wbTransportWaWbDetailsTableName}.statement`,
    `${wbTransportWaWbDetailsTableName}.price`,
    `${wbTransportWaWbDetailsTableName}.price_dollar`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `from_consigment_yarn.number as from_consigment_yarn_number`,
    `${bussinessmanTableName}.name as manufacturer_name`,
    `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
    `from_wa_yarn_order_requisition.name as from_wa_yarn_order_requisition_name`,
    `${wbTableName}.current_quantity`,
  ])
    .sum(`${wbTransportWaWbDetailsTableName}.quantity as quantity`)
    .sum(`${wbTableName}.current_quantity as current_quantity`)
    .from(`${wbTransportWaWbDetailsTableName}`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName} as from_wa_yarn_order_requisition`,
      `from_wa_yarn_order_requisition.id`,
      `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
    .groupBy(`${wbTransportWaWbDetailsTableName}.yarn_id`,
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`,
      `${bussinessmanTableName}.id`,
    )
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wbTransportWaWbTableName}.id as requisition_id`,
    `${wbTransportWaWbTableName}.date`,
    `${wbTransportWaWbTableName}.number`,
    `${wbTransportWaWbTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnTableName}.weight`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
    `${wbTransportWaWbDetailsTableName}.document`,
    `${wbTransportWaWbDetailsTableName}.statement`,
    `${wbTransportWaWbDetailsTableName}.price`,
    `${wbTransportWaWbDetailsTableName}.price_dollar`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `from_consigment_yarn.number as from_consigment_yarn_number`,
    `${bussinessmanTableName}.name as manufacturer_name`,
    `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
    `from_wa_yarn_order_requisition.name as from_wa_yarn_order_requisition_name`,
    `${wbTableName}.current_quantity`,
  ])
    .sum(`${wbTransportWaWbDetailsTableName}.quantity as quantity`)
    .sum(`${wbTableName}.current_quantity as current_quantity`)
    .from(`${wbTransportWaWbDetailsTableName}`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .innerJoin(`${waYarnOrderRequisitionTableName} as from_wa_yarn_order_requisition`,
        `from_wa_yarn_order_requisition.id`,
        `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`)
      .innerJoin(`${waYarnOrderRequisitionTableName}`,
        `${waYarnOrderRequisitionTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
    .groupBy(`${wbTransportWaWbDetailsTableName}.yarn_id`,
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`,
      `${bussinessmanTableName}.id`,
    )
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWithFabricManufacturedByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wbTransportWaWbDetailsTableName}.id`,
    `${wbTransportWaWbDetailsTableName}.orders_requisitions_id`,
    `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
    `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_details_id`,
    `${wbTransportWaWbDetailsTableName}.from_orders_requisitions_id`,
    `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`,
    `${wbTransportWaWbDetailsTableName}.quantity`,
    `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
    `${wbTransportWaWbDetailsTableName}.document`,
    `${wbTransportWaWbDetailsTableName}.statement`,
    `${wbTransportWaWbDetailsTableName}.price`,
    `${wbTransportWaWbDetailsTableName}.price_dollar`,
    `${wbTransportWaWbTableName}.id as requisition_id`,
    `${wbTransportWaWbTableName}.date`,
    `${wbTransportWaWbTableName}.number`,
    `${wbTransportWaWbTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnTableName}.weight`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${bussinessmanTableName}.id as manufacturer_id`,
    `${bussinessmanTableName}.name as manufacturer_name`,
    `${wbTableName}.id as wb_id`,
    `${wbTableName}.fabric_to_be_manufactured_id`,
    `${wbTableName}.current_quantity`,
    `${wbTableName}.type as requisition_type`,
    `${fabricTableName}.name as fabric_to_be_manufactured_name`,
    `${fabricTableName}.code as fabric_to_be_manufactured_code`,
    `${consigmentYarnTableName}.id as consigment_yarn_id`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `from_consigment_yarn.id as from_consigment_yarn_id`,
    `from_consigment_yarn.number as from_consigment_yarn_number`,
    `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
    `from_wa_yarn_order_requisition.name as from_wa_yarn_order_requisition_name`,
  ])
    .from(`${wbTransportWaWbDetailsTableName}`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbTableName}.fabric_to_be_manufactured_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .innerJoin(`${waYarnOrderRequisitionTableName} as from_wa_yarn_order_requisition`,
        `from_wa_yarn_order_requisition.id`,
        `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`)
      .innerJoin(`${waYarnOrderRequisitionTableName}`,
        `${waYarnOrderRequisitionTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneWithFabricManufacturedByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wbTransportWaWbDetailsTableName}.id`,
    `${wbTransportWaWbDetailsTableName}.quantity`,
    `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
    `${wbTransportWaWbDetailsTableName}.document`,
    `${wbTransportWaWbDetailsTableName}.statement`,
    `${wbTransportWaWbDetailsTableName}.price`,
    `${wbTransportWaWbDetailsTableName}.price_dollar`,
    `${wbTransportWaWbTableName}.id as requisition_id`,
    `${wbTransportWaWbTableName}.date`,
    `${wbTransportWaWbTableName}.number`,
    `${wbTransportWaWbTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnTableName}.weight`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${bussinessmanTableName}.id as manufacturer_id`,
    `${bussinessmanTableName}.name as manufacturer_name`,
    `${wbTableName}.id as wb_id`,
    `${wbTableName}.current_quantity`,
    `${wbTableName}.type as requisition_type`,
    `${fabricTableName}.name as fabric_to_be_manufactured_name`,
    `${fabricTableName}.code as fabric_to_be_manufactured_code`,
    `${consigmentYarnTableName}.id as consigment_yarn_id`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `from_consigment_yarn.id as from_consigment_yarn_id`,
    `from_consigment_yarn.number as from_consigment_yarn_number`,
  ])
    .from(`${wbTransportWaWbDetailsTableName}`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbTableName}.fabric_to_be_manufactured_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWbConsigmentsYarn = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex
  .pluck(`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .from(`${wbTransportWaWbDetailsTableName}`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`, consigmentsYarn)
    .groupBy( `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
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
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_details_id`,
      `${wbTransportWaWbDetailsTableName}.orders_requisitions_id`,
      `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_details_id`,
      `${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`,
      `${wbTransportWaWbDetailsTableName}.from_orders_requisitions_id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
      `${wbTransportWaWbTableName}.warehouse_id`,
    ])
    .from(`${wbTransportWaWbDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
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
  await knex(wbTransportWaWbDetailsTableName)
    .select([
      "wb_transport_wa_wb_details.id", 
    "wb_transport_wa_wb_details.price",
    "wb_transport_wa_wb_details.price_dollar",
  ])
    .innerJoin(wbTransportWaWbTableName,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(wbTableName,
      `${wbTableName}.wb_transport_wa_wb_details_id`,
      `${wbTransportWaWbDetailsTableName}.id`)
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

exports.update = async (wbTransportWaWb, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransportWaWbDetailsTableName,
      wbTransportWaWb,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.id as consigment_yarn_id`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `from_consigment_yarn.id as from_consigment_yarn_id`,
        `from_consigment_yarn.number as from_consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .groupBy(
      `${wbTransportWaWbTableName}.id`,
      `${wbTableName}.industry_id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`,
    `from_consigment_yarn.id`)
    .sum(`${wbTransportWaWbDetailsTableName}.quantity as quantity`)
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
        .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `to_consigment_yarn.number as to_consigment_yarn_number`,
        `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as to_consigment_yarn`,
      `to_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnId = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `from_consigment_yarn.number as from_consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectbyConsigmentYarnForDyedFabricOrder = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `from_consigment_yarn.number as from_consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${wbTransportWaWbTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${wbTableName}`,
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .where(whereCluse)
    .whereIn(`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`, consigmentsYarn)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByYarnByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_details_id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `to_consigment_yarn.number as to_consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as to_consigment_yarn`,
      `to_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      queryResults = data;

      for (const element of queryResults) {
            let wbManufacturingWhereCluse = {};
            wbManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_deleted`] = 0;
            wbManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_active`] = 1;
            wbManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_details_id`] = element.wa_yarn_order_requisition_details_id;
            wbManufacturingWhereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
            element.manufacturingDocuments = await wbManufacturingOutputQueries.selectRequisitionsForWaYarnOrderRequisition(wbManufacturingWhereCluse)

      }
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
  whereCluse[`${wbTransportWaWbTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
      `${wbTransportWaWbTableName}.id`, 
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
          whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
          whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `to_consigment_yarn.number as to_consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as to_consigment_yarn`,
      `to_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnId = async (yarnId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `from_consigment_yarn.number as from_consigment_yarn_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .where(`${wbTransportWaWbTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wbTransportWaWbTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByDateWb = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbTransportWaWbDetailsTableName)
    .select(
      [
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.price`,
        `${wbTransportWaWbDetailsTableName}.price_dollar`,
        `${wbTransportWaWbDetailsTableName}.quantity`,
        `${wbTransportWaWbDetailsTableName}.exceeded_ratio`,
        `${wbTransportWaWbDetailsTableName}.document`,
        `${wbTransportWaWbDetailsTableName}.statement`,
        `${wbTransportWaWbTableName}.id as requisition_id`,
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbTableName}.date`,
        `${wbTransportWaWbTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `from_consigment_yarn.number as from_consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wbTransportWaWbTableName}`, 
    `${wbTransportWaWbTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .innerJoin(`${wbTableName}`, 
    `${wbTableName}.wb_transport_wa_wb_details_id`, 
    `${wbTransportWaWbDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbTransportWaWbTableName}.warehouse_id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`, 
    `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
    .where(`${wbTransportWaWbTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wbTransportWaWbTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectRequisitionsForWbYarnOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wbManufacturingInputWbTableName)
    .select(
      [
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id as requisition_id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
      ],
    )
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.id`,
      `${wbManufacturingInputWbTableName}.wb_id`)
    .innerJoin(`${wbTransportWaWbDetailsTableName}`,
      `${wbTransportWaWbDetailsTableName}.id`,
      `${wbTableName}.wb_transport_wa_wb_details_id`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wbManufacturingInputWbTableName}.quantity`, ">", 0)
    .groupBy(
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTransitionBetweenIndustriesRequisitionsForWaYarnOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsWbTableName)
    .select(
      [
        `${wbTransportWaWbTableName}.number`,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id as requisition_id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (A) الى (B)'),
      ],
    )
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_id`)
    .innerJoin(`${wbTransportWaWbDetailsTableName}`,
      `${wbTransportWaWbDetailsTableName}.id`,
      `${wbTableName}.wb_transport_wa_wb_details_id`)
    .innerJoin(`${wbTransportWaWbTableName}`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
    .where(whereCluse)
    .andWhere(`${wbTransportWaWbDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.quantity`, ">", 0)
    .groupBy(
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`,
      `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};