// Services
const wbManufacturingInputService = require("./wb-manufacturing-input");
const wbManufacturingOutputService = require("./wb-manufacturing-output");

// Database
const db = require("../../db/config/connection").getConnection();

// Queries
const wbManufacturingRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-requisition");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const {
    wbManufacturingRequisitionTableName,
    bussinessmanTableName,
    fabricTableName,
    wbManufacturingInputOutputTableName,
    wbManufacturingOutputTableName,
    wcFabricOrderRequisitionTableName,
    wbManufacturingOrderRequisitionTableName,
    circularKnittingMachineTableName,
    consigmentManufacturingTableName,
    wcTableName,
} = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbManufacturingRequisition) => {
    const trx = await db.transaction();
    try {
        wbManufacturingRequisition.id = trans.transform();

        // Select Max Number Of Requisition
        const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingRequisitionTableName, { number: 'number' })
        if (selectMaxRequisitionNumber[0].number == null) {
            selectMaxRequisitionNumber[0].number = 0
        }
        wbManufacturingRequisition.number = selectMaxRequisitionNumber[0].number + 1

        // Check Duplication Data
        const selectOneResult = await wbManufacturingRequisitionQueries.selectOne({ number: wbManufacturingRequisition.number });
        if (selectOneResult[0] != null) {
            await trx.rollback();
            return constants.duplicatedData;
        }

        const results = await wbManufacturingRequisitionQueries.insert(wbManufacturingRequisition);
        if (results) {
            // إنشاء المدخلات والمخرجات والتخصيص (كل شيء في wb-manufacturing-input.js)
            const inputResult = await wbManufacturingInputService.create(wbManufacturingRequisition, 0, trx);
            
            // Commit التراجعة
            await trx.commit();
            
            return {
                status: 200,
                message: "تم الإنشاء بنجاح",
                ...inputResult
            };
        } else {
            await trx.rollback();
            return constants.insertError;
        }
    } catch (error) {
        await trx.rollback();
        console.error("خطأ في create:", error);
        return {
            status: 500,
            message: "خطأ في الخادم",
            error: error.message
        };
    }
};

exports.createForOrder = async (wbManufacturingRequisition) => {
    const trx = await db.transaction();
    try {
        wbManufacturingRequisition.id = trans.transform();

        // Select Max Number Of Requisition
        const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingRequisitionTableName, { number: 'number' })
        if (selectMaxRequisitionNumber[0].number == null) {
            selectMaxRequisitionNumber[0].number = 0
        }
        wbManufacturingRequisition.number = selectMaxRequisitionNumber[0].number + 1

        // Check Duplication Data
        const selectOneResult = await wbManufacturingRequisitionQueries.selectOne({ number: wbManufacturingRequisition.number });
        if (selectOneResult[0] != null) {
            await trx.rollback();
            return constants.duplicatedData;
        }

        const results = await wbManufacturingRequisitionQueries.insertForOrder(wbManufacturingRequisition);
        if (results) {
            // إنشاء المدخلات والمخرجات والتخصيص (كل شيء في wb-manufacturing-input.js)
            const inputResult = await wbManufacturingInputService.create(wbManufacturingRequisition, 1, trx);
            
            // Commit التراجعة
            await trx.commit();
            
            return {
                status: 200,
                message: "تم الإنشاء بنجاح",
                ...inputResult
            };
        } else {
            await trx.rollback();
            return constants.insertError;
        }
    } catch (error) {
        await trx.rollback();
        console.error("خطأ في createForOrder:", error);
        return {
            status: 500,
            message: "خطأ في الخادم",
            error: error.message
        };
    }
};

exports.select = async () => {
    let results = await wbManufacturingRequisitionQueries.select();
    if (Array.isArray(results) && results.length > 0) {
        for (let j = 0; j < results.length; j++) {
            let selectWbManufacturingRequisition = results[j];

            let selectManufacturingOutputByRequisitionId = await wbManufacturingOutputService.selectByRequisitionId(selectWbManufacturingRequisition.id)
            selectWbManufacturingRequisition.details = selectManufacturingOutputByRequisitionId[0];
        }
    }
    return results;
  };

