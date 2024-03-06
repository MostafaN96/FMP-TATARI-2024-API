// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weReturnRequisitionDetailsWeTableName = require("../../../util/database-tables-name").weReturnRequisitionDetailsWeTableName;

exports.insert = async (weReturnRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weReturnRequisitionDetailsWeTableName, {
        we_return_requisition_details_id: items.weReturnRequisitionDetailsId,
        we_id: items.weId,
        quantity: items.updatedQuantity,
        creator_id: weReturnRequisitionDetailsWe.personid,
        ip_address: weReturnRequisitionDetailsWe.ipaddress,
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
        weReturnRequisitionDetailsWeTableName,
        [
          `${weReturnRequisitionDetailsWeTableName}.we_id`,
          `${weReturnRequisitionDetailsWeTableName}.quantity`
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
        weReturnRequisitionDetailsWeTableName,
        [
          `${weReturnRequisitionDetailsWeTableName}.we_id`,
          `${weReturnRequisitionDetailsWeTableName}.quantity`
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
        `${weReturnRequisitionDetailsWeTableName}.we_id`,
        `${weReturnRequisitionDetailsWeTableName}.quantity`
      ])
      .from(`${weReturnRequisitionDetailsWeTableName}`)
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

  exports.update = async (weReturnRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReturnRequisitionDetailsWeTableName,
        weReturnRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };