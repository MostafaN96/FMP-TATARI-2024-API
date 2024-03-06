const dyedFabricQueries = require("../../db/queries/general/dyed-fabric");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { wdDyeingRequisitionDetailsTableName, fabricTableName } = require("../../util/database-tables-name");

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