// Config
const { warehouseTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weReturnRequisitionTableName = require("../../../util/database-tables-name").weReturnRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (weReturnRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weReturnRequisitionTableName, {
      id: weReturnRequisition.id,
      supplier_id: weReturnRequisition.supplierId,
      number: weReturnRequisition.number,
      date: weReturnRequisition.date,
      note: weReturnRequisition.note,
      creator_id: weReturnRequisition.personid,
      ip_address: weReturnRequisition.ipaddress,
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
      .limitedSelect(weReturnRequisitionTableName, ["supplier_id", "is_deleted"], whereCluse, 1)
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
    whereCluse[`${weReturnRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${weReturnRequisitionTableName}.is_active`] = 1;
  
    await knex(weReturnRequisitionTableName)
    .select([
      `${weReturnRequisitionTableName}.id`,
      `${weReturnRequisitionTableName}.number`,
      `${weReturnRequisitionTableName}.date`,
      `${weReturnRequisitionTableName}.note`,
      `${bussinessmanTableName}.name as supplier_name`,
      `${bussinessmanTableName}.id as supplier_id`,
    ])
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${weReturnRequisitionTableName}.supplier_id`)
    .where(whereCluse)
    .orderBy(
      `${weReturnRequisitionTableName}.number`,
    'desc'
    )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (weReturnRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReturnRequisitionTableName,
        weReturnRequisition,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };