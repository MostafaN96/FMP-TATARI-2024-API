// Config
const sqlFun = require("../../config/sql-fun");

// Util
const wcAddRequisitionTableName = require("../../../util/database-tables-name").wcAddRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (wcAddRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcAddRequisitionTableName, {
      id: wcAddRequisition.id,
      supplier_id: wcAddRequisition.supplierId,
      number: wcAddRequisition.number,
      date: wcAddRequisition.date,
      note: wcAddRequisition.note,
      creator_id: wcAddRequisition.personid,
      ip_address: wcAddRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForOrder = async (wcAddRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(wcAddRequisitionTableName, {
      id: wcAddRequisition.id,
      supplier_id: wcAddRequisition.supplierId,
      number: wcAddRequisition.number,
      date: wcAddRequisition.date,
      note: wcAddRequisition.note,
      is_order: '1',
      creator_id: wcAddRequisition.personid,
      ip_address: wcAddRequisition.ipaddress,
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
    .limitedSelect(wcAddRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${wcAddRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wcAddRequisitionTableName}.is_active`] = 1;

  await sqlFun
    .selectWithJionOrderedBy(
      wcAddRequisitionTableName,
      [
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionTableName}.number`,
        `${wcAddRequisitionTableName}.date`,
        `${wcAddRequisitionTableName}.note`,
        `${wcAddRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.name as supplier_name`,
      ],
      whereCluse,
      `${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wcAddRequisitionTableName}.supplier_id`,
      `${wcAddRequisitionTableName}.number`,
      'desc'
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wcAddRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcAddRequisitionTableName,
      wcAddRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};