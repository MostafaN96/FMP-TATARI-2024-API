// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wcTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  wcTransitionBetweenWHRequisitionDetailsTableName, 
} = require("../../../util/database-tables-name");

exports.insert = async (wcTransitionBetweenWHRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTransitionBetweenWHRequisitionTableName, {
      id: wcTransitionBetweenWHRequisition.id,
      to_warehouse_id: wcTransitionBetweenWHRequisition.toWarehouseId,
      number: wcTransitionBetweenWHRequisition.number,
      date: wcTransitionBetweenWHRequisition.date,
      note: wcTransitionBetweenWHRequisition.note,
      creator_id: wcTransitionBetweenWHRequisition.personid,
      ip_address: wcTransitionBetweenWHRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.select = async (userId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wcTransitionBetweenWHRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenWHRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wcTransitionBetweenWHRequisitionTableName}.id`,
      `${wcTransitionBetweenWHRequisitionTableName}.number`,
      `${wcTransitionBetweenWHRequisitionTableName}.date`,
      `${wcTransitionBetweenWHRequisitionTableName}.note`,
      `to_warehouse.name as to_warehouse_name`,
    ])
    .from(`${wcTransitionBetweenWHRequisitionTableName}`)
    .innerJoin(`${warehouseTableName} as to_warehouse`,
    `to_warehouse.id`,
    `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
  `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`,
  `${wcTransitionBetweenWHRequisitionTableName}.id`)
    .where(whereCluse)
    .orderBy(`${wcTransitionBetweenWHRequisitionTableName}.number`, 'desc')
    .groupBy(`${wcTransitionBetweenWHRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcTransitionBetweenWHRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcTransitionBetweenWHRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcTransitionBetweenWHRequisitionTableName,
      wcTransitionBetweenWHRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
