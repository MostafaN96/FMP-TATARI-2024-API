// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { 
  weReconciliationRequisitionTableName, weReconciliationRequisitionDetailsTableName, 
  weReconciliationRequisitionDetailsWeTableName,
  fabricTableName, weTableName, warehouseTableName, colorTableName, colorCategoryTableName, consigmentDyeingTableName } = require("../../../util/database-tables-name");

exports.insert = async (weReconciliationRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weReconciliationRequisitionDetailsTableName, {
      id: items.weReconciliationRequisitionDetailsId,
      we_reconcilition_requisition_id: weReconciliationRequisitionDetails.id,
      warehouse_id: items.warehouseId,
      dyed_fabric_id: items.dyedFabricId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,
      color_code: items.colorCode,
      consigment_dyeing_id: items.consigmentDyeingId,
      fabric_piece: items.numberFabricPieces,
      work_order_number: items.workOrderNumber,
      price: items.price,
      quantity: items.quantity,
      statement: items.statement,
      input_output: items.inputOutput,
      creator_id: weReconciliationRequisitionDetails.personid,
      ip_address: weReconciliationRequisitionDetails.ipaddress,
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
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.id`,
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionDetailsTableName}.statement`,
        `${weReconciliationRequisitionDetailsTableName}.input_output`,
        `${weReconciliationRequisitionDetailsTableName}.color_code`,
        `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        `${weReconciliationRequisitionTableName}.id as requisition_id`,
        `${weReconciliationRequisitionTableName}.number`,
        `${weReconciliationRequisitionTableName}.date`,
        `${weReconciliationRequisitionTableName}.note`,
        `${weReconciliationRequisitionTableName}.creator_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${colorTableName}.id as color_id`,
        `${colorTableName}.name as color_name`,
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,

      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.id`,
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionDetailsTableName}.statement`,
        `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        `${weReconciliationRequisitionTableName}.id as requisition_id`,
        `${weReconciliationRequisitionTableName}.number`,
        `${weReconciliationRequisitionTableName}.date`,
        `${weReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.id`,
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionDetailsTableName}.statement`,
        `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        `${weReconciliationRequisitionTableName}.id as requisition_id`,
        `${weReconciliationRequisitionTableName}.number`,
        `${weReconciliationRequisitionTableName}.date`,
        `${weReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
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
    `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`,
    `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`, 
    `${weReconciliationRequisitionDetailsTableName}.quantity`
  ])
  .from(`${weReconciliationRequisitionDetailsTableName}`)
  .innerJoin(`${weReconciliationRequisitionTableName}`,
  `${weReconciliationRequisitionTableName}.id`,
  `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
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

exports.update = async (weReconciliationRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weReconciliationRequisitionDetailsTableName,
      weReconciliationRequisitionDetails,
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

  await knex.from(weReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${weReconciliationRequisitionDetailsTableName}.id`,
        `${weReconciliationRequisitionDetailsTableName}.price`,
        `${weReconciliationRequisitionDetailsTableName}.quantity`,
        `${weReconciliationRequisitionDetailsTableName}.statement`,
        `${weReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${weReconciliationRequisitionDetailsTableName}.work_order_number`,
        `${weReconciliationRequisitionTableName}.id as requisition_id`,
        `${weReconciliationRequisitionTableName}.number`,
        `${weReconciliationRequisitionTableName}.date`,
        `${weReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${weReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      ],
    )
    .innerJoin(`${weReconciliationRequisitionTableName}`, `${weReconciliationRequisitionTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(`${weReconciliationRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weReconciliationRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};