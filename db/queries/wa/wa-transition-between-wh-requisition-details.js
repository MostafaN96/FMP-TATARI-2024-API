// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { 
  waTransitionBetweenWHRequisitionDetailsTableName, 
  waTransitionBetweenWHRequisitionTableName, 
  warehouseTableName, 
  yarnTableName, 
  waTableName, 
  warehouseUsersTableName,
  consigmentYarnTableName,
  yarnLotTableName,
  waTransitionBetweenWHRequisitionDetailsWaTableName} = require("../../../util/database-tables-name");

exports.insert = async (waTransitionBetweenWHRequisitionDetails, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waTransitionBetweenWHRequisitionDetailsTableName, {
      id: items.waTransitionBetweenWHRequisitionDetailsId,
      wa_transition_between_wh_requisitions_id: waTransitionBetweenWHRequisitionDetails.id,
      from_warehouse_id: items.fromWarehouseId,
      from_consigment_yarn_id: items.fromConsigmentYarnId,
      yarn_id: items.yarnId,
      yarn_lot_id: items.yarnLotId,
      consigment_yarn_id: items.consigmentYarnId,
      price: items.price,
      price_dollar: items.priceDollar,
      quantity: items.quantity,
      document: items.document ?? '',
      statement: items.statement ?? '',
      creator_id: waTransitionBetweenWHRequisitionDetails.personid,
      ip_address: waTransitionBetweenWHRequisitionDetails.ipaddress,
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
    `price_dollar`,
    `quantity`,
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
    `yarn_name`,
    `yarn_code`,
    `consigment_yarn_number`,
    `from_consigment_yarn_number`,
    `yarn_lot_code`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
      `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
      `${waTransitionBetweenWHRequisitionTableName}.number`,
      `${waTransitionBetweenWHRequisitionTableName}.date`,
      `${waTransitionBetweenWHRequisitionTableName}.note`,
      `${warehouseTableName}.id as from_warehouse_id`,
      `${warehouseTableName}.name as from_warehouse_name`,
      `to_warehouse.name as to_warehouse_name`,
      `to_warehouse.id as to_warehouse_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `from_consigment_yarn.number as from_consigment_yarn_number`,
      `${yarnLotTableName}.code as yarn_lot_code`,
    ])
      .from(`${waTransitionBetweenWHRequisitionDetailsTableName}`)
      .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`, 
      `${waTransitionBetweenWHRequisitionTableName}.id`, 
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`, 
      `${warehouseTableName}.id`, 
      `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
      .innerJoin(`${warehouseTableName} as to_warehouse`,
      `to_warehouse.id`,
      `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
      .innerJoin(`${yarnTableName}`, 
      `${yarnTableName}.id`, 
      `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
        .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
        .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_yarn_id`)
      .where(whereCluse)
      .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
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
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_yarn_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
      `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`,
    ])
    .from(`${waTransitionBetweenWHRequisitionDetailsTableName}`)
    .limit(1)
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
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
    .selectWithJionWithLimit(waTransitionBetweenWHRequisitionDetailsTableName, 
      ["wa_transition_between_wh_requisitions_details.id", "wa_transition_between_wh_requisitions_details.price"], 
      whereCluse,
      waTransitionBetweenWHRequisitionTableName, 
    `${waTransitionBetweenWHRequisitionTableName}.id`,
     `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`,
    1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (waTransitionBetweenWHRequisitionDetails, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waTransitionBetweenWHRequisitionDetailsTableName,
      waTransitionBetweenWHRequisitionDetails,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectSumCurrentQuantityByWarehouseByYarnWa = async (whereCluse) => {
  let queryResults = []

  await knex(yarnLotTableName)
  .select([
    `${yarnLotTableName}.id`, 
    `${yarnLotTableName}.code`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`
  ])
  .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`, 
  `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`, 
  `${yarnLotTableName}.id`)
      .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`, 
      `${waTransitionBetweenWHRequisitionTableName}.id`, 
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${waTableName}`, 
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`, 
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .where(`${waTableName}.current_quantity`, ">", "0")
      .andWhere(whereCluse)
      .groupBy(`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
      .sum(`${waTableName}.current_quantity as current_quantity`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
        console.log("selectSumCurrentQuantityByWarehouseByChemicalWChemicals error ::: ", error);
          queryResults = constants.errorPayload
      })
  return queryResults
}

exports.selectFromWarehouseTotalByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id as warehouse_id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0')
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${warehouseTableName}`,
      `${warehouseTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id as warehouse_id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1')
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '( ', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, 
    `to_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByYarnIdByWarehouseId = async (yarnId, warehouseId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `from_warehouse.id as from_warehouse_id`,
        `from_warehouse.name as from_warehouse_name`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', from_warehouse.name, ')', ' الى مخزن ', '(', ${warehouseTableName}.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName} as from_warehouse`, 
    `from_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${waTransitionBetweenWHRequisitionDetailsWaTableName}`,
      `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .innerJoin(`${waTableName}`,
      `${waTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
      .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, 
    `to_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseDetailsDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', from_warehouse.name, ')', ' الى مخزن ', '(', ${warehouseTableName}.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName} as from_warehouse`, 
    `from_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectFromWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '( ', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, 
    `to_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${waTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${waTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehouseTotalDetailsByDate = async (bodyPaylod) => {
  let queryResults = [];

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.document`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.statement`,
        `${waTransitionBetweenWHRequisitionTableName}.id as requisition_id`,
        `${waTransitionBetweenWHRequisitionTableName}.number`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        `${waTransitionBetweenWHRequisitionTableName}.note`,
        `${warehouseTableName}.id as warehouse_id`,
        `${warehouseTableName}.name as warehouse_name`,
        `${yarnTableName}.name as yarn_name`,
        `${yarnTableName}.code as yarn_code`,
        `${yarnLotTableName}.code as yarn_lot_code`,
        `${consigmentYarnTableName}.number as consigment_yarn_number`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '1'),
        knex.raw(`CONCAT(' اذن نقل من مخزن ', '(', ${warehouseTableName}.name, ')', ' الى مخزن ', '(', to_warehouse.name, ')') as side_of`),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
      `${waTransitionBetweenWHRequisitionTableName}.id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
      `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
    .innerJoin(`${yarnTableName}`, 
    `${yarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
    .innerJoin(`${warehouseTableName}`, 
    `${warehouseTableName}.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.from_warehouse_id`)
    .innerJoin(`${warehouseTableName} as to_warehouse`, 
    `to_warehouse.id`, 
    `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
    .innerJoin(`${yarnLotTableName}`, 
    `${yarnLotTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
    .innerJoin(`${consigmentYarnTableName}`, 
    `${consigmentYarnTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(`${waTransitionBetweenWHRequisitionTableName}.date`, `>=`, bodyPaylod.startDate)
      .andWhere(`${waTransitionBetweenWHRequisitionTableName}.date`, `<=`, bodyPaylod.endDate)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectToWarehousePriceByWarehouseByYarnId = async (toWarehouseId, yarnId) => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = toWarehouseId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;

  await knex.from(waTransitionBetweenWHRequisitionDetailsTableName)
    .select(
      [
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.price_dollar`,
        `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
        `${waTransitionBetweenWHRequisitionTableName}.date`,
        knex.raw('? as type_of_requisition', 'اذن نقل بين المخازن'),
        knex.raw('? as input_output', '0'),
      ],
    )
    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`, 
    `${waTransitionBetweenWHRequisitionTableName}.id`, 
    `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
    .where(whereCluse)
    .andWhere(`${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`, ">", 0)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};