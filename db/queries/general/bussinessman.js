// Config
const knex = require("../../config/connection").getConnection();
const sqlFun = require("../../config/sql-fun");

// Util
const constantsPayloads = require("../../..//util/constants-payloads");
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;
const anointedServicesPricesTableName = require("../../../util/database-tables-name").anointedServicesPricesTableName;

const waTableName = require("../../../util/database-tables-name").waTableName;
const waAddRequisitionTableName = require("../../../util/database-tables-name").waAddRequisitionTableName;
const waAddRequisitionDetailsTableName = require("../../../util/database-tables-name").waAddRequisitionDetailsTableName;

const wbTableName = require("../../../util/database-tables-name").wbTableName;
const wbManufactureRequisitionTableName = require("../../../util/database-tables-name").wbManufactureRequisitionTableName;
const wbManufactureRequisitionDetailsTableName = require("../../../util/database-tables-name").wbManufactureRequisitionTableName;

exports.selectBussienessmanByType = async (whereCluse) => {
    let queryResults = [];
    await sqlFun
      .select(
        bussinessmanTableName,
        [
          `${bussinessmanTableName}.id`,
          `${bussinessmanTableName}.name`,
          `${bussinessmanTableName}.phone`,
          `${bussinessmanTableName}.address`,
          `${bussinessmanTableName}.is_stock`,
        ],
        whereCluse
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  
exports.insert = async (bussinessman) => {
  let queryResults = false;
  await sqlFun
    .insert(bussinessmanTableName, {
      id: bussinessman.id,
      name: bussinessman.name,
      phone: bussinessman.phone,
      address: bussinessman.address,
      is_supplier: bussinessman.is_supplier,
      is_seller: bussinessman.is_seller,
      is_manufacturer: bussinessman.is_manufacturer,
      is_dyer: bussinessman.is_dyer,
      is_calc_dyeing_net: bussinessman.is_calc_dyeing_net,
      is_stock: bussinessman.is_stock,
      creator_id: bussinessman.creator_id,
      ip_address: bussinessman.ip_address,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (bussinessman) => {
  let queryResults = false;
  await sqlFun
    .update(
      bussinessmanTableName,
      {
      name: bussinessman.name,
      phone: bussinessman.phone,
      address: bussinessman.address,
      is_supplier: bussinessman.is_supplier,
      is_seller: bussinessman.is_seller,
      is_manufacturer: bussinessman.is_manufacturer,
      is_dyer: bussinessman.is_dyer,
      is_calc_dyeing_net: bussinessman.is_calc_dyeing_net,
      is_stock: bussinessman.is_stock,
      },
      {
          id: bussinessman.id,
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
    .limitedSelect(bussinessmanTableName, ["is_deleted"], whereCluse, 1)
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
      bussinessmanTableName,
      [
        `${bussinessmanTableName}.id`,
        `${bussinessmanTableName}.name`,
        `${bussinessmanTableName}.phone`,
        `${bussinessmanTableName}.address`,
        `${bussinessmanTableName}.is_supplier`,
        `${bussinessmanTableName}.is_seller`,
        `${bussinessmanTableName}.is_manufacturer`,
        `${bussinessmanTableName}.is_dyer`,
        `${bussinessmanTableName}.is_calc_dyeing_net`,
        `${bussinessmanTableName}.is_stock`,
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

exports.selectDyerHasServices = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await sqlFun.selectWhereIn(bussinessmanTableName, 
    [
      `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ], 
  whereCluse,
  `${bussinessmanTableName}.id`,
  `${anointedServicesPricesTableName}.dyeing_id`, `${anointedServicesPricesTableName}`,
  whereInWhereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectNotSelectedBussinessman = async (bussinessmanId, whereCluse) => {
  let queryResults = [];

  let whereCluseNot = {};
  whereCluseNot[`${bussinessmanTableName}.id`] = bussinessmanId;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct()
    .from(`${bussinessmanTableName}`)
    .whereNot(whereCluseNot)
    .andWhere(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSuppliersBoughtFrom = async (whereInTableName, whereStoreTableName, 
  whereDetailsTableName, attributeRequisitionId, attributeRequisitionDetailsId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${bussinessmanTableName}.is_supplier`] = 1;
  whereCluse[`${whereStoreTableName}.type`] = constantsPayloads.addType;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct()
    .from(`${bussinessmanTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.supplier_id`, `${bussinessmanTableName}.id`)
    .innerJoin(`${whereDetailsTableName}`, `${whereDetailsTableName}.${attributeRequisitionId}`, `${whereInTableName}.id`)
    .innerJoin(`${whereStoreTableName}`, `${whereStoreTableName}.${attributeRequisitionDetailsId}`, `${whereDetailsTableName}.id`)
    .whereIn(`${bussinessmanTableName}.id`, function () {
      this.select(`${whereInTableName}.supplier_id`)
        .from(whereInTableName).where(whereInWhereCluse);
    })
    .andWhere(whereCluse)
    .andWhere(`${whereStoreTableName}.current_quantity`, `>`, `0`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectManufacturerFrom = async () => {
  let queryResults = [];
  let columns = [
    `id`,
    `name`,
    `phone`,
    `address`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${bussinessmanTableName}.id`,
      `${bussinessmanTableName}.name`,
      `${bussinessmanTableName}.phone`,
      `${bussinessmanTableName}.address`
    ])
      .from(`${bussinessmanTableName}`)
      .innerJoin(`${wbManufactureRequisitionTableName}`,
      `${wbManufactureRequisitionTableName}.industry_id`,
      `${bussinessmanTableName}.id`)
      .innerJoin(`${wbManufactureRequisitionDetailsTableName}`,
        `${wbManufactureRequisitionDetailsTableName}.manufacture_requisition_wb_id`,
        `${wbManufactureRequisitionTableName}.id`)
        .innerJoin(`${wbManufactureRequisitionDetailsTableName}`,
        `${wbManufactureRequisitionDetailsTableName}.manufacture_requisition_wb_id`,
        `${wbManufactureRequisitionTableName}.id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${waTableName}.id`,
          `${waTableName}.current_quantity`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waReconciliationRequisitionTableName}.date`
        ])
          .from(`${waTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
            `${waTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`)
            .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
      })
  }).as('temp')
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectSellersSellFrom = async (whereInTableName, whereStoreTableName, 
  whereDetailsTableName, attributeRequisitionId, attributeRequisitionDetailsId, 
  whereDetailsWeTableName, attributeRequisitionDetailsWeId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${bussinessmanTableName}.is_seller`] = 1;
  // whereCluse[`${whereStoreTableName}.type`] = constantsPayloads.addType;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct(`${bussinessmanTableName}.id`)
    .from(`${bussinessmanTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.seller_id`, `${bussinessmanTableName}.id`)
    .innerJoin(`${whereDetailsTableName}`, `${whereDetailsTableName}.${attributeRequisitionId}`, `${whereInTableName}.id`)
    .innerJoin(`${whereDetailsWeTableName}`, `${whereDetailsWeTableName}.${attributeRequisitionDetailsId}`, `${whereDetailsTableName}.id`)
    .innerJoin(`${whereStoreTableName}`, `${whereStoreTableName}.id`, `${whereDetailsWeTableName}.${attributeRequisitionDetailsWeId}`)
    .whereIn(`${bussinessmanTableName}.id`, function () {
      this.select(`${whereInTableName}.seller_id`)
        .from(whereInTableName).where(whereInWhereCluse);
    })
    // .andWhere(function() {
    //   this.where(`${whereStoreTableName}.type`, constantsPayloads.addType)
    //   this.orWhere(`${whereStoreTableName}.type`, constantsPayloads.dyeingType)
    //   this.orWhere(`${whereStoreTableName}.type`, constantsPayloads.reconcilitionType)
    // })
    .andWhere(whereCluse)
    .andWhere(`${whereDetailsTableName}.current_quantity`, `>`, `0`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectBussinessmanHasInventoryFrom = async (whereInTableName, whereStoreTableName, 
  whereDetailsTableName, attributeRequisitionId, attributeRequisitionDetailsId, bussinessmanFlagType, whereInAttr) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${bussinessmanTableName}.${bussinessmanFlagType}`] = 1;

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct()
    .from(`${bussinessmanTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.${whereInAttr}`, `${bussinessmanTableName}.id`)
    .innerJoin(`${whereDetailsTableName}`, `${whereDetailsTableName}.${attributeRequisitionId}`, `${whereInTableName}.id`)
    .innerJoin(`${whereStoreTableName}`, `${whereStoreTableName}.${attributeRequisitionDetailsId}`, `${whereDetailsTableName}.id`)
    .whereIn(`${bussinessmanTableName}.id`, function () {
      this.select(`${whereInTableName}.${whereInAttr}`)
        .from(whereInTableName).where(whereInWhereCluse);
    })
    .andWhere(whereCluse)
    .andWhere(`${whereStoreTableName}.current_quantity`, `>`, `0`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectWhereInBussinessman = async (whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${bussinessmanTableName}.${bussinessmanFlagType}`] = 1;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_calc_dyeing_net`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct()
    .from(`${bussinessmanTableName}`)
    .innerJoin(`${whereInTableName}`, `${whereInTableName}.${whereInAttr}`, `${bussinessmanTableName}.id`)
    .whereIn(`${bussinessmanTableName}.id`, function () {
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


exports.selectWhereInBussinessmanNotSelected = async (whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType, whereCluseNot) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${bussinessmanTableName}.is_active`] = 1;
  whereCluse[`${bussinessmanTableName}.${bussinessmanFlagType}`] = 1;

  await knex.select([
    `${bussinessmanTableName}.id`,
    `${bussinessmanTableName}.name`,
    `${bussinessmanTableName}.phone`,
    `${bussinessmanTableName}.address`,
    `${bussinessmanTableName}.is_stock`,
  ])
    .distinct()
    .from(`${bussinessmanTableName}`)
    // .innerJoin(`${whereInTableName}`, `${whereInTableName}.${whereInAttr}`, `${bussinessmanTableName}.id`)
    .whereIn(`${bussinessmanTableName}.id`, function () {
      this.select(`${whereInTableName}.${whereInAttr}`)
        .from(whereInTableName).where(whereInWhereCluse)
        .whereNot(whereCluseNot)
    })
    .andWhere(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDyerFrom = async (whereInTableName, whereStoreTableName) => {
  let queryResults = [];
  let columns = [
    `id`,
    `name`,
    `phone`,
    `address`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${bussinessmanTableName}.id`,
      `${bussinessmanTableName}.name`,
      `${bussinessmanTableName}.phone`,
      `${bussinessmanTableName}.address`
    ])
      .from(`${bussinessmanTableName}`)
      .innerJoin(`${wbManufactureRequisitionTableName}`,
      `${wbManufactureRequisitionTableName}.industry_id`,
      `${bussinessmanTableName}.id`)
      .innerJoin(`${wbManufactureRequisitionDetailsTableName}`,
        `${wbManufactureRequisitionDetailsTableName}.manufacture_requisition_wb_id`,
        `${wbManufactureRequisitionTableName}.id`)
        .innerJoin(`${wbManufactureRequisitionDetailsTableName}`,
        `${wbManufactureRequisitionDetailsTableName}.manufacture_requisition_wb_id`,
        `${wbManufactureRequisitionTableName}.id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${waTableName}.id`,
          `${waTableName}.current_quantity`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waReconciliationRequisitionTableName}.date`
        ])
          .from(`${waTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
            `${waTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`)
            .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
      })
  }).as('temp')
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
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
      bussinessmanTableName,
      [
        `${bussinessmanTableName}.id`,
        `${bussinessmanTableName}.name`,
        `${bussinessmanTableName}.phone`,
        `${bussinessmanTableName}.address`,
        `${bussinessmanTableName}.is_supplier`,
        `${bussinessmanTableName}.is_seller`,
        `${bussinessmanTableName}.is_manufacturer`,
        `${bussinessmanTableName}.is_stock`,
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


exports.delete = async (bussinessmanId) => {
  let queryResults = false;
  await sqlFun
    .delete(bussinessmanTableName, {
      id: bussinessmanId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (bussinessmanId) => {
  let queryResults = false;
  await sqlFun
    .restore(bussinessmanTableName, {
      id: bussinessmanId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};