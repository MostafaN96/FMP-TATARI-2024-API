// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  weTransitionBetweenWHRequisitionDetailsTableName, 
  weTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  fabricTableName, 
  weTableName, 
  warehouseUsersTableName,
  colorTableName,
  colorCategoryTableName,
  consigmentDyeingTableName} = require("../../../util/database-tables-name");

exports.insert = async (weTransitionBetweenWHRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(weTransitionBetweenWHRequisitionDetailsTableName, {
      id: items.weTransitionBetweenWHRequisitionDetailsId,
      from_warehouse_id: items.warehouseId,
      we_transition_between_wh_requisitions_id: weTransitionBetweenWHRequisitionDetails.id,
      dyed_fabric_id: items.dyedFabricId,
      color_category_id: items.colorCategoryId,
      color_id: items.colorId,
      consigment_dyeing_id: items.consigmentDyeingId,
      from_consigment_dyeing_id: items.fromConsigmentDyeingId,
      fabric_piece: items.numberFabricPieces,
      price: items.price,
      quantity: items.quantity,
      color_code: items.colorCode,
      work_order_number: items.workOrderNumber,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: weTransitionBetweenWHRequisitionDetails.personid,
      ip_address: weTransitionBetweenWHRequisitionDetails.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectByRequisitionId = async (whereCluse) => {
  let queryResults = [];

  let columns = [
    `id`,
    `price`,
    `quantity`,
    `fabric_piece`,
    `document`,
    `statement`,
    `requisition_id`,
    `number`,
    `date`,
    `note`,
    `requisition_id`,
    `number`,
    `date`,
    `from_warehouse_id`,
    `from_warehouse_name`,
    `to_warehouse_name`,
    `to_warehouse_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `color_category_name`,
    `color_name`,
    `color_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `work_order_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.document`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
      `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
      `${weTransitionBetweenWHRequisitionTableName}.number`,
      `${weTransitionBetweenWHRequisitionTableName}.date`,
      `${weTransitionBetweenWHRequisitionTableName}.note`,
      `${warehouseTableName}.id as from_warehouse_id`,
      `${warehouseTableName}.name as from_warehouse_name`,
      `to_warehouse.name as to_warehouse_name`,
      `to_warehouse.id as to_warehouse_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
    ])
      .from(`${weTransitionBetweenWHRequisitionDetailsTableName}`)
      .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`, 
      `${weTransitionBetweenWHRequisitionTableName}.id`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${warehouseTableName} as to_warehouse`,
      `to_warehouse.id`,
      `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
      .innerJoin(`${fabricTableName}`, 
      `${fabricTableName}.id`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_transition_between_wh_requisitions_details_id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
        .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
        .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.consigment_dyeing_id`)
      .where(whereCluse)
      .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
      .as('t1')
  }).as('temp')

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
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`,
    ])
    .from(`${weTransitionBetweenWHRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
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
  await sqlFun
    .selectWithJionWithLimit(weTransitionBetweenWHRequisitionDetailsTableName, 
      ["we_transition_between_wh_requisitions_details.id", 
      "we_transition_between_wh_requisitions_details.price"], 
      whereCluse,
      weTransitionBetweenWHRequisitionTableName, 
    `${weTransitionBetweenWHRequisitionTableName}.id`,
     `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (weTransitionBetweenWHRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      weTransitionBetweenWHRequisitionDetailsTableName,
      weTransitionBetweenWHRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByChemicalWChemicals = async (whereCluse) => {
  let queryResults = []

  await knex(fabricTableName)
      .select([
        `${fabricTableName}.id`, 
        `${fabricTableName}.name`, 
        `${fabricTableName}.code`, 
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`
      ])
      .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`, 
      `${fabricTableName}.id`)
      .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`, 
      `${weTransitionBetweenWHRequisitionTableName}.id`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
      .innerJoin(`${weTableName}`, 
      `${weTableName}.we_transition_between_wh_requisitions_details_id`, 
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .where(`${weTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
      .sum(`${weTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
        console.log("selectSumCurrentQuantityByWarehouseByChemicalWChemicals error ::: ", error);
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectFromWarehouseTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id as warehouse_id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id as warehouse_id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
      .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '( ', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorTableName}.name as color_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByFabricId = async (fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
`${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `from_warehouse.id as from_warehouse_id`,
        `from_warehouse.name as from_warehouse_name`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', from_warehouse.name, ')', ' الى مخزن ', '(', ${warehouseTableName}.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorTableName}.name as color_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName} as from_warehouse`, `from_warehouse.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByFabricIdByWarehouseId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByFabricIdByWarehouseId = async (toWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = toWarehouseId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByFabricId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorTableName}.name as color_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByFabricId = async (toWarehouseId, fabricId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = toWarehouseId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.fabric_piece`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', from_warehouse.name, ')', ' الى مخزن ', '(', ${warehouseTableName}.name, ')') as side_of`),
        knex.raw('? as is_return_type', 'not_return'),
        `${colorTableName}.name as color_name`,
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName} as from_warehouse`, `from_warehouse.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${colorTableName}`, 
    `${colorTableName}.id`, 
    `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '( ', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
      .where(`${weTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${weTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${weTransitionBetweenWHRequisitionTableName}.number`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        `${weTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
      `${weTransitionBetweenWHRequisitionTableName}.id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .innerJoin(`${weTableName}`,
      `${weTableName}.we_transition_between_wh_requisitions_details_id`,
      `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
    .innerJoin(`${warehouseTableName}`, `${warehouseTableName}.id`, `${weTransitionBetweenWHRequisitionTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, `to_warehouse.id`, `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
      .where(`${weTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${weTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehousePriceByWarehouseByFabricId = async (fromWarehouseId, fabricId) => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${weTransitionBetweenWHRequisitionTableName}.from_warehouse_id`] = fromWarehouseId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(weTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${weTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${weTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`, 
    `${weTransitionBetweenWHRequisitionTableName}.id`, 
    `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};