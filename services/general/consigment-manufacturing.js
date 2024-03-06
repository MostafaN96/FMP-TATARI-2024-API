// Queries 
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.select = async () => {
  const results = await consigmentManufacturingQueries.select();
  return results;
}; 

exports.create = async (consigmentManufacturing) => {
  consigmentManufacturing.id = trans.transform();
  // check on emails
  const selectOneResult = await consigmentManufacturingQueries.selectOne({ number: consigmentManufacturing.number});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await consigmentManufacturingQueries.insert(consigmentManufacturing);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.selectDeleted = async () => {
  const results = await consigmentManufacturingQueries.selectDeleted();
  return results;
};


exports.update = async (consigmentManufacturing) => {
  // check is found
  const isFound = await consigmentManufacturingQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: consigmentManufacturing.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await consigmentManufacturingQueries.selectOne(function () {
      this.where({ number: consigmentManufacturing.number}).andWhere("id", "<>", consigmentManufacturing.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await consigmentManufacturingQueries.update(consigmentManufacturing);
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


exports.dalete = async (consigmentManufacturing) => {
  for (let i = 0; i < consigmentManufacturing.length; i++) {
    const consigmentManufacturingId = consigmentManufacturing[i].id;

    // check is the item is found
    const isItemAdded = await consigmentManufacturingQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: consigmentManufacturingId,
    });

    if (isItemAdded[0] != null) {
      const results = await consigmentManufacturingQueries.delete(consigmentManufacturingId);
      if (!results) {
        return constants.deleteError;
      }
      else if (consigmentManufacturing.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (consigmentManufacturing) => {
  for (let i = 0; i < consigmentManufacturing.length; i++) {
    const consigmentManufacturingId = consigmentManufacturing[i].id;

    // check is the item is found
    const isItemdeleted = await consigmentManufacturingQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: consigmentManufacturingId,
    });
    if (isItemdeleted[0] != null) {
      const results = await consigmentManufacturingQueries.restore(consigmentManufacturingId);
      if (!results) {
        return constants.restoreError;
      }
      else if (consigmentManufacturing.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};