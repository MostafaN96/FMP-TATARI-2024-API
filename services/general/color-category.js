const colorCategoryQueries = require("../../db/queries/general/color-category");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (colorCategory) => {
  colorCategory.id = trans.transform();
  // check on emails
  const selectOneResult = await colorCategoryQueries.selectOne({ name: colorCategory.name});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await colorCategoryQueries.insert(colorCategory);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await colorCategoryQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await colorCategoryQueries.selectDeleted();
  return results;
};

exports.selectByDeying = async (deyingId) => {
  const results = await colorCategoryQueries.selectByDeying(deyingId);
  return results;
};

exports.selectDyersAndRequisitionsColorCategoryOfFabrics = async (fabricId, supplierId) => {
  const results = await colorCategoryQueries.selectDyersAndRequisitionsColorCategoryOfFabrics(fabricId, supplierId);
  return results;
};

exports.update = async (colorCategory) => {
  // check is found
  const isFound = await colorCategoryQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: colorCategory.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await colorCategoryQueries.selectOne(function () {
      this.where({ name: colorCategory.name }).andWhere("id", "<>", colorCategory.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await colorCategoryQueries.update(colorCategory);
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


exports.dalete = async (colorCategory) => {
  for (let i = 0; i < colorCategory.length; i++) {
    const deliveryCarId = colorCategory[i].id;

    // check is the item is found
    const isItemAdded = await colorCategoryQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: deliveryCarId,
    });

    if (isItemAdded[0] != null) {
      const results = await colorCategoryQueries.delete(deliveryCarId);
      if (!results) {
        return constants.deleteError;
      }
      else if (colorCategory.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (colorCategory) => {
  for (let i = 0; i < colorCategory.length; i++) {
    const deliveryCarId = colorCategory[i].id;

    // check is the item is found
    const isItemdeleted = await colorCategoryQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: deliveryCarId,
    });
    if (isItemdeleted[0] != null) {
      const results = await colorCategoryQueries.restore(deliveryCarId);
      if (!results) {
        return constants.restoreError;
      }
      else if (colorCategory.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};