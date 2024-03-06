// Config
const { warehouseTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wcReturnRequisitionTableName = require("../../../util/database-tables-name").wcReturnRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wcReturnRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcReturnRequisitionTableName, {
      id: wcReturnRequisition.id,
      supplier_id: wcReturnRequisition.supplierId,
      warehouse_id: wcReturnRequisition.warehouseId,
      number: wcReturnRequisition.number,
      date: wcReturnRequisition.date,
      note: wcReturnRequisition.note,
      creator_id: wcReturnRequisition.personid,
      ip_address: wcReturnRequisition.ipaddress,
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
      .limitedSelect(wcReturnRequisitionTableName, ["supplier_id", "is_deleted"], whereCluse, 1)
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
    whereCluse[`${wcReturnRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcReturnRequisitionTableName}.is_active`] = 1;
  
    await knex(wcReturnRequisitionTableName)
    .select([
      `${wcReturnRequisitionTableName}.id`,
      `${wcReturnRequisitionTableName}.number`,
      `${wcReturnRequisitionTableName}.date`,
      `${wcReturnRequisitionTableName}.note`,
      `${bussinessmanTableName}.name as supplier_name`,
      `${bussinessmanTableName}.id as supplier_id`,
      `${warehouseTableName}.name as warehouse_name`,
    ])
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${wcReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${warehouseTableName}`,
    `${warehouseTableName}.id`,
    `${wcReturnRequisitionTableName}.warehouse_id`)
    .where(whereCluse)
    .orderBy(
      `${wcReturnRequisitionTableName}.number`,
    'desc'
    )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (wcReturnRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wcReturnRequisitionTableName,
        wcReturnRequisition,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };