const yarnQueries = require("../../db/queries/general/yarn");
const yarnLotQueries = require("../../db/queries/general/yarn-lot");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { wbTransportWaWbDetailsTableName, wbTableName, waAddRequisitionDetailsTableName, waTableName, wbReconciliationRequisitionTableName, wbTransportRequisitionWbWaTableName, waReconciliationRequisitionTableName, yarnTableName, waReconciliationRequisitionDetailsTableName, warehouseTableName, waExecuteOrderRequisitionTableName, waTransitionBetweenWHRequisitionTableName } = require("../../util/database-tables-name");

exports.create = async (yarn) => {
  yarn.id = trans.transform();
  // yarn.lotId = trans.transform();
  // check
  const selectOneResult = await yarnQueries.selectOne({ code: yarn.code });
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await yarnQueries.insert(yarn);
  if (results) {
    // await yarnLotQueries.insertForYarn(yarn);
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await yarnQueries.select();
  return results;
};


// exports.selectNotInIds = async (yarnsIds) => {
//   let whereCluse = {};
//   whereCluse[`${yarnTableName}.is_deleted`] = 0;
//   whereCluse[`${yarnTableName}.is_active`] = 1;
//   const results = await yarnQueries.selectNotInIds(whereCluse, yarnsIds);
//   return results;
// };

exports.selectStoredWaYarns = async (whereCluseArray) => {
  const results = await yarnQueries.selectStoredWaYarns(whereCluseArray);
  return results;
};

exports.selectStoredWaYarnsForReturn = async (whereCluse) => {
  const results = await yarnQueries.selectStoredWaYarnsForReturn(whereCluse);
  return results;
};

exports.selectStoredWaYarnsAndWarehouses = async (whereCluseArray) => {
  const results = await yarnQueries.selectStoredWaYarnsAndWarehouses(whereCluseArray);
  return results;
};

exports.selectStoredWaYarnsByYarnId = async (yarnId) => {
  let yarnWhereCluse = {};
  yarnWhereCluse[`${yarnTableName}.id`] = yarnId;
  yarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
  yarnWhereCluse[`${yarnTableName}.is_active`] = 1;
  yarnWhereCluse[`${waTableName}.is_deleted`] = 0;
  yarnWhereCluse[`${waTableName}.is_active`] = 1;
  yarnWhereCluse[`${warehouseTableName}.is_stock`] = 1;

  let reconciliationWhereCluse = {};
  reconciliationWhereCluse[`${yarnTableName}.id`] = yarnId;
  reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
  reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
  reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
  reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
  reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
  reconciliationWhereCluse[`${warehouseTableName}.is_stock`] = 1;

  let transportWbWaWhereCluse = {};
  transportWbWaWhereCluse[`${yarnTableName}.id`] = yarnId;
  transportWbWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
  transportWbWaWhereCluse[`${yarnTableName}.is_active`] = 1;
  transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
  transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
  transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
  transportWbWaWhereCluse[`${warehouseTableName}.is_stock`] = 1;

  let transitionBetweenWhWhereCluse = {};
  transitionBetweenWhWhereCluse[`${yarnTableName}.id`] = yarnId;
  transitionBetweenWhWhereCluse[`${yarnTableName}.is_deleted`] = 0;
  transitionBetweenWhWhereCluse[`${yarnTableName}.is_active`] = 1;
  transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
  transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
  transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
  transitionBetweenWhWhereCluse[`${warehouseTableName}.is_stock`] = 1;

  let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, transportWbWaWhereCluse, transitionBetweenWhWhereCluse]

  const results = await yarnQueries.selectStoredWaYarnsByYarnId(whereCluseArray);
  return results;
};

exports.selectByWarehouseWa = async (warehouseId) => {
  let whereCluse = {};
    whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;

    let executeOrderWaWhereCluse = {};
    executeOrderWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${waTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.type`] = constantsPayloads.executeOrderType;
    executeOrderWaWhereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, 
      transportWbWaWhereCluse, executeOrderWaWhereCluse, transitionBetweenWhWhereCluse]

  const results = await yarnQueries.selectByWarehouseWa(whereCluseArray);
  return results;
};

exports.selectByIndustryWb = async (industryId) => {

  let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]

  const results = await yarnQueries.selectByIndustryWb(whereCluseArray);
  return results;
};

exports.selectStoredWbYarnsInManufacturers = async (whereCluseArray) => {
  const results = await yarnQueries.selectStoredWbYarnsInManufacturers(whereCluseArray);
  return results;
};

exports.selectDeleted = async () => {
  const results = await yarnQueries.selectDeleted();
  return results;
};

exports.update = async (yarn) => {
  // check is found
  const isFound = await yarnQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: yarn.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await yarnQueries.selectOne(function () {
      this.where("code", "=", yarn.code).andWhere("id", "<>", yarn.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await yarnQueries.update(yarn);
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
    const isItemAdded = await yarnQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarnId,
    });

    if (isItemAdded[0] != null) {
      const results = await yarnQueries.delete(yarnId);
      if (!results) {
        return constants.deleteError;
      }
      else if (bodyPalod.length - 1 == i) {
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
    const isItemdeleted = await yarnQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: yarnId,
    });
    if (isItemdeleted[0] != null) {
      const results = await yarnQueries.restore(yarnId);
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