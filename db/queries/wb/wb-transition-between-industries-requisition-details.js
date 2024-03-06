// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionTableName, bussinessmanTableName, yarnTableName, yarnLotTableName, wbTableName, wbTransportRequisitionWbWaDetailsWbTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, consigmentYarnTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbTransitionBetweenIndustriesRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransitionBetweenIndustriesRequisitionDetailsTableName, {
      id: items.wbTransitionBetweenIndustriesRequisitionDetailsId,
      wb_transition_between_industries_requisition_id: wbTransitionBetweenIndustriesRequisitionDetails.id,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      quantity: items.quantity,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wbTransitionBetweenIndustriesRequisitionDetails.personid,
      ip_address: wbTransitionBetweenIndustriesRequisitionDetails.ipaddress,
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
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`] = requisitionId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
    `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
    `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
    `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
    `${yarnTableName}.id as yarn_id`,
    `${yarnTableName}.name as yarn_name`,
    `${yarnTableName}.code as yarn_code`,
    `${yarnLotTableName}.id as yarn_lot_id`,
    `${yarnLotTableName}.code as yarn_lot_code`,
    `${consigmentYarnTableName}.number as consigment_yarn_number`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.document`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
    `${bussinessmanTableName}.id as from_industry_id`,
    `${bussinessmanTableName}.name as from_industry_name`,
    `to_industry.name as to_industry_name`,
    `to_industry.id as to_industry_id`,
    `${wbTableName}.current_quantity`,
  ])
    // .distinct()
    .from(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`)
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${yarnTableName}`,
      `${yarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`,
      `${yarnLotTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`,
      `to_industry.id`,
      `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`,
      `${wbTableName}.industry_id as to_industry_id`,
    ])
    .from(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wbTransitionBetweenIndustriesRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransitionBetweenIndustriesRequisitionDetailsTableName,
      wbTransitionBetweenIndustriesRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectFromIndustryTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .distinct(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryTotalByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromIndustryTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryTotalDetailsByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromIndustryDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
        whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryDetailsByIndustryByYarnByLot = async (manufacturerId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
          whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromIndustryDetailsDetailsByIndustryByYarnByLot = async (industryId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`] = industryId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
        whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryDetailsDetailsByIndustryByYarnByLot = async (industryId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = industryId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
          whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectFromIndustryPriceByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryPriceByYarnIdByIndustryId = async (yarnId, manufacturerId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTableName}.industry_id`] = manufacturerId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromIndustryTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${wbTransitionBetweenIndustriesRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wbTransitionBetweenIndustriesRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToIndustryTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbTransitionBetweenIndustriesRequisitionDetailsTableName)
    .select(
      [
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.statement`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.id as requisition_id`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
        `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المصانع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_industry.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
    .innerJoin(`${wbTableName}`,
      `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${yarnLotTableName}`, `${yarnLotTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`, `to_industry.id`, `${wbTableName}.industry_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${wbTransitionBetweenIndustriesRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${wbTransitionBetweenIndustriesRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};