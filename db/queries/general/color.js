// Config
const { weDyedFabricOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const colorTableName = require("../../../util/database-tables-name").colorTableName;
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

exports.insert = async (color) => {
  let queryResults = false;
  await sqlFun
    .insert(colorTableName, {
      id: color.id,
      name: color.name,
      creator_id: color.personid,
      ip_address: color.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (color) => {
  let queryResults = false;
  await sqlFun
    .update(
      colorTableName,
      {
        name: color.name,
      }, {
        id: color.id,
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
    .limitedSelect(colorTableName, [
      `${colorTableName}.id`,
      `${colorTableName}.name`,
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
      colorTableName,
      [
        `${colorTableName}.id`,
        `${colorTableName}.name`,
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
      colorTableName,
      [
        `${colorTableName}.id`,
        `${colorTableName}.name`,
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
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.dyeing_id`] = deyingId;

  await knex(bussinessmanTableName)
    .select([
      `${colorCategoryTableName}.name as color_category_name`,
      `${colorTableName}.name as color_name`,
      `${anointedColorsPricesTableName}.id as dyeing_color_prices_id`,
      `${anointedColorsPricesTableName}.price`,
      `${anointedColorsPricesTableName}.code`,
    ])
    .innerJoin(`${anointedColorsPricesTableName}`,
      `${anointedColorsPricesTableName}.dyeing_id`,
      `${bussinessmanTableName}.id`)
    .innerJoin(`${colorCategoryTableName}`,
      `${colorCategoryTableName}.id`,
      `${anointedColorsPricesTableName}.color_category_id`)
    .innerJoin(`${colorTableName}`,
      `${colorTableName}.id`,
      `${anointedColorsPricesTableName}.color_id`)
    .where(whereCluse)
    .orderBy(`${colorTableName}.name`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByCategoryAndDeying = async (deyingId, colorCategoryId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${colorTableName}.is_deleted`] = 0;
  whereCluse[`${colorTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.dyeing_id`] = deyingId;
  whereCluse[`${anointedColorsPricesTableName}.color_category_id`] = colorCategoryId;

  await knex(colorTableName)
    .select([
      `${colorTableName}.id`,
      // `${colorTableName}.name`,
      knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "name"`),
      `${anointedColorsPricesTableName}.code`,
      `${anointedColorsPricesTableName}.price`,
      `${anointedColorsPricesTableName}.id as dyeing_colors_prices_id`,
    ])
    .innerJoin(`${anointedColorsPricesTableName}`, 
    `${anointedColorsPricesTableName}.color_id`, 
    `${colorTableName}.id`)
    .where(whereCluse)
    .orderBy(`${colorTableName}.name`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByCategoryAndDeyingByDyedFabricByFabricOrder = async (deyingId, colorCategoryId, dyedFabricId, fabricOrderId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${colorTableName}.is_deleted`] = 0;
  whereCluse[`${colorTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.dyeing_id`] = deyingId;
  whereCluse[`${anointedColorsPricesTableName}.color_category_id`] = colorCategoryId;

  await knex(colorTableName)
    .select([
      `${colorTableName}.id`,
      // `${colorTableName}.name`,
      knex.raw(`CONCAT(${colorTableName}.name, ' (السعر: ', ${anointedColorsPricesTableName}.price, ')' ) as "name"`),
      `${anointedColorsPricesTableName}.code`,
      `${anointedColorsPricesTableName}.price`,
      `${anointedColorsPricesTableName}.id as dyeing_colors_prices_id`,
    ])
    .innerJoin(`${anointedColorsPricesTableName}`, 
    `${anointedColorsPricesTableName}.color_id`, 
    `${colorTableName}.id`)
    // -----------------// تم توقيفها بشكل مؤقت لامكانية النقل ل اي خامة 26-7-2026 -------------------
    // .whereIn(`${colorTableName}.id`, function () {
    //   this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
    //     .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
    //     .whereIn(`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`, fabricOrderId)
    //     .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`, dyedFabricId)
    // })
    // -----------------// تم توقيفها بشكل مؤقت لامكانية النقل ل اي خامة 26-7-2026 -------------------
    
    .where(whereCluse)
    .orderBy(`${colorTableName}.name`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByCategory = async (colorCategoryId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${colorTableName}.is_deleted`] = 0;
  whereCluse[`${colorTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedColorsPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedColorsPricesTableName}.color_category_id`] = colorCategoryId;

  await knex(colorTableName)
    .select([
      `${colorTableName}.id`,
      // `${colorTableName}.name`,
      knex.raw(`CONCAT(${colorTableName}.name, ' (كود: ', ${anointedColorsPricesTableName}.code, ')' ) as "color_name_code"`),
      `${anointedColorsPricesTableName}.code`,
      `${anointedColorsPricesTableName}.price`,
      `${anointedColorsPricesTableName}.id as dyeing_colors_prices_id`,
    ])
    .innerJoin(`${anointedColorsPricesTableName}`, 
    `${anointedColorsPricesTableName}.color_id`, 
    `${colorTableName}.id`)
    .where(whereCluse)
    .orderBy(`${colorTableName}.name`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDyersAndRequisitionsColorOfFabrics = async (fabricId, supplierId, colorCategoryId, requisitionId) => {
  let queryResults = [];

  let whereCluse = {};
  whereCluse[`${fabricTableName}.id`] = fabricId;
  whereCluse[`${bussinessmanTableName}.id`] = supplierId;
  whereCluse[`${weTableName}.we_add_requisition_id`] = requisitionId;
  whereCluse[`${weTableName}.color_category_id`] = colorCategoryId;

  let whereCluse2 = {};
  whereCluse2[`${wdDyeingRequisitionTableName}.dyeing_id`] = supplierId;
  whereCluse2[`${fabricTableName}.id`] = fabricId;
  whereCluse2[`color_category_dyeing.id`] = colorCategoryId;

  let columns = ["we_id", "name", "current_quantity", "requisition_id",
        "color_category_name", "color_category_id", "color_name", "color_code", "color_id",
        "fabric_name", "fabric_code", "fabric_id", "supplier_id", "work_order_number"]

  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${weAddRequisitionTableName}.number as name`,
      `${weTableName}.current_quantity`,
      `${weAddRequisitionDetailsTableName}.we_add_requisition_id as requisition_id`,

      `${colorCategoryTableName}.name as color_category_name`,
      `${colorCategoryTableName}.id as color_category_id`,
      knex.raw(`CONCAT(${colorTableName}.name) as color_name`),
      `${weTableName}.color_code`,
      `${colorTableName}.id as color_id`,

      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.id as fabric_id`,
      `${bussinessmanTableName}.id as supplier_id`,
      knex.raw('? as work_order_number', '')
    ])
    .distinct(`${weTableName}.id`)
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
      .leftJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weTableName}.color_id`)
        .leftJoin(`${colorCategoryTableName}`,
        `${colorCategoryTableName}.id`,
        `${weTableName}.color_category_id`)
      .where(whereCluse)
      .as('t1')
      .unionAll(
        knex.select([
          `${weTableName}.id as we_id`,
          `${bussinessmanTableName}.name`,
          `${weTableName}.current_quantity`,
          `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id as requisition_id`,
          `color_category_dyeing.name as color_category_name`,
          `color_category_dyeing.id as color_category_id`,
          knex.raw(`CONCAT(color_dyeing.name, ' ', dyeing_requisition_wd.release_process) as color_name`),
          `${anointedColorsPricesTableName}.code as color_code`,
          "color_dyeing.id as color_id",
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.id as fabric_id`,
          `${wdDyeingRequisitionTableName}.dyeing_id as supplier_id`,
          `${wdDyeingRequisitionTableName}.release_process`
        ])
        .distinct(`${weTableName}.id`)
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
          .leftJoin(`${colorTableName} as color_dyeing`,
            `color_dyeing.id`,
            `${wdFormDyeingOrderDetailsTableName}.color_id`)
          .leftJoin(`${colorCategoryTableName} as color_category_dyeing`,
            `color_category_dyeing.id`,
            `${wdFormDyeingOrderDetailsTableName}.color_category_id`)
          .leftJoin(`${anointedColorsPricesTableName}`,
            `${anointedColorsPricesTableName}.id`,
            `${wdFormDyeingOrderDetailsTableName}.dyeing_colors_prices_id`)
            .where(whereCluse2)
      )
  }).as('temp')
    .where("current_quantity", ">", "0")
    .groupBy("work_order_number")
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByOrderByDyedFabricByColorCategoryWe = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await knex.select([
      `${colorTableName}.id`,
      `${colorTableName}.name`,
  ])
    .from(`${colorTableName}`)
    .whereIn(`${colorTableName}.id`, function () {
      this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
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

exports.delete = async (colorId) => {
  let queryResults = false;
  await sqlFun
    .delete(colorTableName, {
      id: colorId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (colorId) => {
  let queryResults = false;
  await sqlFun
    .restore(colorTableName, {
      id: colorId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
