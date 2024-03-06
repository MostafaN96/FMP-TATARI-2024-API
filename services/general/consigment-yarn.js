// Queries 
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.select = async () => {
  const results = await consigmentYarnQueries.select();
  return results;
}; 

exports.create = async (consigmentYarn) => {
  consigmentYarn.id = trans.transform();
  // check on emails
  const selectOneResult = await consigmentYarnQueries.selectOne({ number: consigmentYarn.number});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await consigmentYarnQueries.insert(consigmentYarn);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.selectDeleted = async () => {
  const results = await consigmentYarnQueries.selectDeleted();
  return results;
};


exports.update = async (consigmentYarn) => {
  // check is found
  const isFound = await consigmentYarnQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: consigmentYarn.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await consigmentYarnQueries.selectOne(function () {
      this.where({ number: consigmentYarn.number}).andWhere("id", "<>", consigmentYarn.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await consigmentYarnQueries.update(consigmentYarn);
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


exports.dalete = async (consigmentYarn) => {
  for (let i = 0; i < consigmentYarn.length; i++) {
    const consigmentYarnId = consigmentYarn[i].id;

    // check is the item is found
    const isItemAdded = await consigmentYarnQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: consigmentYarnId,
    });

    if (isItemAdded[0] != null) {
      const results = await consigmentYarnQueries.delete(consigmentYarnId);
      if (!results) {
        return constants.deleteError;
      }
      else if (consigmentYarn.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (consigmentYarn) => {
  for (let i = 0; i < consigmentYarn.length; i++) {
    const consigmentYarnId = consigmentYarn[i].id;

    // check is the item is found
    const isItemdeleted = await consigmentYarnQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: consigmentYarnId,
    });
    if (isItemdeleted[0] != null) {
      const results = await consigmentYarnQueries.restore(consigmentYarnId);
      if (!results) {
        return constants.restoreError;
      }
      else if (consigmentYarn.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};