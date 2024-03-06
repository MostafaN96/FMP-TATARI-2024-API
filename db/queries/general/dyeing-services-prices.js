// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const anointedServicesPricesTableName = require("../../../util/database-tables-name").anointedServicesPricesTableName;
const dyeingServicesTableName = require("../../../util/database-tables-name").dyeingServicesTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (dyeingServicesPrices, dyeingServicePrice) => {
  let queryResults = false;
  await sqlFun
    .insert(anointedServicesPricesTableName, {
      id: dyeingServicePrice.id,
      anointed_services_id: dyeingServicePrice.anointedServicesId,
      dyeing_id: dyeingServicesPrices.dyerId,
      price: dyeingServicePrice.price,
      is_fabric_piece: dyeingServicePrice.isFabricPiece,
      creator_id: dyeingServicesPrices.personid,
      ip_address: dyeingServicesPrices.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (anointedServicesPrices) => {
  let queryResults = false;
  await sqlFun
    .update(
      anointedServicesPricesTableName,
      {
        price: anointedServicesPrices.price,
        is_fabric_piece: anointedServicesPrices.isFabricPiece,
      }, {
        id: anointedServicesPrices.id,
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
    .limitedSelect(anointedServicesPricesTableName, [
      `${anointedServicesPricesTableName}.id`,
      `${anointedServicesPricesTableName}.price`,
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
  let whereCluse = {};
  whereCluse[`${anointedServicesPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedServicesPricesTableName}.is_active`] = 1;

  await knex.from(anointedServicesPricesTableName)
    .select(
      [
        `${anointedServicesPricesTableName}.id`,
        `${anointedServicesPricesTableName}.price`,
        `${anointedServicesPricesTableName}.is_fabric_piece`,
        `${dyeingServicesTableName}.name as anointed_services_name`,
        `${bussinessmanTableName}.name as dyeing_name`,
      ],
    )
    .innerJoin(`${dyeingServicesTableName}`,
      `${dyeingServicesTableName}.id`,
      `${anointedServicesPricesTableName}.anointed_services_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${anointedServicesPricesTableName}.dyeing_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDeleted = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${anointedServicesPricesTableName}.is_deleted`] = 1;
  whereCluse[`${anointedServicesPricesTableName}.is_active`] = 0;

  await knex.from(anointedServicesPricesTableName)
    .select(
      [
        `${anointedServicesPricesTableName}.id`,
        `${anointedServicesPricesTableName}.price`,
        `${anointedServicesPricesTableName}.is_fabric_piece`,
        `${dyeingServicesTableName}.name as anointed_services_name`,
        `${bussinessmanTableName}.name as dyeing_name`,
      ],
    )
    .innerJoin(`${dyeingServicesTableName}`,
      `${dyeingServicesTableName}.id`,
      `${anointedServicesPricesTableName}.anointed_services_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${anointedServicesPricesTableName}.dyeing_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (anointedServicesPricesId) => {
  let queryResults = false;
  await sqlFun
    .delete(anointedServicesPricesTableName, {
      id: anointedServicesPricesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (anointedServicesPricesId) => {
  let queryResults = false;
  await sqlFun
    .restore(anointedServicesPricesTableName, {
      id: anointedServicesPricesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
