// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdTransportWcWdDetailsTableName, wdTransportWcWdTableName, warehouseTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdTransportWcWd) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransportWcWdTableName, {
      id: wdTransportWcWd.id,
      warehouse_id: wdTransportWcWd.warehouseId,
      number: wdTransportWcWd.number,
      date: wdTransportWcWd.date,
      note: wdTransportWcWd.note,
      creator_id: wdTransportWcWd.personid,
      ip_address: wdTransportWcWd.ipaddress,
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
    .limitedSelect(wdTransportWcWdTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wdTransportWcWdTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdTableName}.number`,
      `${wdTransportWcWdTableName}.date`,
      `${wdTransportWcWdTableName}.note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
    ])
    .from(`${wdTransportWcWdTableName}`)
    .innerJoin(`${wdTransportWcWdDetailsTableName}`,
    `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
    `${wdTransportWcWdTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wdTransportWcWdTableName}.warehouse_id`)
    .where(whereCluse)
    .orderBy(`${wdTransportWcWdTableName}.number`, 'desc')
    .groupBy(`${wdTransportWcWdTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wdTransportWcWd, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransportWcWdTableName,
      wdTransportWcWd,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};