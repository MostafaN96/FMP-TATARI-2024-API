// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const { weReconciliationRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (weReconciliationRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weReconciliationRequisitionTableName, {
      id: weReconciliationRequisition.id,
      number: weReconciliationRequisition.number,
      date: weReconciliationRequisition.date,
      note: weReconciliationRequisition.note,
      creator_id: weReconciliationRequisition.personid,
      ip_address: weReconciliationRequisition.ipaddress,
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
    .limitedSelect(weReconciliationRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${weReconciliationRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weReconciliationRequisitionTableName}.is_active`] = 1;

  await knex(`${weReconciliationRequisitionTableName}`)
  .select([
    `${weReconciliationRequisitionTableName}.id`,
    `${weReconciliationRequisitionTableName}.number`,
    `${weReconciliationRequisitionTableName}.date`,
    `${weReconciliationRequisitionTableName}.note`,
    `${weReconciliationRequisitionTableName}.creator_id`,
  ])
  .where(whereCluse)
  .orderBy(`${weReconciliationRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (weReconciliationRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weReconciliationRequisitionTableName,
      weReconciliationRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};