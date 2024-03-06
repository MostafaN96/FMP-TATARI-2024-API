// Config
const { wdFormDyeingRequisitionDetailsDyeingServicesTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const dyeingServicesTableName = require("../../../util/database-tables-name").dyeingServicesTableName;
const dyeingServicesDetailsTableName = require("../../../util/database-tables-name").dyeingServicesDetailsTableName;
const anointedServicesPricesTableName = require("../../../util/database-tables-name").anointedServicesPricesTableName;
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

exports.insert = async (dyeingServices) => {
  let queryResults = false;
  await sqlFun
    .insert(dyeingServicesTableName, {
      id: dyeingServices.id,
      name: dyeingServices.name,
      creator_id: dyeingServices.personid,
      ip_address: dyeingServices.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (dyeingServices) => {
  let queryResults = false;
  await sqlFun
    .update(
      dyeingServicesTableName,
      {
        name: dyeingServices.name,
      }, {
        id: dyeingServices.id,
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
    .limitedSelect(dyeingServicesTableName, [
      `${dyeingServicesTableName}.id`,
      `${dyeingServicesTableName}.name`,
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
      dyeingServicesTableName,
      [
        `${dyeingServicesTableName}.id`,
        `${dyeingServicesTableName}.name`,
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
      dyeingServicesTableName,
      [
        `${dyeingServicesTableName}.id`,
        `${dyeingServicesTableName}.name`,
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

exports.selectAdded = async (id) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_active`] = 1;
  whereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = id;
 
  await knex.select([
    `${dyeingServicesTableName}.id`, 
    `${dyeingServicesTableName}.name`, 
    `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.price`,
  ])
  .from(wdFormDyeingRequisitionDetailsDyeingServicesTableName)
  .where(whereCluse)
  .innerJoin(`${dyeingServicesTableName}`, `${dyeingServicesTableName}.id`, `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectNotIn = async (dyeingServices) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${anointedServicesPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedServicesPricesTableName}.is_active`] = 1;
 
  await knex.select([
    `${dyeingServicesTableName}.id`, 
    `${dyeingServicesTableName}.name`, 
    `${anointedServicesPricesTableName}.id as dyeing_service_prices_id`,
    `${anointedServicesPricesTableName}.price`
  ])
  .from(dyeingServicesTableName)
  .whereNotIn(`${anointedServicesPricesTableName}.anointed_services_id`, dyeingServices)
  .andWhere(whereCluse)
  .innerJoin(`${anointedServicesPricesTableName}`, `${anointedServicesPricesTableName}.anointed_services_id`, `${dyeingServicesTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByDeying = async (dyeingId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${dyeingServicesTableName}.is_deleted`] = 0;
  whereCluse[`${dyeingServicesTableName}.is_active`] = 1;
  whereCluse[`${anointedServicesPricesTableName}.is_deleted`] = 0;
  whereCluse[`${anointedServicesPricesTableName}.is_active`] = 1;
  whereCluse[`${anointedServicesPricesTableName}.dyeing_id`] = dyeingId;
 
  await knex.select([
    `${dyeingServicesTableName}.id`, 
    `${dyeingServicesTableName}.name`, 
    `${anointedServicesPricesTableName}.id as dyeing_services_prices_id`,
    `${anointedServicesPricesTableName}.price`,
    `${anointedServicesPricesTableName}.is_fabric_piece`,
  ])
  .from(dyeingServicesTableName)
  .where(whereCluse)
  .innerJoin(`${anointedServicesPricesTableName}`, 
  `${anointedServicesPricesTableName}.anointed_services_id`, 
  `${dyeingServicesTableName}.id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (dyeingServicesId) => {
  let queryResults = false;
  await sqlFun
    .delete(dyeingServicesTableName, {
      id: dyeingServicesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (dyeingServicesId) => {
  let queryResults = false;
  await sqlFun
    .restore(dyeingServicesTableName, {
      id: dyeingServicesId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
