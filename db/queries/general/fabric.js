// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constantsPayloads = require("../../../util/constants-payloads");
const constants = require("../../../util/constants");
const { fabricTableName, wbTableName, wcTableName, 
  wcAddRequisitionDetailsTableName, wcReconciliationRequisitionDetailsTableName, 
  wcReconciliationRequisitionDetailsWcTableName, wdTransportRequisitionWdWcDetailsTableName, 
  wcAddRequisitionTableName, bussinessmanTableName, wdTransportWcWdDetailsTableName, 
  wdTableName, wdReconciliationRequisitionDetailsTableName, 
  wdReconciliationRequisitionDetailsWdTableName, wdTransitionBetweenDyersRequisitionDetailsTableName, 
  weAddRequisitionDetailsTableName, weTableName, weReconciliationRequisitionDetailsTableName, 
  weReconciliationRequisitionDetailsWeTableName, wdDyeingRequisitionDetailsTableName, 
  wdDyeingRequisitionTableName, weAddRequisitionTableName, weReturnSellRequisitionDetailsTableName, 
  weReturnSellRequisitionDetailsWeTableName, wbManufacturingOutputTableName, 
  wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName, 
  wdTransportRequisitionWdWcTableName, colorTableName, anointedColorsPricesTableName, 
  warehouseTableName, wdTransportWcWdTableName, wdFormDyeingRequisitionTableName, 
  wdReconciliationRequisitionTableName, wcReconciliationRequisitionTableName, 
  weReconciliationRequisitionTableName, wcExecuteOrderRequisitionDetailsTableName, 
  wcExecuteOrderRequisitionTableName, consigmentManufacturingTableName, 
  weTransitionBetweenWHRequisitionDetailsTableName, weTransitionBetweenWHRequisitionTableName, 
  wcTransitionBetweenWHRequisitionDetailsTableName, wcTransitionBetweenWHRequisitionTableName, 
  weExecuteOrderRequisitionDetailsTableName,
  weExecuteOrderRequisitionTableName,
  weReturnSellRequisitionTableName
} = require("../../../util/database-tables-name");

exports.insert = async (fabric) => {
  let queryResults = false;
  await sqlFun
    .insert(fabricTableName, {
      id: fabric.id,
      name: fabric.name,
      code: fabric.code,
      dyeing_code: fabric.dyeingCode,
      fabric_quantity_m2: fabric.fabricQuantityM2,
      is_form: fabric.isForm,
      creator_id: fabric.personid,
      ip_address: fabric.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (fabric) => {
  let queryResults = false;
  await sqlFun
    .update(
      fabricTableName,
      {
        name: fabric.name,
        code: fabric.code,
        dyeing_code: fabric.dyeingCode,
        fabric_quantity_m2: fabric.fabricQuantityM2,
      },
      {
        id: fabric.id,
      }
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.updateDynamic = async (fabric, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      fabricTableName,
      fabric,
      whereCluse
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
    .limitedSelect(fabricTableName, ["is_deleted"], whereCluse, 1)
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
      fabricTableName,
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        knex.raw(`CONCAT(${fabricTableName}.name, ' (الكود: ', ${fabricTableName}.code, ')' ) as "fabric_name_code"`),
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.fabric_quantity_m2`,
        `${fabricTableName}.is_form`,
      ],
      {
        is_deleted: "0",
        is_active: "1",
        is_dyed_fabric: '0'
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
      fabricTableName,
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
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


exports.delete = async (fabricId) => {
  let queryResults = false;
  await sqlFun
    .delete(fabricTableName, {
      id: fabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (fabricId) => {
  let queryResults = false;
  await sqlFun
    .restore(fabricTableName, {
      id: fabricId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

// WB
exports.selectFabricToBeManufacturedWb = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await knex.select([
    `${fabricTableName}.id`,
    `${fabricTableName}.name`,
    `${fabricTableName}.code`,
    `${fabricTableName}.dyeing_code`,
  ])
    .from(`${fabricTableName}`)
    .whereIn(`${fabricTableName}.id`, function () {
      this.select(`${wbTableName}.fabric_to_be_manufactured_id`)
        .from(`${wbTableName}`)
        .where(whereInWhereCluse)
        .andWhere(`${wbTableName}.current_quantity`, `>`, 0);
    })
    .andWhere(whereCluse)

    .then((data) => {
      console.log(data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectManufacturedFabricWb = async (whereCluse, whereInWhereCluse) => {
  let queryResults = [];
  await sqlFun
    .selectWhereIn(
      fabricTableName,
      [
        `${fabricTableName}.id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
        `${fabricTableName}.dyeing_code`,
      ],
      whereCluse,
      `${fabricTableName}.id`,
      `${wbManufacturingOutputTableName}.fabric_id`,
      `${wbManufacturingOutputTableName}`,
      whereInWhereCluse
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectStoredFabricsWc = async (whereCluse, wcWhereCluse) => {
  let queryResults = []

  await knex(fabricTableName)
    .select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.code`,
    ])
    .whereIn(`${fabricTableName}.id`, function () {
      this.select(`${wcAddRequisitionDetailsTableName}.fabric_id as id`)
        .from(`${wcAddRequisitionDetailsTableName}`)
        .innerJoin(`${wcTableName}`,
          `${wcTableName}.wc_add_requisition_details_id`,
          `${wcAddRequisitionDetailsTableName}.id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
        .andWhere(wcWhereCluse)
    })
    .orWhereIn(`${fabricTableName}.id`, function () {
      this.select(`${wcReconciliationRequisitionDetailsTableName}.fabric_id as id`)
        .from(`${wcReconciliationRequisitionDetailsTableName}`)
        .innerJoin(`${wcReconciliationRequisitionTableName}`,
          `${wcReconciliationRequisitionTableName}.id`,
          `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
        .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
          `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
          `${wcReconciliationRequisitionDetailsTableName}.id`)
        .innerJoin(`${wcTableName}`,
          `${wcTableName}.id`,
          `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
        .andWhere(wcWhereCluse)
    })
    .orWhereIn(`${fabricTableName}.id`, function () {
      this.select(`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id as id`)
        .from(`${wdTransportRequisitionWdWcTableName}`)
        .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
          `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`,
          `${wdTransportRequisitionWdWcTableName}.id`)
        .innerJoin(`${wcTableName}`,
          `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
        .andWhere(wcWhereCluse)
    })
    .orWhereIn(`${fabricTableName}.id`, function () {
      this.select(`${wbManufacturingOutputTableName}.fabric_id as id`)
        .from(`${wbManufacturingOutputTableName}`)
        .innerJoin(`${wcTableName}`,
          `${wcTableName}.wb_manufacturing_output_id`,
          `${wbManufacturingOutputTableName}.id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
        .andWhere(wcWhereCluse)
    })
    .orWhereIn(`${fabricTableName}.id`, function () {
      this.select(`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id as id`)
        .from(`${wcExecuteOrderRequisitionTableName}`)
        .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
          `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`,
          `${wcExecuteOrderRequisitionTableName}.id`)
        .innerJoin(`${wcTableName}`,
          `${wcTableName}.wc_execute_order_requisition_details_id`,
          `${wcExecuteOrderRequisitionDetailsTableName}.id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
        .andWhere(wcWhereCluse)
    })
    .andWhere(whereCluse)
    .groupBy(`${fabricTableName}.id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error selectByWarehouseWc :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredFabricsForExecuteOrderWc = async (whereCluseArray, isGreaterThanZero = 1) => {
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
    `consigment_manufacturing_id`,
    `consigment_manufacturing_number`,
    `requisition_details_id`,
    `quantity`,
    `wc_id`
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
      `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcTableName}.id as wc_id`,
      `${wcTableName}.current_quantity`,
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_add_requisition_details_id`,
        `${wcAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wcTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wcTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
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
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.id as wc_id`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
            `${wcReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wcReconciliationRequisitionTableName}.warehouse_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.transportFromBToAType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن نقل من (D) الى (C)'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wcTableName}.id as wc_id`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`)
          .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code`,
          knex.raw('? as type_of_requisition', `${constantsPayloads.manufactruingType}`),
          knex.raw('? as type_of_requisition_trans', 'اذن تصنيع'),
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${wbManufacturingOutputTableName}.id as requisition_details_id`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wcTableName}.id as wc_id`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wbManufacturingOutputTableName}.warehouse_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`requisition_details_id`, `id`, `warehouse_id`,
      `consigment_manufacturing_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWcFabrics = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `dyeing_code`,
    `code`,
    `requisition_details_id`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code`,
      `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_add_requisition_details_id`,
        `${wcAddRequisitionDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wcTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wcTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
            `${wcReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wbManufacturingOutputTableName}.id as requisition_details_id`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcExecuteOrderRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
            `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_execute_order_requisition_details_id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[4])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[5])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
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

exports.selectStoredWcFabricsForReturn = async (whereCluse) => {
  let queryResults = []

  await knex(fabricTableName)
    .select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.code`,
      `${wcAddRequisitionDetailsTableName}.quantity`
    ])
    .innerJoin(`${wcAddRequisitionDetailsTableName}`,
      `${wcAddRequisitionDetailsTableName}.fabric_id`,
      `${fabricTableName}.id`)
    .innerJoin(`${wcAddRequisitionTableName}`,
      `${wcAddRequisitionTableName}.id`,
      `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .innerJoin(`${wcTableName}`,
      `${wcTableName}.wc_add_requisition_details_id`,
      `${wcAddRequisitionDetailsTableName}.id`)
    .where(whereCluse)
    .andWhere(`${wcTableName}.current_quantity`, ">", "0")
    .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
    .sum(`${wcTableName}.current_quantity as current_quantity`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error selectStoredWcFabricsForReturn :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFabricsInDyers = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `dyeing_id`,
    `dyeing_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdTableName}.dyeing_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wdTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wdTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdTableName}.dyeing_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdTableName}.dyeing_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`, `dyeing_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFormFabricsInDyers = async (whereCluseArray) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `dyeing_id`,
    `dyeing_name`,
    `quantity`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
        `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
        `${wdTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdTableName}.dyeing_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        qb.where(`${wdTableName}.current_quantity`, "<=", "0")
        qb.andWhere(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdTableName}.dyeing_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              qb.where(`${wdTableName}.current_quantity`, "<=", "0")
              qb.andWhere(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdTableName}.dyeing_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              qb.where(`${wdTableName}.current_quantity`, "<=", "0")
              qb.andWhere(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`, `dyeing_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFabrics = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wdTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wdTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFormFabrics = async (whereCluseArray) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
        `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
        `${wdTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
        `${wdFormDyeingRequisitionDetailsTableName}.id`,
        `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        qb.where(`${wdTableName}.current_quantity`, "=", "0")
        qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              qb.where(`${wdTableName}.current_quantity`, "=", "0")
              qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsWdTableName}`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              qb.where(`${wdTableName}.current_quantity`, "=", "0")
              qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWeFabrics = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `we_id`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyeing_code`,
    `dyed_fabric_code`,
    `quantity`,
    `dyeing_id`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      knex.raw('? as dyeing_id', ''),
      `${weTableName}.current_quantity`,
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${weTableName}.current_quantity`,
        ])

          .from(`${fabricTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionTableName}.dyeing_id`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
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
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${weTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
            .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
            `${weTransitionBetweenWHRequisitionTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weExecuteOrderRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${weTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
            `${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
            .innerJoin(`${weExecuteOrderRequisitionTableName}`,
            `${weExecuteOrderRequisitionTableName}.id`,
            `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_execute_order_requisition_details_id`,
            `${weExecuteOrderRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[4])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weReturnSellRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${weTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${weReturnSellRequisitionDetailsTableName}`,
            `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
            .innerJoin(`${weReturnSellRequisitionTableName}`,
            `${weReturnSellRequisitionTableName}.id`,
            `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_return_sell_requisition_details_id`,
            `${weReturnSellRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[5])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.spinning_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`dyed_fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWcFabricsForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `dyeing_code`,
    `code`,
    `requisition_details_id`,
    `warehouse_id`,
    `warehouse_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code`,
      `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${wcAddRequisitionDetailsTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_add_requisition_details_id`,
        `${wcAddRequisitionDetailsTableName}.id`)
        .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.warehouse_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wcTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wcTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${wcAddRequisitionDetailsTableName}.warehouse_id`, function () {
        this.select(`${warehouseTableName}.id as warehouse_id`)
          .from(warehouseTableName).where(whereCluseArray[4]);
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcReconciliationRequisitionTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
            `${wcReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
            .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcReconciliationRequisitionTableName}.warehouse_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
        .whereIn(`${wcReconciliationRequisitionTableName}.warehouse_id`, function () {
          this.select(`${warehouseTableName}.id as warehouse_id`)
            .from(warehouseTableName).where(whereCluseArray[4]);
        })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
          `${wdTransportRequisitionWdWcTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`)
          .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdTransportRequisitionWdWcTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wbManufacturingOutputTableName}.id as requisition_details_id`,
          `${wbManufacturingOutputTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wbManufacturingOutputTableName}.warehouse_id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wbManufacturingOutputTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcExecuteOrderRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcExecuteOrderRequisitionTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
            `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_execute_order_requisition_details_id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
            `${wcExecuteOrderRequisitionTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
          .where(whereCluseArray[5])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wcExecuteOrderRequisitionTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
            `${wcTransitionBetweenWHRequisitionTableName}.id`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .where(whereCluseArray[6])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`warehouse_id`, `id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWcFabricsForInquireFabricAvilabilityTotal = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `id`,
    `name`,
    `dyeing_code`,
    `code`,
    `requisition_details_id`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id`,
      `${fabricTableName}.name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code`,
      `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${wcTableName}`,
        `${wcTableName}.wc_add_requisition_details_id`,
        `${wcAddRequisitionDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${wcTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${wcTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${wcAddRequisitionDetailsTableName}.warehouse_id`, function () {
        this.select(`${warehouseTableName}.id as warehouse_id`)
          .from(warehouseTableName).where(whereCluseArray[4]);
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
            `${wcReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
            .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
        .whereIn(`${wcReconciliationRequisitionTableName}.warehouse_id`, function () {
          this.select(`${warehouseTableName}.id as warehouse_id`)
            .from(warehouseTableName).where(whereCluseArray[4]);
        })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`)
          .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdTransportRequisitionWdWcTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wbManufacturingOutputTableName}.id as requisition_details_id`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
          .where(whereCluseArray[3])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wbManufacturingOutputTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcExecuteOrderRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
            `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_execute_order_requisition_details_id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
            `${wcExecuteOrderRequisitionTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
          .where(whereCluseArray[5])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wcExecuteOrderRequisitionTableName}.warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
            })
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wcTableName}`,
            `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
            `${wcTransitionBetweenWHRequisitionTableName}.id`,
            `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
          .where(whereCluseArray[6])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wcTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[4]);
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

exports.selectStoredWdFabricsForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `dyeing_id`,
    `dyeing_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${wdTableName}.dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
        .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdTableName}.dyeing_id`)
      .where(whereCluseArray[0])
      .andWhere(
        (qb) => {
          if (isGreaterThanZero) {
            qb.where(`${wdTableName}.current_quantity`, ">", "0")
          } else {
            qb.where(`${wdTableName}.current_quantity`, ">=", "0")
          }
        })
      .whereIn(`${wdTableName}.dyeing_id`, function () {
        this.select(`${bussinessmanTableName}.id as dyeing_id`)
          .from(bussinessmanTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdReconciliationRequisitionTableName}.dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
            .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
            .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdReconciliationRequisitionTableName}.dyeing_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdReconciliationRequisitionTableName}.dyeing_id`, function () {
              this.select(`${bussinessmanTableName}.id as dyeing_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdTableName}.dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
            .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdTableName}.dyeing_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdTableName}.dyeing_id`, function () {
              this.select(`${bussinessmanTableName}.id as dyeing_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`dyeing_id`, `fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFabricsForInquireFabricAvilabilityTotal = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .where(whereCluseArray[0])
      .andWhere(
        (qb) => {
          if (isGreaterThanZero) {
            qb.where(`${wdTableName}.current_quantity`, ">", "0")
          } else {
            qb.where(`${wdTableName}.current_quantity`, ">=", "0")
          }
        })
      .whereIn(`${wdTableName}.dyeing_id`, function () {
        this.select(`${bussinessmanTableName}.id as dyeing_id`)
          .from(bussinessmanTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`,
            `${wdReconciliationRequisitionDetailsTableName}.id`)
            .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdReconciliationRequisitionTableName}.dyeing_id`, function () {
              this.select(`${bussinessmanTableName}.id as dyeing_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id`,
          `${fabricTableName}.name`,
          `${fabricTableName}.code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${fabricTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${wdTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${wdTableName}.current_quantity`, ">=", "0")
              }
            })
            .whereIn(`${wdTableName}.dyeing_id`, function () {
              this.select(`${bussinessmanTableName}.id as dyeing_id`)
                .from(bussinessmanTableName).where(whereCluseArray[3]);
            })
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFormFabricsForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `color_id`,
    `color_code`,
    `dyeing_id`,
    `dyeing_name`,
    `form_current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${anointedColorsPricesTableName}.color_id`,
      `${anointedColorsPricesTableName}.code as color_code`,
      `${wdFormDyeingRequisitionTableName}.dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdFormDyeingRequisitionDetailsTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
        .innerJoin(`${anointedColorsPricesTableName}`,
        `${anointedColorsPricesTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
        .innerJoin(`${wdFormDyeingRequisitionTableName}`,
        `${wdFormDyeingRequisitionTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdFormDyeingRequisitionTableName}.dyeing_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
      })
      .whereIn(`${wdFormDyeingRequisitionTableName}.dyeing_id`, function () {
        this.select(`${bussinessmanTableName}.id as dyeing_id`)
          .from(bussinessmanTableName).where(whereCluseArray[1]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
  }).as('temp')
    .sum(`form_current_quantity as form_current_quantity`)
    .groupBy(`dyeing_id`, `fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectStoredWdFormFabricsForInquireFabricAvilabilityTotal = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `color_id`,
    `color_code`,
    `form_current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${anointedColorsPricesTableName}.color_id`,
      `${anointedColorsPricesTableName}.code as color_code`,
      `${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_current_quantity`
    ])
      .from(`${fabricTableName}`)
      .distinct(`${wdFormDyeingRequisitionDetailsTableName}.id`)
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
        `${wdFormDyeingRequisitionDetailsTableName}.fabric_id`,
        `${fabricTableName}.id`)
        .innerJoin(`${anointedColorsPricesTableName}`,
        `${anointedColorsPricesTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
        .innerJoin(`${wdFormDyeingRequisitionTableName}`,
        `${wdFormDyeingRequisitionTableName}.id`,
        `${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
      })
      .whereIn(`${wdFormDyeingRequisitionTableName}.dyeing_id`, function () {
        this.select(`${bussinessmanTableName}.id as dyeing_id`)
          .from(bussinessmanTableName).where(whereCluseArray[1]);
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
  }).as('temp')
    .sum(`form_current_quantity as form_current_quantity`)
    .groupBy(`fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports. selectStoredWeFabricsForInquireFabricAvilability = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `we_id`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyeing_code`,
    `dyed_fabric_code`,
    `quantity`,
    `dyeing_id`,
    `color_id`,
    `color_code`,
    `warehouse_id`,
    `warehouse_name`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      knex.raw('? as dyeing_id', ''),
      `${colorTableName}.id as color_id`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weAddRequisitionDetailsTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${weTableName}.current_quantity`,
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
        .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weAddRequisitionDetailsTableName}.warehouse_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${weAddRequisitionDetailsTableName}.warehouse_id`, function () {
        this.select(`${warehouseTableName}.id as warehouse_id`)
          .from(warehouseTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${colorTableName}.id as color_id`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weReconciliationRequisitionDetailsTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${weTableName}.current_quantity`,
        ])

          .from(`${fabricTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${weReconciliationRequisitionDetailsTableName}.warehouse_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
          .whereIn(`${weReconciliationRequisitionDetailsTableName}.warehouse_id`, function () {
            this.select(`${warehouseTableName}.id as warehouse_id`)
              .from(warehouseTableName).where(whereCluseArray[3]);
          })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionTableName}.dyeing_id`,
          `${anointedColorsPricesTableName}.color_id`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${wdDyeingRequisitionTableName}.warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
            .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
          .innerJoin(`${anointedColorsPricesTableName}`,
            `${anointedColorsPricesTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
            .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wdDyeingRequisitionTableName}.warehouse_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
          .whereIn(`${wdDyeingRequisitionTableName}.warehouse_id`, function () {
            this.select(`${warehouseTableName}.id as warehouse_id`)
              .from(warehouseTableName).where(whereCluseArray[3]);
          })
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${colorTableName}.id as color_id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${weTransitionBetweenWHRequisitionDetailsTableName}`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
          `${weTransitionBetweenWHRequisitionTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
            .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
            .where(whereCluseArray[4])
            .andWhere(
              (qb) => {
                if (isGreaterThanZero) {
                  qb.where(`${weTableName}.current_quantity`, ">", "0")
                } else {
                  qb.where(`${weTableName}.current_quantity`, ">=", "0")
                }
              })
            .whereIn(`${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`, function () {
              this.select(`${warehouseTableName}.id as warehouse_id`)
                .from(warehouseTableName).where(whereCluseArray[3]);
            })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`warehouse_id`, `dyed_fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports. selectStoredWeFabricsForInquireFabricAvilabilityTotal = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `we_id`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyeing_code`,
    `dyed_fabric_code`,
    `quantity`,
    `dyeing_id`,
    `color_id`,
    `color_code`,
    `current_quantity`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${weTableName}.id as we_id`,
      `${fabricTableName}.id as dyed_fabric_id`,
      `${fabricTableName}.name as dyed_fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as dyed_fabric_code`,
      `${weAddRequisitionDetailsTableName}.quantity`,
      knex.raw('? as dyeing_id', ''),
      `${colorTableName}.id as color_id`,
      `${weAddRequisitionDetailsTableName}.color_code`,
      `${weTableName}.current_quantity`,
    ])
      .from(`${fabricTableName}`)
      .innerJoin(`${weAddRequisitionDetailsTableName}`,
        `${weAddRequisitionDetailsTableName}.dyed_fabric_id`,
        `${fabricTableName}.id`)
      .innerJoin(`${weTableName}`,
        `${weTableName}.we_add_requisition_details_id`,
        `${weAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${colorTableName}`,
        `${colorTableName}.id`,
        `${weAddRequisitionDetailsTableName}.color_id`)
      .where(whereCluseArray[0])
      .andWhere((qb) => {
        if (isGreaterThanZero) {
          qb.where(`${weTableName}.current_quantity`, ">", "0")
        } else {
          qb.where(`${weTableName}.current_quantity`, ">=", "0")
        }
      })
      .whereIn(`${weAddRequisitionDetailsTableName}.warehouse_id`, function () {
        this.select(`${warehouseTableName}.id as warehouse_id`)
          .from(warehouseTableName).where(whereCluseArray[3]);
      })
      // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weReconciliationRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${colorTableName}.id as color_id`,
          `${weReconciliationRequisitionDetailsTableName}.color_code`,
          `${weTableName}.current_quantity`,
        ])

          .from(`${fabricTableName}`)
          .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
            `${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
            `${weReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.id`,
            `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
          .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weReconciliationRequisitionDetailsTableName}.color_id`)
          .where(whereCluseArray[1])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
          .whereIn(`${weReconciliationRequisitionDetailsTableName}.warehouse_id`, function () {
            this.select(`${warehouseTableName}.id as warehouse_id`)
              .from(warehouseTableName).where(whereCluseArray[3]);
          })
        // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${wdDyeingRequisitionDetailsTableName}.quantity`,
          `${wdDyeingRequisitionTableName}.dyeing_id`,
          `${anointedColorsPricesTableName}.color_id`,
          `${anointedColorsPricesTableName}.code as color_code`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${fabricTableName}`)
          .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
            `${fabricTableName}.id`)
          .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.wd_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.id`)
            .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
          .innerJoin(`${anointedColorsPricesTableName}`,
            `${anointedColorsPricesTableName}.id`,
            `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
          .where(whereCluseArray[2])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
          .whereIn(`${wdDyeingRequisitionTableName}.warehouse_id`, function () {
            this.select(`${warehouseTableName}.id as warehouse_id`)
              .from(warehouseTableName).where(whereCluseArray[3]);
          })
      })
      .union(function () {
        this.select([
          `${weTableName}.id as we_id`,
          `${fabricTableName}.id as dyed_fabric_id`,
          `${fabricTableName}.name as dyed_fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as dyed_fabric_code`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          knex.raw('? as dyeing_id', ''),
          `${colorTableName}.id as color_id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
          `${weTableName}.current_quantity`,
        ])
          .from(`${weTransitionBetweenWHRequisitionDetailsTableName}`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`)
          .innerJoin(`${weTransitionBetweenWHRequisitionTableName}`,
          `${weTransitionBetweenWHRequisitionTableName}.id`,
          `${weTransitionBetweenWHRequisitionDetailsTableName}.we_transition_between_wh_requisitions_id`)
          .innerJoin(`${weTableName}`,
            `${weTableName}.we_transition_between_wh_requisitions_details_id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
            .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
            .where(whereCluseArray[4])
          .andWhere(
            (qb) => {
              if (isGreaterThanZero) {
                qb.where(`${weTableName}.current_quantity`, ">", "0")
              } else {
                qb.where(`${weTableName}.current_quantity`, ">=", "0")
              }
            })
          .whereIn(`${weTransitionBetweenWHRequisitionTableName}.to_warehouse_id`, function () {
            this.select(`${warehouseTableName}.id as warehouse_id`)
              .from(warehouseTableName).where(whereCluseArray[3]);
          })
      })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`dyed_fabric_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectFabricByDyedFabric = async (whereCluse) => {
  let queryResults = [];
  await sqlFun
    .limitedSelect(fabricTableName, [
        `${fabricTableName}.id`,
        `${fabricTableName}.fabric_id`,
        `${fabricTableName}.name`,
        `${fabricTableName}.code`,
    ], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};