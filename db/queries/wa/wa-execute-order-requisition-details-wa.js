// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  waExecuteOrderRequisitionDetailsWaTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (waExecuteOrderRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waExecuteOrderRequisitionDetailsWaTableName, {
        wa_execute_order_requisition_details_id: items.waExecuteOrderRequisitionDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: waExecuteOrderRequisitionDetailsWa.personid,
        ip_address: waExecuteOrderRequisitionDetailsWa.ipaddress,
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
        waExecuteOrderRequisitionDetailsWaTableName,
        [
          `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`,
          `${waExecuteOrderRequisitionDetailsWaTableName}.quantity`
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
        waExecuteOrderRequisitionDetailsWaTableName,
        [
          `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`,
          `${waExecuteOrderRequisitionDetailsWaTableName}.quantity`
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
    .limitedSelect(waExecuteOrderRequisitionDetailsWaTableName, [
      `${waExecuteOrderRequisitionDetailsWaTableName}.wa_id`,
    `${waExecuteOrderRequisitionDetailsWaTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (waExecuteOrderRequisitionDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waExecuteOrderRequisitionDetailsWaTableName,
        waExecuteOrderRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };