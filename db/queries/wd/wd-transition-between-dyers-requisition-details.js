// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Queries
const wdFormDyeingRequisitionDetailsQueries = require("./wd-form-dyeing-requisition-details");

// Util
const { wdTransitionBetweenDyersRequisitionDetailsTableName, 
  wdTransitionBetweenDyersRequisitionTableName, bussinessmanTableName, 
  fabricTableName, consigmentDyeingTableName, wdTableName, wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName, 
  wcFabricOrderRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (wdTransitionBetweenDyersRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransitionBetweenDyersRequisitionDetailsTableName, {
      id: items.wdTransitionBetweenDyersRequisitionDetailsId,
      wd_transition_between_dyers_requisition_id: wdTransitionBetweenDyersRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.fabricOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      parent_wc_fabric_order_requisition_id: items.parentFabricOrderId || items.fabricOrderId,
      parent_orders_requisitions_id: items.parentOrdersRequisitionsId || items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wdTransitionBetweenDyersRequisitionDetails.personid,
      ip_address: wdTransitionBetweenDyersRequisitionDetails.ipaddress,
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
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`] = requisitionId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
    `${wdTransitionBetweenDyersRequisitionTableName}.date`,
    `${wdTransitionBetweenDyersRequisitionTableName}.number`,
    `${wdTransitionBetweenDyersRequisitionTableName}.note`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
    `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
    `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.document`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
    `${bussinessmanTableName}.id as from_dyeing_id`,
    `${bussinessmanTableName}.name as from_dyeing_name`,
    `to_dyeing.name as to_dyeing_name`,
    `to_dyeing.id as to_dyeing_id`,
    `${wdTableName}.current_quantity`,
  ])
    // .distinct()
    .from(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`)
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`,
      `${wdTransitionBetweenDyersRequisitionTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdTableName}`,
      `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`,
      `to_dyeing.id`,
      `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
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
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`, 
    `${wdTableName}.dyeing_id as to_dyeing_id`, 
])
  .from(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`)
  .limit(1)
  .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`,
  `${wdTransitionBetweenDyersRequisitionTableName}.id`,
  `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
  .innerJoin(`${wdTableName}`,
  `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
  `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
  .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdTransitionBetweenDyersRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransitionBetweenDyersRequisitionDetailsTableName,
      wdTransitionBetweenDyersRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectFromDyeingTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1')
      ],
    )
    // .distinct()
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, 
    // `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    // `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
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

exports.selectFromDyeingTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromDyeingDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        // `${wdTableName}.id as wd_id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    // .innerJoin(`${wdTableName}`, 
    // `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    // `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, 
    // `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    // `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      // if(data[0] != null) {
      //   queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
      // } else {
      //   queryResults = data
      // }    
      queryResults = data
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
                // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
.innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, 
    // `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    // `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    // `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
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

exports.selectFromDyeingDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectFromDyeingPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromDyeingPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromDyeingTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransitionBetweenDyersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransitionBetweenDyersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransitionBetweenDyersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransitionBetweenDyersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromDyeingTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToDyeingTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, 
    `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, 
    `${wdTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    `${wdFormDyeingRequisitionDetailsTableName}.id`, 
    `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdTransitionBetweenDyersRequisitionDetailsTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement`,
        `${wdTransitionBetweenDyersRequisitionTableName}.id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionTableName}.date`,
        `${wdTransitionBetweenDyersRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
    `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .innerJoin(`${wdTableName}`, 
    `${wdTableName}.wd_transition_between_dyers_requisition_details_id`, 
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`, `to_dyeing.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToRequisitionsForWcFabricOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsWdTableName)
    .select(
      [
        `${wdTransitionBetweenDyersRequisitionTableName}.number`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id as requisition_id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصابغ'),
      ],
    )
    .innerJoin(`${wdTableName}`, 
      `${wdTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
      .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`, 
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`, 
        `${wdTableName}.wd_transition_between_dyers_requisition_details_id`)
    .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`, 
      `${wdTransitionBetweenDyersRequisitionTableName}.id`, 
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`, ">", 0)
    .andWhere(`${wdFormDyeingRequisitionDetailsWdTableName}.quantity`, ">", 0)
    .groupBy(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};