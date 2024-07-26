// Queries
const gradeItemQueries = require("../../db/queries/general/grade-item");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Helpers
const trans = require("../../helpers/transform");

exports.create = async (gradeItem) => {
  gradeItem.id = trans.transform();
  // check on emails
  const selectOneResult = await gradeItemQueries.selectOne({ name: gradeItem.name });
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await gradeItemQueries.insert(gradeItem);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await gradeItemQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await gradeItemQueries.selectDeleted();
  return results;
};

exports.update = async (gradeItem) => {
  // check is found
  const isFound = await gradeItemQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: gradeItem.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await gradeItemQueries.selectOne(function () {
      this.where({ name: gradeItem.name }).andWhere("id", "<>", gradeItem.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await gradeItemQueries.update(gradeItem);
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


exports.dalete = async (gradeItem) => {
  for (let i = 0; i < gradeItem.length; i++) {
    const gradeItemId = gradeItem[i].id;

    // check is the item is found
    const isItemAdded = await gradeItemQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: gradeItemId,
    });

    if (isItemAdded[0] != null) {
      const results = await gradeItemQueries.delete(gradeItemId);
      if (!results) {
        return constants.deleteError;
      }
      else if (gradeItem.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (gradeItem) => {
  for (let i = 0; i < gradeItem.length; i++) {
    const gradeItemId = gradeItem[i].id;

    // check is the item is found
    const isItemdeleted = await gradeItemQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: gradeItemId,
    });
    if (isItemdeleted[0] != null) {
      const results = await gradeItemQueries.restore(gradeItemId);
      if (!results) {
        return constants.restoreError;
      }
      else if (gradeItem.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};