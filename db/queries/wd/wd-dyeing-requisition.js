// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingRequisitionTableName, bussinessmanTableName, warehouseTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdDyeingRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wdDyeingRequisitionTableName, {
      id: wdDyeingRequisition.id,
      dyeing_id: wdDyeingRequisition.dyeingId,
      warehouse_id: wdDyeingRequisition.warehouseId,
      number: wdDyeingRequisition.number,
      date: wdDyeingRequisition.date,
      note: wdDyeingRequisition.note,
      is_calc_dyeing_net: wdDyeingRequisition.isCalcDyeingNet,
      release_process: wdDyeingRequisition.releaseProcess,
      creator_id: wdDyeingRequisition.personid,
      ip_address: wdDyeingRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${wdDyeingRequisitionTableName}.id`,
      `${wdDyeingRequisitionTableName}.number`,
      `${wdDyeingRequisitionTableName}.release_process`,
      `${wdDyeingRequisitionTableName}.date`,
      `${wdDyeingRequisitionTableName}.note`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${warehouseTableName}.name as warehouse_name`,
    ])
    .from(`${wdDyeingRequisitionTableName}`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wdDyeingRequisitionTableName}.dyeing_id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wdDyeingRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .orderBy(`${wdDyeingRequisitionTableName}.number`, 'desc')
    .groupBy(`${wdDyeingRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wdDyeingRequisitionTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdDyeingRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdDyeingRequisitionTableName,
      wdDyeingRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};