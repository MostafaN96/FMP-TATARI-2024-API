// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Queries
const wdFormDyeingRequisitionDetailsQueries = require("./wd-form-dyeing-requisition-details");

// Util
const wdReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionDetailsTableName;
const wdReconciliationRequisitionTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionTableName;
const wdReconciliationRequisitionDetailsWdTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionDetailsWdTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const consigmentDyeingTableName = require("../../../util/database-tables-name").consigmentDyeingTableName;
const wdTableName = require("../../../util/database-tables-name").wdTableName;
const constants = require("../../../util/constants");
const { wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName, wcFabricOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdReconciliationRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdReconciliationRequisitionDetailsTableName, {
      id: items.wdReconciliationRequisitionDetailsId,
      wd_reconcilition_requisition_id: wdReconciliationRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.fabricOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      wc_parent_fabric_order_requisition_id: items.fabricOrderId,
      wc_parent_fabric_order_requisition_orders_requisitions_id: items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      statement: items.statement ?? '',
      input_output: items.inputOutput,
      creator_id: wdReconciliationRequisitionDetails.personid,
      ip_address: wdReconciliationRequisitionDetails.ipaddress,
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
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionDetailsTableName}.statement`,
        `${wdReconciliationRequisitionDetailsTableName}.input_output`,
        `${wdReconciliationRequisitionTableName}.id as requisition_id`,
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionTableName}.date`,
        `${wdReconciliationRequisitionTableName}.note`,
        `${wdReconciliationRequisitionTableName}.creator_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdReconciliationRequisitionTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectInputTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '1')
      ],
    )
    .distinct()
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`, `${wdReconciliationRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    // `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data);
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityPrepareDyeingByWdId(data) ;
      } else {
        queryResults = data
      }
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOutputTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionDetailsTableName}.statement`,
        `${wdReconciliationRequisitionTableName}.id as requisition_id`,
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionTableName}.date`,
        `${wdReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdReconciliationRequisitionTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectInputDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .distinct()
    .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`, `${wdReconciliationRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityPrepareDyeingByWdId(data) ;
      } else {
        queryResults = data
      }    
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOutputDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionDetailsTableName}.statement`,
        `${wdReconciliationRequisitionTableName}.id as requisition_id`,
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionTableName}.date`,
        `${wdReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdReconciliationRequisitionTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSumCurrentQuantityByDyeingByFabricWd = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentDyeingTableName)
    .select([
      `${consigmentDyeingTableName}.id`,
      `${consigmentDyeingTableName}.number`,
      `${wdReconciliationRequisitionDetailsTableName}.quantity`,
    ])
    .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
      `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`,
      `${consigmentDyeingTableName}.id`)
    .innerJoin(`${wdReconciliationRequisitionTableName}`,
      `${wdReconciliationRequisitionTableName}.id`,
      `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
      `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
      `${wdReconciliationRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`,
      `${wdTableName}.id`,
      `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
    .where(`${wdTableName}.current_quantity`, ">", "0")
    .andWhere(whereCluse)
    .groupBy(`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .sum(`${wdTableName}.current_quantity as current_quantity`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log(error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectOne = async (whereCluse) => {
  let queryResults = false;

  await knex
    .select([
      `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`,
      `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`,
      `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
      `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`,
      `${wdReconciliationRequisitionTableName}.dyeing_id`,
      `${wdReconciliationRequisitionDetailsTableName}.quantity`
    ])
    .from(`${wdReconciliationRequisitionDetailsTableName}`)
    .innerJoin(`${wdReconciliationRequisitionTableName}`,
      `${wdReconciliationRequisitionTableName}.id`,
      `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
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

exports.update = async (wdReconciliationRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdReconciliationRequisitionDetailsTableName,
      wdReconciliationRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByDateWd = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionDetailsTableName}.statement`,
        `${wdReconciliationRequisitionTableName}.id as requisition_id`,
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionTableName}.date`,
        `${wdReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdReconciliationRequisitionTableName}.dyeing_id`)
    .where(`${wdReconciliationRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdReconciliationRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectInputTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`, `${wdReconciliationRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOutputTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wdReconciliationRequisitionDetailsTableName}.id`,
        `${wdReconciliationRequisitionDetailsTableName}.price`,
        `${wdReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wdReconciliationRequisitionDetailsTableName}.quantity`,
        `${wdReconciliationRequisitionDetailsTableName}.statement`,
        `${wdReconciliationRequisitionTableName}.id as requisition_id`,
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionTableName}.date`,
        `${wdReconciliationRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wdReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdReconciliationRequisitionTableName}`, `${wdReconciliationRequisitionTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdReconciliationRequisitionTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectInputRequisitionsForWcFabricOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsWdTableName)
    .select(
      [
        `${wdReconciliationRequisitionTableName}.number`,
        `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id  as requisition_id`,
        `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
      ],
    )
    .innerJoin(`${wdTableName}`, 
      `${wdTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
      .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`, 
        `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`, 
        `${wdTableName}.id`)
    .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`, 
      `${wdReconciliationRequisitionDetailsTableName}.id`, 
      `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
    .innerJoin(`${wdReconciliationRequisitionTableName}`, 
      `${wdReconciliationRequisitionTableName}.id`, 
      `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wdFormDyeingRequisitionDetailsWdTableName}.quantity`, ">", 0)
    .groupBy(`${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
    .then(async (data) => {
        queryResults = data
    })
    .catch((error) => console.error(error));
  return queryResults;
};