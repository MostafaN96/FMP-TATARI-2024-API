// Config
const { yarnTableName, waYarnOrderRequisitionTableName, waAddRequisitionDetailsTableName, waAddRequisitionDetailsYarnOrderTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");

// Util
const waAddRequisitionTableName = require("../../../util/database-tables-name").waAddRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (waAddRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waAddRequisitionTableName, {
      id: waAddRequisition.id,
      supplier_id: waAddRequisition.supplierId,
      number: waAddRequisition.number,
      date: waAddRequisition.date,
      note: waAddRequisition.note,
      creator_id: waAddRequisition.personid,
      ip_address: waAddRequisition.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForOrder = async (waAddRequisition) => {
  let queryResults = false;
  await sqlFun
    .insert(waAddRequisitionTableName, {
      id: waAddRequisition.id,
      supplier_id: waAddRequisition.supplierId,
      number: waAddRequisition.number,
      date: waAddRequisition.date,
      note: waAddRequisition.note,
      is_order: '1',
      creator_id: waAddRequisition.personid,
      ip_address: waAddRequisition.ipaddress,
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
  await sqlFun
    .limitedSelect(waAddRequisitionTableName, ["supplier_id", "is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionTableName}.is_active`] = 1;

  await sqlFun
    .selectWithJionOrderedBy(
      waAddRequisitionTableName,
      [
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionTableName}.number`,
        `${waAddRequisitionTableName}.date`,
        `${waAddRequisitionTableName}.note`,
        `${waAddRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.name as supplier_name`,
      ],
      whereCluse,
      `${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${waAddRequisitionTableName}.supplier_id`,
      `${waAddRequisitionTableName}.number`,
      'desc'
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOrders = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waAddRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionTableName}.is_active`] = 1;

  await knex
    .select([
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionTableName}.number`,
      `${waAddRequisitionTableName}.date`,
      `${waAddRequisitionTableName}.note`,
      `${waAddRequisitionTableName}.is_order`,
      `${bussinessmanTableName}.id as supplier_id`,
      `${bussinessmanTableName}.name as supplier_name`,
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${waYarnOrderRequisitionTableName}.number as order_number`,
      `seller.id as seller_id`,
      `seller.name as seller_name`,
    ])
    .from(`${waAddRequisitionTableName}`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
    `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
    `${waAddRequisitionTableName}.id`)
    .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
    `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
    `${waAddRequisitionDetailsTableName}.id`)
    .innerJoin(`${waYarnOrderRequisitionTableName}`,
    `${waYarnOrderRequisitionTableName}.id`,
    `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
    .innerJoin(`${yarnTableName}`,
    `${yarnTableName}.id`,
    `${waAddRequisitionDetailsTableName}.fabric_id`)
    .innerJoin(`${bussinessmanTableName}`,
    `${bussinessmanTableName}.id`,
    `${waAddRequisitionTableName}.industry_id`)
    .innerJoin(`${bussinessmanTableName} as seller`,
    `seller.id`,
    `${waYarnOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .orderBy(`${waAddRequisitionTableName}.number`, 'desc')
    .groupBy(`${waAddRequisitionTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.update = async (waAddRequisition, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waAddRequisitionTableName,
      waAddRequisition,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};