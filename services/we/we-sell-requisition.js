// Services
const weSellRequisitionDetailsService = require("./we-sell-requisition-details");

// Queries
const weSellRequisitionQueries = require("../../db/queries/we/we-sell-requisition");
const weSellRequisitionDetailsQueries = require("../../db/queries/we/we-sell-requisition-details");
const generalQueries = require("../../db/queries/general/general");
const deliveryCarQueries = require("../../db/queries/general/delivery-car");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const {
  weSellRequisitionTableName,
  weSellRequisitionDetailsTableName,
  bussinessmanTableName,
  fabricTableName,
  colorTableName,
  gradeItemTableName,
  weSellRequisitionDetailsWeTableName,
  weTableName,
  weAddRequisitionDetailsTableName,
  weDyedFabricOrderRequisitionTableName,
} = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weSellRequisition) => {
    weSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weSellRequisitionQueries.selectOne({ number: weSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Delivery Car
    const selectOneDeliveryCarResult = await deliveryCarQueries.selectOne({ id: weSellRequisition.deliveryCarId });
    if (Array.isArray(selectOneDeliveryCarResult) && selectOneDeliveryCarResult.length > 0) {
      //
    } else {
      weSellRequisition.deliveryCarId = null
    }

    const results = await weSellRequisitionQueries.insert(weSellRequisition);
    if (results) {
        return await weSellRequisitionDetailsService.create(weSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weSellRequisitionQueries.select();

for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await weSellRequisitionDetailsService.selectByRequisitionId(element.id)
    }

    return results;
  };
  
exports.confirm = async (weSellRequisition) => {
    // check is found
    const isFound = await weSellRequisitionQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: weSellRequisition.id,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weSellRequisitionTableName}.id`] = weSellRequisition.id;
        whereCluse[`${weSellRequisitionTableName}.is_deleted`] = 0;
        whereCluse[`${weSellRequisitionTableName}.is_active`] = 1;
  
        // updated
        const updateResults = await weSellRequisitionQueries.update(
            {
                is_approved: weSellRequisition.isApproved
            }, whereCluse);
        if (updateResults) {
          return constants.updateSuccess;
        } else {
          return constants.updateError;
        }
    } else {
      return constants.itemNotFound;
    }
  };

exports.selectAllLazy = async (payload = {}) => {
  const startRow = Number(payload.startRow || 0);
  const endRow = Number(payload.endRow || 50);
  const pageSize = Math.max(1, endRow - startRow);

  const sortModel = Array.isArray(payload.sortModel) ? payload.sortModel : [];
  const filterModel = payload.filterModel || {};
  const isDirect = payload.isDirect ? 1 : 0;

  const whereCluse = {};
  whereCluse[`${weSellRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${weSellRequisitionTableName}.is_active`] = 1;
  whereCluse[`${weSellRequisitionTableName}.is_direct`] = isDirect;

  const omitFilter = (fm, excludeColId) => {
    const out = {};
    Object.keys(fm || {}).forEach(k => { if (k !== excludeColId) out[k] = fm[k]; });
    return out;
  };

  const buildBaseWithFiltersExcept = (excludeColId) => {
    const qb = weSellRequisitionQueries.selectLazy(whereCluse);
    applyAgGridFilters(qb, omitFilter(filterModel, excludeColId));
    return qb;
  };

  const base = weSellRequisitionQueries.selectLazy(whereCluse);
  applyAgGridFilters(base, filterModel);

  // Total rows
  const totalRowRes = await base
    .clone()
    .clearSelect()
    .clearOrder()
    .countDistinct({ total: `${weSellRequisitionTableName}.id` })
    .first();
  const totalRows = Number(totalRowRes?.total || 0);

  // Available filters (cascading)
  const availableFilters = {};

  availableFilters.seller_name = await buildBaseWithFiltersExcept('seller_name')
    .clearSelect().clearOrder()
    .distinct(`${bussinessmanTableName}.name as value`)
    .then(r => r.map(x => x.value));

  // details_fabric — اسم القماش
  const baseExceptFabric = buildBaseWithFiltersExcept('details_fabric');
  availableFilters.details_fabric = await knex
    .distinct('df.name as value')
    .from(`${weSellRequisitionDetailsTableName} as d2`)
    .innerJoin(`${fabricTableName} as df`, 'df.id', 'd2.dyed_fabric_id')
    .where('d2.is_deleted', 0).where('d2.is_active', 1)
    .whereIn('d2.we_sell_requisition_id', baseExceptFabric.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`))
    .then(r => r.map(x => x.value));

  // details_order — اسم الطلبية
  const baseExceptOrder = buildBaseWithFiltersExcept('details_order');
  availableFilters.details_order = await knex
    .distinct('ord.name as value')
    .from(`${weSellRequisitionDetailsTableName} as d2`)
    .innerJoin(`${weDyedFabricOrderRequisitionTableName} as ord`, 'ord.id', 'd2.we_dyed_fabric_order_requisition_id')
    .where('d2.is_deleted', 0).where('d2.is_active', 1)
    .whereIn('d2.we_sell_requisition_id', baseExceptOrder.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`))
    .then(r => r.map(x => x.value));

  // details_color — اللون (عبر we_sell_req_details_we -> we -> we_add_req_details -> color)
  const baseExceptColor = buildBaseWithFiltersExcept('details_color');
  availableFilters.details_color = await knex
    .distinct('c.name as value')
    .from(`${weSellRequisitionDetailsTableName} as d2`)
    .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe`, 'dwe.we_sell_requisition_details_id', 'd2.id')
    .innerJoin(`${weTableName} as we`, 'we.id', 'dwe.we_id')
    .innerJoin(`${weAddRequisitionDetailsTableName} as wad`, 'wad.id', 'we.we_add_requisition_details_id')
    .innerJoin(`${colorTableName} as c`, 'c.id', 'wad.color_id')
    .where('d2.is_deleted', 0).where('d2.is_active', 1)
    .whereIn('d2.we_sell_requisition_id', baseExceptColor.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`))
    .then(r => r.map(x => x.value));

  // details_work_order — أمر الشغل
  const baseExceptWO = buildBaseWithFiltersExcept('details_work_order');
  availableFilters.details_work_order = await knex
    .distinct('wad2.work_order_number as value')
    .from(`${weSellRequisitionDetailsTableName} as d2`)
    .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe2`, 'dwe2.we_sell_requisition_details_id', 'd2.id')
    .innerJoin(`${weTableName} as we2`, 'we2.id', 'dwe2.we_id')
    .innerJoin(`${weAddRequisitionDetailsTableName} as wad2`, 'wad2.id', 'we2.we_add_requisition_details_id')
    .where('d2.is_deleted', 0).where('d2.is_active', 1)
    .whereIn('d2.we_sell_requisition_id', baseExceptWO.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`))
    .where(knex.raw('wad2.work_order_number IS NOT NULL'))
    .then(r => r.map(x => x.value).filter(Boolean));

  // details_grade_item — نوع الدرجة
  const baseExceptGrade = buildBaseWithFiltersExcept('details_grade_item');
  availableFilters.details_grade_item = await knex
    .distinct('g.name as value')
    .from(`${weSellRequisitionDetailsTableName} as d2`)
    .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe3`, 'dwe3.we_sell_requisition_details_id', 'd2.id')
    .innerJoin(`${weTableName} as we3`, 'we3.id', 'dwe3.we_id')
    .innerJoin(`${weAddRequisitionDetailsTableName} as wad3`, 'wad3.id', 'we3.we_add_requisition_details_id')
    .innerJoin(`${gradeItemTableName} as g`, 'g.id', 'wad3.grade_item_id')
    .where('d2.is_deleted', 0).where('d2.is_active', 1)
    .whereIn('d2.we_sell_requisition_id', baseExceptGrade.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`))
    .then(r => r.map(x => x.value));

  // Grand totals — sum from details table for all filtered parent IDs
  const filteredIdsSubquery = base.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`);
  const grandTotalRes = await knex(weSellRequisitionDetailsTableName)
    .whereIn(`${weSellRequisitionDetailsTableName}.we_sell_requisition_id`, filteredIdsSubquery)
    .where(`${weSellRequisitionDetailsTableName}.is_deleted`, 0)
    .where(`${weSellRequisitionDetailsTableName}.is_active`, 1)
    .sum({ grandTotalQty: `${weSellRequisitionDetailsTableName}.quantity`, grandTotalFabricPiece: `${weSellRequisitionDetailsTableName}.fabric_piece` })
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
  const detailsMap = await weSellRequisitionDetailsQueries.selectByRequisitionIds(ids);

  const rows = pageRows.map(r => ({
    ...r,
    details: detailsMap[r.id] || [],
  }));

  const lastRow = (startRow + pageSize) >= totalRows ? totalRows : -1;

  return { rows, lastRow, totalRows, grandTotalQty, grandTotalFabricPiece, availableFilters };
};

function applyAgGridFilters(qb, filterModel) {

  // خريطة فلاتر التفاصيل
  const detailsFilterMap = {
    details_fabric:       { kind: 'fabric',        column: 'name' },
    details_order:        { kind: 'order',         column: 'name' },
    details_color:        { kind: 'we_color',      column: 'name' },
    details_work_order:   { kind: 'we_work_order', column: 'work_order_number' },
    details_grade_item:   { kind: 'we_grade',      column: 'name' },
    details_quantity:     { kind: 'direct',        column: 'quantity' },
    details_fabric_piece: { kind: 'direct',        column: 'fabric_piece' },
  };

  const mapField = (colId) => {
    const m = {
      number:      `${weSellRequisitionTableName}.number`,
      date:        `${weSellRequisitionTableName}.date`,
      seller_name: `${bussinessmanTableName}.name`,
      note:        `${weSellRequisitionTableName}.note`,
    };
    return m[colId];
  };

  Object.keys(filterModel || {}).forEach((colId) => {
    const f = filterModel[colId];

    // ✅ فلاتر التفاصيل
    const spec = detailsFilterMap[colId];
    if (spec) {
      applyDetailsIdsFilter(qb, f, spec);
      return;
    }

    const field = mapField(colId);
    if (!field) return;

    if (f.filterType === 'set') {
      const values = Array.isArray(f.values) ? f.values : Array.isArray(f.value) ? f.value : [];
      if (values.length > 0) qb.whereIn(field, values);
    } else if (f.filterType === 'text') {
      const val = (f.filter ?? '').toString().trim();
      if (!val) return;
      if (f.type === 'equals') qb.andWhere(field, val);
      else if (f.type === 'startsWith') qb.andWhere(field, 'like', `${val}%`);
      else if (f.type === 'endsWith') qb.andWhere(field, 'like', `%${val}`);
      else qb.andWhere(field, 'like', `%${val}%`);
    } else if (f.filterType === 'number') {
      const n = Number(f.filter);
      if (!Number.isFinite(n)) return;
      if (f.type === 'equals') qb.andWhere(field, n);
      else if (f.type === 'greaterThan') qb.andWhere(field, '>', n);
      else if (f.type === 'lessThan') qb.andWhere(field, '<', n);
    } else if (f.filterType === 'date') {
      if (f.type === 'equals') qb.whereRaw(`DATE(${field}) = ?`, [f.dateFrom?.substring(0, 10)]);
      else if (f.type === 'greaterThan') qb.whereRaw(`DATE(${field}) > ?`, [f.dateFrom?.substring(0, 10)]);
      else if (f.type === 'lessThan') qb.whereRaw(`DATE(${field}) < ?`, [f.dateFrom?.substring(0, 10)]);
      else if (f.type === 'inRange') qb.whereRaw(`DATE(${field}) BETWEEN ? AND ?`, [f.dateFrom?.substring(0, 10), f.dateTo?.substring(0, 10)]);
    }
  });
}

function applyDetailsIdsFilter(qb, filterObj, spec) {
  const getValues = () => {
    if (filterObj.filterType === 'set') {
      return Array.isArray(filterObj.values) ? filterObj.values : Array.isArray(filterObj.value) ? filterObj.value : [];
    }
    return [];
  };

  const andWhereInIds = (subFn) => {
    qb.andWhere(function () {
      this.whereIn(`${weSellRequisitionTableName}.id`, subFn);
    });
  };

  const buildSubQuery = (builder, values) => {
    builder
      .select('d2.we_sell_requisition_id')
      .from(`${weSellRequisitionDetailsTableName} as d2`)
      .where('d2.is_deleted', 0)
      .where('d2.is_active', 1);

    if (spec.kind === 'direct') {
      if (filterObj.filterType === 'text') {
        const val = (filterObj.filter ?? '').toString().trim();
        if (val) builder.where(`d2.${spec.column}`, 'like', `%${val}%`);
      } else {
        builder.whereIn(`d2.${spec.column}`, values);
      }
      return;
    }

    if (spec.kind === 'fabric') {
      builder.innerJoin(`${fabricTableName} as df`, 'df.id', 'd2.dyed_fabric_id')
             .whereIn(`df.${spec.column}`, values);
      return;
    }

    if (spec.kind === 'order') {
      builder.innerJoin(`${weDyedFabricOrderRequisitionTableName} as ord`, 'ord.id', 'd2.we_dyed_fabric_order_requisition_id')
             .whereIn(`ord.${spec.column}`, values);
      return;
    }

    // الفلاتر التي تمر عبر we_sell_req_details_we -> we -> we_add_req_details
    builder.innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe`, 'dwe.we_sell_requisition_details_id', 'd2.id')
           .innerJoin(`${weTableName} as we`, 'we.id', 'dwe.we_id')
           .innerJoin(`${weAddRequisitionDetailsTableName} as wad`, 'wad.id', 'we.we_add_requisition_details_id');

    if (spec.kind === 'we_color') {
      builder.innerJoin(`${colorTableName} as c`, 'c.id', 'wad.color_id')
             .whereIn(`c.${spec.column}`, values);
      return;
    }

    if (spec.kind === 'we_work_order') {
      builder.whereIn(`wad.${spec.column}`, values);
      return;
    }

    if (spec.kind === 'we_grade') {
      builder.innerJoin(`${gradeItemTableName} as g`, 'g.id', 'wad.grade_item_id')
             .whereIn(`g.${spec.column}`, values);
      return;
    }
  };

  if (filterObj.filterType === 'set') {
    const values = getValues();
    if (!values.length) return;
    andWhereInIds(function () { buildSubQuery(this, values); });
    return;
  }

  if (filterObj.filterType === 'text' && spec.kind === 'direct') {
    const val = (filterObj.filter ?? '').toString().trim();
    if (!val) return;
    andWhereInIds(function () { buildSubQuery(this, []); });
  }
}

function applyAgGridSort(qb, sortModel) {
  const mapField = (colId) => {
    const m = {
      number: `${weSellRequisitionTableName}.number`,
      date: `${weSellRequisitionTableName}.date`,
      seller_name: `${bussinessmanTableName}.name`,
    };
    return m[colId];
  };
  (sortModel || []).forEach((s) => {
    const field = mapField(s.colId);
    if (!field) return;
    qb.orderBy(field, s.sort === 'asc' ? 'asc' : 'desc');
  });
}