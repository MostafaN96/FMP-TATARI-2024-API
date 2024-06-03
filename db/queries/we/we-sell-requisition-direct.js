// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weSellRequisitionTableName, 
  bussinessmanTableName, deliveryCarTableName, weSellRequisitionDirectDetailsTableName } = require("../../../util/database-tables-name");

exports.insert = async (weSellRequisitionDirect) => {
  let queryResults = false;
  await sqlFun
    .insert(weSellRequisitionTableName, {
      id: weSellRequisitionDirect.id,
      seller_id: weSellRequisitionDirect.sellerId,
      delivery_car_id: weSellRequisitionDirect.deliveryCarId,
      number: weSellRequisitionDirect.number,
      date: weSellRequisitionDirect.date,
      note: weSellRequisitionDirect.note,
      is_direct: "1",
      creator_id: weSellRequisitionDirect.personid,
      ip_address: weSellRequisitionDirect.ipaddress,
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
  .whereIn(`${weSellRequisitionTableName}.id`, function() {
    this.select(`${weSellRequisitionDirectDetailsTableName}.we_sell_requisition_id`)
    .from(`${weSellRequisitionDirectDetailsTableName}`)
    .where(`${weSellRequisitionDirectDetailsTableName}.is_direct`, "1")
    .andWhere(`${weSellRequisitionDirectDetailsTableName}.quantity`, ">", "0")
  })
  .orderBy(`${weSellRequisitionTableName}.number`, 'desc')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (weSellRequisitionDirect, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weSellRequisitionTableName,
      weSellRequisitionDirect,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};