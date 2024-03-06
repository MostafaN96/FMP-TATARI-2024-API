// Config
const sqlFun = require("../../config/sql-fun");
// Util
const waReturnRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waReturnRequisitionDetailsWaTableName;

exports.insert = async (waReturnRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waReturnRequisitionDetailsWaTableName, {
        wa_return_requisition_details_id: items.waReturnRequisitionDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: waReturnRequisitionDetailsWa.personid,
        ip_address: waReturnRequisitionDetailsWa.ipaddress,
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
        waReturnRequisitionDetailsWaTableName,
        [
          `${waReturnRequisitionDetailsWaTableName}.wa_id`,
          `${waReturnRequisitionDetailsWaTableName}.quantity`
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
        waReturnRequisitionDetailsWaTableName,
        [
          `${waReturnRequisitionDetailsWaTableName}.wa_id`,
          `${waReturnRequisitionDetailsWaTableName}.quantity`
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

  exports.update = async (waReturnRequisitionDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waReturnRequisitionDetailsWaTableName,
        waReturnRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };