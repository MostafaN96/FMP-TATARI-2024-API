// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weExecuteOrderRequisitionTableName,
  warehouseTableName,
  weExecuteOrderRequisitionDetailsTableName,
  weDyedFabricOrderRequisitionTableName,
} = require("../../../util/database-tables-name");

exports.insert = async (weExecuteOrderRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weExecuteOrderRequisitionTableName, {
      id: weExecuteOrderRequisition.id,
      warehouse_id: weExecuteOrderRequisition.warehouseId,
      we_dyed_fabric_order_requisition_id: weExecuteOrderRequisition.weDyedFabricOrderRequisitionId,
      number: weExecuteOrderRequisition.number,
      date: weExecuteOrderRequisition.date,
      note: weExecuteOrderRequisition.note,
      creator_id: weExecuteOrderRequisition.personid,
      ip_address: weExecuteOrderRequisition.ipaddress,
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
  whereCluse[`${weExecuteOrderRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weExecuteOrderRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${weExecuteOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionTableName}.number`,
      `${weExecuteOrderRequisitionTableName}.date`,
      `${weExecuteOrderRequisitionTableName}.note`,
      `${warehouseTableName}.name as warehouse_name`,
      `${weDyedFabricOrderRequisitionTableName}.id as dyed_fabric_order_id`,
      `${weDyedFabricOrderRequisitionTableName}.name as dyed_fabric_order_name`,
    ])
    .from(`${weExecuteOrderRequisitionTableName}`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
      `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`,
      `${weExecuteOrderRequisitionTableName}.id`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
      `${weDyedFabricOrderRequisitionTableName}.id`,
      `${weExecuteOrderRequisitionTableName}.we_dyed_fabric_order_requisition_id`)
    .where(whereCluse)
    .orderBy(`${weExecuteOrderRequisitionTableName}.number`, 'desc')
    .groupBy(`${weExecuteOrderRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(weExecuteOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weExecuteOrderRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weExecuteOrderRequisitionTableName,
      weExecuteOrderRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
