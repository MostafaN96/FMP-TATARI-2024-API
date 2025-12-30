// Queries
const fabricQueries = require("../../db/queries/general/fabric");
const fabricYarnsQueries = require("../../db/queries/general/fabric-yarns");

// Helpers
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbTableName, fabricTableName, wbManufacturingOutputTableName, wcTableName, wcReconciliationRequisitionDetailsTableName, wcFabricOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

// Services
const fabricYarnsService = require("./fabric-yarns");

exports.create = async (fabric) => {
  fabric.id = trans.transform();
    // check on emails
    const selectOneResult = await fabricQueries.selectOne({ code: fabric.code });
    if (selectOneResult[0] != null) {
      return constants.duplicatedData;
    }
  
    const results = await fabricQueries.insert(fabric);
    if (results) {
      if(fabric.isForm) {
        for (let i = 0; i < fabric.items.length; i++) {
          const yarn = fabric.items[i];
          await fabricYarnsQueries.insert(fabric, yarn)
        }
      }
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.select = async () => {
  const results = await fabricQueries.select();
  for (let i = 0; i < results.length; i++) {
    const element = results[i];
    element.yarns = await fabricYarnsService.selectByFabricId(element.id)
}
  return results;
};

exports.selectDeleted = async () => {
  const results = await fabricQueries.selectDeleted();
  return results;
};

exports.update = async (yarn) => {
    // check is found
    const isFound = await fabricQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarn.id,
    });
    if (isFound[0] != null) {
      // chick on duplication
      const checkDuplication = await fabricQueries.selectOne(function () {
        this.where("code", "=", yarn.code).andWhere("id", "<>", yarn.id);
      });
  
      if (checkDuplication[0] != null) {
        return constants.duplicatedData;
      } else {
        // updated
        const updateResults = await fabricQueries.update(yarn);
        if (updateResults) {
          return constants.updateSuccess;
        } else {
          return constants.updateError;
        }
      }
    } else {
      return constants.itemNotFound;
    }
  };


exports.dalete = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const yarnId = bodyPalod[i].id;

    // check is the item is found
    const isItemAdded = await fabricQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarnId,
    });

    if (isItemAdded[0] != null) {
      const results = await fabricQueries.delete(yarnId);
      if (!results) {
        return constants.deleteError;
      }
      else if (bodyPalod.length-1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

  };

exports.restore = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const yarnId = bodyPalod[i].id;

    // check is the item is found
    const isItemdeleted = await fabricQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: yarnId,
    });
    if (isItemdeleted[0] != null) {
      const results = await fabricQueries.restore(yarnId);
      if (!results) {
        return constants.restoreError;
      }
      else if (bodyPalod.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};

// Wb
exports.selectFabricToBeManufacturedWb = async (industryId) => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${wbTableName}.industry_id`] = industryId;
  whereInWhereCluse[`${wbTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${wbTableName}.is_active`] = 1;
  const results = await fabricQueries.selectFabricToBeManufacturedWb(whereCluse, whereInWhereCluse);
  return results;
};

exports.selectManufacturedFabricWb = async () => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
  const results = await fabricQueries.selectManufacturedFabricWb(whereCluse, whereInWhereCluse);
  return results;
};

exports.selectFabricsByOrderWc = async (orderRequisitionId) => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderRequisitionId;
  whereInWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
  const results = await fabricQueries.selectFabricsByOrder(whereCluse, whereInWhereCluse);
  return results;
};

exports.selectByWarehouseWc = async (warehouseId, fabricOrderId) => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;

  let wcWhereCluse = {};
  wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
  wcWhereCluse[`${wcTableName}.is_active`] = 1;
  wcWhereCluse[`wc_fabric_order_requisition_id`] = fabricOrderId;

  const results = await fabricQueries.selectStoredFabricsWc(whereCluse, wcWhereCluse, warehouseId);
  return results;
};

exports.selectByWarehouseWcForTransitionBetweenOrder = async (warehouseId, fabricOrderId, toFabricOrderId) => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;

  let wcWhereCluse = {};
  wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
  wcWhereCluse[`${wcTableName}.is_active`] = 1;
  wcWhereCluse[`wc_fabric_order_requisition_id`] = fabricOrderId;

  const results = await fabricQueries.selectByWarehouseWcForTransitionBetweenOrder(whereCluse, wcWhereCluse, warehouseId, toFabricOrderId);
  return results;
};

exports.selectStoredFabricsByFabricIdWc = async (fabricId) => {

  let wcFabricWhereCluse = {};
    wcFabricWhereCluse[`${fabricTableName}.id`] = fabricId;
    wcFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcFabricWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${wcTableName}.is_active`] = 1;

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${fabricTableName}.id`] = fabricId;
    wcReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${fabricTableName}.id`] = fabricId;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${fabricTableName}.id`] = fabricId;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;

  let whereCluseArray = [wcFabricWhereCluse, wcReconciliationWhereCluse, wcTransportWdWcWhereCluse, WcManufacturingOutputWhereCluse]

  const results = await fabricQueries.selectStoredFabricsForExecuteOrderWc(whereCluseArray);
  return results;
};

exports.selectStoredWcFabricsForReturn = async (whereCluse) => {
  const results = await fabricQueries.selectStoredWcFabricsForReturn(whereCluse);
  return results;
};

exports.selectFabricByDyedFabric = async (dyedFabricId) => {
  let whereCluse = {};
  whereCluse[`${fabricTableName}.id`] = dyedFabricId;
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  
  const results = await fabricQueries.selectFabricByDyedFabric(whereCluse);
  return results;
};