// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waReconciliationRequisitionTableName = require("../../../util/database-tables-name").waReconciliationRequisitionTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;

exports.insert = async (waReconciliationRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waReconciliationRequisitionTableName, {
      id: waReconciliationRequisition.id,
      warehouse_id: waReconciliationRequisition.warehouseId,
      number: waReconciliationRequisition.number,
      date: waReconciliationRequisition.date,
      note: waReconciliationRequisition.note,
      creator_id: waReconciliationRequisition.personid,
      ip_address: waReconciliationRequisition.ipaddress,
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
    .limitedSelect(waReconciliationRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${waReconciliationRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waReconciliationRequisitionTableName}.is_active`] = 1;

  await knex(`${waReconciliationRequisitionTableName}`)
  .select([
    `${waReconciliationRequisitionTableName}.id`,
    `${waReconciliationRequisitionTableName}.number`,
    `${waReconciliationRequisitionTableName}.date`,
    `${waReconciliationRequisitionTableName}.note`,
    `${waReconciliationRequisitionTableName}.creator_id`,
    `${warehouseTableName}.name as warehouse_name`,
  ])
  .innerJoin(`${warehouseTableName}`,
  `${warehouseTableName}.id`,
  `${waReconciliationRequisitionTableName}.warehouse_id`)
  .where(whereCluse)
  .orderBy(`${waReconciliationRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (waReconciliationRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waReconciliationRequisitionTableName,
      waReconciliationRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};