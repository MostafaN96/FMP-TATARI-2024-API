// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weTransitionBetweenOrdersRequisitionTableName, 
  warehouseTableName, 
  weTransitionBetweenOrdersRequisitionDetailsTableName, 
  weTransitionBetweenWHRequisitionDetailsWeTableName,
  weTableName, 
  warehouseUsersTableName} = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenOrdersRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weTransitionBetweenOrdersRequisitionTableName, {
      id: weTransitionBetweenOrdersRequisition.id,
      number: weTransitionBetweenOrdersRequisition.number,
      date: weTransitionBetweenOrdersRequisition.date,
      note: weTransitionBetweenOrdersRequisition.note,
      creator_id: weTransitionBetweenOrdersRequisition.personid,
      ip_address: weTransitionBetweenOrdersRequisition.ipaddress,
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
  whereCluse[`${weTransitionBetweenOrdersRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenOrdersRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${weTransitionBetweenOrdersRequisitionTableName}.id`,
      `${weTransitionBetweenOrdersRequisitionTableName}.number`,
      `${weTransitionBetweenOrdersRequisitionTableName}.date`,
      `${weTransitionBetweenOrdersRequisitionTableName}.note`,
    ])
    .from(`${weTransitionBetweenOrdersRequisitionTableName}`)
    .innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName}`,
  `${weTransitionBetweenOrdersRequisitionDetailsTableName}.we_transition_between_orders_requisitions_id`,
  `${weTransitionBetweenOrdersRequisitionTableName}.id`)
    .where(whereCluse)
    .orderBy(`${weTransitionBetweenOrdersRequisitionTableName}.number`, 'desc')
    .groupBy(`${weTransitionBetweenOrdersRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(weTransitionBetweenOrdersRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weTransitionBetweenOrdersRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTransitionBetweenOrdersRequisitionTableName,
      weTransitionBetweenOrdersRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
