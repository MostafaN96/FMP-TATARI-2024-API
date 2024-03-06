// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const anointedColorsPricesTableName = require("../../../util/database-tables-name").anointedColorsPricesTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const colorCategoryTableName = require("../../../util/database-tables-name").colorCategoryTableName;
const colorTableName = require("../../../util/database-tables-name").colorTableName;

exports.insert = async (dyeingColorsPrices, dyeingColorPrice) => {
  let queryResults = false;
  await sqlFun
    .insert(anointedColorsPricesTableName, {
      id: dyeingColorPrice.id,
      dyeing_id: dyeingColorsPrices.dyerId,
      color_category_id: dyeingColorPrice.colorCategoryId,
      color_id: dyeingColorPrice.colorId,
      code: dyeingColorPrice.code,
      price: dyeingColorPrice.price,
      creator_id: dyeingColorsPrices.personid,
      ip_address: dyeingColorsPrices.ipaddress
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
      anointedColorsPricesTableName,
      {
        code: anointedServicesPrices.code,
        price: anointedServicesPrices.price,
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
    .limitedSelect(anointedColorsPricesTableName, [
      `${anointedColorsPricesTableName}.id`,
      `${anointedColorsPricesTableName}.code`,
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
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;

  await knex.from(anointedColorsPricesTableName)
    .select(
      [
        `${anointedColorsPricesTableName}.id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${anointedColorsPricesTableName}.price`,
        `${anointedColorsPricesTableName}.code`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${bussinessmanTableName}.name as dyeing_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (الكود: ', ${anointedColorsPricesTableName}.code, ')' ) as "color_name_code"`),

      ],
    )
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${anointedColorsPricesTableName}.dyeing_id`)
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
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 0;

  await knex.from(anointedColorsPricesTableName)
    .select(
      [
        `${anointedColorsPricesTableName}.id`,
        `${anointedColorsPricesTableName}.price`,
        `${anointedColorsPricesTableName}.code`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${bussinessmanTableName}.name as dyeing_name`,
      ],
    )
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${anointedColorsPricesTableName}.dyeing_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByWhereCluse = async (whereCluse) => {
  let queryResults = [];

  await knex.from(anointedColorsPricesTableName)
    .select(
      [
        `${anointedColorsPricesTableName}.id`,
        `${anointedColorsPricesTableName}.color_id`,
        `${anointedColorsPricesTableName}.price`,
        `${anointedColorsPricesTableName}.code`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${bussinessmanTableName}.name as dyeing_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (الكود: ', ${anointedColorsPricesTableName}.code, ')' ) as "color_name_code"`),

      ],
    )
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${anointedColorsPricesTableName}.dyeing_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (anointedColorsPricesId) => {
  let queryResults = false;
  await sqlFun
    .delete(anointedColorsPricesTableName, {
      id: anointedColorsPricesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (anointedColorsPricesId) => {
  let queryResults = false;
  await sqlFun
    .restore(anointedColorsPricesTableName, {
      id: anointedColorsPricesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
