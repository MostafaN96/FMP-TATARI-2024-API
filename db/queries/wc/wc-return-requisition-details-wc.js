// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wcReturnRequisitionDetailsWcTableName = require("../../../util/database-tables-name").wcReturnRequisitionDetailsWcTableName;

exports.insert = async (wcReturnRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcReturnRequisitionDetailsWcTableName, {
        wc_return_requisition_details_id: items.wcReturnRequisitionDetailsId,
        wc_id: items.wcId,
        quantity: items.updatedQuantity,
        creator_id: wcReturnRequisitionDetailsWc.personid,
        ip_address: wcReturnRequisitionDetailsWc.ipaddress,
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
        wcReturnRequisitionDetailsWcTableName,
        [
          `${wcReturnRequisitionDetailsWcTableName}.wc_id`,
          `${wcReturnRequisitionDetailsWcTableName}.quantity`
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
        wcReturnRequisitionDetailsWcTableName,
        [
          `${wcReturnRequisitionDetailsWcTableName}.wc_id`,
          `${wcReturnRequisitionDetailsWcTableName}.quantity`
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

  exports.update = async (wcReturnRequisitionDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wcReturnRequisitionDetailsWcTableName,
        wcReturnRequisitionDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };