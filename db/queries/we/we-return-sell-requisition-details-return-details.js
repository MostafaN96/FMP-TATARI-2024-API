// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weReturnSellRequisitionDetailsReturnDetailsTableName = require("../../../util/database-tables-name").weReturnSellRequisitionDetailsReturnDetailsTableName;

exports.insert = async (weReturnSellRequisitionDetailsReturnDetails, items) => {
    let queryResults = false;
    await sqlFun
      .insert(weReturnSellRequisitionDetailsReturnDetailsTableName, {
        we_return_sell_requisition_details_id: items.weReturnSellRequisitionDetailsId,
        we_sell_requisition_details_id: items.weSellRequisitionDetailsId,
        quantity: items.updatedQuantity,
        creator_id: weReturnSellRequisitionDetailsReturnDetails.personid,
        ip_address: weReturnSellRequisitionDetailsReturnDetails.ipaddress,
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
        weReturnSellRequisitionDetailsReturnDetailsTableName,
        [
          `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`,
          `${weReturnSellRequisitionDetailsReturnDetailsTableName}.quantity`
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
        weReturnSellRequisitionDetailsReturnDetailsTableName,
        [
          `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`,
          `${weReturnSellRequisitionDetailsReturnDetailsTableName}.quantity`
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
    await knex
      .select([
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`,
        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.quantity`
      ])
      .from(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`)
      .where(whereCluse)
      .limit(1)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => {
        console.log(error);
      });
  
    return queryResults;
  };

  exports.update = async (weReturnSellRequisitionDetailsReturnDetails, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        weReturnSellRequisitionDetailsReturnDetailsTableName,
        weReturnSellRequisitionDetailsReturnDetails,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };