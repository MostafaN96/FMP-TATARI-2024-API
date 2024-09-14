// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { consigmentManufacturingTableName, 
  wcReconciliationRequisitionTableName, wcReconciliationRequisitionDetailsTableName, wcReconciliationRequisitionDetailsWcTableName,
  fabricTableName, wcTableName, warehouseTableName } = require("../../../util/database-tables-name");

exports.insert = async (wcReconciliationRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcReconciliationRequisitionDetailsTableName, {
      id: items.wcReconciliationRequisitionDetailsId,
      wc_reconcilition_requisition_id: wcReconciliationRequisitionDetails.id,
      fabric_id: items.fabricId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      statement: items.statement,
      input_output: items.inputOutput,
      creator_id: wcReconciliationRequisitionDetails.personid,
      ip_address: wcReconciliationRequisitionDetails.ipaddress,
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
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`] = requisitionId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.id`,
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionDetailsTableName}.statement`,
        `${wcReconciliationRequisitionDetailsTableName}.input_output`,
        `${wcReconciliationRequisitionTableName}.id as requisition_id`,
        `${wcReconciliationRequisitionTableName}.number`,
        `${wcReconciliationRequisitionTableName}.date`,
        `${wcReconciliationRequisitionTableName}.note`,
        `${wcReconciliationRequisitionTableName}.creator_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReconciliationRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.id`,
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionDetailsTableName}.statement`,
        `${wcReconciliationRequisitionTableName}.id as requisition_id`,
        `${wcReconciliationRequisitionTableName}.number`,
        `${wcReconciliationRequisitionTableName}.date`,
        `${wcReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReconciliationRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.id`,
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionDetailsTableName}.statement`,
        `${wcReconciliationRequisitionTableName}.id as requisition_id`,
        `${wcReconciliationRequisitionTableName}.number`,
        `${wcReconciliationRequisitionTableName}.date`,
        `${wcReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReconciliationRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentManufacturingTableName)
      .select([
        `${consigmentManufacturingTableName}.id`, 
        `${consigmentManufacturingTableName}.number`, 
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
      ])
      .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`, 
      `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcReconciliationRequisitionTableName}`, 
      `${wcReconciliationRequisitionTableName}.id`, 
      `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
      .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`, 
      `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`, 
      `${wcReconciliationRequisitionDetailsTableName}.id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.id`, 
      `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .sum(`${wcTableName}.current_quantity as current_quantity`)
      .then(data => {
        console.log("Reconcilition selectSumCurrentQuantityByWarehouseByFabricWc ::: ", data);
          queryResults = data
      })
      .catch(error => {
        console.log(error);
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectOne = async (whereCluse) => {
  let queryResults = false;

  await knex
  .select([
    `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`,
    `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`, 
    `${wcReconciliationRequisitionDetailsTableName}.fabric_id`, 
    `${wcReconciliationRequisitionTableName}.warehouse_id`, 
    `${wcReconciliationRequisitionDetailsTableName}.quantity`,
    `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
  ])
  .from(`${wcReconciliationRequisitionDetailsTableName}`)
  .innerJoin(`${wcReconciliationRequisitionTableName}`,
  `${wcReconciliationRequisitionTableName}.id`,
  `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
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

exports.update = async (wcReconciliationRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcReconciliationRequisitionDetailsTableName,
      wcReconciliationRequisitionDetails,
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

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.id`,
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionDetailsTableName}.statement`,
        `${wcReconciliationRequisitionTableName}.id as requisition_id`,
        `${wcReconciliationRequisitionTableName}.number`,
        `${wcReconciliationRequisitionTableName}.date`,
        `${wcReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReconciliationRequisitionTableName}.warehouse_id`)
    .where(`${wcReconciliationRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wcReconciliationRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentManufacturingForDyedFabricOrder = async (whereCluse, consigmentsManufacturing) => {
  let queryResults = [];

  await knex.from(wcReconciliationRequisitionDetailsTableName)
    .select(
      [
        `${wcReconciliationRequisitionDetailsTableName}.id`,
        `${wcReconciliationRequisitionDetailsTableName}.price`,
        `${wcReconciliationRequisitionDetailsTableName}.price_dollar`,
        `${wcReconciliationRequisitionDetailsTableName}.quantity`,
        `${wcReconciliationRequisitionDetailsTableName}.fabric_piece`,
        `${wcReconciliationRequisitionDetailsTableName}.statement`,
        `${wcReconciliationRequisitionTableName}.id as requisition_id`,
        `${wcReconciliationRequisitionTableName}.number`,
        `${wcReconciliationRequisitionTableName}.date`,
        `${wcReconciliationRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تسوية'),
        `${wcReconciliationRequisitionDetailsTableName}.input_output`,
        knex.raw(`CONCAT(${warehouseTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcReconciliationRequisitionTableName}`, `${wcReconciliationRequisitionTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcReconciliationRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcReconciliationRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`, consigmentsManufacturing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};