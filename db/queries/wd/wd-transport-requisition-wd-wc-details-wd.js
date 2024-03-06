// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wdTransportRequisitionWdWcDetailsWdTableName = require("../../../util/database-tables-name").wdTransportRequisitionWdWcDetailsWdTableName;

exports.insert = async (wdTransportRequisitionWdWcDetailsWd, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdTransportRequisitionWdWcDetailsWdTableName, {
        wd_transport_requisition_wd_wc_details_id: items.wdTransportRequisitionWdWcDetailsId,
        wd_id: items.wdId,
        quantity: items.updatedQuantity,
        creator_id: wdTransportRequisitionWdWcDetailsWd.personid,
        ip_address: wdTransportRequisitionWdWcDetailsWd.ipaddress,
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
        wdTransportRequisitionWdWcDetailsWdTableName,
        [
          `${wdTransportRequisitionWdWcDetailsWdTableName}.wd_id`,
          `${wdTransportRequisitionWdWcDetailsWdTableName}.quantity`
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
        wdTransportRequisitionWdWcDetailsWdTableName,
        [
          `${wdTransportRequisitionWdWcDetailsWdTableName}.wd_id`,
          `${wdTransportRequisitionWdWcDetailsWdTableName}.quantity`
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

  exports.update = async (wdTransportRequisitionWdWcDetailsWd, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdTransportRequisitionWdWcDetailsWdTableName,
        wdTransportRequisitionWdWcDetailsWd,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };