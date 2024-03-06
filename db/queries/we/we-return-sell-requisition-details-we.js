// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weReturnSellRequisitionDetailsWeTableName = require("../../../util/database-tables-name").weReturnSellRequisitionDetailsWeTableName;

exports.insert = async (weReturnSellRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weReturnSellRequisitionDetailsWeTableName, {
        we_id: items.weId,
        we_return_sell_requisition_details_id: items.weReturnSellRequisitionDetailsId,
        quantity: items.updatedQuantity,
        creator_id: weReturnSellRequisitionDetailsWe.personid,
        ip_address: weReturnSellRequisitionDetailsWe.ipaddress,
      })
      .then((data) => {
        queryResults = true;
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
        weReturnSellRequisitionDetailsWeTableName,
        [
          `${weReturnSellRequisitionDetailsWeTableName}.we_id`,
          `${weReturnSellRequisitionDetailsWeTableName}.quantity`
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
        weReturnSellRequisitionDetailsWeTableName,
        [
          `${weReturnSellRequisitionDetailsWeTableName}.we_id`,
          `${weReturnSellRequisitionDetailsWeTableName}.quantity`
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
 
  exports.selectOne = async (whereCluse) => {
    let queryResults = false;
    await knex
      .select([
        `${weReturnSellRequisitionDetailsWeTableName}.we_id`,
        `${weReturnSellRequisitionDetailsWeTableName}.we_return_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsWeTableName}.quantity`
      ])
      .from(`${weReturnSellRequisitionDetailsWeTableName}`)
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

  exports.update = async (weReturnSellRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReturnSellRequisitionDetailsWeTableName,
        weReturnSellRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };