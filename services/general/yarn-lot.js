const yarnLotQueries = require("../../db/queries/general/yarn-lot");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { wbTransportWaWbDetailsTableName, wbTableName, wbReconciliationRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, waAddRequisitionDetailsTableName, waTableName, waReconciliationRequisitionTableName, wbTransportRequisitionWbWaTableName, yarnLotTableName, waReconciliationRequisitionDetailsTableName, wbTransportRequisitionWbWaDetailsTableName, waExecuteOrderRequisitionTableName, waExecuteOrderRequisitionDetailsTableName, waTransitionBetweenWHRequisitionTableName, waTransitionBetweenWHRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (yarnLot) => {
    yarnLot.id = trans.transform();
    // check on emails
    const selectOneResult = await yarnLotQueries.selectOne({ yarn_id: yarnLot.yarnId, code: yarnLot.code });
    if (selectOneResult[0] != null) {
      return constants.duplicatedData;
    }
  
    const results = await yarnLotQueries.insert(yarnLot);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.select = async () => {
  const results = await yarnLotQueries.select();
  return results;
};

exports.selectByYarn = async (yarnId) => {
  const results = await yarnLotQueries.selectByYarn(yarnId);
  return results;
};

exports.selectDeleted = async () => {
  const results = await yarnLotQueries.selectDeleted();
  return results;
};

exports.update = async (yarnLot) => {
    // check is found
    const isFound = await yarnLotQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarnLot.id,
    });
    if (isFound[0] != null) {
      // chick on duplication
      const checkDuplication = await yarnLotQueries.selectOne(function () {
        this.where("code", "=", yarnLot.code).andWhere("id", "<>", yarnLot.id);
      });
  
      if (checkDuplication[0] != null) {
        return constants.duplicatedData;
      } else {
        // updated
        const updateResults = await yarnLotQueries.update(yarnLot);
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
    const isItemAdded = await yarnLotQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarnId,
    });

    if (isItemAdded[0] != null) {
      const results = await yarnLotQueries.delete(yarnId);
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
    const isItemdeleted = await yarnLotQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: yarnId,
    });
    if (isItemdeleted[0] != null) {
      const results = await yarnLotQueries.restore(yarnId);
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


exports.selectByWarehouseByYarnWa = async (warehouseId, yarnId) => {

  let whereCluse = {};
  whereCluse[`${yarnLotTableName}.is_deleted`] = 0;
  whereCluse[`${yarnLotTableName}.is_active`] = 1;
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnLotTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnLotTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${yarnLotTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${yarnLotTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;

    let executeOrderWaWhereCluse = {};
    executeOrderWaWhereCluse[`${yarnLotTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${yarnLotTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${waTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.type`] = constantsPayloads.executeOrderType;
    executeOrderWaWhereCluse[`${waExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
    executeOrderWaWhereCluse[`${waExecuteOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${yarnLotTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${yarnLotTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, 
      transportWbWaWhereCluse, executeOrderWaWhereCluse, transitionBetweenWhWhereCluse]


  const results = await yarnLotQueries.selectByWarehouseByYarnWa(whereCluseArray);
  return results;
};

exports.selectBySupplierByWarehouseByYarnWa = async (supplierId, warehouseId, yarnId) => {
  const results = await yarnLotQueries.selectBySupplierByWarehouseByYarnWa(supplierId, warehouseId, yarnId);
  return results;
};

exports.selectByIndustryByYarnWb = async (industryId, yarnId) => {

  let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let yarnLotWhereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]

  const results = await yarnLotQueries.selectByIndustryByYarnWb(yarnLotWhereCluseArray);
  return results;
};