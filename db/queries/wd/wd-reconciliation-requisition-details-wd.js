// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wdReconciliationRequisitionDetailsWdTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionDetailsWdTableName;
const wdReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").wdReconciliationRequisitionDetailsTableName;

exports.insertForOutput = async (wdReconciliationRequisitionDetailsWd, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdReconciliationRequisitionDetailsWdTableName, {
        wd_reconcilition_requisition_details_id: items.wdReconciliationRequisitionDetailsId,
        wd_id: items.wdId,
        quantity: items.updatedQuantity,
        creator_id: wdReconciliationRequisitionDetailsWd.personid,
        ip_address: wdReconciliationRequisitionDetailsWd.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  exports.insertForInput = async (wdReconciliationRequisitionDetailsWd, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdReconciliationRequisitionDetailsWdTableName, {
        wd_reconcilition_requisition_details_id: items.wdReconciliationRequisitionDetailsId,
        wd_id: wdReconciliationRequisitionDetailsWd.wdId,
        quantity: items.quantity,
        creator_id: wdReconciliationRequisitionDetailsWd.personid,
        ip_address: wdReconciliationRequisitionDetailsWd.ipaddress,
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
        wdReconciliationRequisitionDetailsWdTableName,
        [
          `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
          `${wdReconciliationRequisitionDetailsWdTableName}.quantity`
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
        wdReconciliationRequisitionDetailsWdTableName,
        [
          `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
          `${wdReconciliationRequisitionDetailsWdTableName}.quantity`
        ],
        whereCluse,
        `${wdReconciliationRequisitionDetailsTableName}`, 
        `${wdReconciliationRequisitionDetailsTableName}.id`, 
        `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`
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
        wdReconciliationRequisitionDetailsWdTableName,
        [
          `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
          `${wdReconciliationRequisitionDetailsWdTableName}.quantity`
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

  exports.update = async (wdReconciliationRequisitionDetailsWd, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdReconciliationRequisitionDetailsWdTableName,
        wdReconciliationRequisitionDetailsWd,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };