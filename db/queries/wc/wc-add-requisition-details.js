// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wcAddRequisitionDetailsTableName = require("../../../util/database-tables-name").wcAddRequisitionDetailsTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const wcAddRequisitionTableName = require("../../../util/database-tables-name").wcAddRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const { consigmentManufacturingTableName, wcTableName } = require("../../../util/database-tables-name");
const constants = require("../../../util/constants");

exports.insert = async (wcAddRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcAddRequisitionDetailsTableName, {
      id: wcAddRequisitionDetails.wcRequisitionDetailsId,
      wc_add_requisition_id: wcAddRequisitionDetails.id,
      fabric_id: items.fabricId,
      warehouse_id: items.warehouseId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      document: items.document,
      statement: items.statement,
      creator_id: wcAddRequisitionDetails.personid,
      ip_address: wcAddRequisitionDetails.ipaddress,
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
  whereCluse[`${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`] = requisitionId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionDetailsTableName}.document`,
        `${wcAddRequisitionDetailsTableName}.statement`,
        `${wcAddRequisitionTableName}.number`,
        `${wcAddRequisitionTableName}.date`,
        `${wcAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcAddRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcAddRequisitionDetailsTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionDetailsTableName}.document`,
        `${wcAddRequisitionDetailsTableName}.statement`,
        `${wcAddRequisitionTableName}.id as requisition_id`,
        `${wcAddRequisitionTableName}.number`,
        `${wcAddRequisitionTableName}.date`,
        `${wcAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcAddRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcAddRequisitionDetailsTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionDetailsTableName}.document`,
        `${wcAddRequisitionDetailsTableName}.statement`,
        `${wcAddRequisitionTableName}.id as requisition_id`,
        `${wcAddRequisitionTableName}.number`,
        `${wcAddRequisitionTableName}.date`,
        `${wcAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcAddRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcAddRequisitionDetailsTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.price_dollar`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, 
    `${wcAddRequisitionTableName}.id`, 
    `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.price_dollar`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, 
    `${wcAddRequisitionTableName}.id`, 
    `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .selectWithJionWithLimit(wcAddRequisitionDetailsTableName, 
      [
        "wc_add_requisition_details.id", 
      "wc_add_requisition_details.price",
      "wc_add_requisition_details.price_dollar",
    ], 
      whereCluse,
    wcAddRequisitionTableName, 
    `${wcAddRequisitionTableName}.id`,
     `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentManufacturingTableName)
      .select([
        `${consigmentManufacturingTableName}.id`, 
        `${consigmentManufacturingTableName}.number`, 
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${wcAddRequisitionDetailsTableName}`, 
      `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wc_add_requisition_details_id`, 
      `${wcAddRequisitionDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .sum(`${wcTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcAddRequisitionDetailsTableName, [
      "wc_add_requisition_id", 
      "quantity", 
      "is_deleted"
    ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcAddRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcAddRequisitionDetailsTableName,
      wcAddRequisitionDetails,
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

  await knex.from(wcAddRequisitionDetailsTableName)
    .select(
      [
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.price`,
        `${wcAddRequisitionDetailsTableName}.quantity`,
        `${wcAddRequisitionDetailsTableName}.fabric_piece`,
        `${wcAddRequisitionDetailsTableName}.document`,
        `${wcAddRequisitionDetailsTableName}.statement`,
        `${wcAddRequisitionTableName}.id as requisition_id`,
        `${wcAddRequisitionTableName}.number`,
        `${wcAddRequisitionTableName}.date`,
        `${wcAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wcAddRequisitionTableName}`, `${wcAddRequisitionTableName}.id`, `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wcAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wcAddRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wcAddRequisitionDetailsTableName}.warehouse_id`)
    .where(`${wcAddRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wcAddRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wcAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};