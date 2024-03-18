// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  weTransitionBetweenWHRequisitionDetailsTableName, 
  weTransitionBetweenWHRequisitionDetailsWeTableName,
  weTableName, 
  warehouseUsersTableName} = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenWHRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weTransitionBetweenWHRequisitionTableName, {
      id: weTransitionBetweenWHRequisition.id,
      to_warehouse_id: weTransitionBetweenWHRequisition.toWarehouseId,
      number: weTransitionBetweenWHRequisition.number,
      date: weTransitionBetweenWHRequisition.date,
      note: weTransitionBetweenWHRequisition.note,
      creator_id: weTransitionBetweenWHRequisition.personid,
      ip_address: weTransitionBetweenWHRequisition.ipaddress,
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
  whereCluse[`${weTransitionBetweenWHRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionTableName}.number`,
      `${weTransitionBetweenWHRequisitionTableName}.date`,
      `${weTransitionBetweenWHRequisitionTableName}.note`,
      `to_warehouse.name as to_warehouse_name`,
    ])
    .from(`${weTransitionBetweenWHRequisitionTableName}`)
    .innerJoin(`${warehouseTableName} as to_warehouse`,
    `to_warehouse.id`,
    `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
  `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`,
  `${weTransitionBetweenWHRequisitionTableName}.id`)
    .where(whereCluse)
    .orderBy(`${weTransitionBetweenWHRequisitionTableName}.number`, 'desc')
    .groupBy(`${weTransitionBetweenWHRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(weTransitionBetweenWHRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weTransitionBetweenWHRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTransitionBetweenWHRequisitionTableName,
      weTransitionBetweenWHRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
