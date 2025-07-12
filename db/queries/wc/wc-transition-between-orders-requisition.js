// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wcTransitionBetweenOrdersRequisitionTableName, 
  warehouseTableName, 
  wcTransitionBetweenOrdersRequisitionDetailsTableName, 
} = require("../../../util/database-tables-name");

exports.insert = async (wcTransitionBetweenOrdersRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTransitionBetweenOrdersRequisitionTableName, {
      id: wcTransitionBetweenOrdersRequisition.id,
      number: wcTransitionBetweenOrdersRequisition.number,
      date: wcTransitionBetweenOrdersRequisition.date,
      note: wcTransitionBetweenOrdersRequisition.note,
      creator_id: wcTransitionBetweenOrdersRequisition.personid,
      ip_address: wcTransitionBetweenOrdersRequisition.ipaddress,
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
  whereCluse[`${wcTransitionBetweenOrdersRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcTransitionBetweenOrdersRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.number`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.date`,
      `${wcTransitionBetweenOrdersRequisitionTableName}.note`,
    ])
    .from(`${wcTransitionBetweenOrdersRequisitionTableName}`)
    .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`,
  `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`,
  `${wcTransitionBetweenOrdersRequisitionTableName}.id`)
    .where(whereCluse)
    .orderBy(`${wcTransitionBetweenOrdersRequisitionTableName}.number`, 'desc')
    .groupBy(`${wcTransitionBetweenOrdersRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcTransitionBetweenOrdersRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wcTransitionBetweenOrdersRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcTransitionBetweenOrdersRequisitionTableName,
      wcTransitionBetweenOrdersRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
