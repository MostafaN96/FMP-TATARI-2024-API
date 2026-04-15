// Services
const wdTransportWcWdRequisitionDetailsService = require("./wd-transport-wc-wd-details");

// Queries
const wdTransportWcWdRequisitionQueries = require("../../db/queries/wd/wd-transport-wc-wd");
const wdTransportWcWdDetailsQueries = require("../../db/queries/wd/wd-transport-wc-wd-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { wdTransportWcWdTableName, wdTransportWcWdDetailsTableName, warehouseTableName } = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdTransportWcWdRequisition) => {
    wdTransportWcWdRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdTransportWcWdTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdTransportWcWdRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdTransportWcWdRequisitionQueries.selectOne({ number: wdTransportWcWdRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdTransportWcWdRequisitionQueries.insert(wdTransportWcWdRequisition);
    if (results) {
        return await wdTransportWcWdRequisitionDetailsService.create(wdTransportWcWdRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdTransportWcWdRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
            const element = results[i];
            element.details = await wdTransportWcWdRequisitionDetailsService.selectByRequisitionId(element.id)
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
  whereCluse[`${wdTransportWcWdTableName}.is_deleted`] = 0;
  whereCluse[`${wdTransportWcWdTableName}.is_active`] = 1;

  const omitFilter = (fm, excludeColId) => {
    const out = {};
    Object.keys(fm || {}).forEach(k => { if (k !== excludeColId) out[k] = fm[k]; });
    return out;
  };

  const buildBaseWithFiltersExcept = (excludeColId) => {
    const qb = wdTransportWcWdRequisitionQueries.selectLazy(whereCluse);
    applyAgGridFilters(qb, omitFilter(filterModel, excludeColId));
    return qb;
  };

  const base = wdTransportWcWdRequisitionQueries.selectLazy(whereCluse);
  applyAgGridFilters(base, filterModel);

  // Total rows
  const totalRowRes = await base
    .clone()
    .clearSelect()
    .clearOrder()
    .clear('group')
    .countDistinct({ total: `${wdTransportWcWdTableName}.id` })
    .first();
  const totalRows = Number(totalRowRes?.total || 0);

  // Available filters (cascading)
  const availableFilters = {};

  availableFilters.warehouse_name = await buildBaseWithFiltersExcept('warehouse_name')
    .clearSelect().clearOrder().clear('group')
    .distinct(`${warehouseTableName}.name as value`)
    .then(r => r.map(x => x.value));

  // document filter (from details)
  const baseExceptDocument = buildBaseWithFiltersExcept('document');
  availableFilters.document = await knex
    .distinct(`d2.document as value`)
    .from(`${wdTransportWcWdDetailsTableName} as d2`)
    .where(`d2.is_deleted`, 0).where(`d2.is_active`, 1)
    .whereIn(
      `d2.wd_transport_wc_wd_id`,
      baseExceptDocument.clone().clearSelect().select(`${wdTransportWcWdTableName}.id`)
    )
    .then(r => r.map(x => x.value).filter(Boolean));

  // Grand totals
  const grandTotalRes = await base
    .clone()
    .clearSelect().clearOrder().clear('group')
    .join(`${wdTransportWcWdDetailsTableName} as d_total`,
      `d_total.wd_transport_wc_wd_id`, `${wdTransportWcWdTableName}.id`)
    .where(`d_total.is_deleted`, 0).where(`d_total.is_active`, 1)
    .sum({ grandTotalQty: `d_total.quantity`, grandTotalFabricPiece: `d_total.fabric_piece` })
    .first();
  const grandTotalQty = Number(grandTotalRes?.grandTotalQty || 0);
  const grandTotalFabricPiece = Number(grandTotalRes?.grandTotalFabricPiece || 0);

  // Apply sort
  if (sortModel.length) {
    base.clearOrder();
    applyAgGridSort(base, sortModel);
  }

  // Page data
  const pageRows = await base.clone().offset(startRow).limit(pageSize);

  // Load details for page ids
  const ids = pageRows.map(r => r.id).filter(Boolean);
  const detailsMap = await wdTransportWcWdDetailsQueries.selectByRequisitionIds(ids);

  const rows = pageRows.map(r => ({
    ...r,
    details: detailsMap[r.id] || [],
  }));

  const lastRow = (startRow + pageSize) >= totalRows ? totalRows : -1;

  return { rows, lastRow, totalRows, grandTotalQty, grandTotalFabricPiece, availableFilters };
};

function applyAgGridFilters(qb, filterModel) {
  const mapField = (colId) => {
    const m = {
      number: `${wdTransportWcWdTableName}.number`,
      date: `${wdTransportWcWdTableName}.date`,
      warehouse_name: `${warehouseTableName}.name`,
      note: `${wdTransportWcWdTableName}.note`,
    };
    return m[colId];
  };

  const detailsFilterMap = {
    document: { kind: 'direct', column: 'document' },
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
  qb.whereIn(`${wdTransportWcWdTableName}.id`, function () {
    this.select(`d2.wd_transport_wc_wd_id`)
      .from(`${wdTransportWcWdDetailsTableName} as d2`)
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
      number: `${wdTransportWcWdTableName}.number`,
      date: `${wdTransportWcWdTableName}.date`,
      warehouse_name: `${warehouseTableName}.name`,
    };
    return m[colId];
  };
  (sortModel || []).forEach((s) => {
    const field = mapField(s.colId);
    if (!field) return;
    qb.orderBy(field, s.sort === 'asc' ? 'asc' : 'desc');
  });
}