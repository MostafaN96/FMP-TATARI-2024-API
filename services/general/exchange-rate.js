const exchangeRateQueries = require("../../db/queries/general/exchange-rate");

// Util
const constants = require("../../util/constants");
const { 
  exchangeRateTableName 
} = require("../../util/database-tables-name");

// helpers
const trans = require("../../helpers/transform");

exports.select = async () => {
  const results = await exchangeRateQueries.select();
  return results;
};

exports.create = async (exchangeRate) => {

  // updated
  let whereCluse = {};
  whereCluse[`${exchangeRateTableName}.is_current`] = 1;
  const updateResults = await exchangeRateQueries.update({
    is_current: '0'
  }, whereCluse);
  if (updateResults) {
    exchangeRate.id = trans.transform();
    const results = await exchangeRateQueries.insert(exchangeRate);
    if (results) {
      return constants.updateSuccess;
    } else {
      return constants.updateError;
    }
  }
};