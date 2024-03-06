// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;

exports.insert = async (dyedFabric) => {
  let queryResults = false;
  await sqlFun
    .insert(fabricTableName, {
      id: dyedFabric.id,
      fabric_id: dyedFabric.fabricId,
      name: dyedFabric.name,
      code: dyedFabric.code,
      dyeing_code: dyedFabric.dyeingCode,
      is_dyed_fabric: '1',
      fabric_quantity_m2: dyedFabric.fabricQuantityM2,
      waste_ratio: dyedFabric.wasteRatio,
      creator_id: dyedFabric.personid,
      ip_address: dyedFabric.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (dyedFabric) => {
  let queryResults = false;
  await sqlFun
    .update(
      fabricTableName,
      {
        fabric_id: dyedFabric.fabricId,
        name: dyedFabric.name,
        code: dyedFabric.code,
        fabric_quantity_m2: dyedFabric.fabricQuantityM2,
        dyeing_code: dyedFabric.dyeingCode,
        waste_ratio: dyedFabric.wasteRatio,
      },
      {
        id: dyedFabric.id,
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

  await knex.from(fabricTableName)
    .select(
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
        `row_fabric.id as fabric_id`,
        `row_fabric.name as fabric_name`,
        `row_fabric.code as fabric_code`,
        knex.raw(`CONCAT(row_fabric.name, ' (الكود: ', row_fabric.code, ')' ) as "fabric_name_code"`),
      ],
    )
    .innerJoin(`${fabricTableName} as row_fabric`,
      `row_fabric.id`,
      `${fabricTableName}.fabric_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;

  await knex.from(fabricTableName)
    .select(
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
        `row_fabric.id as fabric_id`,
        `row_fabric.name as fabric_name`,
        `row_fabric.code as fabric_code`,
        knex.raw(`CONCAT(row_fabric.name, ' (الكود: ', row_fabric.code, ')' ) as "fabric_name_code"`),
      ],
    )
    .innerJoin(`${fabricTableName} as row_fabric`,
      `row_fabric.id`,
      `${fabricTableName}.fabric_id`)
    .where(whereCluse)
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
      fabricTableName,
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
      ],
      {
        is_deleted: "1",
        is_active: "0",
        is_dyed_fabric: '1'
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectWhereInDyedFabric = async (whereInTableName, whereInAttr, whereInWhereCluse) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;

  await knex.select([
    `${fabricTableName}.id`,
    `${fabricTableName}.name`,
    `${fabricTableName}.code`,
    `${fabricTableName}.dyeing_code`,
  ])
    .distinct()
    .from(`${fabricTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.${whereInAttr}`, `${fabricTableName}.id`)
    .whereIn(`${fabricTableName}.id`, function () {
      this.select(`${whereInTableName}.${whereInAttr}`)
        .from(whereInTableName).where(whereInWhereCluse);
    })
    .andWhere(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (dyedFabricId) => {
  let queryResults = false;
  await sqlFun
    .delete(fabricTableName, {
      id: dyedFabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (dyedFabricId) => {
  let queryResults = false;
  await sqlFun
    .restore(fabricTableName, {
      id: dyedFabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
