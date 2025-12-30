// Config
const { weDyedFabricOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const colorCategoryTableName = require("../../../util/database-tables-name").colorCategoryTableName;
const anointedColorsPricesTableName = require("../../../util/database-tables-name").anointedColorsPricesTableName;
const weTableName = require("../../../util/database-tables-name").weTableName;
const weAddRequisitionTableName = require("../../../util/database-tables-name").weAddRequisitionTableName;
const weAddRequisitionDetailsTableName = require("../../../util/database-tables-name").weAddRequisitionDetailsTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const fabricTableName = require("../../../util/database-tables-name").fabricTableName;
const wdDyeingRequisitionDetailsTableName = require("../../../util/database-tables-name").wdDyeingRequisitionDetailsTableName;
const wdDyeingRequisitionTableName = require("../../../util/database-tables-name").wdDyeingRequisitionTableName;
const wdFormDyeingOrderDetailsTableName = require("../../../util/database-tables-name").wdFormDyeingOrderDetailsTableName;

exports.insert = async (colorCategory) => {
  let queryResults = false;
  await sqlFun
    .insert(colorCategoryTableName, {
      id: colorCategory.id,
      name: colorCategory.name,
      creator_id: colorCategory.personid,
      ip_address: colorCategory.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (colorCategory) => {
  let queryResults = false;
  await sqlFun
    .update(
      colorCategoryTableName,
      {
        name: colorCategory.name,
      }, {
        id: colorCategory.id,
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
  await sqlFun
    .limitedSelect(colorCategoryTableName, [
      `${colorCategoryTableName}.id`,
      `${colorCategoryTableName}.name`,
    ], whereCluse, 1)
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
  await sqlFun
    .select(
      colorCategoryTableName,
      [
        `${colorCategoryTableName}.id`,
        `${colorCategoryTableName}.name`,
      ],
      {
        is_deleted: "0",
        is_active: "1",
      }
    )
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
      colorCategoryTableName,
      [
        `${colorCategoryTableName}.id`,
        `${colorCategoryTableName}.name`,
      ],
      {
        is_deleted: "1",
        is_active: "0",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByDeying = async (deyingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${colorCategoryTableName}.is_deleted`] = 0;
  whereCluse[`${colorCategoryTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.dyeing_id`] = deyingId;

  await knex(colorCategoryTableName)
    .select([
      `${colorCategoryTableName}.id`,
      `${colorCategoryTableName}.name`,
    ])
    .distinct()
    .innerJoin(`${anointedColorsPricesTableName}`, 
    `${anointedColorsPricesTableName}.color_category_id`, 
    `${colorCategoryTableName}.id`)
    .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDyersAndRequisitionsColorCategoryOfFabrics = async (fabricId, supplierId) => {
  let queryResults = [];
  let columns = ["we_id", "name", "current_quantity", "requisition_id",
    "color_category_name", "color_category_id",
    "fabric_name", "fabric_code", "fabric_id", "supplier_id"]

  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weAddRequisitionTableName}.number as name`,
      `${weTableName}.current_quantity`,
      `${weAddRequisitionDetailsTableName}.we_add_requisition_id as requisition_id`,
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorCategoryTableName}.id as color_category_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.id as fabric_id`,
      `${bussinessmanTableName}.id as supplier_id`
    ])
      .from(`${weTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.id`,
        `${weTableName}.we_add_requisition_details_id`)
      .innerJoin(`${weAddRequisitionTableName}`,
        `${weAddRequisitionTableName}.id`,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${weAddRequisitionTableName}.supplier_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`)
      .leftJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTableName}.color_category_id`)
      .distinct(`${weTableName}.id`)
      .as('t1')
      .unionAll(
        knex.select([
          `${weTableName}.id as we_id`,
          `${bussinessmanTableName}.name`,
          `${weTableName}.current_quantity`,
          `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id as requisition_id`,
          `color_category_dyeing.name as color_category_name`,
          `color_category_dyeing.id as color_category_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.id as fabric_id`,
          `${wdDyeingRequisitionTableName}.dyeing_id as supplier_id`
        ])
          .from(`${weTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${weTableName}.dyeing_requisition_details_wd_id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.dyeing_requisition_wd_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingRequisitionTableName}.dyeing_id`)
          .innerJoin(`${wdFormDyeingOrderDetailsTableName}`,
            `${wdFormDyeingOrderDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.form_dyeing_order_details_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTableName}.dyed_fabric_id`)
          .leftJoin(`${colorCategoryTableName} as color_category_dyeing`,
            `color_category_dyeing.id`,
            `${wdFormDyeingOrderDetailsTableName}.color_category_id`)
          .leftJoin(`${anointedColorsPricesTableName}`,
            `${anointedColorsPricesTableName}.id`,
            `${wdFormDyeingOrderDetailsTableName}.dyeing_colors_prices_id`)
          .distinct(`${weTableName}.id`)
      )
  }).as('temp')
    .where("current_quantity", ">", "0")
    .andWhere({ "supplier_id": supplierId, "fabric_id": fabricId })
    .groupBy("color_category_name", "color_category_id")
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByOrderByDyedFabricWe = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await knex.select([
      `${colorCategoryTableName}.id`,
      `${colorCategoryTableName}.name`,
  ])
    .from(`${colorCategoryTableName}`)
    .whereIn(`${colorCategoryTableName}.id`, function () {
      this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`)
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .where(whereInWhereCluse)
    })
    .andWhere(whereCluse)

    .then((data) => {
      console.log("data ::::: ", data);
      
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (colorCategoryId) => {
  let queryResults = false;
  await sqlFun
    .delete(colorCategoryTableName, {
      id: colorCategoryId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (colorCategoryId) => {
  let queryResults = false;
  await sqlFun
    .restore(colorCategoryTableName, {
      id: colorCategoryId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
