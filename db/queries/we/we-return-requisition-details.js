// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weReturnRequisitionDetailsTableName, weReturnRequisitionTableName, fabricTableName,
  bussinessmanTableName, warehouseTableName, weTableName, weReturnRequisitionDetailsWeTableName, weAddRequisitionDetailsTableName, colorCategoryTableName, colorTableName,
  gradeItemTableName
} = require("../../../util/database-tables-name");

exports.insert = async (weReturnRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weReturnRequisitionDetailsTableName, {
      id: items.weReturnRequisitionDetailsId,
      we_return_requisition_id: weReturnRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      warehouse_id: items.warehouseId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      fabric_piece: items.numberFabricPieces,
      statement: items.statement,
      is_defect: items.isDefect,
      creator_id: weReturnRequisitionDetails.personid,
      ip_address: weReturnRequisitionDetails.ipaddress,
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
  whereCluse[`${weReturnRequisitionDetailsTableName}.we_return_requisition_id`] = requisitionId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.id`,
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionDetailsTableName}.fabric_piece`,
        `${weReturnRequisitionDetailsTableName}.statement`,
        `${weReturnRequisitionDetailsTableName}.is_defect`,
        `${weReturnRequisitionTableName}.id as requisition_id`,
        `${weReturnRequisitionTableName}.number`,
        `${weReturnRequisitionTableName}.date`,
        `${weReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as supplier_id`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${weReturnRequisitionDetailsWeTableName}`,
      `${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`,
      `${weReturnRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weReturnRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${weAddRequisitionDetailsTableName}`,
      `${weAddRequisitionDetailsTableName}.id`,
      `${weTableName}.we_add_requisition_details_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_id`)
      .innerJoin(`${gradeItemTableName}`, 
    `${gradeItemTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.id`,
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionDetailsTableName}.fabric_piece`,
        `${weReturnRequisitionDetailsTableName}.statement`,
        `${weReturnRequisitionDetailsTableName}.is_defect`,
        `${weReturnRequisitionTableName}.id as requisition_id`,
        `${weReturnRequisitionTableName}.number`,
        `${weReturnRequisitionTableName}.date`,
        `${weReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'return_buy'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        knex.raw(
        `CASE WHEN ${weReturnRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع شراء عيب بضاعة' 
        ELSE 'مرتجع شراء'  
        END as return_type_name`),
        knex.raw('? as consigment_dyeing_number', ''),
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${weReturnRequisitionDetailsWeTableName}`,
      `${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`,
      `${weReturnRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weReturnRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${weAddRequisitionDetailsTableName}`,
      `${weAddRequisitionDetailsTableName}.id`,
      `${weTableName}.we_add_requisition_details_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, 
      `${weReturnRequisitionTableName}.id`, 
      `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabric = async (warehouseId, dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.id`,
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionDetailsTableName}.fabric_piece`,
        `${weReturnRequisitionDetailsTableName}.statement`,
        `${weReturnRequisitionDetailsTableName}.is_defect`,
        `${weReturnRequisitionTableName}.id as requisition_id`,
        `${weReturnRequisitionTableName}.number`,
        `${weReturnRequisitionTableName}.date`,
        `${weReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'return_buy'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        knex.raw(
          `CASE WHEN ${weReturnRequisitionDetailsTableName}.is_defect = '1' THEN 'مرتجع شراء عيب بضاعة' 
        ELSE 'مرتجع شراء'  
        END as return_type_name`),
        knex.raw('? as consigment_dyeing_number', ''),
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${weReturnRequisitionDetailsWeTableName}`,
      `${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`,
      `${weReturnRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weReturnRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${weAddRequisitionDetailsTableName}`,
      `${weAddRequisitionDetailsTableName}.id`,
      `${weTableName}.we_add_requisition_details_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (dyedFabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weReturnRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;

  await knex
    .select([
      `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`,
      `${weReturnRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weReturnRequisitionDetailsTableName}.warehouse_id`,
      `${weReturnRequisitionDetailsTableName}.quantity`
    ])
    .from(`${weReturnRequisitionDetailsTableName}`)
    .innerJoin(`${weReturnRequisitionTableName}`,
      `${weReturnRequisitionTableName}.id`,
      `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
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

exports.update = async (weReturnRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weReturnRequisitionDetailsTableName,
      weReturnRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weReturnRequisitionDetailsTableName)
    .select(
      [
        `${weReturnRequisitionDetailsTableName}.id`,
        `${weReturnRequisitionDetailsTableName}.price`,
        `${weReturnRequisitionDetailsTableName}.price_dollar`,
        `${weReturnRequisitionDetailsTableName}.quantity`,
        `${weReturnRequisitionDetailsTableName}.fabric_piece`,
        `${weReturnRequisitionDetailsTableName}.statement`,
        `${weReturnRequisitionDetailsTableName}.is_defect`,
        `${weReturnRequisitionTableName}.id as requisition_id`,
        `${weReturnRequisitionTableName}.number`,
        `${weReturnRequisitionTableName}.date`,
        `${weReturnRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.dyeing_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن مرتجع'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'return_buy'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
      ],
    )
    .innerJoin(`${weReturnRequisitionTableName}`, `${weReturnRequisitionTableName}.id`, `${weReturnRequisitionDetailsTableName}.we_return_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weReturnRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${weReturnRequisitionDetailsWeTableName}`,
      `${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`,
      `${weReturnRequisitionDetailsTableName}.id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.id`,
      `${weReturnRequisitionDetailsWeTableName}.we_id`)
    .innerJoin(`${weAddRequisitionDetailsTableName}`,
      `${weAddRequisitionDetailsTableName}.id`,
      `${weTableName}.we_add_requisition_details_id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${weAddRequisitionDetailsTableName}.color_id`)
      .where(`${weReturnRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weReturnRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weReturnRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};