// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constantsPayloads = require("../../../util/constants-payloads");
const { 
  consigmentDyeingTableName, warehouseTableName, 
  weAddRequisitionDetailsTableName, weTableName, 
  weAddRequisitionTableName, weReconciliationRequisitionDetailsTableName, 
  weReconciliationRequisitionDetailsWeTableName, weReconciliationRequisitionTableName, 
  wdDyeingRequisitionDetailsTableName, wdDyeingRequisitionTableName, 
  wdFormDyeingRequisitionDetailsTableName, fabricTableName, colorCategoryTableName, colorTableName, anointedColorsPricesTableName,
  gradeItemTableName,
  weDyedFabricOrderRequisitionDetailsTableName
} = require("../../../util/database-tables-name");

exports.insert = async (dyedFabric) => {
  let queryResults = false;
  await sqlFun
    .insert(fabricTableName, {
      id: dyedFabric.id,
      fabric_id: dyedFabric.fabricId,
      name: dyedFabric.name,
      code: dyedFabric.code,
      dyeing_code: dyedFabric.dyeingCode,
      is_dyed_fabric: '1',
      fabric_quantity_m2: dyedFabric.fabricQuantityM2,
      waste_ratio: dyedFabric.wasteRatio,
      creator_id: dyedFabric.personid,
      ip_address: dyedFabric.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (dyedFabric) => {
  let queryResults = false;
  await sqlFun
    .update(
      fabricTableName,
      {
        fabric_id: dyedFabric.fabricId,
        name: dyedFabric.name,
        code: dyedFabric.code,
        fabric_quantity_m2: dyedFabric.fabricQuantityM2,
        dyeing_code: dyedFabric.dyeingCode,
        waste_ratio: dyedFabric.wasteRatio,
      },
      {
        id: dyedFabric.id,
      }
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;

  await knex.from(fabricTableName)
    .select(
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
        `row_fabric.id as fabric_id`,
        `row_fabric.name as fabric_name`,
        `row_fabric.code as fabric_code`,
        knex.raw(`CONCAT(row_fabric.name, ' (الكود: ', row_fabric.code, ')' ) as "fabric_name_code"`),
      ],
    )
    .innerJoin(`${fabricTableName} as row_fabric`,
      `row_fabric.id`,
      `${fabricTableName}.fabric_id`)
    .where(whereCluse)
    .limit(1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;

  await knex.from(fabricTableName)
    .select(
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
        `row_fabric.id as fabric_id`,
        `row_fabric.name as fabric_name`,
        `row_fabric.code as fabric_code`,
        knex.raw(`CONCAT(row_fabric.name, ' (الكود: ', row_fabric.code, ')' ) as "fabric_name_code"`),
      ],
    )
    .innerJoin(`${fabricTableName} as row_fabric`,
      `row_fabric.id`,
      `${fabricTableName}.fabric_id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectDeleted = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      fabricTableName,
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
      ],
      {
        is_deleted: "1",
        is_active: "0",
        is_dyed_fabric: '1'
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectWhereInDyedFabric = async (whereInTableName, whereInAttr, whereInWhereCluse) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${fabricTableName}.is_deleted`] = 0;
  whereCluse[`${fabricTableName}.is_active`] = 1;
  whereCluse[`${fabricTableName}.is_dyed_fabric`] = 1;

  await knex.select([
    `${fabricTableName}.id`,
    `${fabricTableName}.name`,
    `${fabricTableName}.code`,
    `${fabricTableName}.dyeing_code`,
  ])
    .distinct()
    .from(`${fabricTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.${whereInAttr}`, `${fabricTableName}.id`)
    .whereIn(`${fabricTableName}.id`, function () {
      this.select(`${whereInTableName}.${whereInAttr}`)
        .from(whereInTableName).where(whereInWhereCluse);
    })
    .andWhere(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (dyedFabricId) => {
  let queryResults = false;
  await sqlFun
    .delete(fabricTableName, {
      id: dyedFabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (dyedFabricId) => {
  let queryResults = false;
  await sqlFun
    .restore(fabricTableName, {
      id: dyedFabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectStoredDyedFabricsByDyedFabricIdWe = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `code`,
    `dyeing_code`,
    `type_of_requisition`,
    `type_of_requisition_trans`,
    `warehouse_id`,
    `warehouse_name`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `color_category_id`,
    `color_category_name`,
    `color_id`,
    `color_name`,
    `color_name_code`,
    `color_code`,
    `requisition_details_id`,
    `price`,
    `quantity`,
    `grade_item_id`,
    `grade_item_name`,
    `we_id`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.code`,
      `${fabricTableName}.dyeing_code`,
      knex.raw('? as type_of_requisition', `${constantsPayloads.addType}`),
      knex.raw('? as type_of_requisition_trans', 'اذن اضافة'),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${colorCategoryTableName}.id as color_category_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.id as color_id`,
      `${colorTableName}.name as color_name`,
      knex.raw(`CONCAT(${colorTableName}.name, ' (كود: ', ${weAddRequisitionDetailsTableName}.color_code, ')' ) as "color_name_code"`),
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${weAddRequisitionDetailsTableName}.price`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      `${weAddRequisitionDetailsTableName}.grade_item_id`,
      `${gradeItemTableName}.name as grade_item_name`,
      `${weTableName}.id as we_id`,
      `${weTableName}.current_quantity`,
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${weAddRequisitionDetailsTableName}.consigment_dyeing_id`)
      .innerJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_category_id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .innerJoin(`${gradeItemTableName}`,
        `${gradeItemTableName}.id`,
        `${weAddRequisitionDetailsTableName}.grade_item_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.reconcilitionType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن تسوية'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          knex.raw(`CONCAT(${colorTableName}.name, ' (كود: ', ${weReconciliationRequisitionDetailsTableName}.color_code, ')' ) as "color_name_code"`),
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${weReconciliationRequisitionDetailsTableName}.price`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          `${weReconciliationRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weTableName}.id as we_id`,
          `${weTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionTableName}`,
            `${weReconciliationRequisitionTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${weReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.dyeingType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن صباغة'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${colorCategoryTableName}.id as color_category_id`,
          `${colorCategoryTableName}.name as color_category_name`,
          `${colorTableName}.id as color_id`,
          `${colorTableName}.name as color_name`,
          knex.raw(`CONCAT(${colorTableName}.name, ' (كود: ', ${anointedColorsPricesTableName}.code, ')' ) as "color_name_code"`),
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.cost_price as price`,
          `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
          `${wdDyeingRequisitionDetailsTableName}.grade_item_id`,
          `${gradeItemTableName}.name as grade_item_name`,
          `${weTableName}.id as we_id`,
          `${weTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
          `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
          `${fabricTableName}.id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
            .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${anointedColorsPricesTableName}`,
            `${anointedColorsPricesTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
            .innerJoin(`${colorCategoryTableName}`,
              `${colorCategoryTableName}.id`,
              `${anointedColorsPricesTableName}.color_category_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${anointedColorsPricesTableName}.color_id`)
          .innerJoin(`${gradeItemTableName}`,
            `${gradeItemTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.grade_item_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`requisition_details_id`,
     `id`, `warehouse_id`,
     `color_category_id`, `color_id`,
      `consigment_dyeing_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectDyedFabricsByOrder = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await knex.select([
    `${fabricTableName}.id`,
    `${fabricTableName}.name`,
    `${fabricTableName}.code`,
    `${fabricTableName}.dyeing_code`,
  ])
    .from(`${fabricTableName}`)
    .whereIn(`${fabricTableName}.id`, function () {
      this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .where(whereInWhereCluse)
    })
    .andWhere(whereCluse)

    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};