const dyeingServicesPricesQueries = require("../../db/queries/general/dyeing-services-prices");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (dyeingServicesPrices) => {
  let results = false

  for (let i = 0; i < dyeingServicesPrices.items.length; i++) {
    const dyeingServicePrice = dyeingServicesPrices.items[i];
    dyeingServicePrice.id = trans.transform();
    results = await dyeingServicesPricesQueries.insert(dyeingServicesPrices, dyeingServicePrice);
  }
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await dyeingServicesPricesQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await dyeingServicesPricesQueries.selectDeleted();
  return results;
};

exports.update = async (dyeingServicesPrices) => {
  // check is found
  const isFound = await dyeingServicesPricesQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: dyeingServicesPrices.id,
  });
  if (isFound[0] != null) {
      // updated
      const updateResults = await dyeingServicesPricesQueries.update(dyeingServicesPrices);
      if (updateResults) {
        return constants.updateSuccess;
      } else {
        return constants.updateError;
      }
  } else {
    return constants.itemNotFound;
  }
};

exports.dalete = async (dyeingServicesPrices) => {
  for (let i = 0; i < dyeingServicesPrices.length; i++) {
    const dyeingServicesPricesId = dyeingServicesPrices[i].id;

    // check is the item is found
    const isItemAdded = await dyeingServicesPricesQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: dyeingServicesPricesId,
    });

    if (isItemAdded[0] != null) {
      const results = await dyeingServicesPricesQueries.delete(dyeingServicesPricesId);
      if (!results) {
        return constants.deleteError;
      }
      else if (dyeingServicesPrices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (dyeingServicesPrices) => {
  for (let i = 0; i < dyeingServicesPrices.length; i++) {
    const dyeingServicesPricesId = dyeingServicesPrices[i].id;

    // check is the item is found
    const isItemdeleted = await dyeingServicesPricesQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: dyeingServicesPricesId,
    });
    if (isItemdeleted[0] != null) {
      const results = await dyeingServicesPricesQueries.restore(dyeingServicesPricesId);
      if (!results) {
        return constants.restoreError;
      }
      else if (dyeingServicesPrices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};