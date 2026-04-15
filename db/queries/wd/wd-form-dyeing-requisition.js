// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdFormDyeingRequisitionTableName, bussinessmanTableName, fabricTableName, 
    wdDyeingOrderRequisitionTableName, wdFormOrderDetailsWdFormDetailsTableName, wdFormDyeingRequisitionDetailsTableName, wdFormDyeingOrderDetailsTableName, wdDyeingOrderRequisitionDetailsTableName, 
    wcFabricOrderRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (wdFormDyeingRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wdFormDyeingRequisitionTableName, {
      id: wdFormDyeingRequisition.id,
      dyeing_id: wdFormDyeingRequisition.dyeingId,
      number: wdFormDyeingRequisition.number,
      date: wdFormDyeingRequisition.date,
      note: wdFormDyeingRequisition.note,
      creator_id: wdFormDyeingRequisition.personid,
      ip_address: wdFormDyeingRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForOrder = async (wdFormDyeingRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wdFormDyeingRequisitionTableName, {
      id: wdFormDyeingRequisition.id,
      dyeing_id: wdFormDyeingRequisition.dyeingId,
      number: wdFormDyeingRequisition.number,
      date: wdFormDyeingRequisition.date,
      note: wdFormDyeingRequisition.note,
      is_order: '1',
      creator_id: wdFormDyeingRequisition.personid,
      ip_address: wdFormDyeingRequisition.ipaddress,
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
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdFormDyeingRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionTableName}.number`,
      `${wdFormDyeingRequisitionTableName}.work_order_number`,
      `${wdFormDyeingRequisitionTableName}.date`,
      `${wdFormDyeingRequisitionTableName}.note`,
      `${wdFormDyeingRequisitionTableName}.is_order`,
      // `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
      // `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
    ])
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.quantity as quantity`)
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity as form_current_quantity`)
    .from(`${wdFormDyeingRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
    `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`,
    `${wdFormDyeingRequisitionTableName}.id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .leftOuterJoin(`${wdFormOrderDetailsWdFormDetailsTableName}`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`,
    `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
    `${wdDyeingOrderRequisitionDetailsTableName}.id`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`,
    `${wdDyeingOrderRequisitionTableName}.id`,
    `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
    .leftOuterJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${wdDyeingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${wdFormDyeingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wdFormDyeingRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectLazy = (whereCluse) => {

  return knex
    .select([
      `${wdFormDyeingRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionTableName}.number`,
      `${wdFormDyeingRequisitionTableName}.work_order_number`,
      `${wdFormDyeingRequisitionTableName}.date`,
      `${wdFormDyeingRequisitionTableName}.note`,
      `${wdFormDyeingRequisitionTableName}.is_order`,
      // `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
      // `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
      `parent_wc_order.name as parent_wc_fabric_order_requisition_name`,
    ])
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.quantity as quantity`)
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity as form_current_quantity`)
    .from(`${wdFormDyeingRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
    `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`,
    `${wdFormDyeingRequisitionTableName}.id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .leftJoin(`${wcFabricOrderRequisitionTableName} as parent_wc_order`,
      `parent_wc_order.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
    .leftOuterJoin(`${wdFormOrderDetailsWdFormDetailsTableName}`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`,
    `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
    `${wdDyeingOrderRequisitionDetailsTableName}.id`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`,
    `${wdDyeingOrderRequisitionTableName}.id`,
    `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
    .leftOuterJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${wdDyeingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${wdFormDyeingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wdFormDyeingRequisitionTableName}.id`)
};

exports.selectOrders = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdFormDyeingRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionTableName}.number`,
      `${wdFormDyeingRequisitionTableName}.date`,
      `${wdFormDyeingRequisitionTableName}.note`,
      `${wdFormDyeingRequisitionTableName}.is_order`,
      `${bussinessmanTableName}.id as manufacture_id`,
      `${bussinessmanTableName}.name as manufacture_name`,
      `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
    ])
    .from(`${wdFormDyeingRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
    `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`,
    `${wdFormDyeingRequisitionTableName}.id`)
    .innerJoin(`${wdFormOrderDetailsWdFormDetailsTableName}`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`,
    `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
    `${wdDyeingOrderRequisitionDetailsTableName}.id`,
    `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
    .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
    `${wdDyeingOrderRequisitionTableName}.id`,
    `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${wdDyeingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${wdFormDyeingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wdFormDyeingRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wdFormDyeingRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdFormDyeingRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdFormDyeingRequisitionTableName,
      wdFormDyeingRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};