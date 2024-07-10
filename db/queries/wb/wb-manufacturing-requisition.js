// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { 
  wbManufacturingRequisitionTableName, bussinessmanTableName, 
  fabricTableName, wbManufacturingInputOutputTableName, 
  wbManufacturingOutputTableName, wbManufacturingOutputOrderTableName, 
  wbManufacturingOrderRequisitionTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingRequisitionTableName, {
      id: wbManufacturingRequisition.id,
      industry_id: wbManufacturingRequisition.industryId,
      number: wbManufacturingRequisition.number,
      date: wbManufacturingRequisition.date,
      note: wbManufacturingRequisition.note,
      creator_id: wbManufacturingRequisition.personid,
      ip_address: wbManufacturingRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForOrder = async (wbManufacturingRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingRequisitionTableName, {
      id: wbManufacturingRequisition.id,
      industry_id: wbManufacturingRequisition.industryId,
      number: wbManufacturingRequisition.number,
      date: wbManufacturingRequisition.date,
      note: wbManufacturingRequisition.note,
      is_order: '1',
      creator_id: wbManufacturingRequisition.personid,
      ip_address: wbManufacturingRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingRequisitionTableName}.number`,
      `${wbManufacturingRequisitionTableName}.status`,
      `${wbManufacturingRequisitionTableName}.date`,
      `${wbManufacturingRequisitionTableName}.note`,
      `${wbManufacturingRequisitionTableName}.is_order`,
      `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.is_approved`,
      knex.raw(
        `CASE 
        WHEN ${wbManufacturingOutputTableName}.is_approved = '0' THEN '${constants.wb_manufacturing_requisition_status_is_approved_0}' 
        WHEN ${wbManufacturingOutputTableName}.is_approved = '1' THEN '${constants.wb_manufacturing_requisition_status_is_approved_1}'  
        ELSE ''  
        END as is_approved_status_name`),
      `${bussinessmanTableName}.id as manufacture_id`,
      `${bussinessmanTableName}.name as manufacture_name`,
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${wbManufacturingOrderRequisitionTableName}.number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
      knex.raw(
        `CASE 
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_new}' THEN '${constants.wb_manufacturing_requisition_status_new_trans}' 
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_good_after_check}' THEN '${constants.wb_manufacturing_requisition_status_good_after_check_trans}'  
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_not_good_after_check}' THEN '${constants.wb_manufacturing_requisition_status_not_good_after_check_trans}'  
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_white}' THEN '${constants.wb_manufacturing_requisition_status_white_trans}'  
        ELSE ''  
        END as status_name`),
    ])
    .from(`${wbManufacturingRequisitionTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
    `${wbManufacturingRequisitionTableName}.id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
    `${wbManufacturingOutputTableName}.id`,
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
    `${fabricTableName}.id`,
    `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wbManufacturingRequisitionTableName}.industry_id`)
    .leftOuterJoin(`${wbManufacturingOutputOrderTableName}`,
    `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
    `${wbManufacturingOutputTableName}.id`)
    .leftOuterJoin(`${wbManufacturingOrderRequisitionTableName}`,
    `${wbManufacturingOrderRequisitionTableName}.id`,
    `${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_id`)
    .leftOuterJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${wbManufacturingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${wbManufacturingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wbManufacturingRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOrders = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingRequisitionTableName}.number`,
      `${wbManufacturingRequisitionTableName}.status`,
      `${wbManufacturingRequisitionTableName}.date`,
      `${wbManufacturingRequisitionTableName}.note`,
      `${wbManufacturingRequisitionTableName}.is_order`,
      `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.is_approved`,
      knex.raw(
        `CASE 
        WHEN ${wbManufacturingOutputTableName}.is_approved = '0' THEN '${constants.wb_manufacturing_requisition_status_is_approved_0}' 
        WHEN ${wbManufacturingOutputTableName}.is_approved = '1' THEN '${constants.wb_manufacturing_requisition_status_is_approved_1}'  
        ELSE ''  
        END as is_approved_status_name`),
      `${bussinessmanTableName}.id as manufacture_id`,
      `${bussinessmanTableName}.name as manufacture_name`,
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${wbManufacturingOrderRequisitionTableName}.number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
      knex.raw(
        `CASE 
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_new}' THEN '${constants.wb_manufacturing_requisition_status_new_trans}' 
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_good_after_check}' THEN '${constants.wb_manufacturing_requisition_status_good_after_check_trans}'  
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_not_good_after_check}' THEN '${constants.wb_manufacturing_requisition_status_not_good_after_check_trans}'  
        WHEN ${wbManufacturingRequisitionTableName}.status = '${constants.wb_manufacturing_requisition_status_white}' THEN '${constants.wb_manufacturing_requisition_status_white_trans}'  
        ELSE ''  
        END as status_name`),
    ])
    .from(`${wbManufacturingRequisitionTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
    `${wbManufacturingRequisitionTableName}.id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
    `${wbManufacturingOutputTableName}.id`,
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
    `${fabricTableName}.id`,
    `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${wbManufacturingOutputOrderTableName}`,
    `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
    `${wbManufacturingOrderRequisitionTableName}.id`,
    `${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${wbManufacturingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${wbManufacturingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wbManufacturingRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wbManufacturingRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wbManufacturingRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbManufacturingRequisitionTableName,
      wbManufacturingRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};