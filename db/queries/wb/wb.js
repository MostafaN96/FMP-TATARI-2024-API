// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constantsPayloads = require("../../../util/constants-payloads");
const wbTableName = require("../../../util/database-tables-name").wbTableName;
const { wbTransportWaWbDetailsTableName, wbTransportWaWbDetailsWaTableName, yarnTableName, wbReconciliationRequisitionDetailsWbTableName, wbReconciliationRequisitionDetailsTableName, wbReconciliationRequisitionTableName, yarnLotTableName, wbTransportWaWbTableName, bussinessmanTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionTableName, fabricTableName, consigmentYarnTableName, waAddRequisitionDetailsPurchaseOrderTableName, waYarnOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTableName, {
      id: items.wbId,
      industry_id: items.industryId,
      fabric_to_be_manufactured_id: items.fabricToBeManufacturedId,
      wb_transport_wa_wb_details_id: items.wbTransportWaWbDetailsId,
      type: constantsPayloads.transportFromAToBType,
      current_quantity: items.quantity,
      creator_id: wb.personid,
      ip_address: wb.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForReconciliation = async (wb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTableName, {
      id: wb.wbId,
      industry_id: wb.industryId,
      fabric_to_be_manufactured_id: items.fabricToBeManufacturedId,
      type: constantsPayloads.reconcilitionType,
      current_quantity: items.quantity,
      creator_id: wb.personid,
      ip_address: wb.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetween = async (wb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTableName, {
      id: wb.wbId,
      industry_id: wb.toIndustryId,
      fabric_to_be_manufactured_id: items.fabricToBeManufacturedId,
      wb_transition_between_industries_requisition_details_id: items.wbTransitionBetweenIndustriesRequisitionDetailsId,
      type: constantsPayloads.transportBetweenType,
      current_quantity: items.quantity,
      creator_id: wb.personid,
      ip_address: wb.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransport = async (wb, items) => {
  let queryResults = false;
  await sqlFun
    .insert(wbTableName, {
      id: items.wbId,
      industry_id: items.industryId,
      fabric_to_be_manufactured_id: items.fabricToBeManufacturedId,
      wb_transport_wa_wb_details_id: items.wbTransportWaWbDetailsId,
      type: constantsPayloads.transportFromAToBType,
      current_quantity: items.quantity,
      creator_id: wb.personid,
      ip_address: wb.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (wb, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wbTableName,
      wb,
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
    .limitedSelect(wbTableName, ["id", "fabric_to_be_manufactured_id", "type", "current_quantity"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

// exports.selectByLot = async (whereCluse) => {
//   let queryResults = [];

//   await knex.select([
//     `${wbTableName}.id`,
//     `${wbTableName}.lot_form_id`,

//   ])
//     .from(`${wbTableName}`)
//     .innerJoin(`${wbTransportWaWbDetailsTableName}`,
//       `${wbTransportWaWbDetailsTableName}.id`,
//       `${wbTableName}.wb_transport_wa_wb_requisition_details_id`)
//       .innerJoin(`${lotFormTableName}`,
//       `${lotFormTableName}.id`,
//       `${wbTransportWaWbDetailsTableName}.lot_form_id`)
//     .where(whereCluse)
//     .andWhere(`${wbTableName}.current_quantity`, ">", "0")
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

// exports.checkValidCottonByLot = async (whereCluseArray) => {
//   let queryResults = [];
//   let columns = [
//     `material_id`,
//     `material_name`,
//     `current_quantity`, 
//     `sum_current_quantity`
//   ]
//   await knex.select(columns)
//   .sum(`current_quantity as sum_current_quantity`)
//   .from(function () {
//     this.select([
//       `${yarnTableName}.id as material_id`,
//       `${yarnTableName}.name as material_name`,
//       `${wbTableName}.current_quantity`,
//       knex.raw('? as sum_current_quantity', 0),
//     ])
//     .from(`${wbTableName}`)
//     .innerJoin(`${wbTransportWaWbDetailsTableName}`,
//       `${wbTransportWaWbDetailsTableName}.id`,
//       `${wbTableName}.wb_transport_wa_wb_requisition_details_id`)
//       .innerJoin(`${wbTransportWaWbDetailsWaTableName}`,
//       `${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_requisition_details_id`,
//       `${wbTransportWaWbDetailsTableName}.id`)
//       .innerJoin(`${lotFormTableName}`,
//       `${lotFormTableName}.id`,
//       `${wbTransportWaWbDetailsWaTableName}.lot_form_id`)
//       .innerJoin(`${yarnTableName}`,
//       `${yarnTableName}.id`,
//       `${lotFormTableName}.cotton_id`)
//       .where(whereCluseArray[0])
//       .as('t1')
//       .union(function () {
//         this.select([
//           `${yarnTableName}.id as material_id`,
//           `${yarnTableName}.name as material_name`,
//           `${wbTableName}.current_quantity`,
//           knex.raw('? as sum_current_quantity', 0),
//         ])
//           .from(`${wbTableName}`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
//             `${wbTableName}.id`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
//             `${wbReconciliationRequisitionDetailsTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconciliation_requisition_details_id`)
//             .innerJoin(`${wbReconciliationRequisitionTableName}`,
//             `${wbReconciliationRequisitionTableName}.id`,
//             `${wbReconciliationRequisitionDetailsTableName}.wb_reconciliation_requisition_id`)
//             .innerJoin(`${lotFormTableName}`,
//             `${lotFormTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.lot_form_id`)
//             .innerJoin(`${yarnTableName}`,
//             `${yarnTableName}.id`,
//             `${lotFormTableName}.cotton_id`)
//           .where(whereCluseArray[1])
//       })
//   }).as('temp')
//   .groupBy(`material_id`)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

// exports.checkValidCottonWasteByLot = async (whereCluseArray) => {
//   let queryResults = [];
//   let columns = [
//     `material_id`,
//     `material_name`,
//     `current_quantity`, 
//     `sum_current_quantity`
//   ]
//   await knex.select(columns)
//   .sum(`current_quantity as sum_current_quantity`)
//   .from(function () {
//     this.select([
//       `${cottonWasteTableName}.id as material_id`,
//       `${cottonWasteTableName}.name as material_name`,
//       `${wbTableName}.current_quantity`,
//       knex.raw('? as sum_current_quantity', 0),
//     ])
//     .from(`${wbTableName}`)
//     .innerJoin(`${wbTransportWaWbDetailsTableName}`,
//       `${wbTransportWaWbDetailsTableName}.id`,
//       `${wbTableName}.wb_transport_wa_wb_requisition_details_id`)
//       .innerJoin(`${wbTransportWaWbDetailsWaCottonWasteTableName}`,
//       `${wbTransportWaWbDetailsWaCottonWasteTableName}.wb_transport_wa_wb_requisition_details_id`,
//       `${wbTransportWaWbDetailsTableName}.id`)
//       .innerJoin(`${lotFormTableName}`,
//       `${lotFormTableName}.id`,
//       `${wbTransportWaWbDetailsWaCottonWasteTableName}.lot_form_id`)
//       .innerJoin(`${cottonWasteTableName}`,
//       `${cottonWasteTableName}.id`,
//       `${lotFormTableName}.cotton_waste_id`)
//       .where(whereCluseArray[0])
//       .as('t1')
//       .union(function () {
//         this.select([
//           `${cottonWasteTableName}.id as material_id`,
//           `${cottonWasteTableName}.name as material_name`,
//           `${wbTableName}.current_quantity`,
//           knex.raw('? as sum_current_quantity', 0),
//         ])
//           .from(`${wbTableName}`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
//             `${wbTableName}.id`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
//             `${wbReconciliationRequisitionDetailsTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconciliation_requisition_details_id`)
//             .innerJoin(`${wbReconciliationRequisitionTableName}`,
//             `${wbReconciliationRequisitionTableName}.id`,
//             `${wbReconciliationRequisitionDetailsTableName}.wb_reconciliation_requisition_id`)
//             .innerJoin(`${lotFormTableName}`,
//             `${lotFormTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.lot_form_id`)
//             .innerJoin(`${cottonWasteTableName}`,
//             `${cottonWasteTableName}.id`,
//             `${lotFormTableName}.cotton_waste_id`)
//           .where(whereCluseArray[1])
//       })
//   }).as('temp')
//   .groupBy(`material_id`)
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

// exports.selectCottonsByLotForProductionStatement = async (whereCluseArray) => {
//   let queryResults = [];
//   let columns = [
//     `material_name`,
//     `current_quantity`, 
//     `wb_id`,
//     `lot_form_id`,
//     knex.raw('? as material_type', 'قطن'),
//     `material_id`,
//   ]
//   await knex.select(columns)
//   .from(function () {
//     this.select([
//       `${yarnTableName}.name as material_name`,
//       `${wbTableName}.current_quantity`,
//       `${wbTableName}.id as wb_id`,
//       `${wbTableName}.lot_form_id`,
//       knex.raw('? as material_type', 'قطن'),
//     ])
//     .from(`${wbTableName}`)
//     .innerJoin(`${wbTransportWaWbDetailsTableName}`,
//       `${wbTransportWaWbDetailsTableName}.id`,
//       `${wbTableName}.wb_transport_wa_wb_requisition_details_id`)
//       .innerJoin(`${wbTransportWaWbDetailsWaTableName}`,
//       `${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_requisition_details_id`,
//       `${wbTransportWaWbDetailsTableName}.id`)
//       .innerJoin(`${lotFormTableName}`,
//       `${lotFormTableName}.id`,
//       `${wbTransportWaWbDetailsWaTableName}.lot_form_id`)
//       .innerJoin(`${yarnTableName}`,
//       `${yarnTableName}.id`,
//       `${lotFormTableName}.cotton_id`)
//       .where(whereCluseArray[0])
//       .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//       .distinct(`${yarnTableName}.id as material_id`)
//       .as('t1')
//       .union(function () {
//         this.select([
//           `${yarnTableName}.name as material_name`,
//           `${wbTableName}.current_quantity`,
//           `${wbTableName}.id as wb_id`,
//           `${wbTableName}.lot_form_id`,
//           knex.raw('? as material_type', 'قطن'),
//         ])
//           .from(`${wbTableName}`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
//             `${wbTableName}.id`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
//             `${wbReconciliationRequisitionDetailsTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconciliation_requisition_details_id`)
//             .innerJoin(`${wbReconciliationRequisitionTableName}`,
//             `${wbReconciliationRequisitionTableName}.id`,
//             `${wbReconciliationRequisitionDetailsTableName}.wb_reconciliation_requisition_id`)
//             .innerJoin(`${lotFormTableName}`,
//             `${lotFormTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.lot_form_id`)
//             .innerJoin(`${yarnTableName}`,
//             `${yarnTableName}.id`,
//             `${lotFormTableName}.cotton_id`)
//           .where(whereCluseArray[1])
//           .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//           .distinct(`${yarnTableName}.id as material_id`)
//       })
//   }).as('temp')
//   .groupBy("material_id")
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };

// exports.selectCottonsWasteByLotForProductionStatement = async (whereCluseArray) => {
//   let queryResults = [];
//   let columns = [
//     `material_id`,
//     `material_name`,
//     `current_quantity`, 
//     `wb_id`,
//     `lot_form_id`,
//     knex.raw('? as material_type', 'عوادم قطن'),
//   ]
//   await knex.select(columns)
//   .from(function () {
//     this.select([
//       `${cottonWasteTableName}.name as material_name`,
//       `${wbTableName}.current_quantity`,
//       `${wbTableName}.id as wb_id`,
//       `${wbTableName}.lot_form_id`,
//       knex.raw('? as material_type', 'عوادم قطن'),
//     ])
//     .from(`${wbTableName}`)
//     .innerJoin(`${wbTransportWaWbDetailsTableName}`,
//       `${wbTransportWaWbDetailsTableName}.id`,
//       `${wbTableName}.wb_transport_wa_wb_requisition_details_id`)
//       .innerJoin(`${wbTransportWaWbDetailsWaCottonWasteTableName}`,
//       `${wbTransportWaWbDetailsWaCottonWasteTableName}.wb_transport_wa_wb_requisition_details_id`,
//       `${wbTransportWaWbDetailsTableName}.id`)
//       .innerJoin(`${lotFormTableName}`,
//       `${lotFormTableName}.id`,
//       `${wbTransportWaWbDetailsWaCottonWasteTableName}.lot_form_id`)
//       .innerJoin(`${cottonWasteTableName}`,
//       `${cottonWasteTableName}.id`,
//       `${lotFormTableName}.cotton_waste_id`)
//       .where(whereCluseArray[0])
//       .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//       .distinct(`${cottonWasteTableName}.id as material_id`)
//       .as('t1')
//       .union(function () {
//         this.select([
//           `${cottonWasteTableName}.name as material_name`,
//           `${wbTableName}.current_quantity`,
//           `${wbTableName}.id as wb_id`,
//           `${wbTableName}.lot_form_id`,
//           knex.raw('? as material_type', 'عوادم قطن'),
//         ])
//           .from(`${wbTableName}`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
//             `${wbTableName}.id`)
//           .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
//             `${wbReconciliationRequisitionDetailsTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconciliation_requisition_details_id`)
//             .innerJoin(`${wbReconciliationRequisitionTableName}`,
//             `${wbReconciliationRequisitionTableName}.id`,
//             `${wbReconciliationRequisitionDetailsTableName}.wb_reconciliation_requisition_id`)
//             .innerJoin(`${lotFormTableName}`,
//             `${lotFormTableName}.id`,
//             `${wbReconciliationRequisitionDetailsWbTableName}.lot_form_id`)
//             .innerJoin(`${cottonWasteTableName}`,
//             `${cottonWasteTableName}.id`,
//             `${lotFormTableName}.cotton_waste_id`)
//           .where(whereCluseArray[1])
//           .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
//           .distinct(`${cottonWasteTableName}.id as material_id`)
//         })
//   }).as('temp')
//   .groupBy("material_id")
//     .then((data) => {
//       queryResults = data;
//     })
//     .catch((error) => console.error(error));
//   return queryResults;
// };


exports.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb = async (whereCluseArray) => {
  let queryResults = [];

  await knex.sum(`current_quantity as current_quantity`)
    .from(function () {
      this.select([
        `${wbTableName}.current_quantity`,
      ])
        .from(`${wbTableName}`)
        .innerJoin(`${wbTransportWaWbDetailsTableName}`,
          `${wbTransportWaWbDetailsTableName}.id`,
          `${wbTableName}.wb_transport_wa_wb_details_id`)
        // .innerJoin(`${wbTransportWaWbDetailsWaTableName}`,
        //   `${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`,
        //   `${wbTransportWaWbDetailsTableName}.id`)
        .where(whereCluseArray[0])
        .as('t1')
        .union(function () {
          this.select([
            `${wbTableName}.current_quantity`,
          ])
            .from(`${wbTableName}`)
            .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
              `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
              `${wbTableName}.id`)
            .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
              `${wbReconciliationRequisitionDetailsTableName}.id`,
              `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
            .innerJoin(`${wbReconciliationRequisitionTableName}`,
              `${wbReconciliationRequisitionTableName}.id`,
              `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
            .where(whereCluseArray[1])
        })
        .union(function () {
          this.select([
            `${wbTableName}.current_quantity`,
          ])
            .from(`${wbTableName}`)
            .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
              `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
              `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
            .where(whereCluseArray[2])
        })
    }).as('temp')
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectConsigmentYarnQuantityByYarnByIndustryByLotWb = async (whereCluseArray) => {
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
      `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .unionAll(
        knex.select([
          `${consigmentYarnTableName}.id`,
          `${consigmentYarnTableName}.number`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        // .groupBy(`yarn_id`)
      )
      .unionAll(
        knex.select([
          `${consigmentYarnTableName}.id`,
          `${consigmentYarnTableName}.number`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[3])
      )
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

exports.selectNotIncludedYarnLotQuantityByYarnByIndustryWb = async (whereCluseArray, includedYarnLots) => {
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
      .unionAll(
        knex.select([
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
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        // .groupBy(`yarn_id`)
      )
      .unionAll(
        knex.select([
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

exports.selectRecordsByIndustryByYarnByYarnLot = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `id`,
    `current_quantity`,
    `quantity`,
    `date`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wbTableName}.id`,
      `${wbTableName}.current_quantity`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTransportWaWbTableName}.date`
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${wbTransportWaWbTableName}`,
        `${wbTransportWaWbTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${wbTableName}.id`,
          `${wbTableName}.current_quantity`,
          `${wbReconciliationRequisitionDetailsTableName}.quantity`,
          `${wbReconciliationRequisitionTableName}.date`
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${wbTableName}.id`,
          `${wbTableName}.current_quantity`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
          `${wbTransitionBetweenIndustriesRequisitionTableName}.date`
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
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


exports.selectStoredIndustryAndYarnAndYarnLot = async (whereCluseArray, isGreaterThanZero = 1) => {
  let queryResults = []
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `manufacturer_id`,
    `manufacturer_name`,
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
      `${bussinessmanTableName}.id as manufacturer_id`,
      `${bussinessmanTableName}.name as manufacturer_name`,
      `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTableName}.current_quantity`
    ])
      .from(`${wbTransportWaWbDetailsTableName}`)
      .innerJoin(`${waYarnOrderRequisitionTableName}`,
        `${waYarnOrderRequisitionTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
      .distinct(`${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${wbTableName}`,
        `${wbTableName}.wb_transport_wa_wb_details_id`,
        `${wbTransportWaWbDetailsTableName}.id`)
      .innerJoin(`${bussinessmanTableName}`,
        `${bussinessmanTableName}.id`,
        `${wbTableName}.industry_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
        .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)

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
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${wbReconciliationRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${wbReconciliationRequisitionDetailsTableName}`)
          .distinct(`${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${waYarnOrderRequisitionTableName}`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbReconciliationRequisitionTableName}.industry_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`,
            `${wbReconciliationRequisitionDetailsTableName}.id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`)
            .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
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
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${bussinessmanTableName}.id as manufacturer_id`,
          `${bussinessmanTableName}.name as manufacturer_name`,
          `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
          `${wbTableName}.current_quantity`
        ])
          .from(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`)
          .distinct(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${waYarnOrderRequisitionTableName}`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
          .innerJoin(`${wbTableName}`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`)
          .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbTableName}.industry_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
            .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
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
    .groupBy(
      `yarn_id`, 
      `yarn_lot_id`, 
      `consigment_yarn_id`, 
      `manufacturer_id`,
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

exports.selectQuantityByIndustryWb = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `wa_yarn_order_requisition_details_id`,
    `date`,
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_details_id`,
      `${wbTransportWaWbTableName}.date`,
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
        .innerJoin(`${wbTransportWaWbTableName}`,
        `${wbTransportWaWbTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
        .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`,
          `${wbReconciliationRequisitionTableName}.date`,
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
            .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        // .groupBy(`yarn_id`)
  })
      .union(function () {
        this.select([
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_details_id`,
          `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
            .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[3])
  })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`yarn_id`, `yarn_lot_id`, `consigment_yarn_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb = async (whereCluseArray, includedYarns, includedYarnLots, includedConsigmentYarn) => {
  let queryResults = [];
  console.log("includedYarns:::: ", includedYarns);
  console.log("includedYarnLots:::: ", includedYarnLots);
  console.log("includedConsigmentYarn:::: ", includedConsigmentYarn);
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
        .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          `${wbTableName}.current_quantity`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
            .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
        })
.union(function () {
  this.select([
            `${yarnTableName}.id as yarn_id`,
            `${yarnTableName}.name as yarn_name`,
            `${yarnTableName}.code as yarn_code`,
            `${yarnLotTableName}.id as yarn_lot_id`,
            `${yarnLotTableName}.code as yarn_lot_code`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`,
            `${consigmentYarnTableName}.number as consigment_yarn_number`,
            `${wbTableName}.current_quantity`,
          ])
            .from(`${wbTableName}`)
            .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
            .innerJoin(`${yarnLotTableName}`,
              `${yarnLotTableName}.id`,
              `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
            .innerJoin(`${yarnTableName}`,
              `${yarnTableName}.id`,
              `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
              .innerJoin(`${consigmentYarnTableName}`,
            `${consigmentYarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
            .where(whereCluseArray[3])
            })
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    // .whereNotIn('yarn_id', includedYarns)
    .whereNotIn(('yarn_id', 'consigment_yarn_id', 'yarn_lot_id'), (includedYarns, includedConsigmentYarn, includedYarnLots))
    // .whereNotIn('yarn_lot_id', includedYarnLots)
    // .whereNotIn('consigment_yarn_id', includedConsigmentYarn)
    .andWhere(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(`yarn_id`, `yarn_lot_id`, `consigment_yarn_id`)
    .then((data) => {
      console.log("data ::::::: ", data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectQuantityandFabricToBeManufacturedByIndustryWb = async (whereCluseArray) => {
  let queryResults = [];
  let columns = [
    `requisition_type`,
    `wb_id`,
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `yarn_lot_id`,
    `yarn_lot_code`,
    `consigment_yarn_id`,
    `consigment_yarn_number`,
    `from_consigment_yarn_id`,
    `from_consigment_yarn_number`,
    `orders_requisitions_id`,
    `wa_yarn_order_requisition_id`,
    `wa_yarn_order_requisition_name`,
    `fabric_id`,
    `fabric_name`,
    `fabric_code`,
    `current_quantity`
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wbTableName}.type as requisition_type`,
      `${wbTableName}.id as wb_id`,
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${yarnLotTableName}.id as yarn_lot_id`,
      `${yarnLotTableName}.code as yarn_lot_code`,
      `${consigmentYarnTableName}.id as consigment_yarn_id`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
      `from_consigment_yarn.id as from_consigment_yarn_id`,
      `from_consigment_yarn.number as from_consigment_yarn_number`,
      `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
      `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
      `${fabricTableName}.id as fabric_id`,
      `${fabricTableName}.name as fabric_name`,
      `${fabricTableName}.code as fabric_code`,
      `${wbTableName}.current_quantity`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
        .innerJoin(`${waYarnOrderRequisitionTableName}`,
          `${waYarnOrderRequisitionTableName}.id`,
          `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
      .innerJoin(`${yarnLotTableName}`,
        `${yarnLotTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_lot_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
      .innerJoin(`${fabricTableName}`,
        `${fabricTableName}.id`,
        `${wbTableName}.fabric_to_be_manufactured_id`)
        .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
      .innerJoin(`${consigmentYarnTableName} as from_consigment_yarn`,
      `from_consigment_yarn.id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`)
      .where(whereCluseArray[0])
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .unionAll(
        knex.select([
          `${wbTableName}.type as requisition_type`,
          `${wbTableName}.id as wb_id`,
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          knex.raw('? as from_consigment_yarn_id', ''),
          knex.raw('? as from_consigment_yarn_number', ''),
          `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
      `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${wbTableName}.current_quantity`,
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
            .innerJoin(`${waYarnOrderRequisitionTableName}`,
              `${waYarnOrderRequisitionTableName}.id`,
              `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbTableName}.fabric_to_be_manufactured_id`)
            .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1]),
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        // .groupBy(`yarn_id`)
        knex.select([
          `${wbTableName}.type as requisition_type`,
          `${wbTableName}.id as wb_id`,
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${yarnLotTableName}.id as yarn_lot_id`,
          `${yarnLotTableName}.code as yarn_lot_code`,
          `${consigmentYarnTableName}.id as consigment_yarn_id`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
          knex.raw('? as from_consigment_yarn_id', ''),
          knex.raw('? as from_consigment_yarn_number', ''),
          `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
      `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
      `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
          `${wbTableName}.current_quantity`,
          `${fabricTableName}.id as fabric_id`,
          `${fabricTableName}.name as fabric_name`,
          `${fabricTableName}.code as fabric_code`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
        .innerJoin(`${waYarnOrderRequisitionTableName}`,
          `${waYarnOrderRequisitionTableName}.id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
          .innerJoin(`${yarnLotTableName}`,
            `${yarnLotTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
          .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbTableName}.fabric_to_be_manufactured_id`)
            .innerJoin(`${consigmentYarnTableName}`,
      `${consigmentYarnTableName}.id`,
      `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[3])
      )
  }).as('temp')
    .sum(`current_quantity as current_quantity`)
    .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
    .groupBy(
      `yarn_id`, 
      `yarn_lot_id`, 
      `fabric_id`, 
      `consigment_yarn_id`,
      `wa_yarn_order_requisition_id`
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured = async (whereCluseArray, orderByCluse) => {
  let queryResults = [];
  let columns = [
    `wb_id`,
    `current_quantity`,
    `fabric_to_be_manufactured_id`,
    `requisition_details_id`,
    `yarn_id`,
    `yarn_lot_id`,
    `consigment_yarn_id`,
    `price`,
    `price_dollar`,
    `quantity`,
    `id`,
    `date`,
    `warehouseId`,
    `requisition_type`,
    `consigment_yarn_number`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${wbTableName}.id as wb_id`,
      `${wbTableName}.current_quantity`,
      `${wbTableName}.fabric_to_be_manufactured_id`,
      `${wbTransportWaWbDetailsTableName}.id as requisition_details_id`,
      `${wbTransportWaWbDetailsTableName}.yarn_id`,
      `${wbTransportWaWbDetailsTableName}.yarn_lot_id`,
      `${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id as consigment_yarn_id`,
      `${wbTransportWaWbDetailsTableName}.price`,
      `${wbTransportWaWbDetailsTableName}.price_dollar`,
      `${wbTransportWaWbDetailsTableName}.quantity`,
      `${wbTransportWaWbTableName}.id`,
      `${wbTransportWaWbTableName}.date`,
      `${wbTransportWaWbTableName}.warehouse_id as warehouseId`,
      `${wbTableName}.type as requisition_type`,
      `${consigmentYarnTableName}.number as consigment_yarn_number`,
    ])
      .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${wbTransportWaWbTableName}`,
        `${wbTransportWaWbTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`)
        .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.consigment_yarn_id`)
      .where(whereCluseArray[0]).as('t1')
      .union(function () {
        this.select([
          `${wbTableName}.id as wb_id`,
          `${wbTableName}.current_quantity`,
          `${wbTableName}.fabric_to_be_manufactured_id`,
          `${wbReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wbReconciliationRequisitionDetailsTableName}.yarn_id`,
          `${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`,
          `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`,
          `${wbReconciliationRequisitionDetailsTableName}.price`,
          `${wbReconciliationRequisitionDetailsTableName}.price_dollar`,
          `${wbReconciliationRequisitionDetailsTableName}.quantity`,
          `${wbReconciliationRequisitionTableName}.id`,
          `${wbReconciliationRequisitionTableName}.date`,
          knex.raw('? as warehouseId', ''),
          `${wbTableName}.type as requisition_type`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
            .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`)
          .where(whereCluseArray[1])
      })
      .union(function () {
        this.select([
          `${wbTableName}.id as wb_id`,
          `${wbTableName}.current_quantity`,
          `${wbTableName}.fabric_to_be_manufactured_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id as requisition_details_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.price_dollar`,
          `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.quantity`,
          `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
          `${wbTransitionBetweenIndustriesRequisitionTableName}.date`,
          knex.raw('? as warehouseId', ''),
          `${wbTableName}.type as requisition_type`,
          `${consigmentYarnTableName}.number as consigment_yarn_number`,
        ])
          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
            .innerJoin(`${consigmentYarnTableName}`,
        `${consigmentYarnTableName}.id`,
        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`)
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

exports.selectQuantityByWb = async (whereCluse) => {
  let queryResults = [];
  let columns = [
    `yarn_id`,
    `yarn_name`,
    `yarn_code`,
    `quantity`,
    `requisition_details_id`,
  ]
  await knex.select(columns).from(function () {
    this.select([
      `${yarnTableName}.id as yarn_id`,
      `${yarnTableName}.name as yarn_name`,
      `${yarnTableName}.code as yarn_code`,
      `${wbTableName}.current_quantity as quantity`,
    ])
    .distinct(`${wbTransportWaWbDetailsTableName}.id as requisition_details_id`)
    // .distinct()
    .from(`${wbTableName}`)
      .innerJoin(`${wbTransportWaWbDetailsTableName}`,
        `${wbTransportWaWbDetailsTableName}.id`,
        `${wbTableName}.wb_transport_wa_wb_details_id`)
      .innerJoin(`${yarnTableName}`,
        `${yarnTableName}.id`,
        `${wbTransportWaWbDetailsTableName}.yarn_id`)
      .where(whereCluse)
      // .groupBy(`${waAddRequisitionDetailsTableName}.yarn_lot_id`)
      .as('t1')
      .union(function () {
        this.select([
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${wbTableName}.current_quantity as quantity`,
        ])
        .distinct(`${wbReconciliationRequisitionDetailsTableName}.id as requisition_details_id`)
        // .distinct()
          .from(`${wbTableName}`)
          .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
            `${wbTableName}.id`)
          .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
            `${wbReconciliationRequisitionDetailsTableName}.id`,
            `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
          .innerJoin(`${wbReconciliationRequisitionTableName}`,
            `${wbReconciliationRequisitionTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbReconciliationRequisitionDetailsTableName}.yarn_id`)
          .where(whereCluse)
          .andWhere(`${wbReconciliationRequisitionDetailsTableName}.input_output`, '1')
        // .groupBy(`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`)
        // .groupBy(`yarn_id`)
      })
      .union(function () {
        this.select([
          `${yarnTableName}.id as yarn_id`,
          `${yarnTableName}.name as yarn_name`,
          `${yarnTableName}.code as yarn_code`,
          `${wbTableName}.current_quantity as quantity`,
        ])
        .distinct(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id as requisition_details_id`)
        // .distinct()

          .from(`${wbTableName}`)
          .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
            `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
          .innerJoin(`${yarnTableName}`,
            `${yarnTableName}.id`,
            `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`)
          .where(whereCluse)
      })
  }).as('temp')
    .sum(`quantity as quantity`)
    .where(`quantity`, `>`, `0`)
    .groupBy(`yarn_id`)
    .then((data) => {
      console.log(data);
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};