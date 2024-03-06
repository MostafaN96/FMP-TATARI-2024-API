// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { fabricYarnsTableName, yarnTableName, fabricTableName } = require("../../../util/database-tables-name");

exports.insert = async (fabricYarns, yarn) => {
    let queryResults = false;
    await sqlFun
        .insert(fabricYarnsTableName, {
            fabric_id: fabricYarns.id,
            yarn_id: yarn.yarnId,
            ratio: yarn.ratio,
            wast_ratio: yarn.wastRatio,
            creator_id: fabricYarns.personid,
            ip_address: fabricYarns.ipaddress
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.update = async (fabricYarns, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        fabricYarnsTableName,
        fabricYarns,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };

exports.select = async (whereCluse) => {
    let queryResults = [];
  
    await knex.from(fabricYarnsTableName)
      .select(
        [
          `${fabricYarnsTableName}.fabric_id`,
          `${fabricYarnsTableName}.yarn_id`,
          `${fabricYarnsTableName}.ratio`,
          `${fabricYarnsTableName}.wast_ratio`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.fabric_quantity_m2`,
          knex.raw(`coalesce((${fabricYarnsTableName}.ratio + ${fabricYarnsTableName}.wast_ratio), 0) as total_ratio`),
        ],
      )
      .innerJoin(`${yarnTableName}`, 
      `${yarnTableName}.id`, 
      `${fabricYarnsTableName}.yarn_id`)
      .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${fabricYarnsTableName}.fabric_id`)
      .where(whereCluse)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };


  exports.selectOne = async (whereCluse) => {
    let queryResults = false;
    await sqlFun
      .limitedSelect(fabricYarnsTableName, ["is_deleted"], whereCluse, 1)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => {
        console.log(error);
      });
  
    return queryResults;
  };
  
exports.delete = async (whereCluse) => {
    let queryResults = false;
    await sqlFun
      .delete(fabricYarnsTableName, whereCluse)
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };