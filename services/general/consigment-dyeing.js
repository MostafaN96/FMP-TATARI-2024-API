// Queries 
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.select = async () => {
  const results = await consigmentDyeingQueries.select();
  return results;
}; 

exports.create = async (consigmentDyeing) => {
  consigmentDyeing.id = trans.transform();
  // check on emails
  const selectOneResult = await consigmentDyeingQueries.selectOne({ number: consigmentDyeing.number});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await consigmentDyeingQueries.insert(consigmentDyeing);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.selectDeleted = async () => {
  const results = await consigmentDyeingQueries.selectDeleted();
  return results;
};


exports.update = async (consigmentDyeing) => {
  // check is found
  const isFound = await consigmentDyeingQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: consigmentDyeing.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await consigmentDyeingQueries.selectOne(function () {
      this.where({ number: consigmentDyeing.number}).andWhere("id", "<>", consigmentDyeing.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await consigmentDyeingQueries.update(consigmentDyeing);
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


exports.dalete = async (consigmentDyeing) => {
  for (let i = 0; i < consigmentDyeing.length; i++) {
    const consigmentDyeingId = consigmentDyeing[i].id;

    // check is the item is found
    const isItemAdded = await consigmentDyeingQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: consigmentDyeingId,
    });

    if (isItemAdded[0] != null) {
      const results = await consigmentDyeingQueries.delete(consigmentDyeingId);
      if (!results) {
        return constants.deleteError;
      }
      else if (consigmentDyeing.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (consigmentDyeing) => {
  for (let i = 0; i < consigmentDyeing.length; i++) {
    const consigmentDyeingId = consigmentDyeing[i].id;

    // check is the item is found
    const isItemdeleted = await consigmentDyeingQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: consigmentDyeingId,
    });
    if (isItemdeleted[0] != null) {
      const results = await consigmentDyeingQueries.restore(consigmentDyeingId);
      if (!results) {
        return constants.restoreError;
      }
      else if (consigmentDyeing.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};