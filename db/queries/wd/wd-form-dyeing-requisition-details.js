// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  wdFormDyeingRequisitionDetailsTableName,
  wdFormDyeingRequisitionTableName,
  fabricTableName,
  consigmentDyeingTableName,
  bussinessmanTableName,
  colorCategoryTableName, 
  anointedColorsPricesTableName, 
  colorTableName, 
  wdDyeingOrderDetailsWdFormDyeingDetailsTableName, 
  wdDyeingOrderRequisitionDetailsTableName, 
  wdDyeingOrderRequisitionTableName, 
  wdTableName, 
  wdFormDyeingRequisitionDetailsWdTableName, 
  wdFormDyeingRequisitionDetailsDyeingServicesTableName, 
  wcFabricOrderRequisitionTableName
} = require("../../../util/database-tables-name");

// Services
const wdService = require("../../../services/wd/wd");
const wdFormDyeingRequisitionDetailsDyeingServices = require("../../../services/wd/wd-form-dyeing-requisition-details-dyeing-services");

exports.insert = async (wdFormDyeingRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdFormDyeingRequisitionDetailsTableName, {
      id: items.wdFormDyeingRequisitionDetailsId,
      wd_form_dyeing_requisition_id: wdFormDyeingRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      dyed_fabric_id: items.dyedFabricId,
      dyeing_colors_prices_id: items.dyeingColorsPricesId,
      wc_fabric_order_requisition_details_id: items.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: items.wcFabricOrderRequisitionId,
      orders_requisitions_id: items.ordersRequisitionsId,
      parent_wc_fabric_order_requisition_id: items.parentWcFabricOrderRequisitionId || items.wcFabricOrderRequisitionId,
      parent_orders_requisitions_id: items.parentOrdersRequisitionsId || items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      current_quantity: items.quantity,
      fabric_width: items.fabricWidth,
      fabric_quantity_m2: items.fabricQuantityM2,
      work_order_number: items.workOrderNumberDetails,
      document: items.document,
      statement: items.statement,
      creator_id: wdFormDyeingRequisitionDetails.personid,
      ip_address: wdFormDyeingRequisitionDetails.ipaddress,
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
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`] = requisitionId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.id as wd_form_dyeing_requisition_details_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number as work_order_number_details`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.work_order_number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`, 
      `${wcFabricOrderRequisitionTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
          element.dyeing_id, 
          element.fabric_id, 
          element.consigment_dyeing_id,
          element.wc_fabric_order_requisition_id
        )
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      }

      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionIds = async (requisitionIds) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.id as wd_form_dyeing_requisition_details_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number as work_order_number_details`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.work_order_number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`, 
      `${wcFabricOrderRequisitionTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .whereIn('wd_form_dyeing_requisition_id', requisitionIds)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
          element.dyeing_id, 
          element.fabric_id, 
          element.consigment_dyeing_id,
          element.wc_fabric_order_requisition_id
        )
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      }

      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectBy = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.id as wd_form_dyeing_requisition_details_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number as work_order_number_details`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.work_order_number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`, 
      `${wcFabricOrderRequisitionTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    // .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
          element.dyeing_id, 
          element.fabric_id, 
          element.consigment_dyeing_id,
          element.wc_fabric_order_requisition_id
        )
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      }

      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByDyeing = async (dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number as work_order_number_details`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.work_order_number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
        `${wdDyeingOrderRequisitionDetailsTableName}.id as wd_form_dyeing_order_requisition_details_id`,
        `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
        `${wdDyeingOrderRequisitionDetailsTableName}.quantity as order_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
        `seller.name as seller_name`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.price as color_price`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`, 
      `${wcFabricOrderRequisitionTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .leftOuterJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`, `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`, `${wdDyeingOrderRequisitionDetailsTableName}.id`, `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
    .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`, `${wdDyeingOrderRequisitionTableName}.id`, `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
    .leftOuterJoin(`${bussinessmanTableName} as seller`, `seller.id`, `${wdDyeingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", 0)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
          element.dyeing_id, 
          element.fabric_id, 
          element.consigment_dyeing_id, 
          element.wc_fabric_order_requisition_id
        )
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      }

      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOrderByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`] = requisitionId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.id as wd_form_dyeing_requisition_details_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.work_order_number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${wdDyeingOrderRequisitionTableName}.number as order_number`,
        `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
        `seller.id as seller_id`,
        `seller.name as seller_name`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`, `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdDyeingOrderRequisitionDetailsTableName}`, `${wdDyeingOrderRequisitionDetailsTableName}.id`, `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
    .innerJoin(`${wdDyeingOrderRequisitionTableName}`, `${wdDyeingOrderRequisitionTableName}.id`, `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName} as seller`, `seller.id`, `${wdDyeingOrderRequisitionTableName}.seller_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdFormDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    // .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(element.dyeing_id, element.fabric_id, element.consigment_dyeing_id)
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      }

      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.quantity`,
      `${wdFormDyeingRequisitionDetailsTableName}.current_quantity`,
      `${wdFormDyeingRequisitionTableName}.is_order`,
      `${wdFormDyeingRequisitionTableName}.dyeing_id`,
    ])
    .from(`${wdFormDyeingRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wdFormDyeingRequisitionTableName}`,
      `${wdFormDyeingRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdFormDyeingRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdFormDyeingRequisitionDetailsTableName,
      wdFormDyeingRequisitionDetails,
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
  whereCluse[`${wdFormDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as quantity', '0'),
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_current_quantity`,
        knex.raw('? as form_prepare_dyeing_current_quantity', '0'),
        // knex.raw('? as form_current_quantity', '0'),
        `${wdFormDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2')
      ],
    )
    // .distinct()
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        knex.raw(
          `CASE 
          WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' 
          ELSE '-'  
          END as is_prepare_dyeing_name`),
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as warehouse_name', `${bussinessmanTableName}.name`),
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
      ],
    )
    .distinct()
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as warehouse_name', `${bussinessmanTableName}.name`),
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdFormDyeingRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wdFormDyeingRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};


exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${colorTableName}.name as color_name`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as dyeing_quantity', '0'),
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_current_quantity`,
        knex.raw('? as form_prepare_dyeing_current_quantity', '0'),
        // knex.raw('? as form_current_quantity', '0'),
        `${wdFormDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2')
      ],
    )
    .distinct(`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
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
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        knex.raw(
          `CASE 
          WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' 
          ELSE '-'  
          END as is_prepare_dyeing_name`),
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as warehouse_name', `${bussinessmanTableName}.name`),
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
      ],
    )
    .distinct()
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as quantity', '0'),
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdFormDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2')
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricIdByDyeingIdPreparedDyeing = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`] = 1;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as quantity', '0'),
        knex.raw('? as form_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_prepare_dyeing_current_quantity`,
        `${wdFormDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2')
      ],
    )
    // .distinct()
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeingPreparedDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`] = 1;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as dyeing_quantity', '0'),
        knex.raw('? as form_quantity', '0'),
        knex.raw('? as form_current_quantity', '0'),
        `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_prepare_dyeing_current_quantity`,
        `${wdFormDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2')
      ],
    )
    .distinct(`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFormQuantityByWdId = async (data) => {
  let queryResults = [];

  for (let i = 0; i < data.length; i++) {
    const element = data[i];

    let wdFormWhereCluse = {}
    wdFormWhereCluse[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`] = element.wd_id
    await knex(wdFormDyeingRequisitionDetailsWdTableName)
    .sum(`${wdFormDyeingRequisitionDetailsTableName}.quantity as form_current_quantity`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(wdFormWhereCluse)
    .groupBy(`${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .then((wdFormDyeingData) => {
      if(wdFormDyeingData[0] != null ) {
        data[i].form_current_quantity = wdFormDyeingData[0].form_current_quantity
      }else {
        data[i].form_current_quantity = 0
      }
    })
        .catch((error) => console.error(error));
  }
  queryResults = data;

  return queryResults;
};

exports.selectFormQuantityPrepareDyeingByWdId = async (data) => {
  let queryResults = [];

  for (let i = 0; i < data.length; i++) {
    const element = data[i];

    let wdFormWhereCluse = {}
    wdFormWhereCluse[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`] = element.wd_id
    wdFormWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`] = '1'
    await knex(wdFormDyeingRequisitionDetailsWdTableName)
    .sum(`${wdFormDyeingRequisitionDetailsTableName}.quantity as form_current_quantity`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
    `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(wdFormWhereCluse)
    .groupBy(`${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .then((wdFormDyeingData) => {
      if(wdFormDyeingData[0] != null ) {
        data[i].form_prepare_dyeing_current_quantity = wdFormDyeingData[0].form_current_quantity
      }else {
        data[i].form_prepare_dyeing_current_quantity = 0
      }
    })
        .catch((error) => console.error(error));
  }
  queryResults = data;

  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.price`,
        `${wdFormDyeingRequisitionDetailsTableName}.price_dollar`,
        `${wdFormDyeingRequisitionDetailsTableName}.document`,
        `${wdFormDyeingRequisitionDetailsTableName}.statement`,
        `${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing`,
        knex.raw(
          `CASE 
          WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' 
          ELSE '-'  
          END as is_prepare_dyeing_name`),
        `${wdFormDyeingRequisitionTableName}.id as requisition_id`,
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.date`,
        `${wdFormDyeingRequisitionTableName}.note`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`,
        knex.raw('? as quantity', '0'),
        knex.raw('? as warehouse_name', `${bussinessmanTableName}.name`),
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
        knex.raw('? as input_output', '2'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
      ],
    )
    .distinct()
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, `${wdFormDyeingRequisitionTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`, `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};

exports.selectRequisitionsForWdFabricOrderRequisitionForWbOutputManufacturingRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdFormDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdFormDyeingRequisitionTableName}.number`,
        `${wdFormDyeingRequisitionTableName}.is_order`,
        `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id as requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن تشكيل'),
      ],
    )
    .innerJoin(`${wdFormDyeingRequisitionTableName}`, 
      `${wdFormDyeingRequisitionTableName}.id`, 
      `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wdFormDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .groupBy(
      `${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};