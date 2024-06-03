// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbManufacturingInputOutputTableName = require("../../../util/database-tables-name").wbManufacturingInputOutputTableName;

exports.insert = async (wbManufacturingInputOutput, items, isOrder) => {
    let queryResults = false;
    await sqlFun
      .insert(wbManufacturingInputOutputTableName, {
        wb_manufacturing_requisition_id: wbManufacturingInputOutput.id,
        wb_manufacturing_input_id: items.wbManufacturingInputId,
        wb_manufacturing_output_id: wbManufacturingInputOutput.wbManufacturingOutputId,
        is_order: String(isOrder),
        creator_id: wbManufacturingInputOutput.personid,
        ip_address: wbManufacturingInputOutput.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };
  
  
exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
    ])
    .from(`${wbManufacturingInputOutputTableName}`)
    .limit(1)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};
  
exports.select = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
    ])
    .from(`${wbManufacturingInputOutputTableName}`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};