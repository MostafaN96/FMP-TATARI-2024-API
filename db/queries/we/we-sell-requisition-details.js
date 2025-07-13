// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { consigmentManufacturingTableName, weSellRequisitionDetailsTableName,
  weSellRequisitionTableName, fabricTableName,
  warehouseTableName,
  bussinessmanTableName,
  deliveryCarTableName,
  weSellRequisitionDetailsWeTableName,
  weTableName,
  wdDyeingRequisitionDetailsTableName,
  wdFormDyeingRequisitionDetailsTableName,
  anointedColorsPricesTableName,
  colorCategoryTableName,
  colorTableName,
  weAddRequisitionDetailsTableName,
  weReconciliationRequisitionDetailsTableName,
  weReconciliationRequisitionDetailsWeTableName,
  consigmentDyeingTableName,
  weTransitionBetweenWHRequisitionDetailsTableName,
  weExecuteOrderRequisitionDetailsTableName,
  weReturnSellRequisitionDetailsTableName,
  gradeItemTableName,
  weTransitionBetweenOrdersRequisitionDetailsTableName
} = require("../../../util/database-tables-name");

exports.insert = async (weSellRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weSellRequisitionDetailsTableName, {
      id: items.weSellRequisitionDetailsId,
      we_sell_requisition_id: weSellRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      warehouse_id: items.warehouseId,
      we_dyed_fabric_order_requisition_details_id: items.weDyedFabricOrderRequisitionDetailsId,
      we_dyed_fabric_order_requisition_id: items.dyedFabricOrderId,
      orders_requisitions_id: items.ordersRequisitionsId,
      we_parent_dyed_fabric_order_requisition_id: items.dyedFabricOrderId,
      we_parent_dyed_fabric_order_requisition_orders_requisitions_id: items.ordersRequisitionsId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      current_quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      document: items.document,
      statement: items.statement,
      creator_id: weSellRequisitionDetails.personid,
      ip_address: weSellRequisitionDetails.ipaddress,
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
  whereCluse[`${weSellRequisitionDetailsTableName}.we_sell_requisition_id`] = requisitionId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `document`,
    `statement`,
    `requisition_id`,
    `delivery_car_id`,
    `number`,
    `date`,
    `note`,
    `is_approved`,
    `approved_state`,
    `seller_name`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `warehouse_id`,
    `warehouse_name`,
    `delivery_car_name`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `work_order_number`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `grade_item_id`,
    `grade_item_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.fabric_piece`,
      `${weSellRequisitionDetailsTableName}.document`,
      `${weSellRequisitionDetailsTableName}.statement`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.delivery_car_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      `${weSellRequisitionTableName}.note`,
      `${weSellRequisitionTableName}.is_approved`,
      knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
      `${bussinessmanTableName}.name as seller_name`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
      .leftOuterJoin(`${deliveryCarTableName}`,
        `${deliveryCarTableName}.id`,
        `${weSellRequisitionTableName}.delivery_car_id`)
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
        .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
            .innerJoin(`${gradeItemTableName}`, 
          `${gradeItemTableName}.id`, 
          `${weAddRequisitionDetailsTableName}.grade_item_id`)
        .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.delivery_car_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${weSellRequisitionTableName}.is_approved`,
          knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
          .leftOuterJoin(`${deliveryCarTableName}`,
            `${deliveryCarTableName}.id`,
            `${weSellRequisitionTableName}.delivery_car_id`)
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
            .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
            .innerJoin(`${gradeItemTableName}`, 
          `${gradeItemTableName}.id`, 
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
          .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.delivery_car_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${weSellRequisitionTableName}.is_approved`,
          knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
          .leftOuterJoin(`${deliveryCarTableName}`,
            `${deliveryCarTableName}.id`,
            `${weSellRequisitionTableName}.delivery_car_id`)
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
            .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
            .innerJoin(`${gradeItemTableName}`, 
          `${gradeItemTableName}.id`, 
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
            .where(whereCluse)
            .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.delivery_car_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${weSellRequisitionTableName}.is_approved`,
          knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .leftOuterJoin(`${deliveryCarTableName}`,
          `${deliveryCarTableName}.id`,
          `${weSellRequisitionTableName}.delivery_car_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
          `${weTableName}.we_transition_between_wh_requisitions_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
          `${colorTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${weTransitionBetweenWHRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
            .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.delivery_car_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${weSellRequisitionTableName}.is_approved`,
          knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, 
          `${weSellRequisitionTableName}.id`, 
          `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, 
          `${warehouseTableName}.id`, 
          `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .leftOuterJoin(`${deliveryCarTableName}`,
          `${deliveryCarTableName}.id`,
          `${weSellRequisitionTableName}.delivery_car_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
          `${weTableName}.we_transition_between_orders_requisitions_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
          `${colorTableName}.id`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
            .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.delivery_car_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${weSellRequisitionTableName}.is_approved`,
          knex.raw(`CASE WHEN ${weSellRequisitionTableName}.is_approved = '1' THEN 'تم التسليم' ELSE 'بانتظار التسليم' END as approved_state`),
          `${bussinessmanTableName}.name as seller_name`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
        ' (', ${deliveryCarTableName}.plate_number, ') 
        ', ${deliveryCarTableName}.national_id) as delivery_car_name`),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .leftOuterJoin(`${deliveryCarTableName}`,
          `${deliveryCarTableName}.id`,
          `${weSellRequisitionTableName}.delivery_car_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weTableName}.we_return_sell_requisition_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
          `${colorTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${weReturnSellRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`, 
        `${gradeItemTableName}.id`, 
        `${weReturnSellRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
            .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
  // .distinct(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weSellRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weSellRequisitionDetailsTableName)
    .select(
      [
        `${weSellRequisitionDetailsTableName}.price`,
        `${weSellRequisitionDetailsTableName}.price_dollar`,
        `${weSellRequisitionDetailsTableName}.quantity`,
        `${weSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weSellRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `document`,
    `statement`,
    `fabric_piece`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `bussinessman_id`,
    `bussinessman_name`,
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
    `consigment_dyeing_number`,
    `grade_item_id`,
    `grade_item_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.document`,
      `${weSellRequisitionDetailsTableName}.statement`,
      `${weSellRequisitionDetailsTableName}.fabric_piece`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      `${weSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as bussinessman_id`,
      `${bussinessmanTableName}.name as bussinessman_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن بيع'),
      knex.raw('? as input_output', '0'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'not_return'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluse)
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)

      .as('t1')
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
            .innerJoin(`${consigmentDyeingTableName}`, 
                `${consigmentDyeingTableName}.id`, 
                `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
        })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            `${weSellRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weSellRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`)
        .where(whereCluse)
        .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weExecuteOrderRequisitionDetailsTableName}.color_code`,
          `${weExecuteOrderRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weExecuteOrderRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
          `${weExecuteOrderRequisitionDetailsTableName}.id`,
          `${weTableName}.we_execute_order_requisition_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weExecuteOrderRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weExecuteOrderRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weExecuteOrderRequisitionDetailsTableName}.grade_item_id`)
        .where(whereCluse)
        .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
          `${weReturnSellRequisitionDetailsTableName}.id`,
          `${weTableName}.we_return_sell_requisition_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weReturnSellRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.grade_item_id`)
        .where(whereCluse)
        .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabric = async (warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weSellRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weSellRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `document`,
    `statement`,
    `fabric_piece`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `bussinessman_id`,
    `bussinessman_name`,
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
    `consigment_dyeing_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.document`,
      `${weSellRequisitionDetailsTableName}.statement`,
      `${weSellRequisitionDetailsTableName}.fabric_piece`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      `${weSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as bussinessman_id`,
      `${bussinessmanTableName}.name as bussinessman_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن بيع'),
      knex.raw('? as input_output', '0'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'not_return'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      knex.raw('? as consigment_dyeing_number', ''),
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)

      .as('t1')
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          knex.raw('? as consigment_dyeing_number', ''),
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
          `${weTableName}.we_transition_between_wh_requisitions_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
          `${colorTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${weTransitionBetweenWHRequisitionDetailsTableName}.consigment_dyeing_id`)
        .where(whereCluse)
        .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weExecuteOrderRequisitionDetailsTableName}.color_code`,
          `${weExecuteOrderRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
          `${weExecuteOrderRequisitionDetailsTableName}.id`,
          `${weTableName}.we_execute_order_requisition_details_id`)
        .innerJoin(`${colorCategoryTableName}`,
          `${colorCategoryTableName}.id`,
          `${weExecuteOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
          `${colorTableName}.id`,
          `${weExecuteOrderRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`, 
          `${consigmentDyeingTableName}.id`, 
          `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
        .where(whereCluse)
        .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabric = async (warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weSellRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weSellRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  let columns = [
    `id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `document`,
    `statement`,
    `fabric_piece`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `bussinessman_id`,
    `bussinessman_name`,
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
    `consigment_dyeing_number`,
    `grade_item_id`,
    `grade_item_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.document`,
      `${weSellRequisitionDetailsTableName}.statement`,
      `${weSellRequisitionDetailsTableName}.fabric_piece`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      `${weSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as bussinessman_id`,
      `${bussinessmanTableName}.name as bussinessman_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن بيع'),
      knex.raw('? as input_output', '0'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'not_return'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      knex.raw('? as consigment_dyeing_number', ''),
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
      .innerJoin(`${gradeItemTableName}`,
        `${gradeItemTableName}.id`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluse)
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)

      .as('t1')
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          knex.raw('? as consigment_dyeing_number', ''),
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
        ])
        .from(`${weSellRequisitionDetailsTableName}`)
        .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
        .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
          `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`,
          `${weTableName}.id`,
          `${weSellRequisitionDetailsWeTableName}.we_id`)
        .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
          `${weTableName}.we_transition_between_wh_requisitions_details_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluse)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
  .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weSellRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weSellRequisitionDetailsTableName)
    .select(
      [
        `${weSellRequisitionDetailsTableName}.price`,
        `${weSellRequisitionDetailsTableName}.price_dollar`,
        `${weSellRequisitionDetailsTableName}.quantity`,
        `${weSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weSellRequisitionDetailsTableName)
    .select(
      [
        `${weSellRequisitionDetailsTableName}.price`,
        `${weSellRequisitionDetailsTableName}.price_dollar`,
        `${weSellRequisitionDetailsTableName}.quantity`,
        `${weSellRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن بيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${weSellRequisitionDetailsWeTableName}.we_id`,
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`,
      `${weSellRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weSellRequisitionDetailsTableName}.warehouse_id`,
      `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
      `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.current_quantity`
    ])
    .from(`${weSellRequisitionDetailsTableName}`)
    .innerJoin(`${weSellRequisitionDetailsWeTableName}`, 
    `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`, 
    `${weSellRequisitionDetailsTableName}.id`
      )
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

exports.update = async (weSellRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weSellRequisitionDetailsTableName,
      weSellRequisitionDetails,
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
    `document`,
    `statement`,
    `fabric_piece`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `bussinessman_id`,
    `bussinessman_name`,
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
    `work_order_number`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weSellRequisitionDetailsTableName}.id`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weSellRequisitionDetailsTableName}.document`,
      `${weSellRequisitionDetailsTableName}.statement`,
      `${weSellRequisitionDetailsTableName}.fabric_piece`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      `${weSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as bussinessman_id`,
      `${bussinessmanTableName}.name as bussinessman_name`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code`,
      `${warehouseTableName}.name as warehouse_name`,
      knex.raw('? as type_of_requisition', 'اذن بيع'),
      knex.raw('? as input_output', '0'),
      knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      knex.raw('? as is_return_type', 'not_return'),
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
        .where(`${weSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${weSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)

      .as('t1')
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
            .where(`${weSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
            .andWhere(`${weSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
          .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
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
            .where(`${weSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
            .andWhere(`${weSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
          .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTableName}.we_transition_between_wh_requisitions_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
        .where(`${weSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${weSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
      .union(function () {
        this.select([
          `${weSellRequisitionDetailsTableName}.id`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weSellRequisitionDetailsTableName}.document`,
          `${weSellRequisitionDetailsTableName}.statement`,
          `${weSellRequisitionDetailsTableName}.fabric_piece`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          `${weSellRequisitionTableName}.note`,
          `${bussinessmanTableName}.id as bussinessman_id`,
          `${bussinessmanTableName}.name as bussinessman_name`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${warehouseTableName}.name as warehouse_name`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          knex.raw('? as input_output', '0'),
          knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
          knex.raw('? as is_return_type', 'not_return'),
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.name as color_name`,
          `${weExecuteOrderRequisitionDetailsTableName}.color_code`,
          `${weExecuteOrderRequisitionDetailsTableName}.work_order_number`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weSellRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weTableName}.we_execute_order_requisition_details_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.color_id`)
        .where(`${weSellRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${weSellRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
      .andWhere(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
      })
  }).as('temp')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};