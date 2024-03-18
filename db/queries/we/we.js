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
  dyeingServicesTableName, wdFormDyeingRequisitionDetailsDyeingServicesTableName, anointedServicesPricesTableName, weSellRequisitionTableName, weSellRequisitionDetailsTableName, weSellRequisitionDetailsWeTableName, wdFormDyeingOrderDetailsTableName, wdDyeingOrderDetailsWdFormDyeingDetailsTableName, wdDyeingOrderRequisitionDetailsTableName, wdDyeingOrderRequisitionTableName, weSellRequisitionDirectDetailsTableName, consigmentDyeingTableName, weReturnSellRequisitionDetailsReturnDetailsTableName, weReturnSellRequisitionDetailsTableName, weTransitionBetweenWHRequisitionDetailsTableName, weTransitionBetweenWHRequisitionTableName } = require("../../../util/database-tables-name");

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

exports.createForReturnSell = async (we, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTableName, {
      id: items.weId,
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

exports.update = async (we, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTableName,
      we,
      whereCluse
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
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weTableName}.storage_place`,
      `${weTableName}.current_quantity`,
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
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
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
        .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${weTableName}.storage_place`,
          `${weTableName}.current_quantity`,
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
          knex.raw('? as dyeing_code', '-'),
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
            .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
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
          `${wdDyeingRequisitionTableName}.id as requisition_id`,
          `${wdDyeingRequisitionTableName}.number`,
          `${wdDyeingRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن صباغة'),
          `${wdDyeingRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionDetailsTableName}.work_order_number`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
          knex.raw('? as dyeing_code', '-'),
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
            .innerJoin(`${consigmentDyeingTableName}`, 
            `${consigmentDyeingTableName}.id`, 
            `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
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
          `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
          `${weTransitionBetweenWHRequisitionTableName}.number`,
          `${weTransitionBetweenWHRequisitionTableName}.date`,
          knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          knex.raw('? as wd_form_dyeing_requisition_details_id', 'null'),
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
          knex.raw('? as dyeing_code', '-'),
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
        ])
          .from(`${weTableName}`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
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
          .where(whereCluseArray[0])
      })
  }).as('temp')
    .distinct(`requisition_details_id`, `work_order_number`, `dyed_fabric_id`, `color_id`, `color_category_id`)
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
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
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
          knex.raw('? as dyeing_code', '-'),
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
          knex.raw('? as dyeing_code', '-'),
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
          knex.raw('? as dyeing_code', '-'),
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
  }).as('temp')
  .sum(`current_quantity as current_quantity`)
    .distinct(`requisition_details_id`, `work_order_number`, `dyed_fabric_id`, `color_id`, `color_category_id`)
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
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weAddRequisitionTableName}.number, ')') as supplier_name`),
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
      `${weAddRequisitionDetailsTableName}.dyeing_code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
      knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      `${weAddRequisitionDetailsTableName}.color_code`,
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
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .where(whereCluseArray[0]).as('t1')
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
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${anointedColorsPricesTableName}.code as color_code`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
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
          `${weSellRequisitionDetailsTableName}.quantity`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
          `${weSellRequisitionDetailsTableName}.price`,
          knex.raw('? as dyeing_code', '-'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${fabricTableName}.dyeing_code as dyed_fabric_dyeing_code`,
          knex.raw(`CONCAT(${bussinessmanTableName}.name, ' - رقم الاذن (', ${weSellRequisitionTableName}.number, ')') as supplier_name`),
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
        ])
          .from(`${weSellRequisitionDetailsTableName}`)
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
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`)
            .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
          .where(whereCluseArray[3])
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