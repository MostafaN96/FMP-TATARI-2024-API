// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const { wcReconciliationRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wcReconciliationRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcReconciliationRequisitionTableName, {
      id: wcReconciliationRequisition.id,
      warehouse_id: wcReconciliationRequisition.warehouseId,
      number: wcReconciliationRequisition.number,
      date: wcReconciliationRequisition.date,
      note: wcReconciliationRequisition.note,
      creator_id: wcReconciliationRequisition.personid,
      ip_address: wcReconciliationRequisition.ipaddress,
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
    .limitedSelect(wcReconciliationRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wcReconciliationRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcReconciliationRequisitionTableName}.is_active`] = 1;

  await knex(`${wcReconciliationRequisitionTableName}`)
  .select([
    `${wcReconciliationRequisitionTableName}.id`,
    `${wcReconciliationRequisitionTableName}.number`,
    `${wcReconciliationRequisitionTableName}.date`,
    `${wcReconciliationRequisitionTableName}.note`,
    `${wcReconciliationRequisitionTableName}.creator_id`,
    `${warehouseTableName}.name as warehouse_name`,
  ])
  .innerJoin(`${warehouseTableName}`,
  `${warehouseTableName}.id`,
  `${wcReconciliationRequisitionTableName}.warehouse_id`)
  .where(whereCluse)
  .orderBy(`${wcReconciliationRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wcReconciliationRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcReconciliationRequisitionTableName,
      wcReconciliationRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};