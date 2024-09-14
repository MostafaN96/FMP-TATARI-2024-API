// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingRequisitionTableName, wdDyeingRequisitionDetailsTableName, colorCategoryTableName, 
    anointedColorsPricesTableName, colorTableName, bussinessmanTableName, consigmentDyeingTableName, 
    fabricTableName, 
    wdFormDyeingRequisitionDetailsTableName,
    warehouseTableName,
    wdTableName,
    consigmentManufacturingTableName,
    wdFormDyeingRequisitionDetailsDyeingServicesTableName,
    wdDyeingOrderDetailsWdFormDyeingDetailsTableName,
    wdDyeingOrderRequisitionDetailsTableName,
    anointedServicesPricesTableName,
    gradeItemTableName} = require("../../../util/database-tables-name");

// Services
const wdService = require("../../../services/wd/wd");
const wdFormDyeingRequisitionDetailsDyeingServices = require("../../../services/wd/wd-form-dyeing-requisition-details-dyeing-services");

exports.insert = async (wdFormDyeingRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdDyeingRequisitionDetailsTableName, {
      id: items.wdDyeingRequisitionDetailsId,
      wd_dyeing_requisition_id: wdFormDyeingRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      wd_form_dyeing_requisition_details_id: items.wdFormRequisitionDetailsId,
      grade_item_id: items.gradeItemId,
      quantity: items.quantity,
      dyeing_quantity: items.dyeingQuantity,
      price: items.price,
      cost_price: items.costPrice,
      added_cost: items.addedCost,
      fabric_piece: items.numberFabricPieces,
      dyeing_fee: items.dyeingFee,
      fabric_width: items.fabricWidth,
      fabric_quantity_m2: items.fabricQuantityM2,
      // work_order_number: items.workOrderNumber,
      work_order_number: wdFormDyeingRequisitionDetails.number,
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

exports.insertForOrder = async (wdFormDyeingRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdDyeingRequisitionDetailsTableName, {
      id: items.wdDyeingRequisitionDetailsId,
      wd_dyeing_requisition_id: wdFormDyeingRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      wd_form_dyeing_requisition_details_id: items.wdFormRequisitionDetailsId,
      grade_item_id: items.gradeItemId,
      quantity: items.quantity,
      dyeing_quantity: items.dyeingQuantity,
      price: items.price,
      cost_price: items.costPrice,
      added_cost: items.addedCost,
      fabric_piece: items.numberFabricPieces,
      dyeing_fee: items.dyeingFee,
      fabric_width: items.fabricWidth,
      fabric_quantity_m2: items.fabricQuantityM2,
      work_order_number: items.workOrderNumber,
      statement: items.statement,
      is_order: '1',
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
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`] = requisitionId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.id as wd_dyeing_requisition_details_id`,
        `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_fee`,
        `${wdDyeingRequisitionDetailsTableName}.added_cost`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_width`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionDetailsTableName}.is_order`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${wdDyeingRequisitionTableName}.release_process`,
        `${wdDyeingRequisitionTableName}.is_calc_dyeing_net`,
        `${bussinessmanTableName}.id as dyeing_id`,
        `${bussinessmanTableName}.name as dyeing_name`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
        `dyed_fabric.id as dyed_fabric_id`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "color_name_price"`),
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, `dyed_fabric.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${gradeItemTableName}`, 
      `${gradeItemTableName}.id`, 
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .leftOuterJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`, 
    `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`, 
    `${wdFormDyeingRequisitionDetailsTableName}.id`)
    .where(function() {
      this.where(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
      this.orWhere(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
    })
    .andWhere(whereCluse)
    .then(async (data) => {

      // Get current quantity
      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(element.dyeing_id, element.fabric_id, element.consigment_dyeing_id)
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.wd_form_dyeing_requisition_details_id;
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
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
      `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
      `${wdDyeingRequisitionDetailsTableName}.quantity`,
      `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
      `${wdDyeingRequisitionTableName}.dyeing_id`,
      `${wdDyeingRequisitionTableName}.warehouse_id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
    ])
    .from(`${wdDyeingRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
      .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


exports.selectOneWithDyeingServices = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
      `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
      `${wdDyeingRequisitionDetailsTableName}.quantity`,
      `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
      `${wdDyeingRequisitionDetailsTableName}.price`,
      `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
      `${wdDyeingRequisitionDetailsTableName}.dyeing_fee`,
      `${wdDyeingRequisitionDetailsTableName}.added_cost`,
      `${wdDyeingRequisitionTableName}.dyeing_id`,
      `${wdDyeingRequisitionTableName}.warehouse_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`,
      `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
    ])
    .from(`${wdDyeingRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
      `${wdFormDyeingRequisitionDetailsTableName}.id`, 
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
      .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .then(async (data) => {
      console.log("data ::::::::::::: ", data);
      // Get current quantity
        const element = data[0];
        const wdResult = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(element.dyeing_id, element.fabric_id, element.consigment_dyeing_id)
        element.wd_current_quantity = wdResult[0].current_quantity

        let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = element.wd_form_dyeing_requisition_details_id;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
        wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
        const dyeingServicesResult = await wdFormDyeingRequisitionDetailsDyeingServices.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
        element.dyeingServices = dyeingServicesResult
      
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdDyeingRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdDyeingRequisitionDetailsTableName,
      wdDyeingRequisitionDetails,
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
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${wdDyeingRequisitionTableName}.release_process`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `dyed_fabric.dyeing_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`,
      `dyed_fabric.id`,
      `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, 
      `${wdDyeingRequisitionTableName}.id`, 
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, 
      `${wdFormDyeingRequisitionDetailsTableName}.id`, 
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
      .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `dyed_fabric.dyeing_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, 
    `dyed_fabric.id`, 
    `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${anointedColorsPricesTableName}`,
      `${anointedColorsPricesTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalByFabricIdForWe = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdForWe = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${wdDyeingRequisitionTableName}.release_process as document`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${anointedColorsPricesTableName}`,
      `${anointedColorsPricesTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByWarehouseForWe = async (dyeingId, warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdDyeingRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByWarehouseForWe = async (dyeingId, warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdDyeingRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByFabricByWarehouseForWe = async (warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${wdDyeingRequisitionTableName}.release_process as document`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${anointedColorsPricesTableName}`,
      `${anointedColorsPricesTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;

  await knex(wdDyeingRequisitionDetailsTableName)
  .select([`${wdDyeingRequisitionDetailsTableName}.id`,
  `${wdDyeingRequisitionDetailsTableName}.cost_price as price`])
    .innerJoin(wdDyeingRequisitionTableName,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
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

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `dyed_fabric.dyeing_code`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`,
      `dyed_fabric.id`,
      `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(`${wdDyeingRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wdDyeingRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByDateForWe = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${anointedColorsPricesTableName}`,
      `${anointedColorsPricesTableName}.id`,
      `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
            .where(`${wdDyeingRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
            .andWhere(`${wdDyeingRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
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
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.price`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        knex.raw('? as form_current_quantity', '0'),
        `${wdDyeingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0'),
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`,
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
      `${wdFormDyeingRequisitionDetailsTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(wdDyeingRequisitionDetailsTableName)
    .select(
      [
        `${wdDyeingRequisitionDetailsTableName}.id`,
        `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
        `${wdDyeingRequisitionDetailsTableName}.quantity`,
        `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`,
        `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
        `${wdDyeingRequisitionDetailsTableName}.statement`,
        `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        `${wdDyeingRequisitionTableName}.id as requisition_id`,
        `${wdDyeingRequisitionTableName}.number`,
        `${wdDyeingRequisitionTableName}.date`,
        `${wdDyeingRequisitionTableName}.note`,
        `${wdDyeingRequisitionTableName}.release_process`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `dyed_fabric.name as dyed_fabric_name`,
        `dyed_fabric.code as dyed_fabric_code`,
        `dyed_fabric.dyeing_code`,
        `${consigmentDyeingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن صباغة'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${anointedColorsPricesTableName}.code as color_code`,
        `${anointedColorsPricesTableName}.color_category_id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${wdDyeingRequisitionTableName}`, `${wdDyeingRequisitionTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdDyeingRequisitionTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${anointedColorsPricesTableName}`, `${anointedColorsPricesTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${fabricTableName} as dyed_fabric`,
      `dyed_fabric.id`,
      `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};