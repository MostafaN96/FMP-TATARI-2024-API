const dyedFabricQueries = require("../../db/queries/general/dyed-fabric");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { 
  wdDyeingRequisitionDetailsTableName, fabricTableName, 
  weTableName, weReconciliationRequisitionDetailsTableName, 
  colorTableName, weAddRequisitionDetailsTableName, anointedColorsPricesTableName, 
  weDyedFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (fabric) => {
  fabric.id = trans.transform();
  // check on emails

  let whereCluse = {};
  whereCluse[`${fabricTableName}.code`] = fabric.code;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;
  const selectOneResult = await dyedFabricQueries.selectOne(whereCluse);
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await dyedFabricQueries.insert(fabric);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await dyedFabricQueries.select();
  return results;
};

exports.selectStoredWaYarns = async (whereCluseArray) => {
  const results = await dyedFabricQueries.selectStoredWaYarns(whereCluseArray);
  return results;
};

exports.selectStoredWaYarnsForReturn = async (whereCluse) => {
  const results = await dyedFabricQueries.selectStoredWaYarnsForReturn(whereCluse);
  return results;
};


exports.selectDyedFabric = async () => {
  let whereInTableName = wdDyeingRequisitionDetailsTableName
  let whereInAttr = "dyed_fabric_id"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await dyedFabricQueries.selectWhereInDyedFabric(whereInTableName, whereInAttr, whereInWhereCluse);
  return results;
};


exports.selectDyedFabricsByOrderWe = async (orderRequisitionId) => {
  
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderRequisitionId;
  whereInWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
  const results = await dyedFabricQueries.selectDyedFabricsByOrder(whereCluse, whereInWhereCluse);
  return results;
};

exports.selectStoredDyedFabricsByDyedFabricByColorByColorCodeWe = async (dyedFabricId, colorId, colorCode) => {

  let weFabricWhereCluse = {};
    weFabricWhereCluse[`${fabricTableName}.id`] = dyedFabricId;
    weFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    weFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    weFabricWhereCluse[`${weTableName}.is_deleted`] = 0;
    weFabricWhereCluse[`${weTableName}.is_active`] = 1;
    weFabricWhereCluse[`${weTableName}.type`] = constantsPayloads.addType;
    weFabricWhereCluse[`${colorTableName}.id`] = colorId;
    weFabricWhereCluse[`${weAddRequisitionDetailsTableName}.color_code`] = colorCode;

    let weReconciliationWhereCluse = {};
    weReconciliationWhereCluse[`${fabricTableName}.id`] = dyedFabricId;
    weReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    weReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    weReconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    weReconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    weReconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
    weReconciliationWhereCluse[`${colorTableName}.id`] = colorId;
    weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_code`] = colorCode;

    let WdDyeingRequisitionWhereCluse = {};
    WdDyeingRequisitionWhereCluse[`${fabricTableName}.id`] = dyedFabricId;
    WdDyeingRequisitionWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    WdDyeingRequisitionWhereCluse[`${fabricTableName}.is_active`] = 1;
    WdDyeingRequisitionWhereCluse[`${weTableName}.is_deleted`] = 0;
    WdDyeingRequisitionWhereCluse[`${weTableName}.is_active`] = 1;
    WdDyeingRequisitionWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;
    WdDyeingRequisitionWhereCluse[`${colorTableName}.id`] = colorId;
    WdDyeingRequisitionWhereCluse[`${anointedColorsPricesTableName}.code`] = colorCode;

  let whereCluseArray = [
    weFabricWhereCluse, weReconciliationWhereCluse, 
    WdDyeingRequisitionWhereCluse
  ]

  const results = await dyedFabricQueries.selectStoredDyedFabricsByDyedFabricIdWe(whereCluseArray);
  return results;
};


exports.selectDeleted = async () => {
  const results = await dyedFabricQueries.selectDeleted();
  return results;
};

exports.update = async (fabric) => {
  // check is found
  let whereCluse = {};
  whereCluse[`${fabricTableName}.id`] = fabric.id;
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;
  const isFound = await dyedFabricQueries.selectOne(whereCluse);
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await dyedFabricQueries.selectOne(function () {
      this.where(`${fabricTableName}.code`, "=", fabric.code).andWhere(`${fabricTableName}.id`, "<>", fabric.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await dyedFabricQueries.update(fabric);
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
    const fabricId = bodyPalod[i].id;

    let whereCluse = {};
    whereCluse[`${fabricTableName}.id`] = fabricId;
    whereCluse[`${fabricTableName}.is_deleted`] = 0;
    whereCluse[`${fabricTableName}.is_active`] = 1;
    whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;
    // check is the item is found
    const isItemAdded = await dyedFabricQueries.selectOne(whereCluse);

    if (isItemAdded[0] != null) {
      const results = await dyedFabricQueries.delete(fabricId);
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
    const fabricId = bodyPalod[i].id;

    let whereCluse = {};
    whereCluse[`${fabricTableName}.id`] = fabricId;
    whereCluse[`${fabricTableName}.is_deleted`] = 1;
    whereCluse[`${fabricTableName}.is_active`] = 0;
    whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;
    // check is the item is found
    const isItemdeleted = await dyedFabricQueries.selectOne(whereCluse);
    if (isItemdeleted[0] != null) {
      const results = await dyedFabricQueries.restore(fabricId);
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