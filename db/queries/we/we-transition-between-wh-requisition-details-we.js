// Config
const sqlFun = require("../../config/sql-fun");
// Util
const { 
  weTransitionBetweenWHRequisitionDetailsWeTableName 
} = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenWHRequisitionDetailsWe, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weTransitionBetweenWHRequisitionDetailsWeTableName, {
        we_transition_between_wh_requisitions_details_id: items.weTransitionBetweenWHRequisitionDetailsId,
        we_id: items.weId,
        quantity: items.updatedQuantity,
        creator_id: weTransitionBetweenWHRequisitionDetailsWe.personid,
        ip_address: weTransitionBetweenWHRequisitionDetailsWe.ipaddress,
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
        weTransitionBetweenWHRequisitionDetailsWeTableName,
        [
          `${weTransitionBetweenWHRequisitionDetailsWeTableName}.we_id`,
          `${weTransitionBetweenWHRequisitionDetailsWeTableName}.quantity`
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
        weTransitionBetweenWHRequisitionDetailsWeTableName,
        [
          `${weTransitionBetweenWHRequisitionDetailsWeTableName}.we_id`,
          `${weTransitionBetweenWHRequisitionDetailsWeTableName}.quantity`
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
    .limitedSelect(weTransitionBetweenWHRequisitionDetailsWeTableName, [
      `${weTransitionBetweenWHRequisitionDetailsWeTableName}.we_id`,
    `${weTransitionBetweenWHRequisitionDetailsWeTableName}.quantity`
  ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


  exports.update = async (weTransitionBetweenWHRequisitionDetailsWe, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weTransitionBetweenWHRequisitionDetailsWeTableName,
        weTransitionBetweenWHRequisitionDetailsWe,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };