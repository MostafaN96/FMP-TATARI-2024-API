// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Queries
const wdFormDyeingRequisitionDetailsQueries = require("./wd-form-dyeing-requisition-details");

// Util
const { wdTransportWcWdTableName, wdTransportWcWdDetailsTableName,
  warehouseTableName, fabricTableName, consigmentManufacturingTableName,
  bussinessmanTableName, wdTableName, consigmentDyeingTableName, wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName } = require("../../../util/database-tables-name");
  const constantsPayloads = require("../../../util/constants-payloads");

exports.insert = async (wdTransportWcWd, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTransportWcWdDetailsTableName, {
      id: items.wdTransportWcWdDetailsId,
      wd_transport_wc_wd_id: wdTransportWcWd.id,
      fabric_id: items.fabricId,
      consigment_dyeing_id: items.consigmentDyeingId,
      consigment_manufacturing_id: items.consigmentManufacturingId,
      price: items.price,
      quantity: items.quantity,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: wdTransportWcWd.personid,
      ip_address: wdTransportWcWd.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`] = requisitionId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.select([
    `${wdTransportWcWdTableName}.id as requisition_id`,
    `${wdTransportWcWdTableName}.date`,
    `${wdTransportWcWdTableName}.number`,
    `${wdTransportWcWdTableName}.note`,
    `${warehouseTableName}.id as warehouse_id`,
    `${warehouseTableName}.name as warehouse_name`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
    `${wdTransportWcWdDetailsTableName}.id`,
    `${wdTransportWcWdDetailsTableName}.document`,
    `${wdTransportWcWdDetailsTableName}.statement`,
    `${wdTransportWcWdDetailsTableName}.price`,
    `${bussinessmanTableName}.name as dyer_name`,
    `${wdTableName}.current_quantity`,
  ])
    .sum(`${wdTransportWcWdDetailsTableName}.quantity as quantity`)
    .sum(`${wdTableName}.current_quantity as current_quantity`)
    .from(`${wdTransportWcWdDetailsTableName}`)
    .innerJoin(`${wdTransportWcWdTableName}`,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${wdTableName}`,
      `${wdTableName}.wd_transport_wc_wd_details_id`,
      `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wdTableName}.dyeing_id`)
    .groupBy(
      `${wdTransportWcWdDetailsTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`,
      `${wdTransportWcWdDetailsTableName}.price`,
            `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`,
      `${bussinessmanTableName}.id`,
    )
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// exports.selectWithFabricManufacturedByRequisitionId = async (requisitionId) => {
//   let queryResults = [];
//   let whereCluse = {};
//   whereCluse[`${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`] = requisitionId;
//   whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
//   whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

//   await knex.select([
//     `${wdTransportWcWdDetailsTableName}.id`,
//     `${wdTransportWcWdDetailsTableName}.quantity`,
//     `${wdTransportWcWdDetailsTableName}.document`,
//     `${wdTransportWcWdDetailsTableName}.statement`,
//     `${wdTransportWcWdDetailsTableName}.price`,
//     `${wdTransportWcWdTableName}.date`,
//     `${wdTransportWcWdTableName}.number`,
//     `${wdTransportWcWdTableName}.note`,
//     `${warehouseTableName}.id as warehouse_id`,
//     `${warehouseTableName}.name as warehouse_name`,
//     `${fabricTableName}.id as fabric_id`,
//     `${fabricTableName}.name as fabric_name`,
//     `${fabricTableName}.code as fabric_code`,
//     `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
//     `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
//     `${bussinessmanTableName}.name as dyer_name`,
//     `${wdTableName}.current_quantity`,
//   ])
//     .from(`${wdTransportWcWdDetailsTableName}`)
//     .innerJoin(`${wdTransportWcWdTableName}`,
//       `${wdTransportWcWdTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
//     .innerJoin(`${fabricTableName}`,
//       `${fabricTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.fabric_id`)
//     .innerJoin(`${consigmentManufacturingTableName}`,
//       `${consigmentManufacturingTableName}.id`,
//       `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
//     .innerJoin(`${warehouseTableName}`,
//       `${warehouseTableName}.id`,
//       `${wdTransportWcWdTableName}.warehouse_id`)
//     .innerJoin(`${wdTableName}`,
//       `${wdTableName}.wd_transport_wc_wd_details_id`,
//       `${wdTransportWcWdDetailsTableName}.id`)
//     .innerJoin(`${bussinessmanTableName}`,
//       `${bussinessmanTableName}.id`,
//       `${wdTableName}.dyeing_id`)
//     .where(whereCluse)
//     .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await knex
    .select([
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
      `${wdTransportWcWdDetailsTableName}.fabric_id`,
      `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTransportWcWdTableName}.warehouse_id`,
    ])
    .from(`${wdTransportWcWdDetailsTableName}`)
    .limit(1)
    .innerJoin(`${wdTransportWcWdTableName}`,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};


exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await knex(wdTransportWcWdDetailsTableName)
    .select(["wd_transport_wc_wd_details.id", "wd_transport_wc_wd_details.price"])
    .innerJoin(wdTransportWcWdTableName,
      `${wdTransportWcWdTableName}.id`,
      `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(wdTableName,
      `${wdTableName}.wd_transport_wc_wd_details_id`,
      `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wdTransportWcWd, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTransportWcWdDetailsTableName,
      wdTransportWcWd,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportWcWdDetailsTableName}.quantity`,
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    // .distinct()
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
      } else {
        queryResults = data
      }    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentManufacturing = async (dyeingId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTableName}.id as wd_id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        knex.raw('? as dyeing_quantity', '0'),
        // knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    // .distinct(`${wdTransportWcWdTableName}.id`)
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    // .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then(async (data) => {
      if(data[0] != null) {
        queryResults =  await wdFormDyeingRequisitionDetailsQueries.selectFormQuantityByWdId(data) ;
      } else {
        queryResults = data
      }    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentManufacturing = async (dyeingId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingId = async (fabricId, dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId = async (fabricId, dyeingId, consigmentDyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// Wa
exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        knex.raw('? as bussinessman_id', ''),
        knex.raw('? as bussinessman_name', ''),
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransportWcWdTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportWcWdTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectTotalDetailsByDateWd = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.price`,
        `${wdTransportWcWdDetailsTableName}.quantity`,
        `${wdTransportWcWdDetailsTableName}.document`,
        `${wdTransportWcWdDetailsTableName}.statement`,
        `${wdTransportWcWdTableName}.id as requisition_id`,
        `${wdTransportWcWdTableName}.number`,
        `${wdTransportWcWdTableName}.date`,
        `${wdTransportWcWdTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),

      ],
    )
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wdTransportWcWdTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wdTransportWcWdDetailsTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wdTableName}.dyeing_id`)
    .where(`${wdTransportWcWdTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wdTransportWcWdTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error)
    });
  return queryResults;
};


exports.selectInputTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;

  await knex.from(wdTransportWcWdDetailsTableName)
    .select(
      [
        `${wdTransportWcWdDetailsTableName}.price`,
        knex.raw('? as dyeing_quantity', '0'),
        `${wdTransportWcWdDetailsTableName}.quantity`,
        knex.raw(`coalesce(${wdFormDyeingRequisitionDetailsTableName}.current_quantity, 0) as form_current_quantity`),
        `${wdTransportWcWdTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل من (C) الى (D)'),
        knex.raw('? as input_output', '1')
      ],
    )
    .distinct()
    .innerJoin(`${wdTransportWcWdTableName}`, `${wdTransportWcWdTableName}.id`, `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
    .innerJoin(`${wdTableName}`, `${wdTableName}.wd_transport_wc_wd_details_id`, `${wdTransportWcWdDetailsTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`, `${wdTableName}.id`)
    .leftOuterJoin(`${wdFormDyeingRequisitionDetailsTableName}`, `${wdFormDyeingRequisitionDetailsTableName}.id`, `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
    .where(whereCluse)
    .andWhere(`${wdTransportWcWdDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};