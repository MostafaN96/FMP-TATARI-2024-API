// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { warehouseTableName, bussinessmanTableName, wdTransportRequisitionWdWcTableName, wdTransportRequisitionWdWcDetailsTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdTransportRequisitionWdWc) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransportRequisitionWdWcTableName, {
      id: wdTransportRequisitionWdWc.id,
      dyeing_id: wdTransportRequisitionWdWc.dyeingId,
      warehouse_id: wdTransportRequisitionWdWc.warehouseId,
      number: wdTransportRequisitionWdWc.number,
      date: wdTransportRequisitionWdWc.date,
      note: wdTransportRequisitionWdWc.note,
      creator_id: wdTransportRequisitionWdWc.personid,
      ip_address: wdTransportRequisitionWdWc.ipaddress,
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
    .limitedSelect(wdTransportRequisitionWdWcTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wdTransportRequisitionWdWcTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportRequisitionWdWcTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdTransportRequisitionWdWcTableName}.id`,
      `${wdTransportRequisitionWdWcTableName}.number`,
      `${wdTransportRequisitionWdWcTableName}.date`,
      `${wdTransportRequisitionWdWcTableName}.note`,
      `${warehouseTableName}.name as warehouse_name`,
      `${bussinessmanTableName}.name as dyeing_name`,
    ])
    .from(`${wdTransportRequisitionWdWcTableName}`)
    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
    `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`,
    `${wdTransportRequisitionWdWcTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdTransportRequisitionWdWcTableName}.dyeing_id`)
    .where(whereCluse)
    .orderBy(`${wdTransportRequisitionWdWcTableName}.number`, 'desc')
    .groupBy(`${wdTransportRequisitionWdWcTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wdTransportRequisitionWdWc, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransportRequisitionWdWcTableName,
      wdTransportRequisitionWdWc,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};