exports.selectOrders = async () => {
    let results = await wbManufacturingRequisitionQueries.selectOrders();
    if (Array.isArray(results) && results.length > 0) {
        for (let j = 0; j < results.length; j++) {
            let selectWbManufacturingRequisition = results[j];

            let selectManufacturingOutputByRequisitionId = await wbManufacturingOutputService.selectByRequisitionIdForOrder(selectWbManufacturingRequisition.id)
            selectWbManufacturingRequisition.details = selectManufacturingOutputByRequisitionId[0];
        }
    }
    return results;
  };
  
function applyAgGridFilters(qb, filterModel) {
    if (!filterModel) return;

    const colMap = {
        number:                         `${wbManufacturingRequisitionTableName}.number`,
        date:                           `${wbManufacturingRequisitionTableName}.date`,
        manufacture_name:               `${bussinessmanTableName}.name`,
        fabric_code:                    `${fabricTableName}.code`,
        fabric_name:                    `${fabricTableName}.name`,
        wc_fabric_order_requisition_name: `${wcFabricOrderRequisitionTableName}.name`,
        order_number:                   `${wbManufacturingOrderRequisitionTableName}.number`,
        document:                       `${wbManufacturingOutputTableName}.document`,
        note:                           `${wbManufacturingRequisitionTableName}.note`,
        seller_name:                    `seller.name`,
        consigment_number:              `${consigmentManufacturingTableName}.number`,
        quantity:                       `${wbManufacturingOutputTableName}.quantity`,
    };

    for (const [colId, filter] of Object.entries(filterModel)) {
        if (!filter) continue;

        if (filter.filterType === 'set') {
            const values = Array.isArray(filter.values) ? filter.values : [];
            if (!values.length) continue;
            if (colId === 'status_name') {
                const map = { 'غير مفحوص': 'new', 'مقبول بعد الفحص': 'good_after_check', 'غير مقبول': 'not_good_after_check', 'ابيض': 'white' };
                const mapped = values.map(v => map[v]).filter(Boolean);
                if (mapped.length) qb.whereIn(`${wbManufacturingRequisitionTableName}.status`, mapped);
            } else if (colId === 'is_approved_status_name') {
                const map = { 'تم الاستلام': '1', 'لم يتم الاستلام': '0' };
                const mapped = values.map(v => map[v]).filter(Boolean);
                if (mapped.length) qb.whereIn(`${wbManufacturingOutputTableName}.is_approved`, mapped);
            } else if (colId === 'manufacture_name') {
                qb.whereIn(`${bussinessmanTableName}.name`, values);
            } else if (colId === 'seller_name') {
                qb.whereIn(`seller.name`, values);
            } else if (colId === 'fabric_code') {
                qb.whereIn(`${fabricTableName}.code`, values);
            } else if (colId === 'fabric_name') {
                qb.whereIn(`${fabricTableName}.name`, values);
            } else if (colId === 'wc_fabric_order_requisition_name') {
                qb.whereIn(`${wcFabricOrderRequisitionTableName}.name`, values);
            } else if (colId === 'order_number') {
                qb.whereIn(`${wbManufacturingOrderRequisitionTableName}.number`, values);
            } else if (colId === 'consigment_number') {
                qb.whereIn(`${consigmentManufacturingTableName}.number`, values);
            } else if (colId === 'note') {
                qb.whereIn(`${wbManufacturingRequisitionTableName}.note`, values);
            } else if (colId === 'circular_knitting_machine_name') {
                const placeholders = values.map(() => '?').join(', ');
                qb.whereRaw(`CONCAT(${circularKnittingMachineTableName}.type, ' - طراز (', ${circularKnittingMachineTableName}.model, ')') IN (${placeholders})`, values);
            } else if (colId === 'storage_place') {
                qb.whereIn(`${wcTableName}.storage_place`, values);
            } else if (colId === 'document') {
                qb.whereIn(`${wbManufacturingOutputTableName}.document`, values);
            } else if (colId === 'quantity') {
                qb.whereIn(`${wbManufacturingOutputTableName}.quantity`, values.map(Number));
            }
            continue;
        }

        const dbCol = colMap[colId];

        if (filter.filterType === 'text') {
            const val = filter.filter || '';
            const type = filter.type || 'contains';
            let like = `%${val}%`;
            if (type === 'equals')     like = val;
            else if (type === 'startsWith') like = `${val}%`;
            else if (type === 'endsWith')   like = `%${val}`;
            else if (type === 'notContains') {
                if (colId === 'circular_knitting_machine_name') {
                    qb.andWhereRaw(`CONCAT(${circularKnittingMachineTableName}.type, ' - طراز (', ${circularKnittingMachineTableName}.model, ')') NOT LIKE ?`, [`%${val}%`]);
                } else if (dbCol) {
                    qb.whereNot(dbCol, 'like', `%${val}%`);
                }
                continue;
            }
            if (colId === 'circular_knitting_machine_name') {
                qb.andWhereRaw(`CONCAT(${circularKnittingMachineTableName}.type, ' - طراز (', ${circularKnittingMachineTableName}.model, ')') LIKE ?`, [like]);
            } else if (dbCol) {
                qb.where(dbCol, 'like', like);
            }
        } else if (filter.filterType === 'number' && dbCol) {
            const v = filter.filter;
            const type = filter.type || 'equals';
            if (type === 'equals')              qb.where(dbCol, '=', v);
            else if (type === 'greaterThan')    qb.where(dbCol, '>', v);
            else if (type === 'greaterThanOrEqual') qb.where(dbCol, '>=', v);
            else if (type === 'lessThan')       qb.where(dbCol, '<', v);
            else if (type === 'lessThanOrEqual') qb.where(dbCol, '<=', v);
            else if (type === 'notEqual')       qb.where(dbCol, '!=', v);
            else if (type === 'inRange')        qb.whereBetween(dbCol, [v, filter.filterTo]);
        } else if (filter.filterType === 'date' && dbCol) {
            const from = filter.dateFrom ? filter.dateFrom.split(' ')[0] : '';
            const type = filter.type || 'equals';
            if (type === 'equals')          qb.whereRaw(`DATE(${dbCol}) = ?`, [from]);
            else if (type === 'greaterThan') qb.whereRaw(`DATE(${dbCol}) > ?`, [from]);
            else if (type === 'lessThan')    qb.whereRaw(`DATE(${dbCol}) < ?`, [from]);
            else if (type === 'inRange') {
                const to = filter.dateTo ? filter.dateTo.split(' ')[0] : from;
                qb.whereRaw(`DATE(${dbCol}) BETWEEN ? AND ?`, [from, to]);
            }
        }
    }
}

