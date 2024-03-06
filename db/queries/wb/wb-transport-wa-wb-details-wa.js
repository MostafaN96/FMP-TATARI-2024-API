// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wbTransportWaWbDetailsWaTableName = require("../../../util/database-tables-name").wbTransportWaWbDetailsWaTableName;

exports.insert = async (wbTransportWaWbDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wbTransportWaWbDetailsWaTableName, {
        wb_transport_wa_wb_details_id: items.wbTransportWaWbDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: wbTransportWaWbDetailsWa.personid,
        ip_address: wbTransportWaWbDetailsWa.ipaddress,
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
        wbTransportWaWbDetailsWaTableName,
        [
          `${wbTransportWaWbDetailsWaTableName}.wa_id`,
          `${wbTransportWaWbDetailsWaTableName}.quantity`
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
        wbTransportWaWbDetailsWaTableName,
        [
          `${wbTransportWaWbDetailsWaTableName}.wa_id`,
          `${wbTransportWaWbDetailsWaTableName}.quantity`
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

  exports.update = async (wbTransportWaWbDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wbTransportWaWbDetailsWaTableName,
        wbTransportWaWbDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };