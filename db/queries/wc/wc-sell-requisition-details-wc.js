// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wcSellRequisitionDetailsWcTableName = require("../../../util/database-tables-name").wcSellRequisitionDetailsWcTableName;

exports.insert = async (waSellRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcSellRequisitionDetailsWcTableName, {
        wc_sell_requisition_details_id: items.wcSellRequisitionDetailsId,
        wc_id: items.wcId,
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
        wcSellRequisitionDetailsWcTableName,
        [
          `${wcSellRequisitionDetailsWcTableName}.wc_id`,
          `${wcSellRequisitionDetailsWcTableName}.quantity`
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
        wcSellRequisitionDetailsWcTableName,
        [
          `${wcSellRequisitionDetailsWcTableName}.wc_id`,
          `${wcSellRequisitionDetailsWcTableName}.quantity`
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
        wcSellRequisitionDetailsWcTableName,
        waSellRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };