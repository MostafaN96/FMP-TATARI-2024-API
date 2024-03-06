// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { wbTransitionBetweenIndustriesRequisitionDetailsWbTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbTransitionBetweenIndustriesRequisitionDetailsWb, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, {
        wb_transition_between_industries_requisition_details_id: items.wbTransitionBetweenIndustriesRequisitionDetailsId,
        wb_id: items.wbId,
        quantity: items.updatedQuantity,
        creator_id: wbTransitionBetweenIndustriesRequisitionDetailsWb.personid,
        ip_address: wbTransitionBetweenIndustriesRequisitionDetailsWb.ipaddress,
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
        wbTransitionBetweenIndustriesRequisitionDetailsWbTableName,
        [
          `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.quantity`
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
        wbTransitionBetweenIndustriesRequisitionDetailsWbTableName,
        [
          `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.quantity`
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

  exports.update = async (wbTransitionBetweenIndustriesRequisitionDetailsWb, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wbTransitionBetweenIndustriesRequisitionDetailsWbTableName,
        wbTransitionBetweenIndustriesRequisitionDetailsWb,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };