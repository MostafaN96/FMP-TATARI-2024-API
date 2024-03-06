// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wdReconciliationRequisitionTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wdReconciliationRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wdReconciliationRequisitionTableName, {
      id: wdReconciliationRequisition.id,
      dyeing_id: wdReconciliationRequisition.dyeingId,
      number: wdReconciliationRequisition.number,
      date: wdReconciliationRequisition.date,
      note: wdReconciliationRequisition.note,
      creator_id: wdReconciliationRequisition.personid,
      ip_address: wdReconciliationRequisition.ipaddress,
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
  await sqlFun
    .limitedSelect(wdReconciliationRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdReconciliationRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdReconciliationRequisitionTableName}.is_active`] = 1;

  await knex(`${wdReconciliationRequisitionTableName}`)
  .select([
    `${wdReconciliationRequisitionTableName}.id`,
    `${wdReconciliationRequisitionTableName}.number`,
    `${wdReconciliationRequisitionTableName}.date`,
    `${wdReconciliationRequisitionTableName}.note`,
    `${wdReconciliationRequisitionTableName}.creator_id`,
    `${bussinessmanTableName}.name as dyeing_name`,
  ])
  .innerJoin(`${bussinessmanTableName}`,
  `${bussinessmanTableName}.id`,
  `${wdReconciliationRequisitionTableName}.dyeing_id`)
  .where(whereCluse)
  .orderBy(`${wdReconciliationRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wdReconciliationRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdReconciliationRequisitionTableName,
      wdReconciliationRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};