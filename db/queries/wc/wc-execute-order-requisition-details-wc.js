// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  wcExecuteOrderRequisitionDetailsWcTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (wcExecuteOrderRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcExecuteOrderRequisitionDetailsWcTableName, {
        wc_execute_order_requisition_details_id: items.wcExecuteOrderRequisitionDetailsId,
        wc_id: items.wcId,
        quantity: items.updatedQuantity,
        creator_id: wcExecuteOrderRequisitionDetailsWc.personid,
        ip_address: wcExecuteOrderRequisitionDetailsWc.ipaddress,
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
        wcExecuteOrderRequisitionDetailsWcTableName,
        [
          `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`,
          `${wcExecuteOrderRequisitionDetailsWcTableName}.quantity`
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
        wcExecuteOrderRequisitionDetailsWcTableName,
        [
          `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`,
          `${wcExecuteOrderRequisitionDetailsWcTableName}.quantity`
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
  await sqlFun
    .limitedSelect(wcExecuteOrderRequisitionDetailsWcTableName, [
      `${wcExecuteOrderRequisitionDetailsWcTableName}.wc_id`,
    `${wcExecuteOrderRequisitionDetailsWcTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (wcExecuteOrderRequisitionDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wcExecuteOrderRequisitionDetailsWcTableName,
        wcExecuteOrderRequisitionDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };