// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  weExecuteOrderRequisitionDetailsTableName, 
  weExecuteOrderRequisitionTableName, 
  warehouseTableName, 
  fabricTableName, 
  weTableName,
  consigmentDyeingTableName,
  weDyedFabricOrderRequisitionTableName,
  weExecuteOrderRequisitionDetailsWeTableName,
  colorTableName,
  colorCategoryTableName
} = require("../../../util/database-tables-name");

exports.insert = async (weExecuteOrderRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weExecuteOrderRequisitionDetailsTableName, {
      id: items.weExecuteOrderRequisitionDetailsId,
      we_execute_order_requisition_id: weExecuteOrderRequisitionDetails.id,
      we_dyed_fabric_order_requisition_id: items.weDyedFabricOrderRequisitionId,
      we_dyed_fabric_order_requisition_details_id: items.weDyedFabricOrderRequisitionDetailsId,
      dyed_fabric_id: items.dyedFabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      from_warehouse_id: items.fromWarehouseId,
      from_consigment_dyeing_id: items.fromConsigmentDyeingId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,
      color_code: items.colorCode,
      price: items.price,
      quantity: items.quantity,
      note: items.note ?? '',
      creator_id: weExecuteOrderRequisitionDetails.personid,
      ip_address: weExecuteOrderRequisitionDetails.ipaddress,
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
    `we_dyed_fabric_order_requisition_id`,
    `we_dyed_fabric_order_requisition_details_id`,
    `price`,
    `quantity`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `requisition_note`,
    `warehouse_id`,
    `warehouse_name`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `dyed_fabric_order_name`,
    `we_id`,
    `color_name`,
    `color_category_name`,
    `color_code`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weExecuteOrderRequisitionDetailsTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.price`,
      `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${weExecuteOrderRequisitionDetailsTableName}.note`,
      `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
      `${weExecuteOrderRequisitionTableName}.number`,
      `${weExecuteOrderRequisitionTableName}.date`,
      `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weDyedFabricOrderRequisitionTableName}.name as dyed_fabric_order_name`,
      `${weTableName}.id as we_id`,
      `${colorTableName}.name as color_name`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${weExecuteOrderRequisitionDetailsTableName}.color_code`,
    ])
      .from(`${weExecuteOrderRequisitionDetailsTableName}`)
      .innerJoin(`${weExecuteOrderRequisitionTableName}`, 
      `${weExecuteOrderRequisitionTableName}.id`, 
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${weExecuteOrderRequisitionTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_execute_order_requisition_details_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
        `${weDyedFabricOrderRequisitionTableName}.id`,
        `${weExecuteOrderRequisitionTableName}.we_dyed_fabric_order_requisition_id`)
        .innerJoin(`${colorTableName}`, 
        `${colorTableName}.id`, 
        `${weExecuteOrderRequisitionDetailsTableName}.color_id`)
        .innerJoin(`${colorCategoryTableName}`, 
        `${colorCategoryTableName}.id`, 
        `${weExecuteOrderRequisitionDetailsTableName}.color_category_id`)
      .where(whereCluse)
      .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
      `${weExecuteOrderRequisitionTableName}.warehouse_id`,
      `${weTableName}.id as we_id`,
    ])
    .from(`${weExecuteOrderRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_execute_order_requisition_details_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.id`)
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
    .selectWithJionWithLimit(weExecuteOrderRequisitionDetailsTableName, 
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`
    ], 
      whereCluse,
      weExecuteOrderRequisitionTableName, 
    `${weExecuteOrderRequisitionTableName}.id`,
     `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weExecuteOrderRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weExecuteOrderRequisitionDetailsTableName,
      weExecuteOrderRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentDyeingTableName)
      .select([
        `${consigmentDyeingTableName}.id`, 
        `${consigmentDyeingTableName}.number`, 
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`, 
      `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`, 
      `${consigmentDyeingTableName}.id`)
      .innerJoin(`${weExecuteOrderRequisitionTableName}`, 
      `${weExecuteOrderRequisitionTableName}.id`, 
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weTableName}`, 
      `${weTableName}.we_execute_order_requisition_details_id`, 
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
      .where(`${weTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
      .sum(`${weTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectFromTotalByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionTableName}.warehouse_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${weExecuteOrderRequisitionDetailsWeTableName}`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionTableName}.warehouse_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weTableName}`,
      `${weTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromTotalDetailsByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weExecuteOrderRequisitionDetailsWeTableName}`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToTotalDetailsByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${weExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, dyedFabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.from_consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weExecuteOrderRequisitionDetailsWeTableName}`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, dyedFabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weTableName}`,
      `${weTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, dyedFabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.from_consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
      .innerJoin(`${weExecuteOrderRequisitionDetailsWeTableName}`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.from_consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, dyedFabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${weExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
    `${weExecuteOrderRequisitionTableName}.id`,
    `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
    .innerJoin(`${weExecuteOrderRequisitionDetailsWeTableName}`,
    `${weExecuteOrderRequisitionDetailsWeTableName}.we_execute_order_requisition_details_id`,
    `${weExecuteOrderRequisitionDetailsTableName}.id`)
  .innerJoin(`${weTableName}`,
    `${weTableName}.id`,
    `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`)
  .innerJoin(`${fabricTableName}`, 
  `${fabricTableName}.id`, 
  `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
  .innerJoin(`${warehouseTableName}`, 
  `${warehouseTableName}.id`, 
  `${weExecuteOrderRequisitionTableName}.warehouse_id`)
  .innerJoin(`${consigmentDyeingTableName}`, 
  `${consigmentDyeingTableName}.id`, 
  `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
      .where(`${weExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weExecuteOrderRequisitionDetailsTableName)
    .select(
      [
        `${weExecuteOrderRequisitionDetailsTableName}.id`,
        `${weExecuteOrderRequisitionDetailsTableName}.price`,
        `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
        `${weExecuteOrderRequisitionDetailsTableName}.note`,
        `${weExecuteOrderRequisitionTableName}.id as requisition_id`,
        `${weExecuteOrderRequisitionTableName}.number`,
        `${weExecuteOrderRequisitionTableName}.date`,
        `${weExecuteOrderRequisitionTableName}.note as requisition_note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن تنفيذ طلبية'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${weExecuteOrderRequisitionTableName}`,
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_execute_order_requisition_details_id`,
      `${weExecuteOrderRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${weExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weExecuteOrderRequisitionDetailsTableName}.consigment_dyeing_id`)
      .where(`${weExecuteOrderRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weExecuteOrderRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};