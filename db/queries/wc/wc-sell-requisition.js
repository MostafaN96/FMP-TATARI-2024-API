// Config
const { warehouseTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wcSellRequisitionTableName = require("../../../util/database-tables-name").wcSellRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wcSellRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcSellRequisitionTableName, {
      id: wcSellRequisition.id,
      seller_id: wcSellRequisition.sellerId,
      warehouse_id: wcSellRequisition.warehouseId,
      number: wcSellRequisition.number,
      date: wcSellRequisition.date,
      note: wcSellRequisition.note,
      creator_id: wcSellRequisition.personid,
      ip_address: wcSellRequisition.ipaddress,
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
    .limitedSelect(wcSellRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wcSellRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcSellRequisitionTableName}.is_active`] = 1;

  await knex(`${wcSellRequisitionTableName}`)
  .select([
    `${wcSellRequisitionTableName}.id`,
    `${wcSellRequisitionTableName}.number`,
    `${wcSellRequisitionTableName}.date`,
    `${wcSellRequisitionTableName}.note`,
    `${bussinessmanTableName}.name as seller_name`,
    `${warehouseTableName}.name as warehouse_name`,
  ])
  .innerJoin(`${bussinessmanTableName}`,
  `${bussinessmanTableName}.id`,
  `${wcSellRequisitionTableName}.seller_id`)
  .innerJoin(`${warehouseTableName}`,
  `${warehouseTableName}.id`,
  `${wcSellRequisitionTableName}.warehouse_id`)
  .where(whereCluse)
  .orderBy(`${wcSellRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wcSellRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcSellRequisitionTableName,
      wcSellRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};