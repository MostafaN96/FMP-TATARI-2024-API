// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wbManufacturingInputTableName, wbManufacturingRequisitionTableName, yarnTableName, yarnLotTableName, bussinessmanTableName, wbManufacturingInputOutputTableName, wbManufacturingOutputTableName, fabricTableName, consigmentYarnTableName, waYarnOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingInput, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingInputTableName, {
      id: items.wbManufacturingInputId,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      quantity: items.quantity,
      quantity_with_waste: items.quantityWithWaste,
      price: items.price,
      price_dollar: items.priceDollar,
      ratio: items.ratio,
      wast_ratio: items.wastRatio,
      statement: items.statement,
      creator_id: wbManufacturingInput.personid,
      ip_address: wbManufacturingInput.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wbManufacturingInputTableName}.yarn_id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`,
      `${wbManufacturingInputTableName}.consigment_yarn_id`,
      `${wbManufacturingInputTableName}.quantity`,
      `${wbManufacturingInputTableName}.quantity_with_waste`,
      `${wbManufacturingInputTableName}.price`,
      `${wbManufacturingInputTableName}.price_dollar`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
      `${wbManufacturingRequisitionTableName}.industry_id`,
    ])
    .from(`${wbManufacturingInputTableName}`)
    .limit(1)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectOneByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.id`] = requisitionId;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingRequisitionTableName}.id as requisition_id`,
    `${wbManufacturingRequisitionTableName}.date`,
    `${wbManufacturingRequisitionTableName}.number`,
    `${wbManufacturingRequisitionTableName}.status`,
    `${wbManufacturingRequisitionTableName}.note`,
    `${wbManufacturingRequisitionTableName}.is_order`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.id as consigment_yarn_id`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `${wbManufacturingInputTableName}.id`,
    `${wbManufacturingInputTableName}.quantity`,
    `${wbManufacturingInputTableName}.quantity_with_waste`,
    `${wbManufacturingInputTableName}.price`,
    `${wbManufacturingInputTableName}.price_dollar`,
    `${wbManufacturingInputTableName}.ratio`,
    `${wbManufacturingInputTableName}.wast_ratio`,
    `${wbManufacturingInputTableName}.statement`,
    `${wbManufacturingInputOutputTableName}.orders_requisitions_id`,
    `${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_id`,
    `${bussinessmanTableName}.id as manufacturer_id`,
    `${bussinessmanTableName}.name as manufacturer_name`,
  ])
    .from(`${wbManufacturingInputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.id`] = requisitionId;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingRequisitionTableName}.id as requisition_id`,
    `${wbManufacturingRequisitionTableName}.date`,
    `${wbManufacturingRequisitionTableName}.number`,
    `${wbManufacturingRequisitionTableName}.status`,
    `${wbManufacturingRequisitionTableName}.note`,
    `${wbManufacturingRequisitionTableName}.is_order`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.id as consigment_yarn_id`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `${wbManufacturingInputTableName}.id`,
    `${wbManufacturingInputTableName}.quantity`,
    `${wbManufacturingInputTableName}.quantity_with_waste`,
    `${wbManufacturingInputTableName}.price`,
    `${wbManufacturingInputTableName}.price_dollar`,
    `${wbManufacturingInputTableName}.ratio`,
    `${wbManufacturingInputTableName}.wast_ratio`,
    `${wbManufacturingInputTableName}.statement`,
    `${wbManufacturingInputOutputTableName}.orders_requisitions_id`,
    `${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_id`,
    `${bussinessmanTableName}.id as manufacturer_id`,
    `${bussinessmanTableName}.name as manufacturer_name`,
  ])
    .from(`${wbManufacturingInputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wbManufacturingInput, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbManufacturingInputTableName,
      wbManufacturingInput,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectInputQuantitiesByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`] = requisitionId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingInputTableName}.id`,
    `${wbManufacturingInputTableName}.quantity`,
  ])
    .from(`${wbManufacturingInputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingInputOutputTableName)
    .select(
      [
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex
    .select(
      [
        `${wbManufacturingInputTableName}.id`,
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingInputTableName}.wast_ratio`,
        `${wbManufacturingInputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.status`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${wbManufacturingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
        `${wbManufacturingOutputTableName}.quantity as output_quantity`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .from(wbManufacturingInputOutputTableName)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
      `${wbManufacturingOutputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbManufacturingInputTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex.select(
    [
      `${wbManufacturingInputTableName}.price`,
      `${wbManufacturingInputTableName}.price_dollar`,
      `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
      `${wbManufacturingRequisitionTableName}.date`,
      knex.raw('? as type_of_requisition', 'اذن تصنيع'),
      knex.raw('? as input_output', '0'),
    ],
  )
    .from(wbManufacturingInputOutputTableName)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByIndustryByYarnByLot = async (industryId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = industryId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${wbManufacturingInputTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;



  await knex.from(wbManufacturingInputOutputTableName)
    .select(
      [
        `${wbManufacturingInputTableName}.id`,
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingInputTableName}.wast_ratio`,
        `${wbManufacturingInputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.status`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${wbManufacturingRequisitionTableName}.is_order`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
        `${wbManufacturingOutputTableName}.quantity as output_quantity`,
        `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
        `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
      `${wbManufacturingOutputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbManufacturingInputTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingInputOutputTableName)
    .select(
      [
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex
    .select(
      [
        `${wbManufacturingInputTableName}.id`,
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingInputTableName}.wast_ratio`,
        `${wbManufacturingInputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.status`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${wbManufacturingOutputTableName}.quantity as output_quantity`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .from(wbManufacturingInputOutputTableName)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
      `${wbManufacturingOutputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentYarnTableName}`, `${consigmentYarnTableName}.id`, `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .where(`${wbManufacturingRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${wbManufacturingRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectByFabricByConsigmentManufacturing = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;

  await knex
    .select(
      [
        `${wbManufacturingInputTableName}.id`,
        `${wbManufacturingInputTableName}.wast_ratio`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
      ],
    )
    .count(`${wbManufacturingInputTableName}.yarn_id as length`)
    .sum(`${wbManufacturingInputTableName}.quantity as quantity`)
    .sum(`${wbManufacturingInputTableName}.quantity_with_waste as quantity_with_waste`)
    .sum(`${wbManufacturingInputTableName}.price as price`)
    .sum(`${wbManufacturingInputTableName}.price_dollar as price_dollar`)
    .from(wbManufacturingInputOutputTableName)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
      `${wbManufacturingOutputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .groupBy(`${wbManufacturingInputTableName}.yarn_id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentYarnForDyedFabricOrder = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex
    .select(
      [
        `${wbManufacturingInputTableName}.id`,
        `${wbManufacturingInputTableName}.price`,
        `${wbManufacturingInputTableName}.price_dollar`,
        `${wbManufacturingInputTableName}.quantity_with_waste as quantity`,
        `${wbManufacturingInputTableName}.wast_ratio`,
        `${wbManufacturingInputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.status`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${wbManufacturingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
        `${wbManufacturingOutputTableName}.quantity as output_quantity`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .from(wbManufacturingInputOutputTableName)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbManufacturingInputTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`,
      `${wbManufacturingOutputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${wbManufacturingInputTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputTableName}.quantity_with_waste`, ">", 0)
    .whereIn(`${wbManufacturingInputTableName}.consigment_yarn_id`, consigmentsYarn)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};