// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wbTransportWaWbDetailsTableName, wbTransportWaWbTableName, warehouseTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbTransportWaWb) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransportWaWbTableName, {
      id: wbTransportWaWb.id,
      warehouse_id: wbTransportWaWb.warehouseId,
      number: wbTransportWaWb.number,
      date: wbTransportWaWb.date,
      note: wbTransportWaWb.note,
      creator_id: wbTransportWaWb.personid,
      ip_address: wbTransportWaWb.ipaddress,
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
    .limitedSelect(wbTransportWaWbTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wbTransportWaWbTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportWaWbTableName}.is_active`] = 1;

  await knex
    .select([
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbTableName}.number`,
      `${wbTransportWaWbTableName}.date`,
      `${wbTransportWaWbTableName}.note`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
    ])
    .from(`${wbTransportWaWbTableName}`)
    .innerJoin(`${wbTransportWaWbDetailsTableName}`,
    `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
    `${wbTransportWaWbTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wbTransportWaWbTableName}.warehouse_id`)
    .where(whereCluse)
    .orderBy(`${wbTransportWaWbTableName}.number`, 'desc')
    .groupBy(`${wbTransportWaWbTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wbTransportWaWb, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransportWaWbTableName,
      wbTransportWaWb,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};