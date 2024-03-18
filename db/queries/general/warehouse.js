// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const constantsPayloads = require("../../../util/constants-payloads");
const { wcAddRequisitionDetailsTableName, wcTableName, waReconciliationRequisitionTableName, waReconciliationRequisitionDetailsTableName, waReconciliationRequisitionDetailsWaTableName, wbTransportRequisitionWbWaTableName, wbTransportRequisitionWbWaDetailsTableName, wcReconciliationRequisitionTableName, wcReconciliationRequisitionDetailsTableName, wcReconciliationRequisitionDetailsWcTableName, wdTransportRequisitionWdWcTableName, wdTransportRequisitionWdWcDetailsTableName, wcAddRequisitionTableName, weAddRequisitionDetailsTableName, weTableName, wdDyeingRequisitionDetailsTableName, wbManufacturingOutputTableName, weReconciliationRequisitionTableName, weReconciliationRequisitionDetailsTableName, weReconciliationRequisitionDetailsWeTableName, waExecuteOrderRequisitionTableName, waExecuteOrderRequisitionDetailsTableName, waTransitionBetweenWHRequisitionTableName, waTransitionBetweenWHRequisitionDetailsTableName, wdDyeingRequisitionTableName, wcTransitionBetweenWHRequisitionDetailsTableName, wcTransitionBetweenWHRequisitionTableName } = require("../../../util/database-tables-name");
const warehouseTableName = require("../../../util/database-tables-name").warehouseTableName;
const waTableName = require("../../../util/database-tables-name").waTableName;
const waAddRequisitionDetailsTableName = require("../../../util/database-tables-name").waAddRequisitionDetailsTableName;
const waAddRequisitionTableName = require("../../../util/database-tables-name").waAddRequisitionTableName;

