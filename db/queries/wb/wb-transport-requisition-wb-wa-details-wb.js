// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wbTransportRequisitionWbWaDetailsWbTableName = require("../../../util/database-tables-name").wbTransportRequisitionWbWaDetailsWbTableName;

exports.insert = async (wbTransportRequisitionWbWaDetailsWb, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wbTransportRequisitionWbWaDetailsWbTableName, {
        wb_transport_requisition_wb_wa_details_id: items.wbTransportRequisitionWbWaDetailsId,
        wb_id: items.wbId,
        quantity: items.updatedQuantity,
        creator_id: wbTransportRequisitionWbWaDetailsWb.personid,
        ip_address: wbTransportRequisitionWbWaDetailsWb.ipaddress,
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
        wbTransportRequisitionWbWaDetailsWbTableName,
        [
          `${wbTransportRequisitionWbWaDetailsWbTableName}.wb_id`,
          `${wbTransportRequisitionWbWaDetailsWbTableName}.quantity`
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
        wbTransportRequisitionWbWaDetailsWbTableName,
        [
          `${wbTransportRequisitionWbWaDetailsWbTableName}.wb_id`,
          `${wbTransportRequisitionWbWaDetailsWbTableName}.quantity`
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

  exports.update = async (wbTransportRequisitionWbWaDetailsWb, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wbTransportRequisitionWbWaDetailsWbTableName,
        wbTransportRequisitionWbWaDetailsWb,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };