// Config
const { warehouseTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waSellRequisitionTableName = require("../../../util/database-tables-name").waSellRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (waSellRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waSellRequisitionTableName, {
      id: waSellRequisition.id,
      seller_id: waSellRequisition.sellerId,
      warehouse_id: waSellRequisition.warehouseId,
      number: waSellRequisition.number,
      date: waSellRequisition.date,
      note: waSellRequisition.note,
      creator_id: waSellRequisition.personid,
      ip_address: waSellRequisition.ipaddress,
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
    .limitedSelect(waSellRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${waSellRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waSellRequisitionTableName}.is_active`] = 1;

  await knex(`${waSellRequisitionTableName}`)
  .select([
    `${waSellRequisitionTableName}.id`,
    `${waSellRequisitionTableName}.number`,
    `${waSellRequisitionTableName}.date`,
    `${waSellRequisitionTableName}.note`,
    `${bussinessmanTableName}.name as seller_name`,
    `${warehouseTableName}.name as warehouse_name`,
  ])
  .innerJoin(`${bussinessmanTableName}`,
  `${bussinessmanTableName}.id`,
  `${waSellRequisitionTableName}.seller_id`)
  .innerJoin(`${warehouseTableName}`,
  `${warehouseTableName}.id`,
  `${waSellRequisitionTableName}.warehouse_id`)
  .where(whereCluse)
  .orderBy(`${waSellRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (waSellRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waSellRequisitionTableName,
      waSellRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};