exports.insert = async (warehouse) => {
  let queryResults = false;
  await sqlFun
    .insert(warehouseTableName, {
      id: warehouse.id,
      name: warehouse.name,
      phone: warehouse.phone,
      address: warehouse.address,
      storekeeper_name: warehouse.storekeeper_name,
      is_stock: warehouse.is_stock,
      is_grade: warehouse.is_grade,
      creator_id: warehouse.creator_id,
      ip_address: warehouse.ip_address,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (warehouse) => {
  let queryResults = false;
  await sqlFun
    .update(
      warehouseTableName,
      {
        name: warehouse.name,
        phone: warehouse.phone,
        address: warehouse.address,
        storekeeper_name: warehouse.storekeeper_name,
        is_stock: warehouse.is_stock,
        is_grade: warehouse.is_grade,
      }, {
        id: warehouse.id,
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
    .limitedSelect(warehouseTableName, ["is_deleted"], whereCluse, 1)
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
      warehouseTableName,
      [
        `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
        `${warehouseTableName}.is_grade`,
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
      warehouseTableName,
      [
        `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
        `${warehouseTableName}.is_grade`,
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

exports.selectWhereInWa = async () => {
  let queryResults = []
  await knex.select([
    `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
  ])
      .from(`${warehouseTableName}`)
      .whereIn(`${warehouseTableName}.id`, function () {
          this.select(`${waAddRequisitionDetailsTableName}.warehouse_id as id`)
          .from(`${waAddRequisitionDetailsTableName}`)
          .where(`${waTableName}.current_quantity`, ">", "0")
          .innerJoin(`${waTableName}`, 
          `${waTableName}.wa_add_requisition_details_id`,
          `${waAddRequisitionDetailsTableName}.id`)
      })
      .orWhereIn(`${warehouseTableName}.id`, function () {
        this.select(`${waReconciliationRequisitionTableName}.warehouse_id as id`)
        .from(`${waReconciliationRequisitionTableName}`)
        .innerJoin(`${waReconciliationRequisitionDetailsTableName}`, 
        `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`,
        `${waReconciliationRequisitionTableName}.id`)
        .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`, 
        `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`,
        `${waReconciliationRequisitionDetailsTableName}.id`)
        .innerJoin(`${waTableName}`, 
        `${waTableName}.id`,
        `${waReconciliationRequisitionDetailsWaTableName}.wa_id`)
        .where(`${waTableName}.current_quantity`, ">", "0")
    })
    .orWhereIn(`${warehouseTableName}.id`, function () {
      this.select(`${wbTransportRequisitionWbWaTableName}.warehouse_id as id`)
          .from(`${wbTransportRequisitionWbWaTableName}`)
          .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`, 
          `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`,
          `${wbTransportRequisitionWbWaTableName}.id`)
          .innerJoin(`${waTableName}`, 
          `${waTableName}.wb_transport_requisition_wb_wa_details_id`,
          `${wbTransportRequisitionWbWaDetailsTableName}.id`)
          .where(`${waTableName}.current_quantity`, ">", "0")
  })
    .orWhereIn(`${warehouseTableName}.id`, function () {
      this.select(`${waExecuteOrderRequisitionTableName}.warehouse_id as id`)
          .from(`${waExecuteOrderRequisitionTableName}`)
          .innerJoin(`${waExecuteOrderRequisitionDetailsTableName}`, 
          `${waExecuteOrderRequisitionDetailsTableName}.wa_execute_order_requisition_id`,
          `${waExecuteOrderRequisitionTableName}.id`)
          .innerJoin(`${waTableName}`, 
          `${waTableName}.wa_execute_order_requisition_details_id`,
          `${waExecuteOrderRequisitionDetailsTableName}.id`)
          .where(`${waTableName}.current_quantity`, ">", "0")
  })
    .orWhereIn(`${warehouseTableName}.id`, function () {
      this.select(`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id as id`)
          .from(`${waTransitionBetweenWHRequisitionTableName}`)
          .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`, 
          `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`,
          `${waTransitionBetweenWHRequisitionTableName}.id`)
          .innerJoin(`${waTableName}`, 
          `${waTableName}.wa_transition_between_wh_requisitions_details_id`,
          `${waTransitionBetweenWHRequisitionDetailsTableName}.id`)
          .where(`${waTableName}.current_quantity`, ">", "0")
  })
      .andWhere(constantsPayloads.deletePayload)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults
}

exports.selectWhereInWaBySupplier = async (supplierId) => {
  let queryResults = []
  let whereCluse = {};
  whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;

  await knex.select([
    `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
  ])
      .from(`${warehouseTableName}`)
      .whereIn(`${warehouseTableName}.id`, function () {
          this.select(`${waAddRequisitionDetailsTableName}.warehouse_id as id`)
          .from(`${waAddRequisitionDetailsTableName}`)
          .where(`${waTableName}.current_quantity`, ">", "0")
          .andWhere(whereCluse)
          .innerJoin(`${waTableName}`, 
          `${waTableName}.wa_add_requisition_details_id`,
          `${waAddRequisitionDetailsTableName}.id`)
          .innerJoin(`${waAddRequisitionTableName}`, 
          `${waAddRequisitionTableName}.id`,
          `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
      })
      .andWhere(constantsPayloads.deletePayload)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults
}

exports.selectWhereInWc = async () => {
  let queryResults = []
  await knex.select([
    `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
  ])
      .from(`${warehouseTableName}`)
      .whereIn(`${warehouseTableName}.id`, function () {
          this.select(`${wcAddRequisitionDetailsTableName}.warehouse_id as id`)
          .from(`${wcAddRequisitionDetailsTableName}`)
          .where(`${wcTableName}.current_quantity`, ">", "0")
          .innerJoin(`${wcTableName}`, 
          `${wcTableName}.wc_add_requisition_details_id`,
          `${wcAddRequisitionDetailsTableName}.id`)
      })
      .orWhereIn(`${warehouseTableName}.id`, function () {
        this.select(`${wcReconciliationRequisitionTableName}.warehouse_id as id`)
        .from(`${wcReconciliationRequisitionTableName}`)
        .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`, 
        `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`,
        `${wcReconciliationRequisitionTableName}.id`)
        .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`, 
        `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`,
        `${wcReconciliationRequisitionDetailsTableName}.id`)
        .innerJoin(`${wcTableName}`, 
        `${wcTableName}.id`,
        `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
    })
    .orWhereIn(`${warehouseTableName}.id`, function () {
      this.select(`${wdTransportRequisitionWdWcTableName}.warehouse_id as id`)
          .from(`${wdTransportRequisitionWdWcTableName}`)
          .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`, 
          `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`,
          `${wdTransportRequisitionWdWcTableName}.id`)
          .innerJoin(`${wcTableName}`, 
          `${wcTableName}.wd_transport_requisition_wd_wc_details_id`,
          `${wdTransportRequisitionWdWcDetailsTableName}.id`)
          .where(`${wcTableName}.current_quantity`, ">", "0")
  })
  .orWhereIn(`${warehouseTableName}.id`, function () {
    this.select(`${wbManufacturingOutputTableName}.warehouse_id as id`)
        .from(`${wbManufacturingOutputTableName}`)
        .innerJoin(`${wcTableName}`, 
        `${wcTableName}.wb_manufacturing_output_id`,
        `${wbManufacturingOutputTableName}.id`)
        .where(`${wcTableName}.current_quantity`, ">", "0")
})
.orWhereIn(`${warehouseTableName}.id`, function () {
  this.select(`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id as id`)
      .from(`${wcTransitionBetweenWHRequisitionTableName}`)
      .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`, 
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`,
      `${wcTransitionBetweenWHRequisitionTableName}.id`)
      .innerJoin(`${wcTableName}`, 
      `${wcTableName}.wc_transition_between_wh_requisitions_details_id`,
      `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`)
      .where(`${wcTableName}.current_quantity`, ">", "0")
})
      .andWhere(constantsPayloads.deletePayload)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults
}

exports.selectWhereInWe = async () => {
  let queryResults = []
  await knex.select([
    `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
  ])
      .from(`${warehouseTableName}`)
      .whereIn(`${warehouseTableName}.id`, function () {
          this.select(`${weAddRequisitionDetailsTableName}.warehouse_id as id`)
          .from(`${weAddRequisitionDetailsTableName}`)
          .where(`${weTableName}.current_quantity`, ">", "0")
          .innerJoin(`${weTableName}`, 
          `${weTableName}.we_add_requisition_details_id`,
          `${weAddRequisitionDetailsTableName}.id`)
      })
      .orWhereIn(`${warehouseTableName}.id`, function () {
        this.select(`${weReconciliationRequisitionDetailsTableName}.warehouse_id as id`)
        .from(`${weReconciliationRequisitionTableName}`)
        .innerJoin(`${weReconciliationRequisitionDetailsTableName}`, 
        `${weReconciliationRequisitionDetailsTableName}.we_reconcilition_requisition_id`,
        `${weReconciliationRequisitionTableName}.id`)
        .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`, 
        `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`,
        `${weReconciliationRequisitionDetailsTableName}.id`)
        .innerJoin(`${weTableName}`, 
        `${weTableName}.id`,
        `${weReconciliationRequisitionDetailsWeTableName}.we_id`)
        .where(`${weTableName}.current_quantity`, ">", "0")
    })
    .orWhereIn(`${warehouseTableName}.id`, function () {
      this.select(`${wdDyeingRequisitionTableName}.warehouse_id as id`)
          .from(`${wdDyeingRequisitionDetailsTableName}`)
          .innerJoin(`${wdDyeingRequisitionTableName}`, 
          `${wdDyeingRequisitionTableName}.id`,
          `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
          .innerJoin(`${weTableName}`, 
          `${weTableName}.wd_dyeing_requisition_details_id`,
          `${wdDyeingRequisitionDetailsTableName}.id`)
          .where(`${weTableName}.current_quantity`, ">", "0")
  })
      .andWhere(constantsPayloads.deletePayload)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults
}

exports.selectWhereInWcBySupplier = async (supplierId) => {
  let queryResults = []
  let whereCluse = {};
  whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplierId;

  await knex.select([
    `${warehouseTableName}.id`,
        `${warehouseTableName}.name`,
        `${warehouseTableName}.phone`,
        `${warehouseTableName}.address`,
        `${warehouseTableName}.storekeeper_name`,
        `${warehouseTableName}.is_stock`,
  ])
      .from(`${warehouseTableName}`)
      .whereIn(`${warehouseTableName}.id`, function () {
          this.select(`${wcAddRequisitionDetailsTableName}.warehouse_id as id`)
          .from(`${wcAddRequisitionDetailsTableName}`)
          .where(`${wcTableName}.current_quantity`, ">", "0")
          .andWhere(whereCluse)
          .innerJoin(`${wcTableName}`, 
          `${wcTableName}.wc_add_requisition_details_id`,
          `${wcAddRequisitionDetailsTableName}.id`)
          .innerJoin(`${wcAddRequisitionTableName}`, 
          `${wcAddRequisitionTableName}.id`,
          `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
      })
      .andWhere(constantsPayloads.deletePayload)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults
}

exports.delete = async (warehouseId) => {
  let queryResults = false;
  await sqlFun
    .delete(warehouseTableName, {
      id: warehouseId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (warehouseId) => {
  let queryResults = false;
  await sqlFun
    .restore(warehouseTableName, {
      id: warehouseId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