function applyAgGridSort(qb, sortModel) {
    const colMap = {
        number:           `${wbManufacturingRequisitionTableName}.number`,
        date:             `${wbManufacturingRequisitionTableName}.date`,
        manufacture_name: `${bussinessmanTableName}.name`,
        fabric_code:      `${fabricTableName}.code`,
        fabric_name:      `${fabricTableName}.name`,
        seller_name:      `seller.name`,
        quantity:         `${wbManufacturingOutputTableName}.quantity`,
        fabric_piece:     `${wbManufacturingOutputTableName}.fabric_piece`,
        current_quantity: `${wcTableName}.current_quantity`,
    };
    if (sortModel && sortModel.length > 0) {
        for (const sort of sortModel) {
            const col = colMap[sort.colId];
            if (col) qb.orderBy(col, sort.sort === 'desc' ? 'desc' : 'asc');
        }
    } else {
        qb.orderBy(`${wbManufacturingRequisitionTableName}.number`, 'desc');
    }
}

exports.selectAllLazy = async (payload) => {
    const startRow  = Number(payload.startRow  || 0);
    const endRow    = Number(payload.endRow    || 50);
    const pageSize  = Math.max(1, endRow - startRow);
    const sortModel   = Array.isArray(payload.sortModel)   ? payload.sortModel   : [];
    const filterModel = payload.filterModel || {};

    const whereCluse = {
        [`${wbManufacturingRequisitionTableName}.is_deleted`]: 0,
        [`${wbManufacturingRequisitionTableName}.is_active`]:  1,
    };

    const base = wbManufacturingRequisitionQueries.selectLazy(whereCluse);
    applyAgGridFilters(base, filterModel);

    // total count (wrap grouped query as subquery to get row count)
    const countResult = await db.from(
        base.clone().clearSelect().clearOrder().select(`${wbManufacturingRequisitionTableName}.id`).as('cnt_sub')
    ).count('* as cnt');
    const totalRows = Number(countResult[0]?.cnt ?? 0);

    // available set-filter values
    const buildExcept = (excludeColId) => {
        const b = wbManufacturingRequisitionQueries.selectLazy(whereCluse);
        const reduced = { ...filterModel };
        delete reduced[excludeColId];
        applyAgGridFilters(b, reduced);
        return b;
    };

    // Wrap the grouped base query as a subquery and select DISTINCT from outside.
    // This avoids ONLY_FULL_GROUP_BY conflicts for columns not in the GROUP BY clause.
    const getDistinct = async (excludeColId, colAlias) => {
        const rows = await db.from(
            buildExcept(excludeColId).clone().clearOrder().as('sub')
        ).distinct(colAlias).whereNotNull(colAlias);
        return rows.map(r => r[colAlias]).filter(x => x != null && x !== '');
    };

    const [
        manufNames, sellerNames, fabricCodes, fabricNames,
        wcOrderNames, orderNumbers, consigmentNumbers, machineNames, notes,
        storagePlaces, documents, quantities,
    ] = await Promise.all([
        getDistinct('manufacture_name',               'manufacture_name'),
        getDistinct('seller_name',                    'seller_name'),
        getDistinct('fabric_code',                    'fabric_code'),
        getDistinct('fabric_name',                    'fabric_name'),
        getDistinct('wc_fabric_order_requisition_name', 'wc_fabric_order_requisition_name'),
        getDistinct('order_number',                   'order_number'),
        getDistinct('consigment_number',              'consigment_number'),
        getDistinct('circular_knitting_machine_name', 'circular_knitting_machine_name'),
        getDistinct('note',                           'note'),
        getDistinct('storage_place',                  'storage_place'),
        getDistinct('document',                       'document'),
        getDistinct('quantity',                       'quantity'),
    ]);

    const availableFilters = {
        manufacture_name:               manufNames,
        seller_name:                    sellerNames,
        fabric_code:                    fabricCodes,
        fabric_name:                    fabricNames,
        wc_fabric_order_requisition_name: wcOrderNames,
        order_number:                   orderNumbers.map(String),
        consigment_number:              consigmentNumbers.map(String),
        circular_knitting_machine_name: machineNames,
        note:                           notes,
        storage_place:                  storagePlaces,
        document:                       documents,
        quantity:                       quantities.map(String),
        status_name:                    ['غير مفحوص', 'مقبول بعد الفحص', 'غير مقبول', 'ابيض'],
        is_approved_status_name:        ['تم الاستلام', 'لم يتم الاستلام'],
    };

    // grand totals
    const filteredIds = base.clone().clearSelect().clearOrder().select(`${wbManufacturingRequisitionTableName}.id`);
    const [totals] = await db(wbManufacturingOutputTableName)
        .innerJoin(wbManufacturingInputOutputTableName,
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
        .innerJoin(wcTableName,
            `${wcTableName}.wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.id`)
        .sum({ grand_fabric_piece:     `${wbManufacturingOutputTableName}.fabric_piece` })
        .sum({ grand_quantity:         `${wbManufacturingOutputTableName}.quantity` })
        .sum({ grand_current_quantity: `${wcTableName}.current_quantity` })
        .whereIn(`${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`, filteredIds);

    // sort + paginate
    applyAgGridSort(base, sortModel);
    const rows = await base.clone().offset(startRow).limit(pageSize);
    const lastRow = (startRow + pageSize) >= totalRows ? totalRows : -1;

    return {
        rows,
        lastRow,
        totalRows,
        grandFabricPiece:    Number(totals?.grand_fabric_piece    ?? 0),
        grandQuantity:       Number(totals?.grand_quantity        ?? 0),
        grandCurrentQuantity: Number(totals?.grand_current_quantity ?? 0),
        availableFilters,
    };
};

exports.update = async (wbManufacturingInput) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${wbManufacturingRequisitionTableName}.id`] = wbManufacturingInput.id;
    whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;
    const isFound = await wbManufacturingRequisitionQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
  
        // updated
        const updateResults = await wbManufacturingRequisitionQueries.update({
            date: wbManufacturingInput.date,
            note: wbManufacturingInput.note,
            status: wbManufacturingInput.status
        }, {
            id: wbManufacturingInput.id
        });
        if (updateResults) {
          return constants.updateSuccess;
        } else {
          return constants.updateError;
        }
    } else {
      return constants.itemNotFound;
    }
  };