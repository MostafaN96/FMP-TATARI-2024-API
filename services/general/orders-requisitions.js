
// Queries
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Helpers
const trans = require("../../helpers/transform");
const { 
  ordersRequisitionsTableName
} = require("../../util/database-tables-name");

exports.create = async (orderRequisitions) => {
  const results = await ordersRequisitionsQueries.insertForDyeingOrder(orderRequisitions);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.createForDyedFabricOrderwe = async (orderRequisitions) => {
  orderRequisitions.ordersRequisitionsId = trans.transform();
  const results = await ordersRequisitionsQueries.insertForDyedFabricOrderwe(orderRequisitions);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.checkForCreateOrder = async (orderRequisitions) => {
  if(orderRequisitions.ordersRequisitionsId == "") {
    orderRequisitions.ordersRequisitionsId = trans.transform();
    const results = await ordersRequisitionsQueries.insert(orderRequisitions);
    if (results) {
      return true;
    } else {
      return false;
    }
  } else {
    return true
  }
};

exports.selectByDyeingIdForYarnOrder = async (ordersRequisitionsId) => {  
  let whereCluse = {};
  whereCluse[`${ordersRequisitionsTableName}.id`] = ordersRequisitionsId;
  whereCluse[`${ordersRequisitionsTableName}.is_deleted`] = 0;
  whereCluse[`${ordersRequisitionsTableName}.is_active`] = 1;

    const results = await ordersRequisitionsQueries.selectByDyeingIdForYarnOrder(whereCluse);    
    return results;

};

exports.selectByDyeingIdForFabricOrderWc = async (ordersRequisitionsId) => {
  let whereCluse = {};
  whereCluse[`${ordersRequisitionsTableName}.id`] = ordersRequisitionsId;
  whereCluse[`${ordersRequisitionsTableName}.is_deleted`] = 0;
  whereCluse[`${ordersRequisitionsTableName}.is_active`] = 1;

    const results = await ordersRequisitionsQueries.selectByDyeingIdForFabricOrderWc(whereCluse);
    return results;

};


exports.selectWaYarnConsigmentsOrder = async (whereCluse) => {
  const results = await ordersRequisitionsQueries.selectWaYarnConsigmentsOrder(whereCluse);
  return results;
};