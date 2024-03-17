// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  weExecuteOrderRequisitionDetailsWeTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (weExecuteOrderRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weExecuteOrderRequisitionDetailsWeTableName, {
        we_execute_order_requisition_details_id: items.weExecuteOrderRequisitionDetailsId,
        we_id: items.weId,
        quantity: items.updatedQuantity,
        creator_id: weExecuteOrderRequisitionDetailsWe.personid,
        ip_address: weExecuteOrderRequisitionDetailsWe.ipaddress,
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
        weExecuteOrderRequisitionDetailsWeTableName,
        [
          `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`,
          `${weExecuteOrderRequisitionDetailsWeTableName}.quantity`
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
        weExecuteOrderRequisitionDetailsWeTableName,
        [
          `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`,
          `${weExecuteOrderRequisitionDetailsWeTableName}.quantity`
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
    .limitedSelect(weExecuteOrderRequisitionDetailsWeTableName, [
      `${weExecuteOrderRequisitionDetailsWeTableName}.we_id`,
    `${weExecuteOrderRequisitionDetailsWeTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (weExecuteOrderRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weExecuteOrderRequisitionDetailsWeTableName,
        weExecuteOrderRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };