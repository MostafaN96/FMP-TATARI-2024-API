// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();
const constantsPayloads = require("../../../util/constants-payloads");

const { yarnTableName, warehouseTableName, wbTransportRequisitionWbWaDetailsTableName, 
  wbTransportRequisitionWbWaTableName, consigmentYarnTableName, 
  waExecuteOrderRequisitionDetailsTableName, waExecuteOrderRequisitionTableName, 
  waExecuteOrderRequisitionDetailsWaTableName, waTransitionBetweenWHRequisitionDetailsTableName, 
  waTransitionBetweenWHRequisitionTableName, waAddRequisitionDetailsYarnOrderTableName,
  waTableName, waAddRequisitionDetailsTableName, waAddRequisitionTableName,
  waReconciliationRequisitionDetailsTableName, waReconciliationRequisitionDetailsWaTableName,
  waReconciliationRequisitionTableName, yarnLotTableName,
  waYarnOrderRequisitionTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wa, items, id) => {
  let queryResults = false;
  await sqlFun
    .insert(waTableName, {
      id: wa.waId,
      type: constantsPayloads.addType,
      wa_add_requisition_details_id: wa.waRequisitionDetailsId,
      current_quantity: items.quantity,
      creator_id: wa.personid,
      ip_address: wa.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForReconciliation = async (wa, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waTableName, {
      id: wa.waId,
      type: constantsPayloads.reconcilitionType,
      current_quantity: items.quantity,
      creator_id: wa.personid,
      ip_address: wa.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransportRequisitionWbWa = async (wa, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waTableName, {
      id: items.waId,
      type: constantsPayloads.transportFromBToAType,
      wb_transport_requisition_wb_wa_details_id: items.wbTransportRequisitionWbWaDetailsId,
      current_quantity: items.quantity,
      creator_id: wa.personid,
      ip_address: wa.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.insertForExecuteOrderRequisition = async (wa, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waTableName, {
      id: wa.waId,
      wa_execute_order_requisition_details_id: items.waExecuteOrderRequisitionDetailsId,
      type: constantsPayloads.executeOrderType,
      current_quantity: items.quantity,
      creator_id: wa.personid,
      ip_address: wa.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetweenWhRequisition = async (wa, items) => {
  let queryResults = false;
  await sqlFun
    .insert(waTableName, {
      id: wa.waId,
      wa_transition_between_wh_requisitions_details_id: items.waTransitionBetweenWHRequisitionDetailsId,
      type: constantsPayloads.transportBetweenType,
      current_quantity: items.quantity,
      creator_id: wa.personid,
      ip_address: wa.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (wa, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      waTableName,
      wa,
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
    .limitedSelect(waTableName, ["id", "current_quantity"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectByYarn = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `id`,
    `current_quantity`,
    `quantity`,
    `date`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${waTableName}.id`,
      `${waTableName}.current_quantity`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waAddRequisitionTableName}.date`
    ])
      .from(`${waTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.id`,
        `${waTableName}.wa_add_requisition_details_id`)
        .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
          `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
          `${waAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      .where(whereCluseArray[0])
      .as('t1')
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
      .union(function () {
        this.select([
          `${waTableName}.id`,
          `${waTableName}.current_quantity`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${wbTransportRequisitionWbWaTableName}.date`
        ])
          .from(`${waTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`)
          .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${waTableName}.id`,
          `${waTableName}.current_quantity`,
          `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${waTransitionBetweenWHRequisitionTableName}.date`
        ])
          .from(`${waTableName}`)
          .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${waTableName}.wa_transition_between_wh_requisitions_details_id`)
          .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
            `${waTransitionBetweenWHRequisitionTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
          .where(whereCluseArray[4])
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

exports.selectByYarnForReturn = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];

  await knex.select([
    `${waTableName}.id`,
    `${waTableName}.current_quantity`,
    `${waTableName}.wa_add_requisition_details_id`,
    `${waAddRequisitionDetailsTableName}.quantity`,
  ])
    .from(`${waTableName}`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.id`,
      `${waTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectYarnLotQuantityByWarehouseByYarnByLotWa = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `id`,
    `number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${consigmentYarnTableName}.id`,
      `${consigmentYarnTableName}.number`,
      `${waTableName}.current_quantity`,
    ])
      .from(`${waTableName}`)
      .innerJoin(`${waAddRequisitionDetailsTableName}`,
        `${waAddRequisitionDetailsTableName}.id`,
        `${waTableName}.wa_add_requisition_details_id`)
      .innerJoin(`${waAddRequisitionTableName}`,
        `${waAddRequisitionTableName}.id`,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
        .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
          `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
          `${waAddRequisitionDetailsTableName}.id`)
      .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${consigmentYarnTableName}.id`,
          `${consigmentYarnTableName}.number`,
          `${waTableName}.current_quantity`,
        ])
          // .sum(`${waTableName}.current_quantity as current_quantity`)
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
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${consigmentYarnTableName}.id`,
          `${consigmentYarnTableName}.number`,
          `${waTableName}.current_quantity`,
        ])
          .from(`${waTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`)
          .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${consigmentYarnTableName}.id`,
          `${consigmentYarnTableName}.number`,
          `${waTableName}.current_quantity`,
        ])
          .from(`${waTableName}`)
          .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
            `${waTableName}.wa_transition_between_wh_requisitions_details_id`)
          .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
            `${waTransitionBetweenWHRequisitionTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[4])
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
};

exports.selectSumCurrentQuantityByYarnForReturn = async (whereCluseArray) => {
  let queryResults = [];

  await knex.sum(`${waTableName}.current_quantity as current_quantity`)
    .from(`${waTableName}`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.id`,
      `${waTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .groupBy(`${waAddRequisitionDetailsTableName}.yarn_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectYarnLotQuantityByWarehouseByYarnByLotForReturn = async (whereCluseArray) => {
  let queryResults = [];

  await knex.select([
    `${consigmentYarnTableName}.id`,
    `${consigmentYarnTableName}.number`,
  ])
    .sum(`${waTableName}.current_quantity as current_quantity`)
    .from(`${waTableName}`)
    .innerJoin(`${waAddRequisitionDetailsTableName}`,
      `${waAddRequisitionDetailsTableName}.id`,
      `${waTableName}.wa_add_requisition_details_id`)
    .innerJoin(`${waAddRequisitionTableName}`,
      `${waAddRequisitionTableName}.id`,
      `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
    .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .groupBy(`${waAddRequisitionDetailsTableName}.consigment_yarn_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectStoredWarehouseAndYarnAndYarnLot = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `warehouse_id`,
    `warehouse_name`,
    `wa_yarn_order_requisition_id`,
    `wa_yarn_order_requisition_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
      `${waAddRequisitionDetailsTableName}.quantity`,
      `${waTableName}.current_quantity`
    ])
      .from(`${waAddRequisitionDetailsTableName}`)
      .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
        `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
        .innerJoin(`${waYarnOrderRequisitionTableName}`,
          `${waYarnOrderRequisitionTableName}.id`,
          `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${waAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${waAddRequisitionDetailsTableName}.yarn_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${waTableName}`,
        `${waTableName}.wa_add_requisition_details_id`,
        `${waAddRequisitionDetailsTableName}.id`)
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
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${waReconciliationRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${waReconciliationRequisitionDetailsTableName}`)
          .innerJoin(`${waYarnOrderRequisitionTableName}`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${waReconciliationRequisitionTableName}`,
            `${waReconciliationRequisitionTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${waReconciliationRequisitionTableName}.warehouse_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
            `${waReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.id`,
            `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
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
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${wbTransportRequisitionWbWaDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${wbTransportRequisitionWbWaDetailsTableName}`)
          .innerJoin(`${waYarnOrderRequisitionTableName}`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
            `${wbTransportRequisitionWbWaTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wbTransportRequisitionWbWaTableName}.warehouse_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
            `${wbTransportRequisitionWbWaDetailsTableName}.id`)
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
      .union(function () {
        this.select([
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${waTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
          `${waTableName}.current_quantity`
        ])
          .from(`${waTransitionBetweenWHRequisitionDetailsTableName}`)
          .innerJoin(`${waYarnOrderRequisitionTableName}`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
            `${waTransitionBetweenWHRequisitionTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
          .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${waTableName}`,
            `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[3])
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
    .groupBy(`yarn_id`, 
      `yarn_lot_id`,
      `consigment_yarn_id`, 
      `warehouse_id`,
      `wa_yarn_order_requisition_id`
    )
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}
