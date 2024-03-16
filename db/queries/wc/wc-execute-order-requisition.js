// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wcExecuteOrderRequisitionTableName,
  warehouseTableName,
  wcExecuteOrderRequisitionDetailsTableName,
  wcFabricOrderRequisitionTableName,
} = require("../../../util/database-tables-name");

exports.insert = async (wcExecuteOrderRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcExecuteOrderRequisitionTableName, {
      id: wcExecuteOrderRequisition.id,
      warehouse_id: wcExecuteOrderRequisition.warehouseId,
      wc_fabric_order_requisition_id: wcExecuteOrderRequisition.wcFabricOrderRequisitionId,
      number: wcExecuteOrderRequisition.number,
      date: wcExecuteOrderRequisition.date,
      note: wcExecuteOrderRequisition.note,
      creator_id: wcExecuteOrderRequisition.personid,
      ip_address: wcExecuteOrderRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcExecuteOrderRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcExecuteOrderRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wcExecuteOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionTableName}.number`,
      `${wcExecuteOrderRequisitionTableName}.date`,
      `${wcExecuteOrderRequisitionTableName}.note`,
      `${warehouseTableName}.name as warehouse_name`,
      `${wcFabricOrderRequisitionTableName}.id as fabric_order_id`,
      `${wcFabricOrderRequisitionTableName}.name as fabric_order_name`,
    ])
    .from(`${wcExecuteOrderRequisitionTableName}`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
      `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`,
      `${wcExecuteOrderRequisitionTableName}.id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wcExecuteOrderRequisitionTableName}.wc_fabric_order_requisition_id`)
    .where(whereCluse)
    .orderBy(`${wcExecuteOrderRequisitionTableName}.number`, 'desc')
    .groupBy(`${wcExecuteOrderRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcExecuteOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcExecuteOrderRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcExecuteOrderRequisitionTableName,
      wcExecuteOrderRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
