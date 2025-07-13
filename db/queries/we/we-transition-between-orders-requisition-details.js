// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const {
  weTransitionBetweenOrdersRequisitionDetailsTableName,
  weTransitionBetweenOrdersRequisitionTableName,
  warehouseTableName,
  fabricTableName,
  weTableName,
  warehouseUsersTableName,
  colorTableName,
  colorCategoryTableName,
  consigmentDyeingTableName,
  gradeItemTableName,
  weDyedFabricOrderRequisitionTableName,
  weDyedFabricOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenOrdersRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTransitionBetweenOrdersRequisitionDetailsTableName, {
      id: items.weTransitionBetweenOrdersRequisitionDetailsId,
      warehouse_id: items.warehouseId,
      we_transition_between_orders_requisitions_id: weTransitionBetweenOrdersRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,
      consigment_dyeing_id: items.consigmentDyeingId,
      from_consigment_dyeing_id: items.fromConsigmentDyeingId,
      grade_item_id: items.gradeItemId,
      from_we_dyed_fabric_order_requisition_details_id: items.fromWeDyedFabricOrderRequisitionDetailsId,
      from_we_dyed_fabric_order_requisition_id: items.fromDyedFabricOrderId,
      from_orders_requisitions_id: items.fromOrdersRequisitionsId,
      we_dyed_fabric_order_requisition_details_id: items.toWeDyedFabricOrderRequisitionDetailsId,
      we_dyed_fabric_order_requisition_id: weTransitionBetweenOrdersRequisitionDetails.fabricOrderId,
      orders_requisitions_id: weTransitionBetweenOrdersRequisitionDetails.ordersRequisitionsId,
      we_parent_dyed_fabric_order_requisition_id: weTransitionBetweenOrdersRequisitionDetails.fabricOrderId,
      we_parent_dyed_fabric_order_requisition_orders_requisitions_id: weTransitionBetweenOrdersRequisitionDetails.ordersRequisitionsId,
      fabric_piece: items.numberFabricPieces,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      color_code: items.colorCode,
      work_order_number: items.workOrderNumber,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: weTransitionBetweenOrdersRequisitionDetails.personid,
      ip_address: weTransitionBetweenOrdersRequisitionDetails.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  let columns = [
    `id`,
    `orders_requisitions_id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `document`,
    `statement`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `work_order_number`,
    `grade_item_id`,
    `grade_item_name`,
    `from_we_dyed_fabric_order_requisition_id`,
    `from_we_dyed_fabric_order_requisition_name`,
    `to_we_dyed_fabric_order_requisition_id`,
    `to_we_dyed_fabric_order_requisition_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.orders_requisitions_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
      `${weTransitionBetweenOrdersRequisitionTableName}.number`,
      `${weTransitionBetweenOrdersRequisitionTableName}.date`,
      `${weTransitionBetweenOrdersRequisitionTableName}.note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionTableName}.name as from_we_dyed_fabric_order_requisition_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id as to_we_dyed_fabric_order_requisition_id`,
      `to_we_dyed_fabric_order_requisition.name as to_we_dyed_fabric_order_requisition_name`,
    ])
      .from(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`)
      .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
        `${weDyedFabricOrderRequisitionTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
        `to_we_dyed_fabric_order_requisition.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_transition_between_orders_requisitions_details_id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
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
      .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
  }).as('temp')

    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOneByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  let columns = [
    `id`,
    `orders_requisitions_id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `fabric_piece`,
    `document`,
    `statement`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `work_order_number`,
    `grade_item_id`,
    `grade_item_name`,
    `from_we_dyed_fabric_order_requisition_id`,
    `from_we_dyed_fabric_order_requisition_name`,
    `to_we_dyed_fabric_order_requisition_id`,
    `to_we_dyed_fabric_order_requisition_name`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.orders_requisitions_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.document`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
      `${weTransitionBetweenOrdersRequisitionTableName}.number`,
      `${weTransitionBetweenOrdersRequisitionTableName}.date`,
      `${weTransitionBetweenOrdersRequisitionTableName}.note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionTableName}.name as from_we_dyed_fabric_order_requisition_name`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id as to_we_dyed_fabric_order_requisition_id`,
      `to_we_dyed_fabric_order_requisition.name as to_we_dyed_fabric_order_requisition_name`,
    ])
      .from(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`)
      .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
        `${weDyedFabricOrderRequisitionTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
        `to_we_dyed_fabric_order_requisition.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_transition_between_orders_requisitions_details_id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
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
      .limit(1)
      // .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
  }).as('temp')

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
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`,
    ])
    .from(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .selectWithJionWithLimit(weTransitionBetweenOrdersRequisitionDetailsTableName,
      [
        "we_transition_between_wh_requisitions_details.id",
        "we_transition_between_wh_requisitions_details.price",
        "we_transition_between_wh_requisitions_details.price_dollar",
      ],
      whereCluse,
      weTransitionBetweenOrdersRequisitionTableName,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`,
      1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weTransitionBetweenOrdersRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTransitionBetweenOrdersRequisitionDetailsTableName,
      weTransitionBetweenOrdersRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByChemicalWChemicals = async (whereCluse) => {
  let queryResults = []

  await knex(fabricTableName)
    .select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.code`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`
    ])
    .innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`,
      `${fabricTableName}.id`)
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .where(`${weTableName}.current_quantity`, ">", "0")
    .andWhere(whereCluse)
    .groupBy(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .sum(`${weTableName}.current_quantity as current_quantity`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("selectSumCurrentQuantityByWarehouseByChemicalWChemicals error ::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectFromOrderTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionDetailsTableName}`,
      `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToOrderTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${weDyedFabricOrderRequisitionDetailsTableName}`,
      `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromOrderTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من طلبية ', '( ', ${weDyedFabricOrderRequisitionTableName}.name, ')', ' الى طلبية ', '(', to_we_dyed_fabric_order_requisition.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id as we_dyed_fabric_order_requisition_id`,
        `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
      `to_we_dyed_fabric_order_requisition.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToOrderTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من طلبية ', '( ', ${weDyedFabricOrderRequisitionTableName}.name, ')', ' الى طلبية ', '(', to_we_dyed_fabric_order_requisition.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id as we_dyed_fabric_order_requisition_id`,
        `to_we_dyed_fabric_order_requisition.name as we_dyed_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
      `to_we_dyed_fabric_order_requisition.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromOrderDetailsByFabricIdByWarehouseId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToOrderDetailsByFabricIdByWarehouseId = async (toWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = toWarehouseId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromOrderDetailsDetailsByWarehouseByFabricId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من طلبية ', '(', ${weDyedFabricOrderRequisitionTableName}.name, ')', ' الى طلبية ', '(', to_we_dyed_fabric_order_requisition.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id as we_dyed_fabric_order_requisition_id`,
        `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
      `to_we_dyed_fabric_order_requisition.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToOrderDetailsDetailsByWarehouseByFabricId = async (toWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = toWarehouseId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين الطلبيات'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من طلبية ', '(', ${weDyedFabricOrderRequisitionTableName}.name, ')', ' الى طلبية ', '(', to_we_dyed_fabric_order_requisition.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id as we_dyed_fabric_order_requisition_id`,
        `to_we_dyed_fabric_order_requisition.name as we_dyed_fabric_order_requisition_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName} as to_we_dyed_fabric_order_requisition`,
      `to_we_dyed_fabric_order_requisition.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.grade_item_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '( ', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenOrdersRequisitionTableName}.to_warehouse_id`)
    .where(`${weTransitionBetweenOrdersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${weTransitionBetweenOrdersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenOrdersRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenOrdersRequisitionTableName}.number`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        `${weTransitionBetweenOrdersRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_orders_requisitions_details_id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenOrdersRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenOrdersRequisitionTableName}.to_warehouse_id`)
    .where(`${weTransitionBetweenOrdersRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${weTransitionBetweenOrdersRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehousePriceByWarehouseByFabricId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${weTransitionBetweenOrdersRequisitionTableName}.from_warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenOrdersRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.price_dollar`,
        `${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenOrdersRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${weTransitionBetweenOrdersRequisitionTableName}`,
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};