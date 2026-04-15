// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wbReconciliationRequisitionDetailsWbTableName = require("../../../util/database-tables-name").wbReconciliationRequisitionDetailsWbTableName;
const wbReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").wbReconciliationRequisitionDetailsTableName;

exports.insertForOutput = async (wbReconciliationRequisitionDetailsWb, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wbReconciliationRequisitionDetailsWbTableName, {
        wb_reconcilition_requisition_details_id: items.wbReconciliationRequisitionDetailsId,
        wb_id: items.wbId,
        quantity: items.updatedQuantity,
        creator_id: wbReconciliationRequisitionDetailsWb.personid,
        ip_address: wbReconciliationRequisitionDetailsWb.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  exports.insertForInput = async (wbReconciliationRequisitionDetailsWb, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wbReconciliationRequisitionDetailsWbTableName, {
        wb_reconcilition_requisition_details_id: items.wbReconciliationRequisitionDetailsId,
        wb_id: wbReconciliationRequisitionDetailsWb.wbId,
        quantity: items.quantity,
        creator_id: wbReconciliationRequisitionDetailsWb.personid,
        ip_address: wbReconciliationRequisitionDetailsWb.ipaddress,
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
        wbReconciliationRequisitionDetailsWbTableName,
        [
          `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
          `${wbReconciliationRequisitionDetailsWbTableName}.quantity`
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
        wbReconciliationRequisitionDetailsWbTableName,
        [
          `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
          `${wbReconciliationRequisitionDetailsWbTableName}.quantity`
        ],
        whereCluse,
        `${wbReconciliationRequisitionDetailsTableName}`, 
        `${wbReconciliationRequisitionDetailsTableName}.id`, 
        `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`
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
        wbReconciliationRequisitionDetailsWbTableName,
        [
          `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
          `${wbReconciliationRequisitionDetailsWbTableName}.quantity`
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

  exports.update = async (wbReconciliationRequisitionDetailsWb, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wbReconciliationRequisitionDetailsWbTableName,
        wbReconciliationRequisitionDetailsWb,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };
