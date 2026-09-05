// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constantsPayloads = require("../../../util/constants-payloads");
const { weTableName, weAddRequisitionDetailsTableName, weAddRequisitionTableName,
  weReconciliationRequisitionDetailsTableName, weReconciliationRequisitionTableName,
  weReconciliationRequisitionDetailsWeTableName, wdDyeingRequisitionDetailsTableName,
  wdDyeingRequisitionTableName, warehouseTableName, fabricTableName,
  bussinessmanTableName, colorCategoryTableName, colorTableName,
  wdFormDyeingRequisitionDetailsTableName, anointedColorsPricesTableName,
  dyeingServicesTableName, wdFormDyeingRequisitionDetailsDyeingServicesTableName, anointedServicesPricesTableName, weSellRequisitionTableName, weSellRequisitionDetailsTableName, weSellRequisitionDetailsWeTableName, wdFormDyeingOrderDetailsTableName, wdDyeingOrderDetailsWdFormDyeingDetailsTableName, wdDyeingOrderRequisitionDetailsTableName, wdDyeingOrderRequisitionTableName, weSellRequisitionDirectDetailsTableName, consigmentDyeingTableName, weReturnSellRequisitionDetailsReturnDetailsTableName, weReturnSellRequisitionDetailsTableName, weTransitionBetweenWHRequisitionDetailsTableName, weTransitionBetweenWHRequisitionTableName, weExecuteOrderRequisitionDetailsTableName, weExecuteOrderRequisitionTableName, 
  weReturnSellRequisitionTableName,
  gradeItemTableName,
  weAddRequisitionDetailsDyedFabricOrderTableName,
  weDyedFabricOrderRequisitionTableName,
  weDyedFabricOrderRequisitionDetailsTableName,
  weTransitionBetweenOrdersRequisitionDetailsTableName,
  weTransitionBetweenOrdersRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: we.weId,
      type: constantsPayloads.addType,
      we_add_requisition_details_id: we.weRequisitionDetailsId,
      current_quantity: items.quantity,
      storage_place: items.storagePlace,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.insertForDyeing = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: items.weId,
      wd_dyeing_requisition_details_id: items.wdDyeingRequisitionDetailsId,
      type: constantsPayloads.dyeingType,
      current_quantity: items.dyeingQuantity,
      storage_place: items.storagePlace,
      note1: items.note1 ?? '',
      note2: items.note2 ?? '',
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForReconciliation = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: we.weId,
      type: constantsPayloads.reconcilitionType,
      current_quantity: items.quantity,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForExecuteOrderRequisitionWe = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: we.weId,
      we_execute_order_requisition_details_id: items.weExecuteOrderRequisitionDetailsId,
      type: constantsPayloads.executeOrderType,
      current_quantity: items.quantity,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetweenWHRequisition = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: we.weId,
      we_transition_between_wh_requisitions_details_id: items.weTransitionBetweenWHRequisitionDetailsId,
      type: constantsPayloads.transportBetweenType,
      current_quantity: items.quantity,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetweenOrdersRequisition = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: we.weId,
      we_transition_between_orders_requisitions_details_id: items.weTransitionBetweenOrdersRequisitionDetailsId,
      type: constantsPayloads.transportBetweenOrdersType,
      current_quantity: items.quantity,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.createForReturnSell = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: items.weId,
      we_return_sell_requisition_details_id: items.weReturnSellRequisitionDetailsId,
      type: constantsPayloads.returnSellType,
      current_quantity: items.quantity,
      creator_id: we.personid,
      ip_address: we.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (we, whereCluse, trx = null) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTableName,
      we,
      whereCluse,
      trx
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(weTableName, ["id", "storage_place", "type", "current_quantity"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectStoreWe = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `we_id`,
    `storage_place`,
    `current_quantity`,
    `fabric_image`,
    `note1`,
    `note2`,
    `requisition_details_id`,
    `wd_form_dyeing_requisition_details_id`,
    `quantity`,
    `work_order_number`,
    `price`,
    `price_dollar`,
    `dyeing_code`,
    `fabric_piece`,
    `fabric_width`,
    `fabric_quantity_m2`,
    `requisition_id`,
    `number`,
    `date`,
    `release_process`,
    `type_of_requisition`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `dyed_fabric_dyeing_code`,
    `supplier_id`,
    `supplier_name`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_code`,
    `order_number`,
    `order_customer_name`,
    `wd_form_dyeing_order_requisition_id`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `grade_item_id`,
    `grade_item_name`,
    `we_dyed_fabric_order_requisition_name`,
    `we_dyed_fabric_order_requisition_id`,
    `orders_requisitions_id`,
    `we_order_seller_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weTableName}.current_quantity`,
      `${weTableName}.file as fabric_image`,
      `${weTableName}.note1`,
      `${weTableName}.note2`,
      `${weAddRequisitionDetailsTableName}.id as requisition_details_id`,
      knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${weAddRequisitionDetailsTableName}.price`,
      `${weAddRequisitionDetailsTableName}.price_dollar`,
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${weAddRequisitionDetailsTableName}.fabric_piece`,
      knex.raw('? as fabric_width', ''),
      knex.raw('? as fabric_quantity_m2', ''),
      `${weAddRequisitionTableName}.id as requisition_id`,
      `${weAddRequisitionTableName}.number`,
      `${weAddRequisitionTableName}.date`,
      knex.raw('? as release_process', ''),
      knex.raw('? as type_of_requisition', 'اذن اضافة'),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      `${bussinessmanTableName}.id as supplier_id`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weAddRequisitionTableName}.number, ')') as supplier_name`),
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      knex.raw('? as dyeing_colors_prices_id', 'null'),
      knex.raw('? as order_number', ''),
      knex.raw('? as order_customer_name', ''),
      knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
      `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
    ])
      .from(`${weTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
        .innerJoin(`${weAddRequisitionDetailsDyedFabricOrderTableName}`,
          `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_add_requisition_details_id`,
          `${weAddRequisitionDetailsTableName}.id`)
          .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_dyed_fabric_order_requisition_id`)
            .innerJoin(`${bussinessmanTableName} as we_seller`,
              `we_seller.id`,
              `${weDyedFabricOrderRequisitionTableName}.seller_id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weAddRequisitionTableName}.supplier_id`)
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
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          `${weReconciliationRequisitionDetailsTableName}.price`,
          `${weReconciliationRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
          knex.raw('? as fabric_width', ''),
          knex.raw('? as fabric_quantity_m2', ''),
          `${weReconciliationRequisitionTableName}.id as requisition_id`,
          `${weReconciliationRequisitionTableName}.number`,
          `${weReconciliationRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن تسوية'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${weReconciliationRequisitionTableName}.id as supplier_id`,
          knex.raw(`CONCAT('اذن تسوية', ' - رقم  (', ${weReconciliationRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weReconciliationRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${wdDyeingRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
          `${wdDyeingRequisitionDetailsTableName}.fabric_width`,
          `${wdDyeingRequisitionDetailsTableName}.fabric_quantity_m2`,
          `${wdDyeingRequisitionTableName}.id as requisition_id`,
          `${wdDyeingRequisitionTableName}.number`,
          `${wdDyeingRequisitionTableName}.date`,
          `${wdDyeingRequisitionTableName}.release_process`,
          knex.raw('? as type_of_requisition', 'اذن صباغة'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${bussinessmanTableName}.id as supplier_id`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${wdDyeingRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
          `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
          `seller.name as order_customer_name`,
          `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${wdDyeingRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingRequisitionTableName}.dyeing_id`)
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
            .leftOuterJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
            `${wdDyeingOrderRequisitionDetailsTableName}.id`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
            .leftOuterJoin(`${bussinessmanTableName} as seller`,
            `seller.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
          knex.raw('? as fabric_width', ''),
          knex.raw('? as fabric_quantity_m2', ''),
          `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenWHRequisitionTableName}.number`,
          `${weTransitionBetweenWHRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weTransitionBetweenWHRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weTransitionBetweenWHRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
            `${weTransitionBetweenWHRequisitionTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[4])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReturnSellRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          knex.raw('? as fabric_width', ''),
          knex.raw('? as fabric_quantity_m2', ''),
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weReturnSellRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
            `${weReturnSellRequisitionDetailsTableName}.id`,
            `${weTableName}.we_return_sell_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weReturnSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${weReturnSellRequisitionTableName}`,
            `${weReturnSellRequisitionTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[5])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
          knex.raw('? as fabric_width', ''),
          knex.raw('? as fabric_quantity_m2', ''),
          `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenOrdersRequisitionTableName}.number`,
          `${weTransitionBetweenOrdersRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weTransitionBetweenOrdersRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_orders_requisitions_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
            `${weTransitionBetweenOrdersRequisitionTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[6])
      })
  }).as('temp')
    .groupBy(`we_id`, `warehouse_id`, `requisition_details_id`, 
      `work_order_number`, `dyed_fabric_id`, 
      `color_id`, `color_category_id`, `grade_item_id`)
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      // console.log("data ::::::::::: ", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectStoreWeForSellDirect = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `we_id`,
    `storage_place`,
    `fabric_image`,
    `note1`,
    `note2`,
    `requisition_details_id`,
    `wd_form_dyeing_requisition_details_id`,
    `quantity`,
    `work_order_number`,
    `price`,
    `price_dollar`,
    `dyeing_code`,
    `requisition_id`,
    `number`,
    `date`,
    `type_of_requisition`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `dyed_fabric_dyeing_code`,
    `supplier_id`,
    `supplier_name`,
    `grade_item_id`,
    `grade_item_name`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_code`,
    `order_number`,
    `order_customer_name`,
    `wd_form_dyeing_order_requisition_id`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weTableName}.file as fabric_image`,
      `${weTableName}.note1`,
      `${weTableName}.note2`,
      `${weAddRequisitionTableName}.id as requisition_id`,
      `${weAddRequisitionTableName}.number`,
      `${weAddRequisitionTableName}.date`,
      knex.raw('? as type_of_requisition', 'اذن اضافة'),
      `${weAddRequisitionDetailsTableName}.id as requisition_details_id`,
      knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${weAddRequisitionDetailsTableName}.price`,
      `${weAddRequisitionDetailsTableName}.price_dollar`,
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      `${bussinessmanTableName}.id as supplier_id`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weAddRequisitionTableName}.number, ')') as supplier_name`),
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      knex.raw('? as dyeing_colors_prices_id', 'null'),
      knex.raw('? as order_number', ''),
      knex.raw('? as order_customer_name', ''),
      knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
      `${weTableName}.current_quantity`,

    ])
      .from(`${weTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weAddRequisitionTableName}.supplier_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .innerJoin(`${gradeItemTableName}`,
        `${gradeItemTableName}.id`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReconciliationRequisitionTableName}.id as requisition_id`,
          `${weReconciliationRequisitionTableName}.number`,
          `${weReconciliationRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن تسوية'),
          `${weReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          `${weReconciliationRequisitionDetailsTableName}.price`,
          `${weReconciliationRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${weReconciliationRequisitionTableName}.id as supplier_id`,
          knex.raw(`CONCAT('اذن تسوية', ' - رقم  (', ${weReconciliationRequisitionTableName}.number, ')') as supplier_name`),
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
      knex.raw('? as order_customer_name', ''),
      knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
      `${weTableName}.current_quantity`,

        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${wdDyeingRequisitionTableName}.id as requisition_id`,
          `${wdDyeingRequisitionTableName}.number`,
          `${wdDyeingRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن صباغة'),
          `${wdDyeingRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${bussinessmanTableName}.id as supplier_id`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${wdDyeingRequisitionTableName}.number, ')') as supplier_name`),
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
          `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
          `seller.name as order_customer_name`,
          `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${weTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingRequisitionTableName}.dyeing_id`)
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
            .leftOuterJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
            `${wdDyeingOrderRequisitionDetailsTableName}.id`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
            .leftOuterJoin(`${bussinessmanTableName} as seller`,
            `seller.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenWHRequisitionTableName}.number`,
          `${weTransitionBetweenWHRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن تشكيل'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weTransitionBetweenWHRequisitionTableName}.number, ')') as supplier_name`),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .where(whereCluseArray[4])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          `${weReturnSellRequisitionDetailsTableName}.id as requisition_details_id`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weReturnSellRequisitionTableName}.number, ')') as supplier_name`),
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
            `${weReturnSellRequisitionDetailsTableName}.id`,
            `${weTableName}.we_return_sell_requisition_details_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[5])
      })
  }).as('temp')
  .sum(`current_quantity as current_quantity`)
    .distinct(`requisition_details_id`, 
      `work_order_number`, 
      `dyed_fabric_id`, 
      `color_id`, 
      `color_category_id`,
      `grade_item_id`
    )
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      // console.log("data ::::::::::: ", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectStoreBySupplierForReturnWe = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `we_id`,
    `storage_place`,
    `current_quantity`,
    `fabric_image`,
    `requisition_details_id`,
    `wd_form_dyeing_requisition_details_id`,
    `quantity`,
    `work_order_number`,
    `price`,
    `price_dollar`,
    `dyeing_code`,
    `requisition_id`,
    `number`,
    `date`,
    `type_of_requisition`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `dyed_fabric_dyeing_code`,
    `supplier_name`,
    `grade_item_id`,
    `grade_item_name`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_code`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weTableName}.current_quantity`,
      `${weTableName}.file as fabric_image`,
      `${weAddRequisitionTableName}.id as requisition_id`,
      `${weAddRequisitionTableName}.number`,
      `${weAddRequisitionTableName}.date`,
      knex.raw('? as type_of_requisition', 'اذن اضافة'),
      `${weAddRequisitionDetailsTableName}.id as requisition_details_id`,
      knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${weAddRequisitionDetailsTableName}.price`,
      `${weAddRequisitionDetailsTableName}.price_dollar`,
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weAddRequisitionTableName}.number, ')') as supplier_name`),
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
    ])
      .from(`${weTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weAddRequisitionTableName}.supplier_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .innerJoin(`${gradeItemTableName}`,
        `${gradeItemTableName}.id`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluseArray[0]).as('t1')
  }).as('temp')
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSoldedBySellerForReturnSellWe = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `we_id`,
    `storage_place`,
    `current_quantity`,
    `fabric_image`,
    `requisition_details_id`,
    `wd_form_dyeing_requisition_details_id`,
    `quantity`,
    `work_order_number`,
    `price`,
    `price_dollar`,
    `dyeing_code`,
    `requisition_id`,
    `number`,
    `date`,
    `type_of_requisition`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `dyed_fabric_dyeing_code`,
    `supplier_name`,
    `grade_item_id`,
    `grade_item_name`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `we_dyed_fabric_order_requisition_name`,
    `we_dyed_fabric_order_requisition_id`,
    `orders_requisitions_id`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weSellRequisitionDetailsTableName}.current_quantity`,
      `${weTableName}.file as fabric_image`,
      `${weSellRequisitionTableName}.id as requisition_id`,
      `${weSellRequisitionTableName}.number`,
      `${weSellRequisitionTableName}.date`,
      knex.raw('? as type_of_requisition', 'اذن بيع'),
      `${weSellRequisitionDetailsTableName}.id as requisition_details_id`,
      knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
      `${weSellRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${weSellRequisitionDetailsTableName}.price`,
      `${weSellRequisitionDetailsTableName}.price_dollar`,
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
      `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`
    ])
      .from(`${weSellRequisitionDetailsTableName}`)
      .innerJoin(`${weSellRequisitionTableName}`,
        `${weSellRequisitionTableName}.id`,
        `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weSellRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weSellRequisitionTableName}.seller_id`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
        `${weSellRequisitionDetailsTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.id`,
        `${weSellRequisitionDetailsWeTableName}.we_id`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
        .innerJoin(`${weAddRequisitionDetailsDyedFabricOrderTableName}`,
          `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_add_requisition_details_id`,
          `${weAddRequisitionDetailsTableName}.id`)
          .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_dyed_fabric_order_requisition_id`)
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
      .where(whereCluseArray[0])
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weSellRequisitionDetailsTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن بيع'),
          `${weSellRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weSellRequisitionDetailsTableName}.warehouse_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weSellRequisitionTableName}`,
            `${weSellRequisitionTableName}.id`,
            `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weSellRequisitionTableName}.seller_id`)
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
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weSellRequisitionDetailsTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن هالك'),
          `${weSellRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weSellRequisitionDetailsTableName}.warehouse_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weSellRequisitionTableName}`,
            `${weSellRequisitionTableName}.id`,
            `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weSellRequisitionTableName}.seller_id`)
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
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weSellRequisitionDetailsTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weSellRequisitionTableName}.id as requisition_id`,
          `${weSellRequisitionTableName}.number`,
          `${weSellRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن هالك'),
          `${weSellRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${weSellRequisitionDetailsTableName}.price`,
          `${weSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
          .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weSellRequisitionTableName}`,
            `${weSellRequisitionTableName}.id`,
            `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weSellRequisitionTableName}.seller_id`)
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
          .where(whereCluseArray[4])
      })
  }).as('temp')
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectStoreWithDyeingServicesWe = async (weStoreData) => {

  for (let index = 0; index < weStoreData.length; index++) {
    const record = weStoreData[index];
    let whereCluse = {}
    whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = record.wd_form_dyeing_requisition_details_id
    whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1

    if (record.wd_form_dyeing_requisition_details_id != 'null') {
      await knex.select([`${dyeingServicesTableName}.id`, `${dyeingServicesTableName}.name`])
        .from(`${dyeingServicesTableName}`)
        .innerJoin(`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}`,
          `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`,
          `${dyeingServicesTableName}.id`)
        .innerJoin(`${anointedServicesPricesTableName}`,
          `${anointedServicesPricesTableName}.anointed_services_id`,
          `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`)
        .where(whereCluse)
        .groupBy(`${dyeingServicesTableName}.id`)
        .then(dyeingService => {
          weStoreData[index].dyeingServices = dyeingService
        })
    }
    else {
      weStoreData[index].dyeingServices = []
    }
  }
  return weStoreData;
};


exports.selectStoreForDirectSellWe = async (weStoreData) => {

  let whereCluse = {}
  whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = record.wd_form_dyeing_requisition_details_id
  whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1

  await knex.select([`${dyeingServicesTableName}.id`, `${dyeingServicesTableName}.name`])
    .from(`${dyeingServicesTableName}`)
    .innerJoin(`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}`,
      `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`,
      `${dyeingServicesTableName}.id`)
    .innerJoin(`${anointedServicesPricesTableName}`,
      `${anointedServicesPricesTableName}.anointed_services_id`,
      `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`)
    .where(whereCluse)
    .groupBy(`${dyeingServicesTableName}.id`)
    .then(dyeingService => {
      weStoreData[index].dyeingServices = dyeingService
    })

  return weStoreData;
};


exports.selectStoredWarehouseAndFabric = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `we_id`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyeing_code`,
    `dyed_fabric_code`,
    `dyeing_id`,
    `warehouse_id`,
    `warehouse_name`,
    `grade_item_id`,
    `grade_item_name`,
    `quantity`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as dyed_fabric_code`,
      knex.raw('? as dyeing_id', ''),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weTableName}.current_quantity`
    ])
      .from(`${weAddRequisitionDetailsTableName}`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${gradeItemTableName}`,
        `${gradeItemTableName}.id`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${weReconciliationRequisitionDetailsTableName}`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${wdDyeingRequisitionTableName}.dyeing_id`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${wdDyeingRequisitionDetailsTableName}`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${weReturnSellRequisitionTableName}`,
            `${weReturnSellRequisitionTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`dyed_fabric_id`, `warehouse_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWarehouseAndFabricForReport = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `we_id`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyeing_code`,
    `dyed_fabric_code`,
    `dyeing_id`,
    `warehouse_id`,
    `warehouse_name`,
    `quantity`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as dyed_fabric_code`,
      knex.raw('? as dyeing_id', ''),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weTableName}.current_quantity`
    ])
      .from(`${weAddRequisitionDetailsTableName}`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${weReconciliationRequisitionDetailsTableName}`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${wdDyeingRequisitionTableName}.dyeing_id`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${wdDyeingRequisitionDetailsTableName}`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.quantity as current_quantity`,
        ])
          .from(`${weReturnSellRequisitionDetailsTableName}`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${weTransitionBetweenWHRequisitionDetailsTableName}`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
          `${weTransitionBetweenWHRequisitionTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .where(whereCluseArray[4])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          knex.raw('? as dyeing_id', ''),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
          `${weTableName}.current_quantity`
        ])
          .from(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
          `${weTransitionBetweenOrdersRequisitionTableName}.id`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_transition_between_orders_requisitions_details_id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
          .where(whereCluseArray[5])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      })
      // .union(function () {
      //   this.select([
      //     `${weTableName}.id as we_id`,
      //     `${fabricTableName}.id as dyed_fabric_id`,
      //     `${fabricTableName}.name as fabric_name`,
      //     `${fabricTableName}.dyeing_code`,
      //     `${fabricTableName}.code as fabric_code`,
      //     knex.raw('? as dyeing_id', ''),
      //     `${warehouseTableName}.id as warehouse_id`,
      //     `${warehouseTableName}.name as warehouse_name`,
      //     `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
      //     `${weTableName}.current_quantity`
      //   ])
      //     .from(`${weExecuteOrderRequisitionDetailsTableName}`)
      //     .innerJoin(`${fabricTableName}`,
      //       `${fabricTableName}.id`,
      //       `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
      //     .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      //     `${weExecuteOrderRequisitionTableName}.id`,
      //     `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      //     .innerJoin(`${weTableName}`,
      //       `${weTableName}.we_execute_order_requisition_details_id`,
      //       `${weExecuteOrderRequisitionDetailsTableName}.id`)
      //       .innerJoin(`${warehouseTableName}`,
      //       `${warehouseTableName}.id`,
      //       `${weExecuteOrderRequisitionTableName}.warehouse_id`)
      //     .where(whereCluseArray[5])
      //     .andWhere(
      //       (qb) => {
      //         if (isGreaterThanZero) {
      //           qb.where(`${weTableName}.current_quantity`, ">", "0")
      //         } else {
      //           qb.where(`${weTableName}.current_quantity`, ">=", "0")
      //         }
      //       })
      //   // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      // })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`dyed_fabric_id`, `warehouse_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectSellDirectQuantity = async (weStoreData) => {

  for (let index = 0; index < weStoreData.length; index++) {
    const record = weStoreData[index];
    let whereCluse = {}
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.work_order_number`] = record.work_order_number
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.color_id`] = record.color_id
    whereCluse[`${weSellRequisitionDirectDetailsTableName}.is_direct`] = 1

      await knex(`${weSellRequisitionDirectDetailsTableName}`)
      .sum("quantity as direct_quantity")
        .where(whereCluse)
        .groupBy(`${weSellRequisitionDirectDetailsTableName}.work_order_number`,
        `${weSellRequisitionDirectDetailsTableName}.dyed_fabric_id`,
        `${weSellRequisitionDirectDetailsTableName}.color_id`
        )
        .then(weSellRequisitionDirectDetailsData => {
          weStoreData[index].sold_direct_quantity = (weSellRequisitionDirectDetailsData[0]?.direct_quantity != undefined) ? weSellRequisitionDirectDetailsData[0].direct_quantity : 0
        })
    
  }
  return weStoreData;
};

exports.selectStoreWeByWeDyedFabricOrderRequisitionIdOfOrderDyedFabrics = async (whereCluseArray, orderByCluse, weDyedFabricOrderRequisitionId) => {
  let queryResults = [];
  let columns = [
    `we_id`,
    `storage_place`,
    `current_quantity`,
    `fabric_image`,
    `note1`,
    `note2`,
    `requisition_details_id`,
    `wd_form_dyeing_requisition_details_id`,
    `quantity`,
    `work_order_number`,
    `price`,
    `price_dollar`,
    `dyeing_code`,
    `fabric_piece`,
    `requisition_id`,
    `number`,
    `date`,
    `release_process`,
    `type_of_requisition`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `dyed_fabric_dyeing_code`,
    `supplier_id`,
    `supplier_name`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_code`,
    `order_number`,
    `order_customer_name`,
    `wd_form_dyeing_order_requisition_id`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `grade_item_id`,
    `grade_item_name`,
    `we_dyed_fabric_order_requisition_name`,
    `we_dyed_fabric_order_requisition_id`,
    `orders_requisitions_id`,
    `we_order_seller_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weTableName}.current_quantity`,
      `${weTableName}.file as fabric_image`,
      `${weTableName}.note1`,
      `${weTableName}.note2`,
      `${weAddRequisitionDetailsTableName}.id as requisition_details_id`,
      knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.work_order_number`,
      `${weAddRequisitionDetailsTableName}.price`,
      `${weAddRequisitionDetailsTableName}.price_dollar`,
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${weAddRequisitionDetailsTableName}.fabric_piece`,
      `${weAddRequisitionTableName}.id as requisition_id`,
      `${weAddRequisitionTableName}.number`,
      `${weAddRequisitionTableName}.date`,
      knex.raw('? as release_process', ''),
      knex.raw('? as type_of_requisition', 'اذن اضافة'),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      `${bussinessmanTableName}.id as supplier_id`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weAddRequisitionTableName}.number, ')') as supplier_name`),
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      knex.raw('? as dyeing_colors_prices_id', 'null'),
      knex.raw('? as order_number', ''),
      knex.raw('? as order_customer_name', ''),
      knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
      `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
    ])
      .from(`${weTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
        .innerJoin(`${weAddRequisitionDetailsDyedFabricOrderTableName}`,
          `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_add_requisition_details_id`,
          `${weAddRequisitionDetailsTableName}.id`)
          .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weAddRequisitionDetailsDyedFabricOrderTableName}.we_dyed_fabric_order_requisition_id`)
            .innerJoin(`${bussinessmanTableName} as we_seller`,
              `we_seller.id`,
              `${weDyedFabricOrderRequisitionTableName}.seller_id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weAddRequisitionTableName}.supplier_id`)
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
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
          `${weReconciliationRequisitionDetailsTableName}.price`,
          `${weReconciliationRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
          `${weReconciliationRequisitionTableName}.id as requisition_id`,
          `${weReconciliationRequisitionTableName}.number`,
          `${weReconciliationRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن تسوية'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${weReconciliationRequisitionTableName}.id as supplier_id`,
          knex.raw(`CONCAT('اذن تسوية', ' - رقم  (', ${weReconciliationRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
            `${weTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weReconciliationRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${wdDyeingRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${wdDyeingRequisitionDetailsTableName}.fabric_piece`,
          `${wdDyeingRequisitionTableName}.id as requisition_id`,
          `${wdDyeingRequisitionTableName}.number`,
          `${wdDyeingRequisitionTableName}.date`,
          `${wdDyeingRequisitionTableName}.release_process`,
          knex.raw('? as type_of_requisition', 'اذن صباغة'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          `${bussinessmanTableName}.id as supplier_id`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${wdDyeingRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`,
          `${wdDyeingOrderRequisitionTableName}.work_order_number as order_number`,
          `seller.name as order_customer_name`,
          `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.wd_dyeing_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${wdDyeingRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingRequisitionTableName}.dyeing_id`)
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
            .leftOuterJoin(`${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_requisition_details_id`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionDetailsTableName}`,
            `${wdDyeingOrderRequisitionDetailsTableName}.id`,
            `${wdDyeingOrderDetailsWdFormDyeingDetailsTableName}.wd_form_dyeing_order_requisition_details_id`)
            .leftOuterJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
            .leftOuterJoin(`${bussinessmanTableName} as seller`,
            `seller.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
          `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenWHRequisitionTableName}.number`,
          `${weTransitionBetweenWHRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weTransitionBetweenWHRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weTransitionBetweenWHRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
            `${weTransitionBetweenWHRequisitionTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[4])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weReturnSellRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          `${weReturnSellRequisitionDetailsTableName}.work_order_number`,
          `${weReturnSellRequisitionDetailsTableName}.price`,
          `${weReturnSellRequisitionDetailsTableName}.price_dollar`,
          knex.raw('? as dyeing_code', '-'),
          `${weReturnSellRequisitionDetailsTableName}.fabric_piece`,
          `${weReturnSellRequisitionTableName}.id as requisition_id`,
          `${weReturnSellRequisitionTableName}.number`,
          `${weReturnSellRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weReturnSellRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weReturnSellRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weReturnSellRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
            `${weReturnSellRequisitionDetailsTableName}.id`,
            `${weTableName}.we_return_sell_requisition_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weReturnSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${weReturnSellRequisitionTableName}`,
            `${weReturnSellRequisitionTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[5])
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
          `${weTableName}.file as fabric_image`,
          `${weTableName}.note1`,
          `${weTableName}.note2`,
          `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenOrdersRequisitionTableName}.number`,
          `${weTransitionBetweenOrdersRequisitionTableName}.date`,
          knex.raw('? as release_process', ''),
          knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw('? as supplier_id', '-'),
          knex.raw(`CONCAT(${warehouseTableName}.name, ' - رقم الاذن (', ${weTransitionBetweenOrdersRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
          knex.raw('? as dyeing_colors_prices_id', 'null'),
          knex.raw('? as order_number', ''),
          knex.raw('? as order_customer_name', ''),
          knex.raw('? as wd_form_dyeing_order_requisition_id', ''),
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
          `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
          `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `we_seller.name as we_order_seller_name`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_orders_requisitions_details_id`)
            .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
              `${weDyedFabricOrderRequisitionTableName}.id`,
              `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
              .innerJoin(`${bussinessmanTableName} as we_seller`,
                `we_seller.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
            `${weTransitionBetweenOrdersRequisitionTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
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
          .where(whereCluseArray[6])
      })
  }).as('temp')
    .distinct(`warehouse_id`, `requisition_details_id`, 
      `work_order_number`, `dyed_fabric_id`, 
      `color_id`, `color_category_id`, `grade_item_id`)
    .andWhere(whereCluseArray[2].whereTableName, 
      whereCluseArray[2].operator, 
      whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .whereIn('dyed_fabric_id', function () {
      this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
      .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
      .where(`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`, weDyedFabricOrderRequisitionId)
    })
    .whereIn('color_id', function () {
      this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
      .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
      .where(`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`, weDyedFabricOrderRequisitionId)
    })
    .whereNotIn('we_dyed_fabric_order_requisition_id', [weDyedFabricOrderRequisitionId])
    .then((data) => {
      // console.log("data ::::::::::: ", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};