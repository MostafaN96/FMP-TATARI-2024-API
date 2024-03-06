const colorQueries = require("../../db/queries/general/color");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (color) => {
  color.id = trans.transform();
  // check on emails
  const selectOneResult = await colorQueries.selectOne({ name: color.name});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await colorQueries.insert(color);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await colorQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await colorQueries.selectDeleted();
  return results;
};

exports.selectByDeying = async (deyingId) => {
  const results = await colorQueries.selectByDeying(deyingId);
  return results;
};

exports.selectByCategoryAndDeying = async (deyingId, colorCategoryId) => {
  const results = await colorQueries.selectByCategoryAndDeying(deyingId, colorCategoryId);
  return results;
};

exports.selectByCategory = async (colorCategoryId) => {
  const results = await colorQueries.selectByCategory(colorCategoryId);
  return results;
};

exports.selectDyersAndRequisitionsColorOfFabrics = async (fabricId, supplierId, colorCategoryId, requisitionId) => {
  const results = await colorQueries.selectDyersAndRequisitionsColorOfFabrics(fabricId, supplierId, colorCategoryId, requisitionId);
  return results;
};

exports.update = async (color) => {
  // check is found
  const isFound = await colorQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: color.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await colorQueries.selectOne(function () {
      this.where({ name: color.name}).andWhere("id", "<>", color.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await colorQueries.update(color);
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


exports.dalete = async (color) => {
  for (let i = 0; i < color.length; i++) {
    const colorId = color[i].id;

    // check is the item is found
    const isItemAdded = await colorQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: colorId,
    });

    if (isItemAdded[0] != null) {
      const results = await colorQueries.delete(colorId);
      if (!results) {
        return constants.deleteError;
      }
      else if (color.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (color) => {
  for (let i = 0; i < color.length; i++) {
    const colorId = color[i].id;

    // check is the item is found
    const isItemdeleted = await colorQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: colorId,
    });
    if (isItemdeleted[0] != null) {
      const results = await colorQueries.restore(colorId);
      if (!results) {
        return constants.restoreError;
      }
      else if (color.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};