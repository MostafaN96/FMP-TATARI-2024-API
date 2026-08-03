const dyeingColorsPricesQueries = require("../../db/queries/general/dyeing-colors-prices");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { anointedColorsPricesTableName } = require("../../util/database-tables-name");

exports.create = async (dyeingColorsPrices) => {
  let results = false

  console.log("dyeingColorsPrices ::: ", dyeingColorsPrices);
  

  for (let i = 0; i < dyeingColorsPrices.items.length; i++) {
    const dyeingColorPrice = dyeingColorsPrices.items[i];
    dyeingColorPrice.id = trans.transform();

    // check on Duplicated Data
    const selectOneResult = await dyeingColorsPricesQueries.selectOne({code: dyeingColorPrice.code});
    if (selectOneResult[0] == null) {
      // Insert Data
      results = await dyeingColorsPricesQueries.insert(dyeingColorsPrices, dyeingColorPrice);
    }
    
  }
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await dyeingColorsPricesQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await dyeingColorsPricesQueries.selectDeleted();
  return results;
};

exports.selectByColorId = async (colorId) => {
  let whereCluse = {}
  whereCluse[`${anointedColorsPricesTableName}.color_id`] = colorId;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;

  const results = await dyeingColorsPricesQueries.selectByWhereCluse(whereCluse);
  return results;
};

exports.update = async (dyeingColorsPrices) => {
  // check is found
  const isFound = await dyeingColorsPricesQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: dyeingColorsPrices.id,
  });
  if (isFound[0] != null) {
      // updated
      const updateResults = await dyeingColorsPricesQueries.update(dyeingColorsPrices);
      if (updateResults) {
        return constants.updateSuccess;
      } else {
        return constants.updateError;
      }
  } else {
    return constants.itemNotFound;
  }
};

exports.dalete = async (dyeingColorsPrices) => {
  for (let i = 0; i < dyeingColorsPrices.length; i++) {
    const dyeingColorsPricesId = dyeingColorsPrices[i].id;

    // check is the item is found
    const isItemAdded = await dyeingColorsPricesQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: dyeingColorsPricesId,
    });

    if (isItemAdded[0] != null) {
      const results = await dyeingColorsPricesQueries.delete(dyeingColorsPricesId);
      if (!results) {
        return constants.deleteError;
      }
      else if (dyeingColorsPrices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (dyeingColorsPrices) => {
  for (let i = 0; i < dyeingColorsPrices.length; i++) {
    const dyeingColorsPricesId = dyeingColorsPrices[i].id;

    // check is the item is found
    const isItemdeleted = await dyeingColorsPricesQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: dyeingColorsPricesId,
    });
    if (isItemdeleted[0] != null) {
      const results = await dyeingColorsPricesQueries.restore(dyeingColorsPricesId);
      if (!results) {
        return constants.restoreError;
      }
      else if (dyeingColorsPrices.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};