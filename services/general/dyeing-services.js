const dyeingServicesQueries = require("../../db/queries/general/dyeing-services");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (dyeingServices) => {
  dyeingServices.id = trans.transform();
  // check on emails
  const selectOneResult = await dyeingServicesQueries.selectOne({ name: dyeingServices.name});
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await dyeingServicesQueries.insert(dyeingServices);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await dyeingServicesQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await dyeingServicesQueries.selectDeleted();
  return results;
};

exports.selectAdded = async (id) => {
  const results = await dyeingServicesQueries.selectAdded(id);
  return results;
};

exports.selectNotIn = async (dyeingServices) => {
  const results = await dyeingServicesQueries.selectNotIn(dyeingServices);
  return results;
};

exports.selectByDeying = async (deyingId) => {
  const results = await dyeingServicesQueries.selectByDeying(deyingId);
  return results;
};

exports.update = async (dyeingServices) => {
  // check is found
  const isFound = await dyeingServicesQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: dyeingServices.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await dyeingServicesQueries.selectOne(function () {
      this.where({ name: dyeingServices.name}).andWhere("id", "<>", dyeingServices.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await dyeingServicesQueries.update(dyeingServices);
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


exports.dalete = async (dyeingServices) => {
  for (let i = 0; i < dyeingServices.length; i++) {
    const dyeingServicesId = dyeingServices[i].id;

    // check is the item is found
    const isItemAdded = await dyeingServicesQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: dyeingServicesId,
    });

    if (isItemAdded[0] != null) {
      const results = await dyeingServicesQueries.delete(dyeingServicesId);
      if (!results) {
        return constants.deleteError;
      }
      else if (dyeingServices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (dyeingServices) => {
  for (let i = 0; i < dyeingServices.length; i++) {
    const dyeingServicesId = dyeingServices[i].id;

    // check is the item is found
    const isItemdeleted = await dyeingServicesQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: dyeingServicesId,
    });
    if (isItemdeleted[0] != null) {
      const results = await dyeingServicesQueries.restore(dyeingServicesId);
      if (!results) {
        return constants.restoreError;
      }
      else if (dyeingServices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};