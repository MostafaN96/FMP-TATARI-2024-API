// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wbTransitionBetweenIndustriesRequisitionTableName, bussinessmanTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, wbTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbTransitionBetweenIndustriesRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransitionBetweenIndustriesRequisitionTableName, {
      id: wbTransitionBetweenIndustriesRequisition.id,
      industry_id: wbTransitionBetweenIndustriesRequisition.fromIndustryId,
      number: wbTransitionBetweenIndustriesRequisition.number,
      date: wbTransitionBetweenIndustriesRequisition.date,
      note: wbTransitionBetweenIndustriesRequisition.note,
      creator_id: wbTransitionBetweenIndustriesRequisition.personid,
      ip_address: wbTransitionBetweenIndustriesRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransitionBetweenIndustriesRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.number`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
      `${wbTransitionBetweenIndustriesRequisitionTableName}.note`,
      `${bussinessmanTableName}.name as from_industry_name`,
      `to_industry.name as to_industry_name`,
    ])
    .from(`${wbTransitionBetweenIndustriesRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wbTransitionBetweenIndustriesRequisitionTableName}.industry_id`)
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`,
    `${wbTransitionBetweenIndustriesRequisitionTableName}.id`)
    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
    .innerJoin(`${wbTableName}`,
    `${wbTableName}.id`,
    `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_id`)
    .innerJoin(`${bussinessmanTableName} as to_industry`,
    `to_industry.id`,
    `${wbTableName}.industry_id`)
    .where(whereCluse)
    .orderBy(`${wbTransitionBetweenIndustriesRequisitionTableName}.number`, 'desc')
    .groupBy(`${wbTransitionBetweenIndustriesRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wbTransitionBetweenIndustriesRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wbTransitionBetweenIndustriesRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransitionBetweenIndustriesRequisitionTableName,
      wbTransitionBetweenIndustriesRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
