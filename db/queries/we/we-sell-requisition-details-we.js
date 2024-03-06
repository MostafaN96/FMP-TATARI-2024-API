// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weSellRequisitionDetailsWeTableName = require("../../../util/database-tables-name").weSellRequisitionDetailsWeTableName;

exports.insert = async (weSellRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weSellRequisitionDetailsWeTableName, {
        we_sell_requisition_details_id: items.weSellRequisitionDetailsId,
        we_id: items.weId,
        quantity: items.updatedQuantity,
        creator_id: weSellRequisitionDetailsWe.personid,
        ip_address: weSellRequisitionDetailsWe.ipaddress,
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
  await knex
    .select([
      `${weSellRequisitionDetailsWeTableName}.we_id`,
      `${weSellRequisitionDetailsWeTableName}.quantity`
    ])
    .from(`${weSellRequisitionDetailsWeTableName}`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

  exports.select = async (whereCluse) => {
    let queryResults = [];
    await sqlFun
      .select(
        weSellRequisitionDetailsWeTableName,
        [
          `${weSellRequisitionDetailsWeTableName}.we_id`,
          `${weSellRequisitionDetailsWeTableName}.quantity`
        ],
        whereCluse
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    let queryResults = [];
    await sqlFun
      .selectWithTwoCondition(
        weSellRequisitionDetailsWeTableName,
        [
          `${weSellRequisitionDetailsWeTableName}.we_id`,
          `${weSellRequisitionDetailsWeTableName}.quantity`
        ],
        whereCluse,
        andWhereCluseArray
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (weSellRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weSellRequisitionDetailsWeTableName,
        weSellRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };