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
  weReconciliationRequisitionDetailsTableName,
  weReconciliationRequisitionDetailsWeTableName,
  wdDyeingRequisitionDetailsTableName,
  weTransitionBetweenWHRequisitionDetailsTableName,
  weTransitionBetweenOrdersRequisitionDetailsTableName,
  weReturnSellRequisitionDetailsTableName,
  wdFormDyeingRequisitionDetailsTableName,
  anointedColorsPricesTableName,
} = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weSellRequisition) => {
    weSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition (outside trx — read-only)
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data (outside trx — read-only)
    const selectOneResult = await weSellRequisitionQueries.selectOne({ number: weSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Delivery Car (outside trx — read-only)
    const selectOneDeliveryCarResult = await deliveryCarQueries.selectOne({ id: weSellRequisition.deliveryCarId });
    if (Array.isArray(selectOneDeliveryCarResult) && selectOneDeliveryCarResult.length > 0) {
      //
    } else {
      weSellRequisition.deliveryCarId = null
    }

    const trx = await knex.transaction();
    try {
        const inserted = await weSellRequisitionQueries.insert(weSellRequisition, trx);
        if (!inserted) {
            await trx.rollback();
            return constants.insertError;
        }

        const detailsResult = await weSellRequisitionDetailsService.create(weSellRequisition, trx);
        if (detailsResult?.status !== constants.insertSuccess?.status) {
            await trx.rollback();
            return detailsResult;
        }

        await trx.commit();
        return detailsResult;
    } catch (error) {
        await trx.rollback();
        console.error('we-sell-requisition create trx error:', error);
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

  // details_color — اللون (من جميع المصادر الـ 6)
  const baseExceptColor = buildBaseWithFiltersExcept('details_color');
  const colorBase = baseExceptColor.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`);

  const buildColorPath = (alias, joinFn, colorIdExpr) =>
    knex.distinct(`c_col.name as value`)
      .from(`${weSellRequisitionDetailsTableName} as d2`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe_c`, 'dwe_c.we_sell_requisition_details_id', 'd2.id')
      .innerJoin(`${weTableName} as we_c`, 'we_c.id', 'dwe_c.we_id')
      .modify(joinFn)
      .innerJoin(`${colorTableName} as c_col`, 'c_col.id', colorIdExpr)
      .where('d2.is_deleted', 0).where('d2.is_active', 1)
      .whereIn('d2.we_sell_requisition_id', colorBase.clone())
      .whereNotNull(colorIdExpr)
      .then(r => r.map(x => x.value).filter(Boolean));

  const [col1, col2, col3, col4, col5, col6] = await Promise.all([
    // Path 1: we_add_requisition_details
    buildColorPath('wad_c', qb => qb.innerJoin(`${weAddRequisitionDetailsTableName} as wad_c`, 'wad_c.id', 'we_c.we_add_requisition_details_id'), 'wad_c.color_id'),
    // Path 2: we_reconciliation_requisition_details
    buildColorPath('wrec_c', qb => qb
      .innerJoin(`${weReconciliationRequisitionDetailsWeTableName} as wrecdwe_c`, 'wrecdwe_c.we_id', 'we_c.id')
      .innerJoin(`${weReconciliationRequisitionDetailsTableName} as wrec_c`, 'wrec_c.id', 'wrecdwe_c.we_reconcilition_requisition_details_id'), 'wrec_c.color_id'),
    // Path 3: wd_dyeing_requisition_details -> wd_form_dyeing_req_details -> anointed_colors_prices
    buildColorPath('acp_c', qb => qb
      .innerJoin(`${wdDyeingRequisitionDetailsTableName} as wdd_c`, 'wdd_c.id', 'we_c.wd_dyeing_requisition_details_id')
      .innerJoin(`${wdFormDyeingRequisitionDetailsTableName} as wfd_c`, 'wfd_c.id', 'wdd_c.wd_form_dyeing_requisition_details_id')
      .innerJoin(`${anointedColorsPricesTableName} as acp_c`, 'acp_c.id', 'wfd_c.dyeing_colors_prices_id'), 'acp_c.color_id'),
    // Path 4: we_transition_between_wh_requisition_details
    buildColorPath('wtbwh_c', qb => qb.innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName} as wtbwh_c`, 'wtbwh_c.id', 'we_c.we_transition_between_wh_requisitions_details_id'), 'wtbwh_c.color_id'),
    // Path 5: we_transition_between_orders_requisition_details
    buildColorPath('wtbo_c', qb => qb.innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName} as wtbo_c`, 'wtbo_c.id', 'we_c.we_transition_between_orders_requisitions_details_id'), 'wtbo_c.color_id'),
    // Path 6: we_return_sell_requisition_details
    buildColorPath('wrsd_c', qb => qb.innerJoin(`${weReturnSellRequisitionDetailsTableName} as wrsd_c`, 'wrsd_c.id', 'we_c.we_return_sell_requisition_details_id'), 'wrsd_c.color_id'),
  ]);

  availableFilters.details_color = [...new Set([...col1, ...col2, ...col3, ...col4, ...col5, ...col6])];

  // details_work_order — أمر الشغل (من جميع المصادر الـ 6)
  const baseExceptWO = buildBaseWithFiltersExcept('details_work_order');
  const woBase = baseExceptWO.clone().clearSelect().clearOrder().select(`${weSellRequisitionTableName}.id`);

  const buildWoPath = (alias, joinFn) =>
    knex.distinct(`${alias}.work_order_number as value`)
      .from(`${weSellRequisitionDetailsTableName} as d2`)
      .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe2`, 'dwe2.we_sell_requisition_details_id', 'd2.id')
      .innerJoin(`${weTableName} as we2`, 'we2.id', 'dwe2.we_id')
      .modify(joinFn)
      .where('d2.is_deleted', 0).where('d2.is_active', 1)
      .whereIn('d2.we_sell_requisition_id', woBase.clone())
      .whereNotNull(`${alias}.work_order_number`)
      .where(`${alias}.work_order_number`, '<>', '')
      .then(r => r.map(x => x.value).filter(Boolean));

  const [wo1, wo2, wo3, wo4, wo5, wo6] = await Promise.all([
    // Path 1: we_add_requisition_details
    buildWoPath('wad2', qb => qb.innerJoin(`${weAddRequisitionDetailsTableName} as wad2`, 'wad2.id', 'we2.we_add_requisition_details_id')),
    // Path 2: we_reconciliation_requisition_details
    buildWoPath('wrec', qb => qb
      .innerJoin(`${weReconciliationRequisitionDetailsWeTableName} as wrecdwe`, 'wrecdwe.we_id', 'we2.id')
      .innerJoin(`${weReconciliationRequisitionDetailsTableName} as wrec`, 'wrec.id', 'wrecdwe.we_reconcilition_requisition_details_id')),
    // Path 3: wd_dyeing_requisition_details
    buildWoPath('wdd', qb => qb.innerJoin(`${wdDyeingRequisitionDetailsTableName} as wdd`, 'wdd.id', 'we2.wd_dyeing_requisition_details_id')),
    // Path 4: we_transition_between_wh_requisition_details
    buildWoPath('wtbwh', qb => qb.innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName} as wtbwh`, 'wtbwh.id', 'we2.we_transition_between_wh_requisitions_details_id')),
    // Path 5: we_transition_between_orders_requisition_details
    buildWoPath('wtbo', qb => qb.innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName} as wtbo`, 'wtbo.id', 'we2.we_transition_between_orders_requisitions_details_id')),
    // Path 6: we_return_sell_requisition_details
    buildWoPath('wrsd', qb => qb.innerJoin(`${weReturnSellRequisitionDetailsTableName} as wrsd`, 'wrsd.id', 'we2.we_return_sell_requisition_details_id')),
  ]);

  availableFilters.details_work_order = [...new Set([...wo1, ...wo2, ...wo3, ...wo4, ...wo5, ...wo6])];

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

    // we_work_order: يجب معالجته قبل الـ INNER JOINs لأن المصدر يأتي من 6 جداول مختلفة
    if (spec.kind === 'we_work_order') {
      const makeWoSub = (alias, joinFn) =>
        knex.distinct('d_sub.id')
          .from(`${weSellRequisitionDetailsTableName} as d_sub`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe_sub`, 'dwe_sub.we_sell_requisition_details_id', 'd_sub.id')
          .innerJoin(`${weTableName} as we_sub`, 'we_sub.id', 'dwe_sub.we_id')
          .modify(joinFn)
          .whereIn(`${alias}.work_order_number`, values);

      builder.where(function () {
        // Path 1: we_add_requisition_details
        this.whereIn('d2.id', makeWoSub('wad_s', qb => qb.innerJoin(`${weAddRequisitionDetailsTableName} as wad_s`, 'wad_s.id', 'we_sub.we_add_requisition_details_id')))
        // Path 2: we_reconciliation_requisition_details
        .orWhereIn('d2.id', makeWoSub('wrec_s', qb => qb
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName} as wrecdwe_s`, 'wrecdwe_s.we_id', 'we_sub.id')
          .innerJoin(`${weReconciliationRequisitionDetailsTableName} as wrec_s`, 'wrec_s.id', 'wrecdwe_s.we_reconcilition_requisition_details_id')))
        // Path 3: wd_dyeing_requisition_details
        .orWhereIn('d2.id', makeWoSub('wdd_s', qb => qb.innerJoin(`${wdDyeingRequisitionDetailsTableName} as wdd_s`, 'wdd_s.id', 'we_sub.wd_dyeing_requisition_details_id')))
        // Path 4: we_transition_between_wh_requisition_details
        .orWhereIn('d2.id', makeWoSub('wtbwh_s', qb => qb.innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName} as wtbwh_s`, 'wtbwh_s.id', 'we_sub.we_transition_between_wh_requisitions_details_id')))
        // Path 5: we_transition_between_orders_requisition_details
        .orWhereIn('d2.id', makeWoSub('wtbo_s', qb => qb.innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName} as wtbo_s`, 'wtbo_s.id', 'we_sub.we_transition_between_orders_requisitions_details_id')))
        // Path 6: we_return_sell_requisition_details
        .orWhereIn('d2.id', makeWoSub('wrsd_s', qb => qb.innerJoin(`${weReturnSellRequisitionDetailsTableName} as wrsd_s`, 'wrsd_s.id', 'we_sub.we_return_sell_requisition_details_id')));
      });
      return;
    }

    // الفلاتر التي تمر عبر we_sell_req_details_we -> we -> we_add_req_details (للدرجة فقط)
    if (spec.kind === 'we_color') {
      // اللون يأتي من 6 مسارات مختلفة
      const makeColorSub = (alias, joinFn, colorIdExpr) =>
        knex.distinct('d_sub.id')
          .from(`${weSellRequisitionDetailsTableName} as d_sub`)
          .innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe_sub`, 'dwe_sub.we_sell_requisition_details_id', 'd_sub.id')
          .innerJoin(`${weTableName} as we_sub`, 'we_sub.id', 'dwe_sub.we_id')
          .modify(joinFn)
          .innerJoin(`${colorTableName} as c_sub`, `c_sub.id`, colorIdExpr)
          .whereIn(`c_sub.${spec.column}`, values);

      builder.where(function () {
        // Path 1: we_add_requisition_details
        this.whereIn('d2.id', makeColorSub('wad_fs', qb => qb.innerJoin(`${weAddRequisitionDetailsTableName} as wad_fs`, 'wad_fs.id', 'we_sub.we_add_requisition_details_id'), 'wad_fs.color_id'))
        // Path 2: we_reconciliation_requisition_details
        .orWhereIn('d2.id', makeColorSub('wrec_fs', qb => qb
          .innerJoin(`${weReconciliationRequisitionDetailsWeTableName} as wrecdwe_fs`, 'wrecdwe_fs.we_id', 'we_sub.id')
          .innerJoin(`${weReconciliationRequisitionDetailsTableName} as wrec_fs`, 'wrec_fs.id', 'wrecdwe_fs.we_reconcilition_requisition_details_id'), 'wrec_fs.color_id'))
        // Path 3: wd_dyeing -> wd_form_dyeing -> anointed_colors_prices
        .orWhereIn('d2.id', makeColorSub('acp_fs', qb => qb
          .innerJoin(`${wdDyeingRequisitionDetailsTableName} as wdd_fs`, 'wdd_fs.id', 'we_sub.wd_dyeing_requisition_details_id')
          .innerJoin(`${wdFormDyeingRequisitionDetailsTableName} as wfd_fs`, 'wfd_fs.id', 'wdd_fs.wd_form_dyeing_requisition_details_id')
          .innerJoin(`${anointedColorsPricesTableName} as acp_fs`, 'acp_fs.id', 'wfd_fs.dyeing_colors_prices_id'), 'acp_fs.color_id'))
        // Path 4: we_transition_between_wh_requisition_details
        .orWhereIn('d2.id', makeColorSub('wtbwh_fs', qb => qb.innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName} as wtbwh_fs`, 'wtbwh_fs.id', 'we_sub.we_transition_between_wh_requisitions_details_id'), 'wtbwh_fs.color_id'))
        // Path 5: we_transition_between_orders_requisition_details
        .orWhereIn('d2.id', makeColorSub('wtbo_fs', qb => qb.innerJoin(`${weTransitionBetweenOrdersRequisitionDetailsTableName} as wtbo_fs`, 'wtbo_fs.id', 'we_sub.we_transition_between_orders_requisitions_details_id'), 'wtbo_fs.color_id'))
        // Path 6: we_return_sell_requisition_details
        .orWhereIn('d2.id', makeColorSub('wrsd_fs', qb => qb.innerJoin(`${weReturnSellRequisitionDetailsTableName} as wrsd_fs`, 'wrsd_fs.id', 'we_sub.we_return_sell_requisition_details_id'), 'wrsd_fs.color_id'));
      });
      return;
    }

    builder.innerJoin(`${weSellRequisitionDetailsWeTableName} as dwe`, 'dwe.we_sell_requisition_details_id', 'd2.id')
           .innerJoin(`${weTableName} as we`, 'we.id', 'dwe.we_id')
           .innerJoin(`${weAddRequisitionDetailsTableName} as wad`, 'wad.id', 'we.we_add_requisition_details_id');

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