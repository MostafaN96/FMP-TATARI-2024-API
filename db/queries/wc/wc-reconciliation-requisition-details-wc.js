// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wcReconciliationRequisitionDetailsWcTableName = require("../../../util/database-tables-name").wcReconciliationRequisitionDetailsWcTableName;
const wcReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").wcReconciliationRequisitionDetailsTableName;

exports.insertForOutput = async (wcReconciliationRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcReconciliationRequisitionDetailsWcTableName, {
        wc_reconcilition_requisition_details_id: items.wcReconciliationRequisitionDetailsId,
        wc_id: items.wcId,
        quantity: items.updatedQuantity,
        creator_id: wcReconciliationRequisitionDetailsWc.personid,
        ip_address: wcReconciliationRequisitionDetailsWc.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  exports.insertForInput = async (wcReconciliationRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcReconciliationRequisitionDetailsWcTableName, {
        wc_reconcilition_requisition_details_id: items.wcReconciliationRequisitionDetailsId,
        wc_id: wcReconciliationRequisitionDetailsWc.wcId,
        quantity: items.quantity,
        creator_id: wcReconciliationRequisitionDetailsWc.personid,
        ip_address: wcReconciliationRequisitionDetailsWc.ipaddress,
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
        wcReconciliationRequisitionDetailsWcTableName,
        [
          `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
          `${wcReconciliationRequisitionDetailsWcTableName}.quantity`
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
        wcReconciliationRequisitionDetailsWcTableName,
        [
          `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
          `${wcReconciliationRequisitionDetailsWcTableName}.quantity`
        ],
        whereCluse,
        `${wcReconciliationRequisitionDetailsTableName}`, 
        `${wcReconciliationRequisitionDetailsTableName}.id`, 
        `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`
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
        wcReconciliationRequisitionDetailsWcTableName,
        [
          `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
          `${wcReconciliationRequisitionDetailsWcTableName}.quantity`
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

  exports.update = async (wcReconciliationRequisitionDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wcReconciliationRequisitionDetailsWcTableName,
        wcReconciliationRequisitionDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };