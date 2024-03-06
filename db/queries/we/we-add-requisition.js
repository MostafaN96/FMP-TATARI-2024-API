// Config
const sqlFun = require("../../config/sql-fun");

// Util
const weAddRequisitionTableName = require("../../../util/database-tables-name").weAddRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (weAddRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weAddRequisitionTableName, {
      id: weAddRequisition.id,
      supplier_id: weAddRequisition.supplierId,
      number: weAddRequisition.number,
      date: weAddRequisition.date,
      work_order_number: weAddRequisition.workOrderNumber,
      note: weAddRequisition.note,
      creator_id: weAddRequisition.personid,
      ip_address: weAddRequisition.ipaddress,
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
    .limitedSelect(weAddRequisitionTableName, ["is_deleted"], whereCluse, 1)
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
  whereCluse[`${weAddRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionTableName}.is_active`] = 1;

  await sqlFun
    .selectWithJionOrderedBy(
      weAddRequisitionTableName,
      [
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${weAddRequisitionTableName}.work_order_number`,
        `${bussinessmanTableName}.name as supplier_name`,
      ],
      whereCluse,
      `${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${weAddRequisitionTableName}.supplier_id`,
      `${weAddRequisitionTableName}.number`,
      'desc'
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (weAddRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weAddRequisitionTableName,
      weAddRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};