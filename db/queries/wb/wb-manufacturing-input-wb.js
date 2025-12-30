// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  wbManufacturingRequisitionTableName, 
  wbManufacturingInputOutputTableName, 
  wbManufacturingInputWbTableName, 
} = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingInputWb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingInputWbTableName, {
      wb_manufacturing_input_id: items.wbManufacturingInputId,
      wb_id: items.wbId,
      quantity: items.updatedQuantity,
      creator_id: wbManufacturingInputWb.personid,
      ip_address: wbManufacturingInputWb.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.select = async (whereCluse) => {
  let queryResults = [];
  await sqlFun
    .select(
      wbManufacturingInputWbTableName,
      [
        `${wbManufacturingInputWbTableName}.wb_id`,
        `${wbManufacturingInputWbTableName}.quantity`
      ],
      whereCluse
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
  let queryResults = [];
  await sqlFun
    .selectWithTwoCondition(
      wbManufacturingInputWbTableName,
      [
        `${wbManufacturingInputWbTableName}.wb_id`,
        `${wbManufacturingInputWbTableName}.quantity`
      ],
      whereCluse,
      andWhereCluseArray
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (wbManufacturingInputWb, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbManufacturingInputWbTableName,
      wbManufacturingInputWb,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectManufacturingRequisitionsForTransportWaWb = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wbManufacturingRequisitionTableName)
    .select(
      [
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
      ],
    )
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`,
      `${wbManufacturingRequisitionTableName}.id`)
    .innerJoin(`${wbManufacturingInputWbTableName}`,
      `${wbManufacturingInputWbTableName}.wb_manufacturing_input_id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingInputWbTableName}.quantity`, ">", 0)
    .groupBy(
      `${wbManufacturingRequisitionTableName}.id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};