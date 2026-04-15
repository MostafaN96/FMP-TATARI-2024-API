// Services
const wdDyeingRequisitionDetailsService = require("./wd-dyeing-requisition-details");

// Queries
const wdDyeingRequisitionQueries = require("../../db/queries/wd/wd-dyeing-requisition");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-requisition-details");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { wdDyeingRequisitionTableName, wdDyeingRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsTableName, bussinessmanTableName, warehouseTableName } = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdDyeingRequisition) => {
    wdDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdDyeingRequisitionQueries.selectOne({ number: wdDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Valid Current Quantity
    for (let i = 0; i < wdDyeingRequisition.items.length; i++) {
        const element = wdDyeingRequisition.items[i];

        let whereCluse = {}
        whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = element.wdFormRequisitionDetailsId
        const selectOneFormQuantity = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse)
        if (selectOneFormQuantity[0] != null) {
            if (parseFloat(element.quantity) > selectOneFormQuantity[0].current_quantity) {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: selectOneFormQuantity[0].current_quantity,
                    newQuantity: element.quantity
                }
            }
        }
    }

    const results = await wdDyeingRequisitionQueries.insert(wdDyeingRequisition);
    if (results) {
        return await wdDyeingRequisitionDetailsService.create(wdDyeingRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdDyeingRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wdDyeingRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };

exports.selectAllLazy = async (payload = {}) => {
  const startRow = Number(payload.startRow || 0);
  const endRow = Number(payload.endRow || 50);
  const pageSize = Math.max(1, endRow - startRow);

  const sortModel = Array.isArray(payload.sortModel) ? payload.sortModel : [];
  const filterModel = payload.filterModel || {};

  const whereCluse = {};
  whereCluse[`${wdDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdDyeingRequisitionTableName}.is_active`] = 1;

  const omitFilter = (fm, excludeColId) => {
    const out = {};
    Object.keys(fm || {}).forEach(k => { if (k !== excludeColId) out[k] = fm[k]; });
    return out;
  };

  const buildBaseWithFiltersExcept = (excludeColId) => {
    const qb = wdDyeingRequisitionQueries.selectLazy(whereCluse);
    applyAgGridFilters(qb, omitFilter(filterModel, excludeColId));
    return qb;
  };

  const base = wdDyeingRequisitionQueries.selectLazy(whereCluse);
  applyAgGridFilters(base, filterModel);

  // Total rows
  const totalRowRes = await base
    .clone()
    .clearSelect()
    .clearOrder()
    .clear('group')
    .countDistinct({ total: `${wdDyeingRequisitionTableName}.id` })
    .first();
  const totalRows = Number(totalRowRes?.total || 0);

  // Available filters (cascading)
  const availableFilters = {};

  availableFilters.dyeing_name = await buildBaseWithFiltersExcept('dyeing_name')
    .clearSelect().clearOrder().clear('group')
    .distinct(`${bussinessmanTableName}.name as value`)
    .then(r => r.map(x => x.value));

  availableFilters.warehouse_name = await buildBaseWithFiltersExcept('warehouse_name')
    .clearSelect().clearOrder().clear('group')
    .distinct(`${warehouseTableName}.name as value`)
    .then(r => r.map(x => x.value));

  availableFilters.release_process = await buildBaseWithFiltersExcept('release_process')
    .clearSelect().clearOrder().clear('group')
    .distinct(`${wdDyeingRequisitionTableName}.release_process as value`)
    .then(r => r.map(x => x.value).filter(Boolean));

  // details_work_order filter
  const baseExceptDetailsWO = buildBaseWithFiltersExcept('details_work_order');
  availableFilters.details_work_order = await knex
    .distinct(`d2.work_order_number as value`)
    .from(`${wdDyeingRequisitionDetailsTableName} as d2`)
    .where(`d2.is_deleted`, 0).where(`d2.is_active`, 1)
    .whereIn(
      `d2.wd_dyeing_requisition_id`,
      baseExceptDetailsWO.clone().clearSelect().select(`${wdDyeingRequisitionTableName}.id`)
    )
    .then(r => r.map(x => x.value).filter(Boolean));

  // Grand total
  const grandTotalRes = await base
    .clone()
    .clearSelect().clearOrder().clear('group')
    .join(`${wdDyeingRequisitionDetailsTableName} as d_total`,
      `d_total.wd_dyeing_requisition_id`, `${wdDyeingRequisitionTableName}.id`)
    .where(`d_total.is_deleted`, 0).where(`d_total.is_active`, 1)
    .sum({ grandTotalQty: `d_total.quantity` })
    .first();
  const grandTotalQty = Number(grandTotalRes?.grandTotalQty || 0);

  // Apply sort
  if (sortModel.length) {
    base.clearOrder();
    applyAgGridSort(base, sortModel);
  }

  // Page data
  const pageRows = await base.clone().offset(startRow).limit(pageSize);

  // Load details for page ids
  const ids = pageRows.map(r => r.id).filter(Boolean);
  const detailsMap = await wdDyeingRequisitionDetailsQueries.selectByRequisitionIds(ids);

  const rows = pageRows.map(r => ({
    ...r,
    details: detailsMap[r.id] || [],
  }));

  const lastRow = (startRow + pageSize) >= totalRows ? totalRows : -1;

  return { rows, lastRow, totalRows, grandTotalQty, availableFilters };
};

function applyAgGridFilters(qb, filterModel) {
  const mapField = (colId) => {
    const m = {
      number: `${wdDyeingRequisitionTableName}.number`,
      date: `${wdDyeingRequisitionTableName}.date`,
      dyeing_name: `${bussinessmanTableName}.name`,
      warehouse_name: `${warehouseTableName}.name`,
      release_process: `${wdDyeingRequisitionTableName}.release_process`,
      note: `${wdDyeingRequisitionTableName}.note`,
    };
    return m[colId];
  };

  const detailsFilterMap = {
    details_work_order: { kind: 'direct', column: 'work_order_number' },
  };

  Object.keys(filterModel || {}).forEach((colId) => {
    const f = filterModel[colId];

    const spec = detailsFilterMap[colId];
    if (spec) {
      applyDetailsIdsFilter(qb, f, spec);
      return;
    }

    const field = mapField(colId);
    if (!field) return;

    if (f.filterType === 'set') {
      const values = Array.isArray(f.values) ? f.values : [];
      if (values.length > 0) qb.whereIn(field, values);
    } else if (f.filterType === 'text') {
      const val = f.filter || '';
      if (val) qb.where(field, 'like', `%${val}%`);
    } else if (f.filterType === 'number') {
      if (f.type === 'equals') qb.where(field, f.filter);
      else if (f.type === 'greaterThan') qb.where(field, '>', f.filter);
      else if (f.type === 'lessThan') qb.where(field, '<', f.filter);
    } else if (f.filterType === 'date') {
      if (f.type === 'equals') {
        qb.whereRaw(`DATE(${field}) = ?`, [f.dateFrom?.substring(0, 10)]);
      } else if (f.type === 'greaterThan') {
        qb.whereRaw(`DATE(${field}) > ?`, [f.dateFrom?.substring(0, 10)]);
      } else if (f.type === 'lessThan') {
        qb.whereRaw(`DATE(${field}) < ?`, [f.dateFrom?.substring(0, 10)]);
      } else if (f.type === 'inRange') {
        qb.whereRaw(`DATE(${field}) BETWEEN ? AND ?`, [f.dateFrom?.substring(0, 10), f.dateTo?.substring(0, 10)]);
      }
    }
  });
}

function applyDetailsIdsFilter(qb, filterDef, spec) {
  qb.whereIn(`${wdDyeingRequisitionTableName}.id`, function () {
    this.select(`d2.wd_dyeing_requisition_id`)
      .from(`${wdDyeingRequisitionDetailsTableName} as d2`)
      .where(`d2.is_deleted`, 0).where(`d2.is_active`, 1);

    if (filterDef.filterType === 'set') {
      const values = Array.isArray(filterDef.values) ? filterDef.values : [];
      if (values.length > 0) this.whereIn(`d2.${spec.column}`, values);
    } else if (filterDef.filterType === 'text') {
      const val = filterDef.filter || '';
      if (val) this.where(`d2.${spec.column}`, 'like', `%${val}%`);
    }
  });
}

function applyAgGridSort(qb, sortModel) {
  const mapField = (colId) => {
    const m = {
      number: `${wdDyeingRequisitionTableName}.number`,
      date: `${wdDyeingRequisitionTableName}.date`,
      dyeing_name: `${bussinessmanTableName}.name`,
      warehouse_name: `${warehouseTableName}.name`,
      release_process: `${wdDyeingRequisitionTableName}.release_process`,
    };
    return m[colId];
  };
  (sortModel || []).forEach((s) => {
    const field = mapField(s.colId);
    if (!field) return;
    qb.orderBy(field, s.sort === 'asc' ? 'asc' : 'desc');
  });
}