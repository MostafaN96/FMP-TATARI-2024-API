// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbReconciliationRequisitionTableName = require("../../../util/database-tables-name").wbReconciliationRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wbReconciliationRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wbReconciliationRequisitionTableName, {
      id: wbReconciliationRequisition.id,
      industry_id: wbReconciliationRequisition.industryId,
      number: wbReconciliationRequisition.number,
      date: wbReconciliationRequisition.date,
      note: wbReconciliationRequisition.note,
      creator_id: wbReconciliationRequisition.personid,
      ip_address: wbReconciliationRequisition.ipaddress,
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
    .limitedSelect(wbReconciliationRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wbReconciliationRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbReconciliationRequisitionTableName}.is_active`] = 1;

  await knex(`${wbReconciliationRequisitionTableName}`)
  .select([
    `${wbReconciliationRequisitionTableName}.id`,
    `${wbReconciliationRequisitionTableName}.number`,
    `${wbReconciliationRequisitionTableName}.date`,
    `${wbReconciliationRequisitionTableName}.note`,
    `${wbReconciliationRequisitionTableName}.creator_id`,
    `${bussinessmanTableName}.name as industry_name`,
  ])
  .innerJoin(`${bussinessmanTableName}`,
  `${bussinessmanTableName}.id`,
  `${wbReconciliationRequisitionTableName}.industry_id`)
  .where(whereCluse)
  .orderBy(`${wbReconciliationRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wbReconciliationRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbReconciliationRequisitionTableName,
      wbReconciliationRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
