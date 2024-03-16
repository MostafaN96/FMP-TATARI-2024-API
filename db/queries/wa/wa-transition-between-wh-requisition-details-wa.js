// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  waTransitionBetweenWHRequisitionDetailsWaTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (waTransitionBetweenWHRequisitionDetailsWa, items) => {
    let queryResults = false;
    await sqlFun
      .insert(waTransitionBetweenWHRequisitionDetailsWaTableName, {
        wa_transition_between_wh_requisitions_details_id: items.waTransitionBetweenWHRequisitionDetailsId,
        wa_id: items.waId,
        quantity: items.updatedQuantity,
        creator_id: waTransitionBetweenWHRequisitionDetailsWa.personid,
        ip_address: waTransitionBetweenWHRequisitionDetailsWa.ipaddress,
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
        waTransitionBetweenWHRequisitionDetailsWaTableName,
        [
          `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_id`,
          `${waTransitionBetweenWHRequisitionDetailsWaTableName}.quantity`
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
        waTransitionBetweenWHRequisitionDetailsWaTableName,
        [
          `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_id`,
          `${waTransitionBetweenWHRequisitionDetailsWaTableName}.quantity`
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
  await sqlFun
    .limitedSelect(waTransitionBetweenWHRequisitionDetailsWaTableName, [
      `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_id`,
    `${waTransitionBetweenWHRequisitionDetailsWaTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (waTransitionBetweenWHRequisitionDetailsWa, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        waTransitionBetweenWHRequisitionDetailsWaTableName,
        waTransitionBetweenWHRequisitionDetailsWa,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };