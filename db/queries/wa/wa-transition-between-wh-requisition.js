// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { waTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  waTransitionBetweenWHRequisitionDetailsTableName, 
  warehouseUsersTableName} = require("../../../util/database-tables-name");

exports.insert = async (waTransitionBetweenWHRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waTransitionBetweenWHRequisitionTableName, {
      id: waTransitionBetweenWHRequisition.id,
      to_warehouse_id: waTransitionBetweenWHRequisition.toWarehouseId,
      number: waTransitionBetweenWHRequisition.number,
      date: waTransitionBetweenWHRequisition.date,
      note: waTransitionBetweenWHRequisition.note,
      creator_id: waTransitionBetweenWHRequisition.personid,
      ip_address: waTransitionBetweenWHRequisition.ipaddress,
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
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionTableName}.number`,
      `${waTransitionBetweenWHRequisitionTableName}.date`,
      `${waTransitionBetweenWHRequisitionTableName}.note`,
      `to_warehouse.name as to_warehouse_name`,
    ])
    .from(`${waTransitionBetweenWHRequisitionTableName}`)
    .innerJoin(`${warehouseTableName} as to_warehouse`,
    `to_warehouse.id`,
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`,
  `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`,
  `${waTransitionBetweenWHRequisitionTableName}.id`)
    .where(whereCluse)
    .orderBy(`${waTransitionBetweenWHRequisitionTableName}.number`, 'desc')
    .groupBy(`${waTransitionBetweenWHRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(waTransitionBetweenWHRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (waTransitionBetweenWHRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waTransitionBetweenWHRequisitionTableName,
      waTransitionBetweenWHRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
