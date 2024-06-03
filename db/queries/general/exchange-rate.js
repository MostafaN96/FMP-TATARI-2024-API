// Config
const sqlFun = require("../../config/sql-fun");

// Util
const {exchangeRateTableName} = require("../../../util/database-tables-name");

exports.insert = async (exchangeRate) => {
  let queryResults = false;
  await sqlFun
  .insert(exchangeRateTableName, {
    id: exchangeRate.id,
    dollar_price: exchangeRate.dollarPrice,
    creator_id: exchangeRate.personid,
    ip_address: exchangeRate.ipaddress
  })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.update = async (exchangeRate, whereCluese) => {
  let queryResults = false;
  await sqlFun
    .update(
      exchangeRateTableName,
      exchangeRate,
      whereCluese
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      exchangeRateTableName,
      [
        `${exchangeRateTableName}.id`,
        `${exchangeRateTableName}.dollar_price`,
      ],
      {
        is_deleted: "0",
        is_active: "1",
        is_current: "1",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};