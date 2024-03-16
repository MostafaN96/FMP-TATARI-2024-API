// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constantsPayloads = require("../../../util/constants-payloads");
const { wcTableName, consigmentManufacturingTableName, wcAddRequisitionDetailsTableName, wcAddRequisitionTableName, wcReconciliationRequisitionDetailsWcTableName, wcReconciliationRequisitionDetailsTableName, wcReconciliationRequisitionTableName, wdTransportRequisitionWdWcDetailsTableName, wdTransportRequisitionWdWcTableName, fabricTableName, warehouseTableName, wbManufacturingOutputTableName, wbManufacturingRequisitionTableName, wbManufacturingInputOutputTableName, wcExecuteOrderRequisitionDetailsTableName, wcExecuteOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wc, items, id) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTableName, {
      id: wc.wcId,
      type: constantsPayloads.addType,
      wc_add_requisition_details_id: wc.wcRequisitionDetailsId,
      current_quantity: items.quantity,
      creator_id: wc.personid,
      ip_address: wc.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForManufacturing = async (wc) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTableName, {
      id: wc.wcId,
      wb_manufacturing_output_id: wc.wbManufacturingOutputId,
      type: constantsPayloads.manufactruingType,
      current_quantity: wc.fabricQuantity,
      creator_id: wc.personid,
      ip_address: wc.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForReconciliation = async (wc, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTableName, {
      id: wc.wcId,
      type: constantsPayloads.reconcilitionType,
      current_quantity: items.quantity,
      creator_id: wc.personid,
      ip_address: wc.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransportRequisitionWdWc = async (wc, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTableName, {
      id: items.wcId,
      type: constantsPayloads.transportFromBToAType,
      wd_transport_requisition_wd_wc_details_id: items.wdTransportRequisitionWdWcDetailsId,
      current_quantity: items.quantity,
      creator_id: wc.personid,
      ip_address: wc.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForExecuteOrderRequisition = async (wc, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wcTableName, {
      id: wc.wcId,
      wc_execute_order_requisition_details_id: items.wcExecuteOrderRequisitionDetailsId,
      type: constantsPayloads.executeOrderType,
      current_quantity: items.quantity,
      creator_id: wc.personid,
      ip_address: wc.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(wcTableName, ["id", "current_quantity"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.update = async (wc, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wcTableName,
      wc,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectByFabric = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `id`,
    `current_quantity`,
    `quantity`,
    `date`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wcTableName}.id`,
      `${wcTableName}.current_quantity`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcAddRequisitionTableName}.date`
    ])
      .from(`${wcTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcTableName}.wc_add_requisition_details_id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${wcTableName}.id`,
          `${wcTableName}.current_quantity`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcReconciliationRequisitionTableName}.date`
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
            `${wcTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`)
            .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${wcTableName}.id`,
          `${wcTableName}.current_quantity`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wdTransportRequisitionWdWcTableName}.date`
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`)
            .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${wcTableName}.id`,
          `${wcTableName}.current_quantity`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wbManufacturingRequisitionTableName}.date`
        ])
        .distinct()
          .from(`${wcTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.id`,
            `${wcTableName}.wb_manufacturing_output_id`)
            .innerJoin(`${wbManufacturingInputOutputTableName}`,
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
            .innerJoin(`${wbManufacturingRequisitionTableName}`,
            `${wbManufacturingRequisitionTableName}.id`,
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
          .where(whereCluseArray[4])
      })
      .union(function () {
        this.select([
          `${wcTableName}.id`,
          `${wcTableName}.current_quantity`,
          `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
          `${wcExecuteOrderRequisitionTableName}.date`
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
            `${wcExecuteOrderRequisitionDetailsTableName}.id`,
            `${wcTableName}.wc_execute_order_requisition_details_id`)
            .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
            `${wcExecuteOrderRequisitionTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
          .where(whereCluseArray[5])
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

exports.selectByFabricForReturn = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];

  await knex.select([
    `${wcTableName}.id`,
    `${wcTableName}.current_quantity`,
    `${wcTableName}.wc_add_requisition_details_id`,
    `${wcAddRequisitionDetailsTableName}.quantity`,
  ])
    .from(`${wcTableName}`)
    .innerJoin(`${wcAddRequisitionDetailsTableName}`,
      `${wcAddRequisitionDetailsTableName}.id`,
      `${wcTableName}.wc_add_requisition_details_id`)
    .innerJoin(`${wcAddRequisitionTableName}`,
      `${wcAddRequisitionTableName}.id`,
      `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn = async (whereCluseArray) => {
  let queryResults = [];

  await knex.select([
    `${consigmentManufacturingTableName}.id`, 
    `${consigmentManufacturingTableName}.number`, 
  ])
  .sum(`${wcTableName}.current_quantity as current_quantity`)
    .from(`${wcTableName}`)
    .innerJoin(`${wcAddRequisitionDetailsTableName}`,
      `${wcAddRequisitionDetailsTableName}.id`,
      `${wcTableName}.wc_add_requisition_details_id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
      `${wcAddRequisitionTableName}.id`,
      `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
      `${consigmentManufacturingTableName}.id`,
      `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .groupBy(`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectConsigmentManufacturingQuantityByWarehouseByFabricWc = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `id`,
    `number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${consigmentManufacturingTableName}.id`,
      `${consigmentManufacturingTableName}.number`,
      `${wcTableName}.current_quantity`,
    ])
      .from(`${wcTableName}`)
      .innerJoin(`${wcAddRequisitionDetailsTableName}`,
        `${wcAddRequisitionDetailsTableName}.id`,
        `${wcTableName}.wc_add_requisition_details_id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
        `${wcAddRequisitionTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
      .where(whereCluseArray[0])
      .as('t1')
      .union(function () {
        this.select([
          `${consigmentManufacturingTableName}.id`,
          `${consigmentManufacturingTableName}.number`,
          `${wcTableName}.current_quantity`,
        ])
          // .sum(`${wcTableName}.current_quantity as current_quantity`)
          .from(`${wcTableName}`)
          .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
            `${wcTableName}.id`)
          .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
            `${wcReconciliationRequisitionDetailsTableName}.id`,
            `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`)
          .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${consigmentManufacturingTableName}.id`,
          `${consigmentManufacturingTableName}.number`,
          `${wcTableName}.current_quantity`,
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
            `${wdTransportRequisitionWdWcDetailsTableName}.id`,
            `${wcTableName}.wd_transport_requisition_wd_wc_details_id`)
          .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[3])
      })
      .union(function () {
        this.select([
          `${consigmentManufacturingTableName}.id`,
          `${consigmentManufacturingTableName}.number`,
          `${wcTableName}.current_quantity`,
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.id`,
            `${wcTableName}.wb_manufacturing_output_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[4])
      })
      .union(function () {
        this.select([
          `${consigmentManufacturingTableName}.id`,
          `${consigmentManufacturingTableName}.number`,
          `${wcTableName}.current_quantity`,
        ])
          .from(`${wcTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionDetailsTableName}`,
            `${wcExecuteOrderRequisitionDetailsTableName}.id`,
            `${wcTableName}.wc_execute_order_requisition_details_id`)
          .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
            `${wcExecuteOrderRequisitionTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
          .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
          .where(whereCluseArray[5])
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


exports.selectSumCurrentQuantityByFabricForReturn = async (whereCluseArray) => {
  let queryResults = [];

  await knex.sum(`${wcTableName}.current_quantity as current_quantity`)
    .from(`${wcTableName}`)
    .innerJoin(`${wcAddRequisitionDetailsTableName}`,
      `${wcAddRequisitionDetailsTableName}.id`,
      `${wcTableName}.wc_add_requisition_details_id`)
      .innerJoin(`${wcAddRequisitionTableName}`,
      `${wcAddRequisitionTableName}.id`,
      `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
    .where(whereCluseArray[0])
    .andWhere(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
    .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectStoredWarehouseAndFabricAndConsigmentManufacturing = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `dyeing_code`,
    `fabric_code`,
    `consigment_manufacturing_id`,
    `consigment_manufacturing_number`,
    `warehouse_id`,
    `warehouse_name`,
    `quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.dyeing_code`,
      `${fabricTableName}.code as fabric_code`,
      `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
      `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
      `${warehouseTableName}.id as warehouse_id`,
      `${warehouseTableName}.name as warehouse_name`,
      `${wcAddRequisitionDetailsTableName}.quantity`,
      `${wcTableName}.current_quantity`
    ])
      .from(`${wcAddRequisitionDetailsTableName}`)
      .innerJoin(`${warehouseTableName}`,
        `${warehouseTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.warehouse_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.fabric_id`)
        .innerJoin(`${consigmentManufacturingTableName}`,
        `${consigmentManufacturingTableName}.id`,
        `${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`)
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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wcReconciliationRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${wcReconciliationRequisitionDetailsTableName}`)
          .innerJoin(`${wcReconciliationRequisitionTableName}`,
            `${wcReconciliationRequisitionTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wcReconciliationRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.fabric_id`)
            .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`)
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
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.fabric_id`)
        
      })
      .union(function () {
        this.select([
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${wdTransportRequisitionWdWcDetailsTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
            `${wdTransportRequisitionWdWcTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdTransportRequisitionWdWcTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`)
            .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`)
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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wbManufacturingOutputTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${wbManufacturingOutputTableName}`)
          .distinct()
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wbManufacturingOutputTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbManufacturingOutputTableName}.fabric_id`)
            .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wbManufacturingOutputTableName}.consigment_manufacturing_id`)
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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.dyeing_code`,
          `${fabricTableName}.code as fabric_code`,
          `${consigmentManufacturingTableName}.id as consigment_manufacturing_id`,
          `${consigmentManufacturingTableName}.number as consigment_manufacturing_number`,
          `${warehouseTableName}.id as warehouse_id`,
          `${warehouseTableName}.name as warehouse_name`,
          `${wcExecuteOrderRequisitionDetailsTableName}.quantity`,
          `${wcTableName}.current_quantity`
        ])
          .from(`${wcExecuteOrderRequisitionDetailsTableName}`)
          .innerJoin(`${wcExecuteOrderRequisitionTableName}`,
            `${wcExecuteOrderRequisitionTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.wc_execute_order_requisition_id`)
            .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wcExecuteOrderRequisitionTableName}.warehouse_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`)
            .innerJoin(`${consigmentManufacturingTableName}`,
            `${consigmentManufacturingTableName}.id`,
            `${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`)
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
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .groupBy(`fabric_id`, `consigment_manufacturing_id`, `warehouse_id`)
    .then(data => {
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}
