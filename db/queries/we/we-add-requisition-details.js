// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const weAddRequisitionDetailsTableName = require("../../../util/database-tables-name").weAddRequisitionDetailsTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const weAddRequisitionTableName = require("../../../util/database-tables-name").weAddRequisitionTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const { weTableName, colorTableName, colorCategoryTableName, consigmentDyeingTableName, gradeItemTableName } = require("../../../util/database-tables-name");
const constants = require("../../../util/constants");

exports.insert = async (weAddRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weAddRequisitionDetailsTableName, {
      id: weAddRequisitionDetails.weRequisitionDetailsId,
      we_add_requisition_id: weAddRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      warehouse_id: items.warehouseId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,      
      consigment_dyeing_id: items.consigmentDyeingId,
      grade_item_id: items.gradeItemId,
      price: items.price,
      price_dollar: items.priceDollar,
      color_code: items.colorCode,
      dyeing_code: items.dyeingCode,
      fabric_piece: items.numberFabricPieces,
      work_order_number: items.workOrderNumber,
      quantity: items.quantity,
      document: items.document,
      statement: items.statement,
      creator_id: weAddRequisitionDetails.personid,
      ip_address: weAddRequisitionDetails.ipaddress,
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
  whereCluse[`${weAddRequisitionDetailsTableName}.we_add_requisition_id`] = requisitionId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionDetailsTableName}.document`,
        `${weAddRequisitionDetailsTableName}.statement`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionDetailsTableName}.dyeing_code`,
        `${weAddRequisitionDetailsTableName}.fabric_piece`,
        `${weAddRequisitionDetailsTableName}.work_order_number as work_order_number_details`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${weAddRequisitionTableName}.work_order_number`,
        `${bussinessmanTableName}.name as supplier_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${warehouseTableName}.name as warehouse_name`,
        `${colorTableName}.id as color_id`,
        `${colorTableName}.name as color_name`,
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${weTableName}.storage_place`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,

      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorTableName}`, `${colorTableName}.id`, `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${colorCategoryTableName}`, `${colorCategoryTableName}.id`, `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${weTableName}`, `${weTableName}.we_add_requisition_details_id`, `${weAddRequisitionDetailsTableName}.id`)
    .innerJoin(`${consigmentDyeingTableName}`, `${consigmentDyeingTableName}.id`, `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`, 
      `${gradeItemTableName}.id`, 
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionDetailsTableName}.document`,
        `${weAddRequisitionDetailsTableName}.statement`,
        `${weAddRequisitionDetailsTableName}.fabric_piece`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        `${weAddRequisitionDetailsTableName}.dyeing_code`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionTableName}.id as requisition_id`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorCategoryTableName}`, 
    `${colorCategoryTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectDetailsByWarehouseByFabric = async (warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, 
      `${weAddRequisitionTableName}.id`, 
      `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDetailsDetailsByWarehouseByFabric = async (warehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionDetailsTableName}.document`,
        `${weAddRequisitionDetailsTableName}.statement`,
        `${weAddRequisitionDetailsTableName}.fabric_piece`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        `${weAddRequisitionDetailsTableName}.dyeing_code`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionTableName}.id as requisition_id`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${colorCategoryTableName}`, 
    `${colorCategoryTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
      `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`,
      `${consigmentDyeingTableName}.id`,
      `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectPriceWe = async (whereCluse) => {
  let queryResults = [];

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectLatestPrice = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .selectWithJionWithLimit(weAddRequisitionDetailsTableName, 
      [
        "we_add_requisition_details.id", 
      "we_add_requisition_details.price",
      "we_add_requisition_details.price_dollar",
    ], 
      whereCluse,
    weAddRequisitionTableName, 
    `${weAddRequisitionTableName}.id`,
     `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(weAddRequisitionDetailsTableName, ["we_add_requisition_id", "quantity", "is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weAddRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weAddRequisitionDetailsTableName,
      weAddRequisitionDetails,
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

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionDetailsTableName}.document`,
        `${weAddRequisitionDetailsTableName}.statement`,
        `${weAddRequisitionDetailsTableName}.fabric_piece`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        `${weAddRequisitionDetailsTableName}.dyeing_code`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionTableName}.id as requisition_id`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorCategoryTableName}`, 
    `${colorCategoryTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .where(`${weAddRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
    .andWhere(`${weAddRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByConsigmentDyeingForDyedFabricOrder = async (whereCluse, consigmentsDyeing) => {
  let queryResults = [];

  await knex.from(weAddRequisitionDetailsTableName)
    .select(
      [
        `${weAddRequisitionDetailsTableName}.id`,
        `${weAddRequisitionDetailsTableName}.price`,
        `${weAddRequisitionDetailsTableName}.price_dollar`,
        `${weAddRequisitionDetailsTableName}.quantity`,
        `${weAddRequisitionDetailsTableName}.document`,
        `${weAddRequisitionDetailsTableName}.statement`,
        `${weAddRequisitionDetailsTableName}.fabric_piece`,
        `${weAddRequisitionDetailsTableName}.work_order_number`,
        `${weAddRequisitionDetailsTableName}.dyeing_code`,
        `${weAddRequisitionDetailsTableName}.color_code`,
        `${weAddRequisitionTableName}.id as requisition_id`,
        `${weAddRequisitionTableName}.number`,
        `${weAddRequisitionTableName}.date`,
        `${weAddRequisitionTableName}.note`,
        `${bussinessmanTableName}.id as bussinessman_id`,
        `${bussinessmanTableName}.name as bussinessman_name`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${warehouseTableName}.name as warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن اضافة'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(${bussinessmanTableName}.name) as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`,
        `${gradeItemTableName}.name as grade_item_name`,
      ],
    )
    .innerJoin(`${weAddRequisitionTableName}`, `${weAddRequisitionTableName}.id`, `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weAddRequisitionTableName}.supplier_id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weAddRequisitionDetailsTableName}.warehouse_id`)
    .innerJoin(`${colorCategoryTableName}`, 
    `${colorCategoryTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.color_id`)
    .innerJoin(`${consigmentDyeingTableName}`, 
    `${consigmentDyeingTableName}.id`, 
    `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
    .innerJoin(`${gradeItemTableName}`,
      `${gradeItemTableName}.id`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`)
    .where(whereCluse)
    .andWhere(`${weAddRequisitionDetailsTableName}.quantity`, ">", 0)
    .whereIn(`${weAddRequisitionDetailsTableName}.consigment_dyeing_id`, consigmentsDyeing)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};