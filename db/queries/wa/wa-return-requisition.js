// Config
const sqlFun = require("../../config/sql-fun");

// Util
const waReturnRequisitionTableName = require("../../../util/database-tables-name").waReturnRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (waReturnRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waReturnRequisitionTableName, {
      id: waReturnRequisition.id,
      supplier_id: waReturnRequisition.supplierId,
      warehouse_id: waReturnRequisition.warehouseId,
      number: waReturnRequisition.number,
      date: waReturnRequisition.date,
      note: waReturnRequisition.note,
      creator_id: waReturnRequisition.personid,
      ip_address: waReturnRequisition.ipaddress,
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
      .limitedSelect(waReturnRequisitionTableName, ["supplier_id", "is_deleted"], whereCluse, 1)
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
    whereCluse[`${waReturnRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${waReturnRequisitionTableName}.is_active`] = 1;
  
    await sqlFun
      .selectWithJionOrderedBy(
        waReturnRequisitionTableName,
        [
          `${waReturnRequisitionTableName}.id`,
          `${waReturnRequisitionTableName}.number`,
          `${waReturnRequisitionTableName}.date`,
          `${waReturnRequisitionTableName}.note`,
          `${bussinessmanTableName}.name as supplier_name`,
          `${bussinessmanTableName}.id as supplier_id`,
        ],
        whereCluse,
        `${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${waReturnRequisitionTableName}.supplier_id`,
        `${waReturnRequisitionTableName}.number`,
        'desc'
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (waReturnRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waReturnRequisitionTableName,
        waReturnRequisition,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };