// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdTransitionBetweenDyersRequisitionTableName, bussinessmanTableName, wdTransitionBetweenDyersRequisitionDetailsTableName, wdTransitionBetweenDyersRequisitionDetailsWdTableName, wdTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdTransitionBetweenDyersRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransitionBetweenDyersRequisitionTableName, {
      id: wdTransitionBetweenDyersRequisition.id,
      dyeing_id: wdTransitionBetweenDyersRequisition.fromDyeingId,
      number: wdTransitionBetweenDyersRequisition.number,
      date: wdTransitionBetweenDyersRequisition.date,
      note: wdTransitionBetweenDyersRequisition.note,
      creator_id: wdTransitionBetweenDyersRequisition.personid,
      ip_address: wdTransitionBetweenDyersRequisition.ipaddress,
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
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransitionBetweenDyersRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdTransitionBetweenDyersRequisitionTableName}.id`,
      `${wdTransitionBetweenDyersRequisitionTableName}.number`,
      `${wdTransitionBetweenDyersRequisitionTableName}.date`,
      `${wdTransitionBetweenDyersRequisitionTableName}.note`,
      `${bussinessmanTableName}.name as from_dyeing_name`,
      `to_dyeing.name as to_dyeing_name`,
    ])
    .from(`${wdTransitionBetweenDyersRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id`)
    .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`,
    `${wdTransitionBetweenDyersRequisitionTableName}.id`)
    .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsWdTableName}`,
    `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_transition_between_dyers_requisition_details_id`,
    `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
    .innerJoin(`${wdTableName}`,
    `${wdTableName}.id`,
    `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_id`)
    .innerJoin(`${bussinessmanTableName} as to_dyeing`,
    `to_dyeing.id`,
    `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .orderBy(`${wdTransitionBetweenDyersRequisitionTableName}.number`, 'desc')
    .groupBy(`${wdTransitionBetweenDyersRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wdTransitionBetweenDyersRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdTransitionBetweenDyersRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransitionBetweenDyersRequisitionTableName,
      wdTransitionBetweenDyersRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
