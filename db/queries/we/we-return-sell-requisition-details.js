// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weReturnSellRequisitionDetailsTableName, weReturnSellRequisitionTableName, fabricTableName,
  bussinessmanTableName, warehouseTableName, weTableName,
  weReturnSellRequisitionDetailsReturnDetailsTableName,
  weAddRequisitionDetailsTableName, colorCategoryTableName, colorTableName, weSellRequisitionDetailsTableName, weSellRequisitionDetailsWeTableName, wdDyeingRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsTableName, anointedColorsPricesTableName, weReconciliationRequisitionDetailsWeTableName, weReconciliationRequisitionDetailsTableName, weReconciliationRequisitionTableName, wdDyeingRequisitionTableName, consigmentDyeingTableName
} = require("../../../util/database-tables-name");

exports.insert = async (weReturnSellRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weReturnSellRequisitionDetailsTableName, {
      id: items.weReturnSellRequisitionDetailsId,
      we_return_sell_requisition_id: weReturnSellRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      warehouse_id: items.warehouseId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      statement: items.statement,
      is_defect: items.isDefect,
      creator_id: weReturnSellRequisitionDetails.personid,
      ip_address: weReturnSellRequisitionDetails.ipaddress,
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
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`] = requisitionId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `statement`,
    `is_defect`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `seller_id`,
    `seller_name`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `work_order_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weReturnSellRequisitionDetailsTableName}.id`,
      `${weReturnSellRequisitionDetailsTableName}.price`,
      `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
      `${weReturnSellRequisitionDetailsTableName}.quantity`,
      `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
      `${weReturnSellRequisitionDetailsTableName}.statement`,
      `${weReturnSellRequisitionDetailsTableName}.is_defect`,
      `${weReturnSellRequisitionTableName}.id as requisition_id`,
      `${weReturnSellRequisitionTableName}.number`,
      `${weReturnSellRequisitionTableName}.date`,
      `${weReturnSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as seller_id`,
      `${bussinessmanTableName}.name as seller_name`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
    ])
      .from(`${weReturnSellRequisitionDetailsTableName}`)
      .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weSellRequisitionDetailsTableName}`,
        `${weSellRequisitionDetailsTableName}.id`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .where(whereCluse)
      .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)

          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
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
          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')

    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnSellRequisitionDetailsTableName)
    .select(
      [
        `${weReturnSellRequisitionDetailsTableName}.price`,
        `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
        `${weReturnSellRequisitionDetailsTableName}.quantity`,
        `${weReturnSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `statement`,
    `is_defect`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `seller_id`,
    `seller_name`,
    `fabric_name`,
    `fabric_code`,
    `dyeing_code`,
    `warehouse_name`,
    `type_of_requisition`,
    `input_output`,
    `side_of`,
    `is_return_type`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `work_order_number`,
    `return_type_name`,
    `consigment_dyeing_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weReturnSellRequisitionDetailsTableName}.id`,
      `${weReturnSellRequisitionDetailsTableName}.price`,
      `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
      `${weReturnSellRequisitionDetailsTableName}.quantity`,
      `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
      `${weReturnSellRequisitionDetailsTableName}.statement`,
      `${weReturnSellRequisitionDetailsTableName}.is_defect`,
      `${weReturnSellRequisitionTableName}.id as requisition_id`,
      `${weReturnSellRequisitionTableName}.number`,
      `${weReturnSellRequisitionTableName}.date`,
      `${weReturnSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as seller_id`,
      `${bussinessmanTableName}.name as seller_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
      knex.raw('? as input_output', '1'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'return_warning'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      knex.raw(
        `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
        ELSE 'مرتجع صرف عادي'  
        END as return_type_name`),
        knex.raw('? as consigment_dyeing_number', ''),
    ])
      .from(`${weReturnSellRequisitionDetailsTableName}`)
      .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weSellRequisitionDetailsTableName}`,
        `${weSellRequisitionDetailsTableName}.id`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .where(whereCluse)
      .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          knex.raw(
            `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
            ELSE 'مرتجع صرف عادي'  
            END as return_type_name`),
            knex.raw('? as consigment_dyeing_number', ''),
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)

          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          knex.raw(
            `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
            ELSE 'مرتجع صرف عادي'  
            END as return_type_name`),
                      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,

        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
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
                        .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)

          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnSellRequisitionDetailsTableName)
    .select(
      [
        `${weReturnSellRequisitionDetailsTableName}.price`,
        `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
        `${weReturnSellRequisitionDetailsTableName}.quantity`,
        `${weReturnSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `statement`,
    `is_defect`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `seller_id`,
    `seller_name`,
    `fabric_name`,
    `fabric_code`,
    `dyeing_code`,
    `type_of_requisition`,
    `input_output`,
    `side_of`,
    `is_return_type`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `work_order_number`,
    `return_type_name`,
    `consigment_dyeing_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weReturnSellRequisitionDetailsTableName}.id`,
      `${weReturnSellRequisitionDetailsTableName}.price`,
      `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
      `${weReturnSellRequisitionDetailsTableName}.quantity`,
      `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
      `${weReturnSellRequisitionDetailsTableName}.statement`,
      `${weReturnSellRequisitionDetailsTableName}.is_defect`,
      `${weReturnSellRequisitionTableName}.id as requisition_id`,
      `${weReturnSellRequisitionTableName}.number`,
      `${weReturnSellRequisitionTableName}.date`,
      `${weReturnSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as seller_id`,
      `${bussinessmanTableName}.name as seller_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
      knex.raw('? as input_output', '1'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'return_warning'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      knex.raw(
        `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
        ELSE 'مرتجع صرف عادي'  
        END as return_type_name`),
        knex.raw('? as consigment_dyeing_number', ''),
    ])
      .from(`${weReturnSellRequisitionDetailsTableName}`)
      .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weSellRequisitionDetailsTableName}`,
        `${weSellRequisitionDetailsTableName}.id`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .where(whereCluse)
      .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          knex.raw(
            `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
            ELSE 'مرتجع صرف عادي'  
            END as return_type_name`),
            knex.raw('? as consigment_dyeing_number', ''),
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)

          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          knex.raw(
            `CASE WHEN ${weReturnSellRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع صرف عيب بضاعة' 
            ELSE 'مرتجع صرف عادي'  
            END as return_type_name`),
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,

        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
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
                        .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)

          .where(whereCluse)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnSellRequisitionDetailsTableName)
    .select(
      [
        `${weReturnSellRequisitionDetailsTableName}.price`,
        `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
        `${weReturnSellRequisitionDetailsTableName}.quantity`,
        `${weReturnSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weReturnSellRequisitionDetailsTableName)
    .select(
      [
        `${weReturnSellRequisitionDetailsTableName}.price`,
        `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
        `${weReturnSellRequisitionDetailsTableName}.quantity`,
        `${weReturnSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`,
      `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weReturnSellRequisitionDetailsTableName}.quantity`
    ])
    .from(`${weReturnSellRequisitionDetailsTableName}`)
    .innerJoin(`${weReturnSellRequisitionTableName}`,
      `${weReturnSellRequisitionTableName}.id`,
      `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
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

exports.update = async (weReturnSellRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weReturnSellRequisitionDetailsTableName,
      weReturnSellRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `statement`,
    `is_defect`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `seller_id`,
    `seller_name`,
    `fabric_name`,
    `fabric_code`,
    `dyeing_code`,
    `warehouse_name`,
    `type_of_requisition`,
    `input_output`,
    `side_of`,
    `is_return_type`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `work_order_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weReturnSellRequisitionDetailsTableName}.id`,
      `${weReturnSellRequisitionDetailsTableName}.price`,
      `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
      `${weReturnSellRequisitionDetailsTableName}.quantity`,
      `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
      `${weReturnSellRequisitionDetailsTableName}.statement`,
      `${weReturnSellRequisitionDetailsTableName}.is_defect`,
      `${weReturnSellRequisitionTableName}.id as requisition_id`,
      `${weReturnSellRequisitionTableName}.number`,
      `${weReturnSellRequisitionTableName}.date`,
      `${weReturnSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as seller_id`,
      `${bussinessmanTableName}.name as seller_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
      knex.raw('? as input_output', '1'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'return_warning'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
    ])
      .from(`${weReturnSellRequisitionDetailsTableName}`)
      .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weSellRequisitionDetailsTableName}`,
        `${weSellRequisitionDetailsTableName}.id`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
        .where(`${weReturnSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${weReturnSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
      .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)

          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
            .where(`${weReturnSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
            .andWhere(`${weReturnSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionDetailsTableName}.statement`,
          `${weReturnSellRequisitionDetailsTableName}.is_defect`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          `${weReturnSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as seller_id`,
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          knex.raw('? as input_output', '1'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'return_warning'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weSellRequisitionDetailsTableName}`,
            `${weSellRequisitionDetailsTableName}.id`,
            `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
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
            .where(`${weReturnSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
            .andWhere(`${weReturnSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
          .andWhere(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};