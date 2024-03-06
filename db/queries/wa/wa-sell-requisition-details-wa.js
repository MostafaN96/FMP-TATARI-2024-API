// Config
const sqlFun = require("../../config/sql-fun");
// Util
const waSellRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waSellRequisitionDetailsWaTableName;

exports.insert = async (waSellRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waSellRequisitionDetailsWaTableName, {
        wa_sell_requisition_details_id: items.waSellRequisitionDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: waSellRequisitionDetailsWa.personid,
        ip_address: waSellRequisitionDetailsWa.ipaddress,
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
        waSellRequisitionDetailsWaTableName,
        [
          `${waSellRequisitionDetailsWaTableName}.wa_id`,
          `${waSellRequisitionDetailsWaTableName}.quantity`
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
        waSellRequisitionDetailsWaTableName,
        [
          `${waSellRequisitionDetailsWaTableName}.wa_id`,
          `${waSellRequisitionDetailsWaTableName}.quantity`
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

  exports.update = async (waSellRequisitionDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waSellRequisitionDetailsWaTableName,
        waSellRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };