// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const constantsPayloads = require("../../../util/constants-payloads");
const wdTableName = require("../../../util/database-tables-name").wdTableName;
const { wdTransportWcWdDetailsTableName, fabricTableName, 
  wdReconciliationRequisitionDetailsWdTableName, wdReconciliationRequisitionDetailsTableName, 
  wdReconciliationRequisitionTableName, consigmentDyeingTableName, wbTransportWaWbTableName, 
  bussinessmanTableName, wdTransitionBetweenDyersRequisitionDetailsTableName, 
  wdTransitionBetweenDyersRequisitionTableName, 
  wdTransportWcWdTableName,
  wdFormDyeingRequisitionDetailsWdTableName,
  wdFormDyeingRequisitionDetailsTableName,
  wcFabricOrderRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (wd, items, trx = null) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTableName, {
      id: items.wdId,
      dyeing_id: items.dyeingId,
      wd_transport_wc_wd_details_id: items.wdTransportWcWdDetailsId,
      type: constantsPayloads.transportFromAToBType,
      current_quantity: items.quantity,
      creator_id: wd.personid,
      ip_address: wd.ipaddress,
    }, trx)
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForReconciliation = async (wd, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTableName, {
      id: wd.wdId,
      dyeing_id: wd.dyeingId,
      type: constantsPayloads.reconcilitionType,
      current_quantity: items.quantity,
      creator_id: wd.personid,
      ip_address: wd.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetween = async (wd, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTableName, {
      id: wd.wdId,
      dyeing_id: wd.toDyeingId,
      wd_transition_between_dyers_requisition_details_id: items.wdTransitionBetweenDyersRequisitionDetailsId,
      type: constantsPayloads.transportBetweenType,
      current_quantity: items.quantity,
      creator_id: wd.personid,
      ip_address: wd.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransport = async (wd, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wdTableName, {
      id: items.wdId,
      dyeing_id: items.dyeingId,
      wd_transport_wc_wd_details_id: items.wdTransportWcWdDetailsId,
      type: constantsPayloads.transportFromAToBType,
      current_quantity: items.quantity,
      creator_id: wd.personid,
      ip_address: wd.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (wd, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdTableName,
      wd,
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
    .limitedSelect(wdTableName, ["id", "type", "current_quantity"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd = async (whereCluseArray) => {
  let queryResults = [];

  await knex.sum(`current_quantity as current_quantity`)
    .from(function () {
      this.select([
        `${wdTableName}.current_quantity`,
      ])
        .from(`${wdTableName}`)
        .innerJoin(`${wdTransportWcWdDetailsTableName}`,
          `${wdTransportWcWdDetailsTableName}.id`,
          `${wdTableName}.wd_transport_wc_wd_details_id`)
        // .innerJoin(`${wbTransportWaWbDetailsWaTableName}`,
        //   `${wbTransportWaWbDetailsWaTableName}.wd_transport_wc_wd_details_id`,
        //   `${wdTransportWcWdDetailsTableName}.id`)
        .where(whereCluseArray[0])
        .as('t1')
        .union(function () {
          this.select([
            `${wdTableName}.current_quantity`,
          ])
            .from(`${wdTableName}`)
            .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
              `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
              `${wdTableName}.id`)
            .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
              `${wdReconciliationRequisitionDetailsTableName}.id`,
              `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
            .innerJoin(`${wdReconciliationRequisitionTableName}`,
              `${wdReconciliationRequisitionTableName}.id`,
              `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
            .where(whereCluseArray[1])
        })
        .union(function () {
          this.select([
            `${wdTableName}.current_quantity`,
          ])
            .from(`${wdTableName}`)
            .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
              `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
              `${wdTableName}.wd_transition_between_dyers_requisition_details_id`)
            .where(whereCluseArray[2])
        })
    }).as('temp')
    .then((data) => {
      // console.log("data :::: ", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectConsigmentDyeingQuantityByFabricByDyeingWd = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `id`,
    `number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${consigmentDyeingTableName}.id`,
      `${consigmentDyeingTableName}.number`,
      `${wdTableName}.current_quantity`,
    ])
      .from(`${wdTableName}`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTableName}.wd_transport_wc_wd_details_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.consigment_dyeing_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${consigmentDyeingTableName}.id`,
          `${consigmentDyeingTableName}.number`,
          `${wdTableName}.current_quantity`,
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
        // .groupBy(`fabric_id`)
      })
      .union(function () {
        this.select([
          `${consigmentDyeingTableName}.id`,
          `${consigmentDyeingTableName}.number`,
          `${wdTableName}.current_quantity`,
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
          .where(whereCluseArray[3])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
        // .groupBy(`fabric_id`)
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

exports.selectNotIncludedConsigmentDyeingQuantityByFabricByDyeingWd = async (whereCluseArray, includedYarnLots) => {
  let queryResults = [];
  let columns = [
    `id`,
    `number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${consigmentDyeingTableName}.id`,
      `${consigmentDyeingTableName}.number`,
      `${wdTableName}.current_quantity`,
    ])
      .from(`${wdTableName}`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTableName}.wd_transport_wc_wd_details_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.consigment_dyeing_id`)
      .as('t1')
      .unionAll(
        knex.select([
          `${consigmentDyeingTableName}.id`,
          `${consigmentDyeingTableName}.number`,
          `${wdTableName}.current_quantity`,
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
        // .groupBy(`fabric_id`)
      )
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .whereNotIn(`id`, includedYarnLots)
    .groupBy(`id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectRecordsByDyeingByFabricByConsigmentDyeing = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `id`,
    `current_quantity`,
    `quantity`,
    `date`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wdTableName}.id`,
      `${wdTableName}.current_quantity`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTransportWcWdTableName}.date`
    ])
      .from(`${wdTableName}`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTableName}.wd_transport_wc_wd_details_id`)
      .innerJoin(`${wdTransportWcWdTableName}`,
        `${wdTransportWcWdTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${wdTableName}.id`,
          `${wdTableName}.current_quantity`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdReconciliationRequisitionTableName}.date`
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${wdTableName}.id`,
          `${wdTableName}.current_quantity`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTransitionBetweenDyersRequisitionTableName}.date`
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`)
            .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`,
            `${wdTransitionBetweenDyersRequisitionTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
          .where(whereCluseArray[3])
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


exports.selectStoredDyeingAndFabricAndConsigmentDyeing = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `dyeing_id`,
    `dyeing_name`,
    `wc_fabric_order_requisition_id`,
    `wc_fabric_order_requisition_name`,
    `quantity`,
    `current_quantity`,
    `details_id`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${wdTransportWcWdDetailsTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id as details_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.parent_wc_fabric_order_requisition_id`)
      .innerJoin(`${wdTableName}`,
        `${wdTableName}.wd_transport_wc_wd_details_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wdTableName}.dyeing_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)

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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
          `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${wdReconciliationRequisitionDetailsTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id as details_id`)
          .innerJoin(`${wcFabricOrderRequisitionTableName}`,
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdReconciliationRequisitionTableName}.dyeing_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
          `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id as details_id`)
          .innerJoin(`${wcFabricOrderRequisitionTableName}`,
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`,
            `${wdTransitionBetweenDyersRequisitionTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
          .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transition_between_dyers_requisition_details_id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdTableName}.dyeing_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
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
    .groupBy(
      `fabric_id`, 
      `consigment_dyeing_id`, 
      `dyeing_id`,
      `wc_fabric_order_requisition_id`
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
exports.selectStoredDyeingAndFabricAndConsigmentDyeingForm = async (whereCluseArray) => {
  let queryResults = []
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `dyeing_id`,
    `dyeing_name`,
    `wc_fabric_order_requisition_id`,
    `wc_fabric_order_requisition_name`,
    `quantity`,
    `current_quantity`,
    `details_id`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${bussinessmanTableName}.id as dyeing_id`,
      `${bussinessmanTableName}.name as dyeing_name`,
      `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      `${wdTransportWcWdDetailsTableName}.quantity`,
      `${wdTableName}.current_quantity`
    ])
      .from(`${wdTransportWcWdDetailsTableName}`)
      .distinct(`${wdTransportWcWdDetailsTableName}.id as details_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id`)
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
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)

      .where(whereCluseArray[0])
      .andWhere((qb) => {
        qb.where(`${wdTableName}.current_quantity`, "=", "0")
          qb.where(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity`, ">", "0")
      })
      // .groupBy(`${waAddRequisitionDetailsTableName}.fabric_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
          `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
          `${wdReconciliationRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${wdReconciliationRequisitionDetailsTableName}`)
          .distinct(`${wdReconciliationRequisitionDetailsTableName}.id as details_id`)
          .innerJoin(`${wcFabricOrderRequisitionTableName}`,
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdReconciliationRequisitionTableName}.dyeing_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
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
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${bussinessmanTableName}.id as dyeing_id`,
          `${bussinessmanTableName}.name as dyeing_name`,
          `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
          `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity`,
          `${wdTableName}.current_quantity`
        ])
          .from(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`)
          .distinct(`${wdTransitionBetweenDyersRequisitionDetailsTableName}.id as details_id`)
          .innerJoin(`${wcFabricOrderRequisitionTableName}`,
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
          .innerJoin(`${wdTransitionBetweenDyersRequisitionTableName}`,
            `${wdTransitionBetweenDyersRequisitionTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id`)
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
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
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
    .groupBy(
      `fabric_id`, 
      `consigment_dyeing_id`, 
      `dyeing_id`,
      `wc_fabric_order_requisition_id`
    )
    .then(data => {
      // console.log("data ::::::: ", data);
      queryResults = data
    })
    .catch(error => {
      console.log("error :::: ", error);
      queryResults = constants.errorPayload
    })
  return queryResults
}

exports.selectQuantityByDyeingWd = async (whereCluseArray, groupBy) => {
  let queryResults = [];
  let columns = [
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `fabric_dyeing_code`,
    `dyed_fabric_id`,
    `dyed_fabric_name`,
    `dyed_fabric_code`,
    `consigment_dyeing_id`,
    `consigment_dyeing_number`,
    `dyeing_id`,
    `wc_fabric_order_requisition_id`,
    `wc_fabric_order_requisition_name`,
    `orders_requisitions_id`,
    `parent_orders_requisitions_id`,
    `parent_wc_fabric_order_requisition_id`,
    `wd_id`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `dyed_fabric.id as dyed_fabric_id`,
      `dyed_fabric.name as dyed_fabric_name`,
      `dyed_fabric.code as dyed_fabric_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${wdTableName}.dyeing_id`,
      `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id`,
      `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
      `${wdTableName}.id as wd_id`,
      `${wdTableName}.current_quantity`,
    ])
      .from(`${wdTableName}`)
      .innerJoin(`${wdTransportWcWdDetailsTableName}`,
        `${wdTransportWcWdDetailsTableName}.id`,
        `${wdTableName}.wd_transport_wc_wd_details_id`)
      .innerJoin(`${wcFabricOrderRequisitionTableName}`,
        `${wcFabricOrderRequisitionTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.parent_wc_fabric_order_requisition_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wdTransportWcWdDetailsTableName}.fabric_id`)
      .leftOuterJoin(`${fabricTableName} as dyed_fabric`,
        `dyed_fabric.fabric_id`,
        `${fabricTableName}.id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.consigment_dyeing_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
          `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
          `dyed_fabric.id as dyed_fabric_id`,
      `dyed_fabric.name as dyed_fabric_name`,
      `dyed_fabric.code as dyed_fabric_code`,
          `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
          `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
          `${wdTableName}.dyeing_id`,
          `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
          `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
          `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
          `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id`,
      `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
      `${wdTableName}.id as wd_id`,
          `${wdTableName}.current_quantity`,
        ])
          .from(`${wdTableName}`)
          .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
            `${wdTableName}.id`)
          .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
            `${wdReconciliationRequisitionDetailsTableName}.id`,
            `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
            .innerJoin(`${wcFabricOrderRequisitionTableName}`,
              `${wcFabricOrderRequisitionTableName}.id`,
              `${wdReconciliationRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
          .innerJoin(`${wdReconciliationRequisitionTableName}`,
            `${wdReconciliationRequisitionTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
          .innerJoin(`${consigmentDyeingTableName}`,
            `${consigmentDyeingTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
          .leftOuterJoin(`${fabricTableName} as dyed_fabric`,
            `dyed_fabric.fabric_id`,
            `${fabricTableName}.id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
        // .groupBy(`fabric_id`)
  }) 
  .union(function () {
    this.select([
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
      `dyed_fabric.id as dyed_fabric_id`,
      `dyed_fabric.name as dyed_fabric_name`,
      `dyed_fabric.code as dyed_fabric_code`,
      `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
      `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
      `${wdTableName}.dyeing_id`,
      `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
      `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
      `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
      `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id`,
      `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
      `${wdTableName}.id as wd_id`,
      `${wdTableName}.current_quantity`,
    ])
      .from(`${wdTableName}`)
      .innerJoin(`${wdTransitionBetweenDyersRequisitionDetailsTableName}`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.id`,
        `${wdTableName}.wd_transition_between_dyers_requisition_details_id`)
        .innerJoin(`${wcFabricOrderRequisitionTableName}`,
          `${wcFabricOrderRequisitionTableName}.id`,
          `${wdTransitionBetweenDyersRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
      .innerJoin(`${consigmentDyeingTableName}`,
        `${consigmentDyeingTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`)
      .leftOuterJoin(`${fabricTableName} as dyed_fabric`,
            `dyed_fabric.fabric_id`,
            `${fabricTableName}.id`)
      .where(whereCluseArray[3])
    // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
    // .groupBy(`fabric_id`)
})
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(groupBy)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

// exports.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb = async (whereCluseArray, includedYarns, includedYarnLots) => {
//   let queryResults = [];
//   let columns = [
//     `fabric_id`,
//     `fabric_name`,
//     `fabric_code`,
//     `consigment_dyeing_id`,
//     `consigment_dyeing_number`,
//     `current_quantity`
//   ]
//   await knex.select(columns).from(function () {
//     this.select([
//       `${fabricTableName}.id as fabric_id`,
//       `${fabricTableName}.name as fabric_name`,
//       `${fabricTableName}.code as fabric_code`,
// `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
//       `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
//       `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
//       `${wdTableName}.current_quantity`,
//     ])
//       .from(`${wdTableName}`)
//       .innerJoin(`${wdTransportWcWdDetailsTableName}`,
//         `${wdTransportWcWdDetailsTableName}.id`,
//         `${wdTableName}.wd_transport_wc_wd_details_id`)
//       .innerJoin(`${consigmentDyeingTableName}`,
//         `${consigmentDyeingTableName}.id`,
//         `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
//       .innerJoin(`${fabricTableName}`,
//         `${fabricTableName}.id`,
//         `${wdTransportWcWdDetailsTableName}.fabric_id`)
//       .where(whereCluseArray[0])
//       // .groupBy(`${waAddRequisitionDetailsTableName}.consigment_dyeing_id`)
//       .as('t1')
//       .unionAll(
//         knex.select([
//           `${fabricTableName}.id as fabric_id`,
//           `${fabricTableName}.name as fabric_name`,
//           `${fabricTableName}.code as fabric_code`,
// `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
//           `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
//           `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
//           `${wdTableName}.current_quantity`,
//         ])
//           .from(`${wdTableName}`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
//             `${wdTableName}.id`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
//             `${wdReconciliationRequisitionDetailsTableName}.id`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
//           .innerJoin(`${wdReconciliationRequisitionTableName}`,
//             `${wdReconciliationRequisitionTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
//           .innerJoin(`${consigmentDyeingTableName}`,
//             `${consigmentDyeingTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
//           .innerJoin(`${fabricTableName}`,
//             `${fabricTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
//           .where(whereCluseArray[1])
//         // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
//         // .groupBy(`fabric_id`)
//       )
//   }).as('temp')
//     .sum(`current_quantity as current_quantity`)
//     .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//     .whereNotIn('fabric_id', includedYarns)
//     .whereNotIn('consigment_dyeing_id', includedYarnLots)
//     .groupBy(`fabric_id`, `consigment_dyeing_id`)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };


// exports.selectQuantityandFabricToBeManufacturedByIndustryWb = async (whereCluseArray) => {
//   let queryResults = [];
//   let columns = [
//     `wd_id`,
//     `fabric_id`,
//     `fabric_name`,
//     `fabric_code`,
//     `consigment_dyeing_id`,
//     `consigment_dyeing_number`,
//     `fabric_id`,
//     `fabric_name`,
//     `fabric_code`,
//     `current_quantity`
//   ]
//   await knex.select(columns).from(function () {
//     this.select([
//       `${wdTableName}.id as wd_id`,
//       `${fabricTableName}.id as fabric_id`,
//       `${fabricTableName}.name as fabric_name`,
//       `${fabricTableName}.code as fabric_code`,
// `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
//       `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
//       `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
//       `${wdTableName}.current_quantity`,
//       `${fabricTableName}.id as fabric_id`,
//       `${fabricTableName}.name as fabric_name`,
//       `${fabricTableName}.code as fabric_code`,
//     ])
//       .from(`${wdTableName}`)
//       .innerJoin(`${wdTransportWcWdDetailsTableName}`,
//         `${wdTransportWcWdDetailsTableName}.id`,
//         `${wdTableName}.wd_transport_wc_wd_details_id`)
//       .innerJoin(`${consigmentDyeingTableName}`,
//         `${consigmentDyeingTableName}.id`,
//         `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`)
//       .innerJoin(`${fabricTableName}`,
//         `${fabricTableName}.id`,
//         `${wdTransportWcWdDetailsTableName}.fabric_id`)
//       .innerJoin(`${fabricTableName}`,
//         `${fabricTableName}.id`,
//         `${wdTableName}.fabric_to_be_manufactured_id`)
//       .where(whereCluseArray[0])
//       // .groupBy(`${waAddRequisitionDetailsTableName}.consigment_dyeing_id`)
//       .as('t1')
//       .unionAll(
//         knex.select([
//           `${wdTableName}.id as wd_id`,
//           `${fabricTableName}.id as fabric_id`,
//           `${fabricTableName}.name as fabric_name`,
//           `${fabricTableName}.code as fabric_code`,
// `${fabricTableName}.dyeing_code as fabric_dyeing_code`,
//           `${consigmentDyeingTableName}.id as consigment_dyeing_id`,
//           `${consigmentDyeingTableName}.number as consigment_dyeing_number`,
//           `${wdTableName}.current_quantity`,
//           `${fabricTableName}.id as fabric_id`,
//           `${fabricTableName}.name as fabric_name`,
//           `${fabricTableName}.code as fabric_code`,
//         ])
//           .from(`${wdTableName}`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
//             `${wdTableName}.id`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
//             `${wdReconciliationRequisitionDetailsTableName}.id`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
//           .innerJoin(`${wdReconciliationRequisitionTableName}`,
//             `${wdReconciliationRequisitionTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
//           .innerJoin(`${consigmentDyeingTableName}`,
//             `${consigmentDyeingTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
//           .innerJoin(`${fabricTableName}`,
//             `${fabricTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.fabric_id`)
//           .innerJoin(`${fabricTableName}`,
//             `${fabricTableName}.id`,
//             `${wdTableName}.fabric_to_be_manufactured_id`)
//           .where(whereCluseArray[1])
//         // .groupBy(`${waReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`)
//         // .groupBy(`fabric_id`)
//       )
//   }).as('temp')
//     .sum(`current_quantity as current_quantity`)
//     .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//     .groupBy(`fabric_id`, `consigment_dyeing_id`, `fabric_id`)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

// exports.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured = async (whereCluseArray, orderByCluse) => {
//   let queryResults = [];
//   let columns = [
//     `wd_id`,
//     `current_quantity`,
//     `fabric_to_be_manufactured_id`,
//     `requisition_details_id`,
//     `fabric_id`,
//     `consigment_dyeing_id`,
//     `price`,
//     `quantity`,
//     `id`,
//     `date`,
//     `warehouseId`,
//     `requisition_type`,
//   ]
//   await knex.select(columns).from(function () {
//     this.select([
//       `${wdTableName}.id as wd_id`,
//       `${wdTableName}.current_quantity`,
//       `${wdTableName}.fabric_to_be_manufactured_id`,
//       `${wdTransportWcWdDetailsTableName}.id as requisition_details_id`,
//       `${wdTransportWcWdDetailsTableName}.fabric_id`,
//       `${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`,
//       `${wdTransportWcWdDetailsTableName}.price`,
//       `${wdTransportWcWdDetailsTableName}.quantity`,
//       `${wbTransportWaWbTableName}.id`,
//       `${wbTransportWaWbTableName}.date`,
//       `${wbTransportWaWbTableName}.warehouse_id as warehouseId`,
//       `${wdTableName}.type as requisition_type`,
//     ])
//       .from(`${wdTableName}`)
//       .innerJoin(`${wdTransportWcWdDetailsTableName}`,
//         `${wdTransportWcWdDetailsTableName}.id`,
//         `${wdTableName}.wd_transport_wc_wd_details_id`)
//       .innerJoin(`${wbTransportWaWbTableName}`,
//         `${wbTransportWaWbTableName}.id`,
//         `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`)
//       .where(whereCluseArray[0]).as('t1')
//       .union(function () {
//         this.select([
//           `${wdTableName}.id as wd_id`,
//           `${wdTableName}.current_quantity`,
//           `${wdTableName}.fabric_to_be_manufactured_id`,
//           `${wdReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
//           `${wdReconciliationRequisitionDetailsTableName}.fabric_id`,
//           `${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`,
//           `${wdReconciliationRequisitionDetailsTableName}.price`,
//           `${wdReconciliationRequisitionDetailsTableName}.quantity`,
//           `${wdReconciliationRequisitionTableName}.id`,
//           `${wdReconciliationRequisitionTableName}.date`,
//           knex.raw('? as warehouseId', ''),
//           `${wdTableName}.type as requisition_type`,
//         ])
//           .from(`${wdTableName}`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsWdTableName}`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_id`,
//             `${wdTableName}.id`)
//           .innerJoin(`${wdReconciliationRequisitionDetailsTableName}`,
//             `${wdReconciliationRequisitionDetailsTableName}.id`,
//             `${wdReconciliationRequisitionDetailsWdTableName}.wd_reconcilition_requisition_details_id`)
//           .innerJoin(`${wdReconciliationRequisitionTableName}`,
//             `${wdReconciliationRequisitionTableName}.id`,
//             `${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id`)
//           .where(whereCluseArray[1])
//       })
//   }).as('temp')
//     .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//     .orderBy(`${orderByCluse.attributeName}`, `${orderByCluse.value}`)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };