// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wbManufacturingOutputTableName, wbManufacturingRequisitionTableName, wbManufacturingInputOutputTableName, fabricTableName, circularKnittingMachineTableName, consigmentManufacturingTableName, circularKnittingMachineBussinessmanTableName, warehouseTableName, wbManufacturingOutputOrderTableName, wbManufacturingOrderRequisitionDetailsTableName, wbManufacturingOrderRequisitionTableName, bussinessmanTableName, wcTableName, wbManufacturingInputTableName, wcFabricOrderRequisitionTableName, wdTransportWcWdDetailsWcTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingOutput, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbManufacturingOutputTableName, {
      id: wbManufacturingOutput.wbManufacturingOutputId,
      wc_fabric_order_requisition_details_id: wbManufacturingOutput.wcFabricOrderRequisitionDetailsId,
      wc_fabric_order_requisition_id: wbManufacturingOutput.fabricOrderId,
      orders_requisitions_id: wbManufacturingOutput.ordersRequisitionsId,
      fabric_id: wbManufacturingOutput.fabricId,
      consigment_manufacturing_id: wbManufacturingOutput.consigmentManufacturingId,
      circular_knitting_machine_bussiness_man_id: wbManufacturingOutput.circularKnittingMachineId,
      warehouse_id: wbManufacturingOutput.warehouseId,
      quantity: wbManufacturingOutput.fabricQuantity,
      fabric_piece: wbManufacturingOutput.numberFabricPieces,
      price: wbManufacturingOutput.fabricPrice,
      price_dollar: wbManufacturingOutput.fabricPriceDollar,
      manufacturing_fee: wbManufacturingOutput.manufacturingFee,
      manufacturing_fee_dollar: wbManufacturingOutput.manufacturingFeeDollar,
      document: wbManufacturingOutput.document,
      statement: wbManufacturingOutput.statement,
      creator_id: wbManufacturingOutput.personid,
      ip_address: wbManufacturingOutput.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectLatestManufacturingFeeByIndustryAndFabric = async (whereCluse) => {
  let queryResults = [];

  await knex(`${wbManufacturingOutputTableName}`)
    .select([
      `${wbManufacturingOutputTableName}.manufacturing_fee`,
    ])
    .max(`${wbManufacturingRequisitionTableName}.date`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.manufacturing_fee`, `>`, `0`)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.select = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wbManufacturingOutputTableName}.id`,
    `${wbManufacturingOutputTableName}.consigment_manufacturing_id`,
    `${wbManufacturingOutputTableName}.quantity`,
    `${wbManufacturingOutputTableName}.price`,
    `${wbManufacturingOutputTableName}.price_dollar`,
    `${wbManufacturingOutputTableName}.manufacturing_fee`,
    `${wbManufacturingOutputTableName}.manufacturing_fee_dollar`,
    `${wbManufacturingOutputTableName}.fabric_piece`,
    `${wbManufacturingOutputTableName}.document`,
    `${wbManufacturingOutputTableName}.statement`,
  ])
    .from(`${wbManufacturingOutputTableName}`) 
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionId = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.id`] = requisitionId;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingOutputTableName}.id`,
    `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`,
    `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_details_id`,
    `${wbManufacturingOutputTableName}.orders_requisitions_id`,
    `${wbManufacturingOutputTableName}.circular_knitting_machine_bussiness_man_id`,
    `${wbManufacturingOutputTableName}.quantity`,
    `${wbManufacturingOutputTableName}.price`,
    `${wbManufacturingOutputTableName}.price_dollar`,
    `${wbManufacturingOutputTableName}.manufacturing_fee`,
    `${wbManufacturingOutputTableName}.manufacturing_fee_dollar`,
    `${wbManufacturingOutputTableName}.fabric_piece`,
    `${wbManufacturingOutputTableName}.document`,
    `${wbManufacturingOutputTableName}.statement`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${circularKnittingMachineTableName}.type as circular_knitting_machine_type`,
    `${circularKnittingMachineTableName}.diameter as circular_knitting_machine_diameter`,
    `${circularKnittingMachineTableName}.smoothness as circular_knitting_machine_smoothness`,
    `${circularKnittingMachineTableName}.model as circular_knitting_machine_model`,
    `${circularKnittingMachineTableName}.number as circular_knitting_machine_number`,
    knex.raw(`CONCAT(${circularKnittingMachineTableName}.type, ' - طراز (', ${circularKnittingMachineTableName}.model, ')') as circular_knitting_machine_name`),
    `${wbManufacturingOutputTableName}.consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_number`,
    `${warehouseTableName}.name as warehouse_name`,
    `${wbManufacturingRequisitionTableName}.industry_id as manufacture_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
  ])
    .distinct()
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbManufacturingOutputTableName}.warehouse_id`)
    .innerJoin(`${circularKnittingMachineBussinessmanTableName}`,
      `${circularKnittingMachineBussinessmanTableName}.id`,
      `${wbManufacturingOutputTableName}.circular_knitting_machine_bussiness_man_id`)
    .innerJoin(`${circularKnittingMachineTableName}`,
      `${circularKnittingMachineTableName}.id`,
      `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`)
    .where(whereCluse)
    // .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByRequisitionIdForOrder = async (requisitionId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.id`] = requisitionId;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingOutputTableName}.circular_knitting_machine_bussiness_man_id`,
    `${wbManufacturingOutputTableName}.price`,
    `${wbManufacturingOutputTableName}.price_dollar`,
    `${wbManufacturingOutputTableName}.manufacturing_fee`,
    `${wbManufacturingOutputTableName}.manufacturing_fee_dollar`,
    `${wbManufacturingOutputTableName}.fabric_piece`,
    `${wbManufacturingOutputTableName}.document`,
    `${wbManufacturingOutputTableName}.statement`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
    `${circularKnittingMachineTableName}.type as circular_knitting_machine_type`,
    `${circularKnittingMachineTableName}.diameter as circular_knitting_machine_diameter`,
    `${circularKnittingMachineTableName}.smoothness as circular_knitting_machine_smoothness`,
    `${circularKnittingMachineTableName}.model as circular_knitting_machine_model`,
    `${circularKnittingMachineTableName}.number as circular_knitting_machine_number`,
    knex.raw(`CONCAT(${circularKnittingMachineTableName}.type, ' - طراز (', ${circularKnittingMachineTableName}.model, ')') as circular_knitting_machine_name`),
    `${consigmentManufacturingTableName}.number as consigment_number`,
    `${warehouseTableName}.name as warehouse_name`,
    `${wbManufacturingOrderRequisitionTableName}.number as order_number`,
    `${bussinessmanTableName}.name as seller_name`,
    `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
    `${wbManufacturingOutputOrderTableName}.quantity`,
    `${wbManufacturingRequisitionTableName}.industry_id as manufacture_id`,
  ])
    .distinct()
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${wbManufacturingOutputTableName}.warehouse_id`)
    .innerJoin(`${circularKnittingMachineBussinessmanTableName}`,
      `${circularKnittingMachineBussinessmanTableName}.id`,
      `${wbManufacturingOutputTableName}.circular_knitting_machine_bussiness_man_id`)
    .innerJoin(`${circularKnittingMachineTableName}`,
      `${circularKnittingMachineTableName}.id`,
      `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .innerJoin(`${wbManufacturingOutputOrderTableName}`,
      `${wbManufacturingOutputOrderTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingOrderRequisitionDetailsTableName}`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.id`,
      `${wbManufacturingOutputOrderTableName}.wb_manufacturing_order_requisition_details_id`)
    .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
      `${wbManufacturingOrderRequisitionTableName}.id`,
      `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`,
      `${bussinessmanTableName}.id`,
      `${wbManufacturingOrderRequisitionTableName}.seller_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectConsigmentManufacturingByFabric = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingOutputTableName}.fabric_id`,
    `${wbManufacturingOutputTableName}.consigment_manufacturing_id`,
    `${consigmentManufacturingTableName}.number as consigment_number`,
  ])
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .groupBy(`${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWcConsigmentsManufacturing = async (whereCluse, consigmentsYarn) => {
  let queryResults = [];

  await knex
    .pluck(`${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${wbManufacturingInputOutputTableName}`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingInputTableName}`,
      `${wbManufacturingInputTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_input_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .whereIn(`${wbManufacturingInputTableName}.consigment_yarn_id`, consigmentsYarn)
    .groupBy(`${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wbManufacturingOutputTableName, [
      "fabric_id",
      "consigment_manufacturing_id",
      "quantity",
      "is_deleted"
    ], whereCluse, 1)
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

  await knex(wbManufacturingOutputTableName)
  .select([
    `${wbManufacturingOutputTableName}.id`,
  `${wbManufacturingOutputTableName}.price`,
  `${wbManufacturingOutputTableName}.price_dollar`,
])
    .innerJoin(wbManufacturingInputOutputTableName,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
      `${wbManufacturingOutputTableName}.id`)
    .innerJoin(wbManufacturingRequisitionTableName,
      `${wbManufacturingRequisitionTableName}.id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
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

exports.update = async (wbManufacturingOutput, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbManufacturingOutputTableName,
      wbManufacturingOutput,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .distinct()
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.id`,
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingOutputTableName}.document`,
        `${wbManufacturingOutputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.industry_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${wbManufacturingRequisitionTableName}.is_order`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .distinct()
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)    
    .innerJoin(`${wcTableName}`, `${wcTableName}.wb_manufacturing_output_id`, `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbManufacturingOutputTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbManufacturingRequisitionTableName}.industry_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .distinct()
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)    
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing = async (warehouseId, fabricId, consigmentManufacturingId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`] = fabricOrderId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.id`,
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingOutputTableName}.document`,
        `${wbManufacturingOutputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.industry_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${wbManufacturingRequisitionTableName}.is_order`,
        `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
        `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .distinct()
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)    
    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
      `${wcFabricOrderRequisitionTableName}.id`,
      `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${wbManufacturingRequisitionTableName}.industry_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, `${consigmentManufacturingTableName}.id`, `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${wbManufacturingOutputTableName}.warehouse_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)    
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricIdByConsigmentManufacturingId = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.from(wbManufacturingOutputTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
    `${wbManufacturingRequisitionTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)    
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectSumCurrentQuantityByWarehouseByFabricWc = async (whereCluse) => {
  let queryResults = []

  await knex(consigmentManufacturingTableName)
      .select([
        `${consigmentManufacturingTableName}.id`, 
        `${consigmentManufacturingTableName}.number`, 
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
      ])
      .innerJoin(`${wbManufacturingOutputTableName}`, 
      `${wbManufacturingOutputTableName}.consigment_manufacturing_id`, 
      `${consigmentManufacturingTableName}.id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wb_manufacturing_output_id`, 
      `${wbManufacturingOutputTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
      .sum(`${wcTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
      })
  return queryResults
}


exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(wbManufacturingRequisitionTableName)
    .select(
      [
        `${wbManufacturingOutputTableName}.id`,
        `${wbManufacturingOutputTableName}.price`,
        `${wbManufacturingOutputTableName}.price_dollar`,
        `${wbManufacturingOutputTableName}.quantity`,
        `${wbManufacturingOutputTableName}.fabric_piece`,
        `${wbManufacturingOutputTableName}.document`,
        `${wbManufacturingOutputTableName}.statement`,
        `${wbManufacturingRequisitionTableName}.id as requisition_id`,
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingRequisitionTableName}.date`,
        `${wbManufacturingRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
      ],
    )
    .distinct()
    .innerJoin(`${wbManufacturingInputOutputTableName}`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`, 
    `${wbManufacturingRequisitionTableName}.id`)
    .innerJoin(`${wbManufacturingOutputTableName}`, 
    `${wbManufacturingOutputTableName}.id`, 
    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
    .innerJoin(`${wcTableName}`, 
    `${wcTableName}.wb_manufacturing_output_id`, 
    `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${wbManufacturingOutputTableName}.warehouse_id`)
    .innerJoin(`${fabricTableName}`, 
    `${fabricTableName}.id`, 
    `${wbManufacturingOutputTableName}.fabric_id`)
    .innerJoin(`${consigmentManufacturingTableName}`, 
    `${consigmentManufacturingTableName}.id`, 
    `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .innerJoin(`${bussinessmanTableName}`, 
    `${bussinessmanTableName}.id`,
     `${wbManufacturingRequisitionTableName}.industry_id`)
    .where(`${wbManufacturingRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
        .andWhere(`${wbManufacturingRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectByFabricByConsigmentManufacturing = async (fabricId, consigmentManufacturingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  await knex.select([
    `${wbManufacturingOutputTableName}.id`,
    `${wbManufacturingOutputTableName}.price`,
    `${wbManufacturingOutputTableName}.price_dollar`,
    `${wbManufacturingOutputTableName}.manufacturing_fee`,
    `${wbManufacturingOutputTableName}.manufacturing_fee_dollar`,
    `${wbManufacturingOutputTableName}.fabric_piece`,
    `${fabricTableName}.id as fabric_id`,
    `${fabricTableName}.name as fabric_name`,
    `${fabricTableName}.code as fabric_code`,
  ])
  .count('fabric_id as length')
  .sum(`${wbManufacturingOutputTableName}.quantity as quantity`)
  .sum(`${wbManufacturingOutputTableName}.price as price`)
  .sum(`${wbManufacturingOutputTableName}.price_dollar as price_dollar`)
  .sum(`${wbManufacturingOutputTableName}.manufacturing_fee as manufacturing_fee`)
  .sum(`${wbManufacturingOutputTableName}.manufacturing_fee_dollar as manufacturing_fee_dollar`)
    .from(`${wbManufacturingOutputTableName}`)
    .innerJoin(`${fabricTableName}`,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .groupBy(`${wbManufacturingOutputTableName}.fabric_id`,
    `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectRequisitionsForWcFabricOrderRequisition = async (whereCluse) => {
  let queryResults = [];

  await knex.from(wdTransportWcWdDetailsWcTableName)
    .select(
      [
        `${wbManufacturingRequisitionTableName}.number`,
        `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id as requisition_id`,
        `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`,
        knex.raw('? as type_of_requisition', 'اذن تصنيع'),
      ],
    )
    .innerJoin(`${wcTableName}`, 
      `${wcTableName}.id`, 
      `${wdTransportWcWdDetailsWcTableName}.wc_id`)
    .innerJoin(`${wbManufacturingOutputTableName}`, 
      `${wbManufacturingOutputTableName}.id`, 
      `${wcTableName}.wb_manufacturing_output_id`)
      .innerJoin(`${wbManufacturingInputOutputTableName}`, 
        `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
        `${wbManufacturingOutputTableName}.id`)
    .innerJoin(`${wbManufacturingRequisitionTableName}`, 
      `${wbManufacturingRequisitionTableName}.id`, 
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
    .where(whereCluse)
    .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
    .andWhere(`${wdTransportWcWdDetailsWcTableName}.quantity`, ">", 0)
    .groupBy(
      `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`,
      `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};