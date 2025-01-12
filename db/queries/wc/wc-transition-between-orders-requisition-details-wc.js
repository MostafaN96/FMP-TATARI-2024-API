// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  wcTransitionBetweenOrdersRequisitionDetailsWcTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (wcTransitionBetweenWHRequisitionDetailsWc, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wcTransitionBetweenOrdersRequisitionDetailsWcTableName, {
        wc_transition_between_orders_requisitions_details_id: items.wcTransitionBetweenOrdersRequisitionDetailsId,
        wc_id: items.wcId,
        quantity: items.updatedQuantity,
        creator_id: wcTransitionBetweenWHRequisitionDetailsWc.personid,
        ip_address: wcTransitionBetweenWHRequisitionDetailsWc.ipaddress,
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
        wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
        [
          `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`,
          `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.quantity`
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
        wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
        [
          `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`,
          `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.quantity`
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
    .limitedSelect(wcTransitionBetweenOrdersRequisitionDetailsWcTableName, [
      `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.wc_id`,
    `${wcTransitionBetweenOrdersRequisitionDetailsWcTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (wcTransitionBetweenWHRequisitionDetailsWc, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
        wcTransitionBetweenWHRequisitionDetailsWc,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };