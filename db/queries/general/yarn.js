// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const constantsPayloads = require("../../../util/constants-payloads");
const { waAddRequisitionTableName, wbTableName, wbTransportWaWbDetailsTableName, wbTransportWaWbTableName, bussinessmanTableName, wbReconciliationRequisitionDetailsTableName, wbReconciliationRequisitionDetailsWbTableName, wbTransportRequisitionWbWaDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, warehouseTableName, waReconciliationRequisitionTableName, wbTransportRequisitionWbWaTableName, yarnLotTableName, consigmentYarnTableName } = require("../../../util/database-tables-name");
const yarnTableName = require("../../../util/database-tables-name").yarnTableName;
const waTableName = require("../../../util/database-tables-name").waTableName;
const waAddRequisitionDetailsTableName = require("../../../util/database-tables-name").waAddRequisitionDetailsTableName;
const waReconciliationRequisitionDetailsTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const waReconciliationRequisitionDetailsWaTableName = require("../../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;

exports.insert = async (yarn) => {
  let queryResults = false;
  await sqlFun
    .insert(yarnTableName, {
      id: yarn.id,
      name: yarn.name,
      code: yarn.code,
      creator_id: yarn.creator_id,
      ip_address: yarn.ip_address,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (yarn) => {
  let queryResults = false;
  await sqlFun
    .update(
      yarnTableName,
      {
        name: yarn.name,
        code: yarn.code,
      },
      {
        id: yarn.id,
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
    .limitedSelect(yarnTableName, ["is_deleted"], whereCluse, 1)
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
      yarnTableName,
      [
        `${yarnTableName}.id`,
        `${yarnTableName}.name`,
        `${yarnTableName}.code`,
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
      yarnTableName,
      [
        `${yarnTableName}.id`,
        `${yarnTableName}.name`,
        `${yarnTableName}.code`,
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


exports.delete = async (yarnId) => {
  let queryResults = false;
  await sqlFun
    .delete(yarnTableName, {
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
    .restore(yarnTableName, {
      id: yarnId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

// exports.selectNotInIds = async (whereCluse, yarnsIds) => {
//   let queryResults = [];

//   await knex.from(yarnTableName)
//     .select(
//       [
//         `${yarnTableName}.id`,
//         `${yarnTableName}.name`,
//         `${yarnTableName}.code`,
//       ],
//     )
//     .whereNotIn('id', yarnsIds)
//     .andWhere(whereCluse)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

exports.selectStoredWaYarns = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `code`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${waTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${waTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
            `${waReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)

      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWaYarnsForReturn = async (whereCluse) => {
  let queryResults = []

  await knex(yarnTableName)
    .select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${waAddRequisitionDetailsTableName}.quantity`
    ])
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.yarn_id`,
      `${yarnTableName}.id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${waTableName}`,
      `${waTableName}.wa_add_requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${waTableName}.current_quantity`, ">", "0")
    .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
    .sum(`${waTableName}.current_quantity as current_quantity`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      queryResults = constants.errorPayload
    })
  return queryResults
}


exports.selectStoredWaYarnsByYarnId = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `code`,
    `type_of_requisition`,
    `type_of_requisition_trans`,
    `warehouse_id`,
    `warehouse_name`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `requisition_details_id`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      knex.raw('? as type_of_requisition', `${constantsPayloads.addType}`),
      knex.raw('? as type_of_requisition_trans', 'اذن اضافة'),
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `${waAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
        .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waAddRequisitionDetailsTableName}.warehouse_id`)
        .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
        .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${waTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${waTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.reconcilitionType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن تسوية'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${waReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
            `${waReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
            .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waReconciliationRequisitionTableName}.warehouse_id`)
        .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)

      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.transportFromBToAType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن نقل من (B) الى (A)'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${wbTransportRequisitionWbWaDetailsTableName}.id as requisition_details_id`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`)
            .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
        .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
        .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`requisition_details_id`, `id`, `warehouse_id`, 
    `yarn_lot_id`, `consigment_yarn_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWaYarnsAndWarehouses = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `code`,
    `warehouse_id`,
    `warehouse_name`,
    `requisition_details_id`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${waAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
        .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waAddRequisitionDetailsTableName}.warehouse_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${waTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${waTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${waReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
            `${waReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
            .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waReconciliationRequisitionTableName}.warehouse_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)

      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wbTransportRequisitionWbWaDetailsTableName}.id as requisition_details_id`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`)
            .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`id`, `warehouse_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectByWarehouseWa = async (whereCluseArray) => {

  let queryResults = [];
  let columns = [
    `id`,
    `name`,
    `code`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${waTableName}.current_quantity`,
    ])
      .from(`${waTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.id`,
        `${waTableName}.wa_add_requisition_details_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${waAddRequisitionDetailsTableName}.yarn_id`)
      .where(whereCluseArray[0])
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
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
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
          .where(whereCluseArray[1])
        })
        .union(function () {
          this.select([
            `${yarnTableName}.id`,
            `${yarnTableName}.name`,
            `${yarnTableName}.code`,
            `${waTableName}.current_quantity`,
          ])
            .from(`${waTableName}`)
            .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
              `${wbTransportRequisitionWbWaDetailsTableName}.id`,
              `${waTableName}.wb_transport_requisition_wb_wa_details_id`)
              .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
              `${wbTransportRequisitionWbWaTableName}.id`,
              `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
            .innerJoin(`${yarnTableName}`,
              `${yarnTableName}.id`,
              `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
            .where(whereCluseArray[3])
          })
  }).as('temp')
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;

}

exports.selectByIndustryWb = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `id`,
    `name`,
    `code`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
      .where(whereCluseArray[0])
      .as('t1')
      .unionAll(
        knex.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
          .where(whereCluseArray[1])
      )
      .unionAll(
        knex.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
          .where(whereCluseArray[3])
      )
  }).as('temp')
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
}

exports.selectStoredWbYarnsInManufacturers = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `manufacturer_id`,
    `manufacturer_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${bussinessmanTableName}.id as manufacturer_id`,
      `${bussinessmanTableName}.name as manufacturer_name`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .distinct(`${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${wbTableName}`,
        `${wbTableName}.wb_transport_wa_wb_details_id`,
        `${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wbTableName}.industry_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wbTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wbTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${wbReconciliationRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .distinct(`${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`,
            `${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbTableName}.industry_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wbTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wbTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)
      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .distinct(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbTableName}.industry_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wbTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wbTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`yarn_id`, `manufacturer_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWaYarnsAndWarehousesForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `code`,
    `warehouse_id`,
    `warehouse_name`,
    `requisition_details_id`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id`,
      `${yarnTableName}.name`,
      `${yarnTableName}.code`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${waAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
        .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waAddRequisitionDetailsTableName}.warehouse_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${waTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${waTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${waAddRequisitionDetailsTableName}.warehouse_id`, function () {
        this.select(`${warehouseTableName}.id as warehouse_id`)
          .from(warehouseTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${waReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
            `${waReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
            .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waReconciliationRequisitionTableName}.warehouse_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${waReconciliationRequisitionTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)

      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wbTransportRequisitionWbWaDetailsTableName}.id as requisition_details_id`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`)
            .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${waTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${waTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wbTransportRequisitionWbWaTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[3]);
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`id`, `warehouse_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWbYarnsInManufacturersForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `manufacturer_id`,
    `manufacturer_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${bussinessmanTableName}.id as manufacturer_id`,
      `${bussinessmanTableName}.name as manufacturer_name`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTableName}.current_quantity`
    ])
      .from(`${yarnTableName}`)
      .distinct(`${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`,
        `${yarnTableName}.id`)
      .innerJoin(`${wbTableName}`,
        `${wbTableName}.wb_transport_wa_wb_details_id`,
        `${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wbTableName}.industry_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wbTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wbTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${wbTableName}.industry_id`, function () {
        this.select(`${bussinessmanTableName}.id as industry_id`)
          .from(bussinessmanTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${wbReconciliationRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .distinct(`${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`,
            `${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbTableName}.industry_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wbTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wbTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wbTableName}.industry_id`, function () {
              this.select(`${bussinessmanTableName}.id as industry_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)
      })
      .union(function () {
        this.select([
          `${yarnTableName}.id`,
          `${yarnTableName}.name`,
          `${yarnTableName}.code`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${yarnTableName}`)
          .distinct(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`,
            `${yarnTableName}.id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbTableName}.industry_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wbTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wbTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wbTableName}.industry_id`, function () {
              this.select(`${bussinessmanTableName}.id as industry_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`yarn_id`, `manufacturer_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}
