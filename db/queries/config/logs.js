// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { logsTableName } = require("../../../util/database-tables-name");

exports.insert = async (log) => {
  let queryResults = false;
  
  await sqlFun
    .insert(logsTableName, {
      url: `${log.url}`,
      method: `${log.method}`,
      comment: `${log.comment}`,
      body: `${JSON.stringify( log.body)}`,
      creator_id: `${log.creatorId}`,
      ip_address: `${log.ipAddress}`,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

