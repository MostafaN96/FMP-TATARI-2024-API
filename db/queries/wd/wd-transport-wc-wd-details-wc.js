// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wdTransportWcWdDetailsWcTableName = require("../../../util/database-tables-name").wdTransportWcWdDetailsWcTableName;

exports.insert = async (wdTransportWcWdDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdTransportWcWdDetailsWcTableName, {
        wd_transport_wc_wd_details_id: items.wdTransportWcWdDetailsId,
        wc_id: items.wcId,
        quantity: items.updatedQuantity,
        creator_id: wdTransportWcWdDetailsWc.personid,
        ip_address: wdTransportWcWdDetailsWc.ipaddress,
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
        wdTransportWcWdDetailsWcTableName,
        [
          `${wdTransportWcWdDetailsWcTableName}.wc_id`,
          `${wdTransportWcWdDetailsWcTableName}.quantity`
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
        wdTransportWcWdDetailsWcTableName,
        [
          `${wdTransportWcWdDetailsWcTableName}.wc_id`,
          `${wdTransportWcWdDetailsWcTableName}.quantity`
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

  exports.update = async (wdTransportWcWdDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdTransportWcWdDetailsWcTableName,
        wdTransportWcWdDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };