// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { waAddRequisitionDetailsTableName, waTableName, wbTableName, wbTransportWaWbDetailsTableName, waAddRequisitionTableName, wbReconciliationRequisitionDetailsWbTableName, wbReconciliationRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, waReconciliationRequisitionDetailsWaTableName, waReconciliationRequisitionDetailsTableName, wbTransportRequisitionWbWaDetailsTableName, waReconciliationRequisitionTableName, wbTransportRequisitionWbWaTableName } = require("../../../util/database-tables-name");
const yarnLotTableName = require("../../../util/database-tables-name").yarnLotTableName;
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;

exports.insert = async (yarnLot) => {
  let queryResults = false;
  await sqlFun
    .insert(yarnLotTableName, {
      id: yarnLot.id,
      yarn_id: yarnLot.yarn_id,
      code: yarnLot.code,
      creator_id: yarnLot.creator_id,
      ip_address: yarnLot.ip_address,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForYarn = async (yarnLot) => {
  let queryResults = false;
  await sqlFun
    .insert(yarnLotTableName, {
      id: yarnLot.lotId,
      yarn_id: yarnLot.id,
      code: yarnLot.lotCode,
      creator_id: yarnLot.creator_id,
      ip_address: yarnLot.ip_address,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (yarnLot) => {
  let queryResults = false;
  await sqlFun
    .update(
      yarnLotTableName,
      {
        code: yarnLot.code,
      },
      {
        id: yarnLot.id,
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
    .limitedSelect(yarnLotTableName, ["id", "is_deleted"], whereCluse, 1)
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
  let whereCluse = {};
  whereCluse[`${yarnLotTableName}.is_deleted`] = 0;
  whereCluse[`${yarnLotTableName}.is_active`] = 1;

  await knex(yarnLotTableName)
  .select([`${yarnLotTableName}.id`, `${yarnLotTableName}.yarn_id`, `${yarnLotTableName}.code`,
  `${yarnTableName}.name as yarn_name`, `${yarnTableName}.code as yarn_code`
  ])
  .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${yarnLotTableName}.yarn_id`)
  .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectDeleted = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${yarnLotTableName}.is_deleted`] = 1;
  whereCluse[`${yarnLotTableName}.is_active`] = 0;

  await knex(yarnLotTableName)
  .select([`${yarnLotTableName}.id`, `${yarnLotTableName}.yarn_id`, `${yarnLotTableName}.code`,
  `${yarnTableName}.name as yarn_name`, `${yarnTableName}.code as yarn_code`
  ])
  .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${yarnLotTableName}.yarn_id`)
  .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByYarn = async (yarnId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${yarnLotTableName}.is_deleted`] = 0;
  whereCluse[`${yarnLotTableName}.is_active`] = 1;
  whereCluse[`${yarnLotTableName}.yarn_id`] = yarnId;

  await knex(yarnLotTableName)
  .select([`${yarnLotTableName}.id`, `${yarnLotTableName}.yarn_id`, `${yarnLotTableName}.code`,
  `${yarnTableName}.name as yarn_name`, `${yarnTableName}.code as yarn_code`
  ])
  .innerJoin(`${yarnTableName}`, `${yarnTableName}.id`, `${yarnLotTableName}.yarn_id`)
  .where(whereCluse)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (yarnId) => {
  let queryResults = false;
  await sqlFun
    .delete(yarnLotTableName, {
      id: yarnId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (yarnId) => {
  let queryResults = false;
  await sqlFun
    .restore(yarnLotTableName, {
      id: yarnId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};


exports.selectByWarehouseByYarnWa = async (whereCluseArray) => {
  let queryResults = [];

  let columns = [
    `id`,
    `code`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnLotTableName}.id`,
      `${yarnLotTableName}.code`,
        `${waTableName}.current_quantity`,
    ])
      .from(`${waTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.id`,
        `${waTableName}.wa_add_requisition_details_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .where(whereCluseArray[0])
      .as('t1')
      .union(function () {
        this.select([
          `${yarnLotTableName}.id`,
          `${yarnLotTableName}.code`,
            `${waTableName}.current_quantity`,
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
            .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${yarnLotTableName}.id`,
          `${yarnLotTableName}.code`,
            `${waTableName}.current_quantity`,
        ])
          .from(`${waTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`)
            .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
              `${wbTransportRequisitionWbWaTableName}.id`,
              `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
          .where(whereCluseArray[3])
     })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;

}

exports.selectBySupplierByWarehouseByYarnWa = async (supplierId, warehouseId, yarnId) => {
  let queryResults = []

  let andWhereCluse = {};
  andWhereCluse[`${yarnLotTableName}.is_deleted`] = 0;
  andWhereCluse[`${yarnLotTableName}.is_active`] = 1;
  andWhereCluse[`${waTableName}.is_deleted`] = 0;
  andWhereCluse[`${waTableName}.is_active`] = 1;
  andWhereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;
  andWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  andWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;

  await knex(yarnLotTableName)
    .select([
      `${yarnLotTableName}.id`,
      `${yarnLotTableName}.code`
    ])
    .innerJoin(`${waAddRequisitionDetailsTableName}`, 
    `${waAddRequisitionDetailsTableName}.yarn_lot_id`, 
    `${yarnLotTableName}.id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waTableName}`, `${waTableName}.wa_add_requisition_details_id`, `${waAddRequisitionDetailsTableName}.id`)
    .where(`${waTableName}.current_quantity`, ">", "0")
    .andWhere(andWhereCluse)
    // .orWhere(orWhereCluse)
    .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectByIndustryByYarnWb = async (whereCluseArray) => {

  let queryResults = [];
  let columns = [
    `id`,
    `code`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnLotTableName}.id`,
      `${yarnLotTableName}.code`,
        `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnLotTableName}.id`,
          `${yarnLotTableName}.code`,
            `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${yarnLotTableName}.id`,
          `${yarnLotTableName}.code`,
            `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
          .where(whereCluseArray[3])
     })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;

}