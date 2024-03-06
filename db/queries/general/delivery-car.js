// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const deliveryCarTableName = require("../../../util/database-tables-name").deliveryCarTableName;

exports.insert = async (deliveryCar) => {
  let queryResults = false;
  await sqlFun
    .insert(deliveryCarTableName, {
      id: deliveryCar.id,
      model: deliveryCar.model,
      plate_number: deliveryCar.plateNumber,
      drivers_name: deliveryCar.driversName,
      phone: deliveryCar.phone,
      national_id: deliveryCar.nationalId,
      creator_id: deliveryCar.personid,
      ip_address: deliveryCar.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (deliveryCar) => {
  let queryResults = false;
  await sqlFun
    .update(
      deliveryCarTableName,
      {
        model: deliveryCar.model,
        plate_number: deliveryCar.plateNumber,
        drivers_name: deliveryCar.driversName,
        phone: deliveryCar.phone,
        national_id: deliveryCar.nationalId
      },
      {
        id: deliveryCar.id,
      }
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(deliveryCarTableName, [
      `${deliveryCarTableName}.id`,
      `${deliveryCarTableName}.model`,
      `${deliveryCarTableName}.plate_number`,
      `${deliveryCarTableName}.drivers_name`,
      `${deliveryCarTableName}.phone`,
      `${deliveryCarTableName}.national_id`,
    ], whereCluse, 1)
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
  await sqlFun
    .select(
      deliveryCarTableName,
      [
        `${deliveryCarTableName}.id`,
        `${deliveryCarTableName}.model`,
        `${deliveryCarTableName}.plate_number`,
        `${deliveryCarTableName}.drivers_name`,
        `${deliveryCarTableName}.phone`,
        `${deliveryCarTableName}.national_id`,
        knex.raw(`CONCAT(drivers_name, ' (', plate_number, ') ', national_id) as name`)
      ],
      {
        is_deleted: "0",
        is_active: "1",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectDeleted = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      deliveryCarTableName,
      [
        `${deliveryCarTableName}.id`,
        `${deliveryCarTableName}.model`,
        `${deliveryCarTableName}.plate_number`,
        `${deliveryCarTableName}.drivers_name`,
        `${deliveryCarTableName}.phone`,
        `${deliveryCarTableName}.national_id`,
        knex.raw(`CONCAT(drivers_name, ' (', plate_number, ') ', national_id) as name`)
      ],
      {
        is_deleted: "1",
        is_active: "0",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.delete = async (deliveryCarId) => {
  let queryResults = false;
  await sqlFun
    .delete(deliveryCarTableName, {
      id: deliveryCarId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (deliveryCarId) => {
  let queryResults = false;
  await sqlFun
    .restore(deliveryCarTableName, {
      id: deliveryCarId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
