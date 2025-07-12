// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  weTransitionBetweenOrdersRequisitionDetailsWeTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenOrdersRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weTransitionBetweenOrdersRequisitionDetailsWeTableName, {
        we_transition_between_orders_requisitions_details_id: items.weTransitionBetweenOrdersRequisitionDetailsId,
        we_id: items.weId,
        quantity: items.updatedQuantity,
        creator_id: weTransitionBetweenOrdersRequisitionDetailsWe.personid,
        ip_address: weTransitionBetweenOrdersRequisitionDetailsWe.ipaddress,
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
        weTransitionBetweenOrdersRequisitionDetailsWeTableName,
        [
          `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.we_id`,
          `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.quantity`
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
        weTransitionBetweenOrdersRequisitionDetailsWeTableName,
        [
          `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.we_id`,
          `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.quantity`
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
    .limitedSelect(weTransitionBetweenOrdersRequisitionDetailsWeTableName, [
      `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.we_id`,
    `${weTransitionBetweenOrdersRequisitionDetailsWeTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (weTransitionBetweenOrdersRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weTransitionBetweenOrdersRequisitionDetailsWeTableName,
        weTransitionBetweenOrdersRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };