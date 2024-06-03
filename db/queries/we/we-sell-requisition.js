// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { warehouseTableName, weSellRequisitionTableName, 
  bussinessmanTableName, deliveryCarTableName } = require("../../../util/database-tables-name");

exports.insert = async (weSellRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weSellRequisitionTableName, {
      id: weSellRequisition.id,
      seller_id: weSellRequisition.sellerId,
      delivery_car_id: weSellRequisition.deliveryCarId,
      number: weSellRequisition.number,
      date: weSellRequisition.date,
      note: weSellRequisition.note,
      creator_id: weSellRequisition.personid,
      ip_address: weSellRequisition.ipaddress,
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
    .limitedSelect(weSellRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${weSellRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionTableName}.is_active`] = 1;
  whereCluse[`${weSellRequisitionTableName}.is_direct`] = 0;

  await knex(`${weSellRequisitionTableName}`)
  .select([
    `${weSellRequisitionTableName}.id`,
    `${weSellRequisitionTableName}.number`,
    `${weSellRequisitionTableName}.date`,
    `${weSellRequisitionTableName}.note`,
    `${weSellRequisitionTableName}.is_direct`,
    `${bussinessmanTableName}.name as seller_name`,
    knex.raw(`CONCAT(${deliveryCarTableName}.drivers_name, 
      ' (', ${deliveryCarTableName}.plate_number, ') 
      ', ${deliveryCarTableName}.national_id) as delivery_car_name`)
  ])
  .innerJoin(`${bussinessmanTableName}`,
  `${bussinessmanTableName}.id`,
  `${weSellRequisitionTableName}.seller_id`)
  .leftOuterJoin(`${deliveryCarTableName}`,
  `${deliveryCarTableName}.id`,
  `${weSellRequisitionTableName}.delivery_car_id`)
  .where(whereCluse)
  .orderBy(`${weSellRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (weSellRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weSellRequisitionTableName,
      weSellRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};