// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wdTransitionBetweenDyersRequisitionDetailsWdTableName = require("../../../util/database-tables-name").wdTransitionBetweenDyersRequisitionDetailsWdTableName;

exports.insert = async (wdTransitionBetweenDyersRequisitionDetailsWd, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdTransitionBetweenDyersRequisitionDetailsWdTableName, {
        wd_transition_between_dyers_requisition_details_id: items.wdTransitionBetweenDyersRequisitionDetailsId,
        wd_id: items.wdId,
        quantity: items.updatedQuantity,
        creator_id: wdTransitionBetweenDyersRequisitionDetailsWd.personid,
        ip_address: wdTransitionBetweenDyersRequisitionDetailsWd.ipaddress,
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
        wdTransitionBetweenDyersRequisitionDetailsWdTableName,
        [
          `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_id`,
          `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.quantity`
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
        wdTransitionBetweenDyersRequisitionDetailsWdTableName,
        [
          `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.wd_id`,
          `${wdTransitionBetweenDyersRequisitionDetailsWdTableName}.quantity`
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

  exports.update = async (wdTransitionBetweenDyersRequisitionDetailsWd, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdTransitionBetweenDyersRequisitionDetailsWdTableName,
        wdTransitionBetweenDyersRequisitionDetailsWd,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };