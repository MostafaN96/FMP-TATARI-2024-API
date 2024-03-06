// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weReturnSellRequisitionTableName, bussinessmanTableName } = require("../../../util/database-tables-name");

exports.insert = async (weReturnSellRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(weReturnSellRequisitionTableName, {
      id: weReturnSellRequisition.id,
      seller_id: weReturnSellRequisition.sellerId,
      number: weReturnSellRequisition.number,
      date: weReturnSellRequisition.date,
      note: weReturnSellRequisition.note,
      creator_id: weReturnSellRequisition.personid,
      ip_address: weReturnSellRequisition.ipaddress,
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
      .limitedSelect(weReturnSellRequisitionTableName, ["seller_id", "is_deleted"], whereCluse, 1)
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
    whereCluse[`${weReturnSellRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${weReturnSellRequisitionTableName}.is_active`] = 1;
  
    await knex(weReturnSellRequisitionTableName)
    .select([
      `${weReturnSellRequisitionTableName}.id`,
      `${weReturnSellRequisitionTableName}.number`,
      `${weReturnSellRequisitionTableName}.date`,
      `${weReturnSellRequisitionTableName}.note`,
      `${bussinessmanTableName}.name as seller_name`,
      `${bussinessmanTableName}.id as seller_id`,
    ])
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${weReturnSellRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(
      `${weReturnSellRequisitionTableName}.number`,
    'desc'
    )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (weReturnSellRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReturnSellRequisitionTableName,
        weReturnSellRequisition,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };