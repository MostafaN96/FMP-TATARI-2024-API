// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { waExecuteOrderRequisitionTableName,
  warehouseTableName,
  waExecuteOrderRequisitionDetailsTableName,
  waYarnOrderRequisitionTableName,
} = require("../../../util/database-tables-name");

exports.insert = async (waExecuteOrderRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waExecuteOrderRequisitionTableName, {
      id: waExecuteOrderRequisition.id,
      warehouse_id: waExecuteOrderRequisition.warehouseId,
      wa_yarn_order_requisition_id: waExecuteOrderRequisition.waYarnOrderRequisitionId,
      number: waExecuteOrderRequisition.number,
      date: waExecuteOrderRequisition.date,
      note: waExecuteOrderRequisition.note,
      creator_id: waExecuteOrderRequisition.personid,
      ip_address: waExecuteOrderRequisition.ipaddress,
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
  whereCluse[`${waExecuteOrderRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waExecuteOrderRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${waExecuteOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionTableName}.number`,
      `${waExecuteOrderRequisitionTableName}.date`,
      `${waExecuteOrderRequisitionTableName}.note`,
      `${warehouseTableName}.name as warehouse_name`,
      `${waYarnOrderRequisitionTableName}.id as yarn_order_id`,
      `${waYarnOrderRequisitionTableName}.name as yarn_order_name`,
    ])
    .from(`${waExecuteOrderRequisitionTableName}`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${waExecuteOrderRequisitionTableName}.warehouse_id`)
    .innerJoin(`${waExecuteOrderRequisitionDetailsTableName}`,
      `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`,
      `${waExecuteOrderRequisitionTableName}.id`)
      .innerJoin(`${waYarnOrderRequisitionTableName}`,
      `${waYarnOrderRequisitionTableName}.id`,
      `${waExecuteOrderRequisitionTableName}.wa_yarn_order_requisition_id`)
    .where(whereCluse)
    .orderBy(`${waExecuteOrderRequisitionTableName}.number`, 'desc')
    .groupBy(`${waExecuteOrderRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(waExecuteOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (waExecuteOrderRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waExecuteOrderRequisitionTableName,
      waExecuteOrderRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
