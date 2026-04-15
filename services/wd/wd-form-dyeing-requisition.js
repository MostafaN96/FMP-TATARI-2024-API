// Services
const wdFormDyeingRequisitionDetailsService = require("./wd-form-dyeing-requisition-details");
const wdService = require("./wd");

// Queries
const wdFormDyeingRequisitionQueries = require("../../db/queries/wd/wd-form-dyeing-requisition");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdFormDyeingRequisitionTableName = require("../../util/database-tables-name").wdFormDyeingRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");
const { wcFabricOrderRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsTableName, bussinessmanTableName, wcFabricOrderRequisitionTableName, fabricTableName, anointedColorsPricesTableName, colorTableName } = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

exports.create = async (wdFormDyeingRequisition) => {
    wdFormDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdFormDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdFormDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdFormDyeingRequisitionQueries.selectOne({ number: wdFormDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // check work_order_number duplicate
    let results = false
    for (let k = 0; k < wdFormDyeingRequisition.items.length; k++) {
        const element = wdFormDyeingRequisition.items[k];

        const checkValidWorkOrderNumberResult = await wdFormDyeingRequisitionDetailsService.selectBy(function () {
            this.where(`${wdFormDyeingRequisitionDetailsTableName}.work_order_number`, "=", element.workOrderNumberDetails)
                .andWhere(`${wdFormDyeingRequisitionTableName}.id`, "<>", wdFormDyeingRequisition.id);
        })
        results = checkValidWorkOrderNumberResult

        if (Array.isArray(checkValidWorkOrderNumberResult) && checkValidWorkOrderNumberResult.length < 1) {
            if (k == wdFormDyeingRequisition.items.length - 1) {
                results = await wdFormDyeingRequisitionQueries.insert(wdFormDyeingRequisition);
                if (results) {
                    return await wdFormDyeingRequisitionDetailsService.create(wdFormDyeingRequisition);
                } else {
                    return constants.insertError;
                }
            }
        } else {
            return results = constants.duplicatedData;
        }
    }

    // results = await wdFormDyeingRequisitionQueries.insert(wdFormDyeingRequisition);
    // if (results) {
    //     return await wdFormDyeingRequisitionDetailsService.create(wdFormDyeingRequisition);
    // } else {
    //     return constants.insertError;
    // }

};

exports.createForOrder = async (wdFormDyeingRequisition) => {
    wdFormDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdFormDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdFormDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdFormDyeingRequisitionQueries.selectOne({ number: wdFormDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Ordered Quantity
    let insertFlag = true
    for (let i = 0; i < wdFormDyeingRequisition.items.length; i++) {
        const element = wdFormDyeingRequisition.items[i];

        const selectOneOrderedQuantity = await wdDyeingRequisitionDetailsQueries.selectOne({ id: element.wdFormDyeingOrderRequisitionDetailsId })
        if (selectOneOrderedQuantity[0] != null) {
            if (parseFloat(element.quantity) > selectOneOrderedQuantity[0].form_current_quantity) {
                insertFlag = false;
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: selectOneOrderedQuantity[0].form_current_quantity,
                    newQuantity: element.quantity
                }
            }
        }
        if (i == wdFormDyeingRequisition.items.length - 1 && insertFlag) {
            const results = await wdFormDyeingRequisitionQueries.insertForOrder(wdFormDyeingRequisition);
            if (results) {
                return await wdFormDyeingRequisitionDetailsService.createForOrder(wdFormDyeingRequisition);
            } else {
                return constants.insertError;
            }
        }
    }


};

exports.select = async () => {
    const results = await wdFormDyeingRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wdFormDyeingRequisitionDetailsService.selectByRequisitionId(element.id)
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
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_deleted`] = 0;
  whereCluse[`${wdFormDyeingRequisitionTableName}.is_active`] = 1;

  // ===============================
  // Helpers for Cascading Filters
  // ===============================
  const omitFilter = (fm, excludeColId) => {
    const out = {};
    Object.keys(fm || {}).forEach(k => {
      if (k !== excludeColId) out[k] = fm[k];
    });
    return out;
  };

  const buildBaseWithFiltersExcept = (excludeColId) => {
    const qb = wdFormDyeingRequisitionQueries.selectLazy(whereCluse);
    applyAgGridFilters(qb, omitFilter(filterModel, excludeColId));
    return qb;
  };

  // ===============================
  // 1) Base Query
  // ===============================
  const base = wdFormDyeingRequisitionQueries.selectLazy(whereCluse);

  // ===============================
  // 2) Apply Filters from AG Grid
  // ===============================
  applyAgGridFilters(base, filterModel);

  // ===============================
  // 3) Total Rows (بعد الفلترة)
  // ===============================
  const totalRowRes = await base
    .clone()
    .clearSelect()
    .clearOrder()
    .clear('group')
    .countDistinct({ total: `${wdFormDyeingRequisitionTableName}.id` })
    .first();

  const totalRows = Number(totalRowRes?.total || 0);

  // ===============================
  // 3.5) Available Filter Values (Cascading)
  // ===============================
  const availableFilters = {};

  // ✅ المصبغة (استثني فلتر dyeing_name نفسه)
  availableFilters.dyeing_name = await buildBaseWithFiltersExcept('dyeing_name')
    .clearSelect()
    .clearOrder()
    .clear('group')
    .distinct(`${bussinessmanTableName}.name as value`)
    .then(r => r.map(x => x.value));

  // ✅ رقم الطلب (استثني فلتر work_order_number نفسه)
  availableFilters.work_order_number = await buildBaseWithFiltersExcept('work_order_number')
    .clearSelect()
    .clearOrder()
    .clear('group')
    .distinct(`${wdFormDyeingRequisitionTableName}.work_order_number as value`)
    .then(r => r.map(x => x.value));

  // ✅ الطلبية الأم
  availableFilters.parent_wc_fabric_order_requisition_name = await buildBaseWithFiltersExcept('parent_wc_fabric_order_requisition_name')
    .clearSelect()
    .clearOrder()
    .clear('group')
    .distinct(`parent_wc_order.name as value`)
    .then(r => r.map(x => x.value));

  // ===== DETAILS FILTERS =====

  // ✅ نوع القماش details_fabric (استثني فلتر details_fabric نفسه)
  const baseExceptDetailsFabric = buildBaseWithFiltersExcept('details_fabric');
  availableFilters.details_fabric = await knex
    .distinct('df.name as value')
    .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`)
    .innerJoin(`${fabricTableName} as df`, 'df.id', 'd2.dyed_fabric_id')
    .whereIn(
      'd2.wd_form_dyeing_requisition_id',
      baseExceptDetailsFabric.clone().clearSelect().select(`${wdFormDyeingRequisitionTableName}.id`)
    )
    .then(r => r.map(x => x.value));

  // ✅ أمر الشغل details_work_order (موجود بجدول details)
  const baseExceptDetailsWO = buildBaseWithFiltersExcept('details_work_order');
  availableFilters.details_work_order = await knex
    .distinct(`d2.work_order_number as value`)
    .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`)
    .whereIn(
      'd2.wd_form_dyeing_requisition_id',
      baseExceptDetailsWO.clone().clearSelect().select(`${wdFormDyeingRequisitionTableName}.id`)
    )
    .then(r => r.map(x => x.value));

  // ✅ كود القماش details_fabric_code (من جدول fabric)
  const baseExceptFabricCode = buildBaseWithFiltersExcept('details_fabric_code');
  availableFilters.details_fabric_code = await knex
    .distinct(`dyed_fabric.code as value`)
    .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`)
    .innerJoin(`${fabricTableName} as dyed_fabric`, 'dyed_fabric.id', 'd2.dyed_fabric_id')
    .whereIn(
      'd2.wd_form_dyeing_requisition_id',
      baseExceptFabricCode.clone().clearSelect().select(`${wdFormDyeingRequisitionTableName}.id`)
    )
    .then(r => r.map(x => x.value));

  // ✅ اللون details_color (details -> anointedColorsPrices -> color)
  const baseExceptColor = buildBaseWithFiltersExcept('details_color');
  availableFilters.details_color = await knex
    .distinct(`c.name as value`)
    .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`)
    .innerJoin(`${anointedColorsPricesTableName} as ap`, 'ap.id', 'd2.dyeing_colors_prices_id')
    .innerJoin(`${colorTableName} as c`, 'c.id', 'ap.color_id')
    .whereIn(
      'd2.wd_form_dyeing_requisition_id',
      baseExceptColor.clone().clearSelect().select(`${wdFormDyeingRequisitionTableName}.id`)
    )
    .then(r => r.map(x => x.value));

  // ===============================
  // 4) Grand Total Quantity (للفوتر)
  // ===============================
  const grandTotalRes = await base
    .clone()
    .clearSelect()
    .clearOrder()
    .clear('group')
    .sum({ grandTotalDetailsQty: `${wdFormDyeingRequisitionDetailsTableName}.quantity` })
    .first();

  const grandTotalDetailsQty = Number(grandTotalRes?.grandTotalDetailsQty || 0);

  // ===============================
  // 5) Apply Sort
  // ===============================
  if (sortModel.length) {
    base.clearOrder();
    applyAgGridSort(base, sortModel);
  }

  // ===============================
  // 6) Page Data
  // ===============================
  const pageRows = await base
    .clone()
    .offset(startRow)
    .limit(pageSize);

  // ===============================
  // 7) Load details only for page ids
  // ===============================
  const ids = pageRows.map(r => r.id).filter(Boolean);
  const detailsMap = await wdFormDyeingRequisitionDetailsService.selectByRequisitionIds(ids);

  const rows = pageRows.map(r => ({
    ...r,
    details: detailsMap[r.id] || [],
  }));

  // ===============================
  // 8) lastRow (AG Grid requirement)
  // ===============================
  const lastRow = (startRow + pageSize) >= totalRows ? totalRows : -1;

  // ===============================
  // 9) Final Response
  // ===============================
  return {
    rows,
    lastRow,
    totalRows,
    grandTotalDetailsQty,
    availableFilters,
  };
};


// فلترة AG Grid (Text / Set / Number / Date)
function applyAgGridFilters(qb, filterModel) {

  const mapField = (colId) => {
    const m = {
      number: `${wdFormDyeingRequisitionTableName}.number`,
      date: `${wdFormDyeingRequisitionTableName}.date`,
      dyeing_name: `${bussinessmanTableName}.name`,
      work_order_number: `${wdFormDyeingRequisitionTableName}.work_order_number`,
      parent_wc_fabric_order_requisition_name: `parent_wc_order.name`,
      note: `${wdFormDyeingRequisitionTableName}.note`,
    };
    return m[colId];
  };

  // ✅ خريطة فلاتر التفاصيل (DB columns حقيقية)
const detailsFilterMap = {
  // موجودة مباشرة بجدول التفاصيل
  details_work_order: { kind: 'direct', column: 'work_order_number' },

  // موجودة بجدول fabric (alias dyed_fabric)
  details_fabric_code: { kind: 'dyed_fabric', column: 'code' },
  details_fabric:      { kind: 'dyed_fabric', column: 'name' },

  // موجودة بجدول color (عن طريق anointedColorsPrices)
  details_color:       { kind: 'color', column: 'name' },
};

  Object.keys(filterModel || {}).forEach((colId) => {
    const f = filterModel[colId];

    // ===============================
    // ✅ فلاتر DETAILS (المخفية)
    // ===============================
const spec = detailsFilterMap[colId];
if (spec) {
  applyDetailsIdsFilter(qb, f, spec);
  return;
}

    const dbField = mapField(colId);
    if (!dbField) return;

    // ===============================
    // Text Filter
    // ===============================
    if (f.filterType === 'text') {
      const val = (f.filter ?? '').toString().trim();
      if (!val) return;

      if (f.type === 'contains') qb.andWhere(dbField, 'like', `%${val}%`);
      else if (f.type === 'equals') qb.andWhere(dbField, val);
      else if (f.type === 'startsWith') qb.andWhere(dbField, 'like', `${val}%`);
      else if (f.type === 'endsWith') qb.andWhere(dbField, 'like', `%${val}`);
      else qb.andWhere(dbField, 'like', `%${val}%`);
    }

    // ===============================
    // Set Filter
    // ===============================
    if (f.filterType === 'set') {
      const values =
        Array.isArray(f.values) ? f.values :
        Array.isArray(f.value) ? f.value : [];

      if (values.length) qb.whereIn(dbField, values);
    }

    // ===============================
    // Number Filter
    // ===============================
    if (f.filterType === 'number') {
      const n = Number(f.filter);
      if (!Number.isFinite(n)) return;

      if (f.type === 'equals') qb.andWhere(dbField, n);
      else if (f.type === 'greaterThan') qb.andWhere(dbField, '>', n);
      else if (f.type === 'lessThan') qb.andWhere(dbField, '<', n);
      else if (f.type === 'greaterThanOrEqual') qb.andWhere(dbField, '>=', n);
      else if (f.type === 'lessThanOrEqual') qb.andWhere(dbField, '<=', n);
    }

    // ===============================
    // Date Filter
    // ===============================
    if (f.filterType === 'date') {
      const d = f.dateFrom;
      if (!d) return;

      if (f.type === 'equals') qb.andWhereRaw(`DATE(${dbField}) = ?`, [d]);
      else if (f.type === 'greaterThan') qb.andWhereRaw(`DATE(${dbField}) > ?`, [d]);
      else if (f.type === 'lessThan') qb.andWhereRaw(`DATE(${dbField}) < ?`, [d]);
      else qb.andWhereRaw(`DATE(${dbField}) = ?`, [d]);
    }
  });
}

function applyDetailsIdsFilter(qb, filterObj, spec) {
  if (!filterObj || !spec) return;

  const getValues = () => {
    const values =
      Array.isArray(filterObj.values) ? filterObj.values :
      Array.isArray(filterObj.value) ? filterObj.value : [];
    return values.filter(v => v !== null && v !== undefined && v !== '');
  };

  // AND + whereIn (متوافق مع نسختك)
  const andWhereInIds = (subQueryBuilderFn) => {
    qb.andWhere(function () {
      this.whereIn(`${wdFormDyeingRequisitionTableName}.id`, subQueryBuilderFn);
    });
  };

  // يبني subquery حسب نوع الفلتر
  const buildSubQuery = (builder, values) => {
    builder.select('d2.wd_form_dyeing_requisition_id')
      .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`);

    // ===== direct fields in details table =====
    if (spec.kind === 'direct') {
      builder.whereIn(`d2.${spec.column}`, values);
      return;
    }

    // ===== dyed_fabric join (fabric as dyed_fabric) =====
    if (spec.kind === 'dyed_fabric') {
      builder
        .innerJoin(`${fabricTableName} as dyed_fabric`, 'dyed_fabric.id', 'd2.dyed_fabric_id')
        .whereIn(`dyed_fabric.${spec.column}`, values);
      return;
    }

    // ===== color join (details -> anointedColorsPrices -> color) =====
    if (spec.kind === 'color') {
      builder
        .innerJoin(`${anointedColorsPricesTableName} as ap`, 'ap.id', 'd2.dyeing_colors_prices_id')
        .innerJoin(`${colorTableName} as c`, 'c.id', 'ap.color_id')
        .whereIn(`c.${spec.column}`, values);
      return;
    }
  };

  // ===============================
  // ✅ Set Filter
  // ===============================
  if (filterObj.filterType === 'set') {
    const values = getValues();
    if (!values.length) return;

    andWhereInIds(function () {
      buildSubQuery(this, values);
    });

    return;
  }

  // ===============================
  // ✅ Text Filter (اختياري)
  // ===============================
  if (filterObj.filterType === 'text') {
    const val = (filterObj.filter ?? '').toString().trim();
    if (!val) return;

    // Text على join columns: نستخدم LIKE
    andWhereInIds(function () {
      this.select('d2.wd_form_dyeing_requisition_id')
        .from(`${wdFormDyeingRequisitionDetailsTableName} as d2`);

      if (spec.kind === 'direct') {
        this.where(`d2.${spec.column}`, 'like', `%${val}%`);
      } else if (spec.kind === 'dyed_fabric') {
        this.innerJoin(`${fabricTableName} as dyed_fabric`, 'dyed_fabric.id', 'd2.dyed_fabric_id')
          .where(`dyed_fabric.${spec.column}`, 'like', `%${val}%`);
      } else if (spec.kind === 'color') {
        this.innerJoin(`${anointedColorsPricesTableName} as ap`, 'ap.id', 'd2.dyeing_colors_prices_id')
          .innerJoin(`${colorTableName} as c`, 'c.id', 'ap.color_id')
          .where(`c.${spec.column}`, 'like', `%${val}%`);
      }
    });
  }
}



function applyAgGridSort(qb, sortModel) {
  const mapField = (colId) => {
    const m = {
      number: `${wdFormDyeingRequisitionTableName}.number`,
      date: `${wdFormDyeingRequisitionTableName}.date`,
      dyeing_name: `${bussinessmanTableName}.name`,
      work_order_number: `${wdFormDyeingRequisitionTableName}.work_order_number`,
      parent_wc_fabric_order_requisition_name: `parent_wc_order.name`,
    };
    return m[colId];
  };

  (sortModel || []).forEach((s) => {
    const field = mapField(s.colId);
    if (!field) return;
    const dir = (s.sort === 'asc') ? 'asc' : 'desc';
    qb.orderBy(field, dir);
  });
}


// exports.checkValidQuantityInWd = async (data, item) => {
//     const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(data.dyeingId, item.fabricId, item.consigmentDyeingId)
//     if (sumCurrentQuantityWd[0] != null) {
//         const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
//         if (sumCurrentQuantity >= item.quantity) {
//             return true
//         } else {
//             return {
//                 ...constants.wrongQuantity,
//                 spentQuantity: sumCurrentQuantity,
//                 newQuantity: item.quantity
//             }
//         }
//     }
// };

