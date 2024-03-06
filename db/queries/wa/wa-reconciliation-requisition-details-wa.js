// Config
const sqlFun = require("../../config/sql-fun");
// Util
const waReconciliationRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;
const waReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;

exports.insertForOutput = async (waReconciliationRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waReconciliationRequisitionDetailsWaTableName, {
        wa_reconcilition_requisition_details_id: items.waReconciliationRequisitionDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: waReconciliationRequisitionDetailsWa.personid,
        ip_address: waReconciliationRequisitionDetailsWa.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  exports.insertForInput = async (waReconciliationRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waReconciliationRequisitionDetailsWaTableName, {
        wa_reconcilition_requisition_details_id: items.waReconciliationRequisitionDetailsId,
        wa_id: waReconciliationRequisitionDetailsWa.waId,
        quantity: items.quantity,
        creator_id: waReconciliationRequisitionDetailsWa.personid,
        ip_address: waReconciliationRequisitionDetailsWa.ipaddress,
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
        waReconciliationRequisitionDetailsWaTableName,
        [
          `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
          `${waReconciliationRequisitionDetailsWaTableName}.quantity`
        ],
        whereCluse
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.selectForInput = async (whereCluse) => {
    let queryResults = [];
    await sqlFun
      .selectWithJion(
        waReconciliationRequisitionDetailsWaTableName,
        [
          `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
          `${waReconciliationRequisitionDetailsWaTableName}.quantity`
        ],
        whereCluse,
        `${waReconciliationRequisitionDetailsTableName}`, 
        `${waReconciliationRequisitionDetailsTableName}.id`, 
        `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`
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
        waReconciliationRequisitionDetailsWaTableName,
        [
          `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
          `${waReconciliationRequisitionDetailsWaTableName}.quantity`
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

  exports.update = async (waReconciliationRequisitionDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waReconciliationRequisitionDetailsWaTableName,
        waReconciliationRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };