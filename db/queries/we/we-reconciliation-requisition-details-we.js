// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weReconciliationRequisitionDetailsWeTableName = require("../../../util/database-tables-name").weReconciliationRequisitionDetailsWeTableName;
const weReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").weReconciliationRequisitionDetailsTableName;

exports.insertForOutput = async (wcReconciliationRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weReconciliationRequisitionDetailsWeTableName, {
        we_reconcilition_requisition_details_id: items.weReconciliationRequisitionDetailsId,
        we_id: items.weId,
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
      .insert(weReconciliationRequisitionDetailsWeTableName, {
        we_reconcilition_requisition_details_id: items.weReconciliationRequisitionDetailsId,
        we_id: wcReconciliationRequisitionDetailsWc.weId,
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
        weReconciliationRequisitionDetailsWeTableName,
        [
          `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
          `${weReconciliationRequisitionDetailsWeTableName}.quantity`
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
        weReconciliationRequisitionDetailsWeTableName,
        [
          `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
          `${weReconciliationRequisitionDetailsWeTableName}.quantity`
        ],
        whereCluse,
        `${weReconciliationRequisitionDetailsTableName}`, 
        `${weReconciliationRequisitionDetailsTableName}.id`, 
        `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`
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
        weReconciliationRequisitionDetailsWeTableName,
        [
          `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
          `${weReconciliationRequisitionDetailsWeTableName}.quantity`
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
        `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
        `${weReconciliationRequisitionDetailsWeTableName}.quantity`
      ])
      .from(`${weReconciliationRequisitionDetailsWeTableName}`)
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

  exports.update = async (wcReconciliationRequisitionDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReconciliationRequisitionDetailsWeTableName,
        wcReconciliationRequisitionDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };