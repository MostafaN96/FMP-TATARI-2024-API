// Config
const { warehouseTableName, bussinessmanTableName, wbTransportRequisitionWbWaDetailsTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbTransportRequisitionWbWaTableName = require("../../../util/database-tables-name").wbTransportRequisitionWbWaTableName;

exports.insert = async (wbTransportRequisitionWbWa) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTransportRequisitionWbWaTableName, {
      id: wbTransportRequisitionWbWa.id,
      industry_id: wbTransportRequisitionWbWa.industryId,
      warehouse_id: wbTransportRequisitionWbWa.warehouseId,
      number: wbTransportRequisitionWbWa.number,
      date: wbTransportRequisitionWbWa.date,
      note: wbTransportRequisitionWbWa.note,
      creator_id: wbTransportRequisitionWbWa.personid,
      ip_address: wbTransportRequisitionWbWa.ipaddress,
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
    .limitedSelect(wbTransportRequisitionWbWaTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wbTransportRequisitionWbWaTableName}.is_deleted`] = 0;
  whereCluse[`${wbTransportRequisitionWbWaTableName}.is_active`] = 1;

  await knex
    .select([
      `${wbTransportRequisitionWbWaTableName}.id`,
      `${wbTransportRequisitionWbWaTableName}.number`,
      `${wbTransportRequisitionWbWaTableName}.date`,
      `${wbTransportRequisitionWbWaTableName}.note`,
      `${warehouseTableName}.name as warehouse_name`,
      `${bussinessmanTableName}.name as industry_name`,
    ])
    .from(`${wbTransportRequisitionWbWaTableName}`)
    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
    `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`,
    `${wbTransportRequisitionWbWaTableName}.id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wbTransportRequisitionWbWaTableName}.industry_id`)
    .where(whereCluse)
    .orderBy(`${wbTransportRequisitionWbWaTableName}.number`, 'desc')
    .groupBy(`${wbTransportRequisitionWbWaTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wbTransportRequisitionWbWa, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTransportRequisitionWbWaTableName,
      wbTransportRequisitionWbWa,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};