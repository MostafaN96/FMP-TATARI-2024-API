// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { bussinessmanTableName, wcFabricOrderRequisitionDetailsTableName,
    wcFabricOrderRequisitionTableName,
    fabricTableName,
    wcAddRequisitionDetailsTableName,
    wcTableName,
    wcReconciliationRequisitionDetailsTableName,
    wcReconciliationRequisitionTableName,
    wcReconciliationRequisitionDetailsWcTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wdTransportRequisitionWdWcTableName,
    wbManufacturingOutputTableName,
    wcAddRequisitionDetailsFabricOrderTableName,
    wcAddRequisitionTableName,
    wcTransitionBetweenWHRequisitionDetailsTableName,
    wcTransitionBetweenWHRequisitionTableName,
    wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
    wcTransitionBetweenOrdersRequisitionDetailsTableName,
    wcTransitionBetweenOrdersRequisitionTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wcFabricOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(wcFabricOrderRequisitionTableName, {
            id: wcFabricOrderRequisition.id,
            parent_wc_fabric_order_requisition_id: wcFabricOrderRequisition.parentWcFabricOrderRequisitionId || wcFabricOrderRequisition.id,
            parent_orders_requisitions_id: wcFabricOrderRequisition.parentOrdersRequisitionsId || wcFabricOrderRequisition.ordersRequisitionsId,
            orders_requisitions_id: wcFabricOrderRequisition.ordersRequisitionsId,
            seller_id: wcFabricOrderRequisition.sellerId,
            number: wcFabricOrderRequisition.number,
            name: wcFabricOrderRequisition.name,
            date: wcFabricOrderRequisition.date,
            note: wcFabricOrderRequisition.note,
            creator_id: wcFabricOrderRequisition.personid,
            ip_address: wcFabricOrderRequisition.ipaddress,
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
        .limitedSelect(wcFabricOrderRequisitionTableName, [
            `${wcFabricOrderRequisitionTableName}.id`
        ], whereCluse, 1)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => {
            console.log(error);
        });

    return queryResults;
};

exports.select = async (whereCluse, isOrder, onlyParents = false) => {
    let queryResults = [];

    let query = knex(wcFabricOrderRequisitionTableName)
        .select([
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
            `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.is_parent`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.date`,
            `${wcFabricOrderRequisitionTableName}.note`,
            `${wcFabricOrderRequisitionTableName}.is_order`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${wcFabricOrderRequisitionTableName}.number`, 'desc')
        .whereIn(`${wcFabricOrderRequisitionTableName}.id`, function () {
            this.select(`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
                .from(`${wcFabricOrderRequisitionDetailsTableName}`)
                .where({ "is_order": isOrder })
        });

    if (onlyParents) {
        query = query.whereRaw(
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id = ${wcFabricOrderRequisitionTableName}.id`
        );
    }

    await query
        .then((data) => { queryResults = data; })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectStoredFabricsWc = async (whereCluseArray, isGreaterThanZero = 1) => {
    let queryResults = []
    let columns = [
        `orders_requisitions_id`,
        `id`,
        `name`,
        `number`,
        `is_parent`,
        `requisition_details_id`,
        `quantity`
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id as id`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.is_parent`,
            `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
            `${wcAddRequisitionDetailsTableName}.quantity`,
            `${wcTableName}.current_quantity`
        ])
            .from(`${wcTableName}`)
            .innerJoin(`${wcAddRequisitionDetailsTableName}`,
                `${wcAddRequisitionDetailsTableName}.id`,
                `${wcTableName}.wc_add_requisition_details_id`)
            .innerJoin(`${wcAddRequisitionDetailsFabricOrderTableName}`,
                `${wcAddRequisitionDetailsFabricOrderTableName}.wc_add_requisition_details_id`,
                `${wcAddRequisitionDetailsTableName}.id`)
            .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
                `${wcAddRequisitionDetailsFabricOrderTableName}.parent_wc_fabric_order_requisition_id`)
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
                    `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id as id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcFabricOrderRequisitionTableName}.is_parent`,
                    `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcReconciliationRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
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
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
                        `${wcReconciliationRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[1])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
                // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

            })
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id as id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcFabricOrderRequisitionTableName}.is_parent`,
                    `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
                    `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
                        `${wcTableName}.wd_transport_requisition_wd_wc_details_id`)
                    .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
                        `${wdTransportRequisitionWdWcTableName}.id`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.parent_wc_fabric_order_requisition_id`)
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
                    `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
                    `parent_wc_fabric_order_requisition.id as id`,
                    `parent_wc_fabric_order_requisition.name`,
                    `parent_wc_fabric_order_requisition.number`,
                    `${wcFabricOrderRequisitionTableName}.is_parent`,
                    `${wbManufacturingOutputTableName}.id as requisition_details_id`,
                    `${wbManufacturingOutputTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wbManufacturingOutputTableName}`,
                        `${wbManufacturingOutputTableName}.id`,
                        `${wcTableName}.wb_manufacturing_output_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`)
                        .innerJoin(`${wcFabricOrderRequisitionTableName} as parent_wc_fabric_order_requisition`,
                        `parent_wc_fabric_order_requisition.id`,
                        `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`)
                       
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
                    `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id as id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcFabricOrderRequisitionTableName}.is_parent`,
                    `${wcTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
                        `${wcTableName}.wc_transition_between_wh_requisitions_details_id`)
                    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
                        `${wcTransitionBetweenWHRequisitionTableName}.id`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
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
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.parent_orders_requisitions_id as orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id as id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcFabricOrderRequisitionTableName}.is_parent`,
                    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
                        `${wcTableName}.wc_transition_between_orders_requisitions_details_id`)
                    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
                        `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.parent_wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[5])
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
        .groupBy(`id`)
        // .whereIn(`id`, function () {
        //     this.select(`id`)
        //         .from(wcFabricOrderRequisitionTableName)
        //         .whereRaw(`${wcFabricOrderRequisitionTableName}.id = ${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`)
        //         .where({ is_deleted: 0, is_active: 1, is_parent: 1 })
        // })
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log("error :::: ", error);
            queryResults = constants.errorPayload
        })
    return queryResults
}

exports.update = async (wcFabricOrderRequisition, whereCluse, trx = null) => {
    let queryResults = false;
    await sqlFun
        .update(
            wcFabricOrderRequisitionTableName,
            wcFabricOrderRequisition,
            whereCluse,
            trx
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};

/**
 * جلب الطلبيات مع معلومات parent
 * يعرض الطلبيات الأساسية (parents) مع count الطلبيات المدموجة
 */
exports.selectWithParentInfo = async (whereCluse, isOrder) => {
    let queryResults = [];

    await knex(wcFabricOrderRequisitionTableName)
        .select([
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.date`,
            `${wcFabricOrderRequisitionTableName}.note`,
            `${wcFabricOrderRequisitionTableName}.is_order`,
            `${wcFabricOrderRequisitionTableName}.is_parent`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${wcFabricOrderRequisitionTableName}.number`, 'desc')
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    
    return queryResults;
};

/**
 * جلب الطلبيات المدموجة تحت parent معين
 */
exports.selectMergedOrders = async (parentOrderId) => {
    let queryResults = [];

    await knex(wcFabricOrderRequisitionTableName)
        .select([
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.date`,
            `${wcFabricOrderRequisitionTableName}.note`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.seller_id`
        )
        .where({
            [`${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`]: parentOrderId,
            [`${wcFabricOrderRequisitionTableName}.is_deleted`]: 0,
            [`${wcFabricOrderRequisitionTableName}.is_active`]: 1
        })
        .orderBy(`${wcFabricOrderRequisitionTableName}.number`, 'desc')
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    
    return queryResults;
};

/**
 * جلب جميع الطلبيات في مجموعة الدمج (الـ parent + جميع children)
 * إذا الطلبية مدموجة (is_parent=1 أو parent_id != id) تُرجع جميع أفراد المجموعة
 * إذا لم تكن مدموجة تُرجع مصفوفة فارغة
 * @param {string} orderId - id الطلبية الحالية
 * @returns {Array} - مصفوفة الطلبيات في المجموعة (بدون الطلبية الأصلية نفسها)
 */
exports.selectMergeGroupSiblings = async (orderId) => {
    let queryResults = [];
    // أولاً: اجلب بيانات الطلبية الحالية
    const current = await knex(wcFabricOrderRequisitionTableName)
        .select(
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.is_parent`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`
        )
        .where({ [`${wcFabricOrderRequisitionTableName}.id`]: orderId, [`${wcFabricOrderRequisitionTableName}.is_deleted`]: 0 })
        .first();

    if (!current) return queryResults;
    // إذا parent_id فارغ أو مساوٍ لـ own id وليست parent → طلبية مستقلة بدون دمج
    if (!current.parent_wc_fabric_order_requisition_id ||
        (current.is_parent != 1 && current.parent_wc_fabric_order_requisition_id === current.id)) {
        return queryResults;
    }

    // الـ parent الفعلي للمجموعة
    const groupParentId = (current.is_parent == 1)
        ? current.id
        : current.parent_wc_fabric_order_requisition_id;

    // جلب جميع أفراد المجموعة ماعدا الطلبية الحالية
    await knex(wcFabricOrderRequisitionTableName)
        .select(
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`
        )
        .where({
            [`${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`]: groupParentId,
            [`${wcFabricOrderRequisitionTableName}.is_deleted`]: 0,
            [`${wcFabricOrderRequisitionTableName}.is_active`]: 1,
        })
        .whereNot(`${wcFabricOrderRequisitionTableName}.id`, orderId)
        .then((data) => { queryResults = data; })
        .catch((error) => console.error(error));

    return queryResults;
};

/**
 * جلب جميع الطلبيات مع معلومات الدمج (فقط parent و regular orders، بدون children)
 * @param {object} whereCluse - شروط الاستعلام
 * @returns {Array} - مصفوفة الطلبيات مع معلومات الدمج
 */
exports.selectAllWithMergeInfo = async (whereCluse) => {
    let queryResults = [];

    try {
        // Build the main query
        const query = knex(wcFabricOrderRequisitionTableName + ' as o')
            .select([
                'o.id',
                'o.parent_wc_fabric_order_requisition_id',
                'o.orders_requisitions_id',
                'o.number',
                'o.name',
                'o.date',
                'o.note',
                'o.is_order',
                'o.is_parent',
                `${bussinessmanTableName}.name as seller_name`,
                `${bussinessmanTableName}.id as seller_id`,
                // عدد الطلبيات المدموجة (children + parent نفسه)
                knex.raw(`(
                    SELECT COUNT(*) 
                    FROM ${wcFabricOrderRequisitionTableName} c 
                    WHERE c.parent_wc_fabric_order_requisition_id = o.id
                    AND c.is_deleted = 0 
                    AND c.is_active = 1
                ) as merged_count`),
                // مجموع الكميات للطلبيات المدموجة
                knex.raw(`(
                    SELECT SUM(d.current_quantity) 
                    FROM ${wcFabricOrderRequisitionTableName} c
                    INNER JOIN ${wcFabricOrderRequisitionDetailsTableName} d 
                        ON c.id = d.wc_fabric_order_requisition_id
                    WHERE c.parent_wc_fabric_order_requisition_id = o.id
                    AND c.is_deleted = 0 
                    AND c.is_active = 1
                    AND d.is_deleted = 0 
                    AND d.is_active = 1
                ) as total_quantity`),
                // الكمية الحالية للطلبية نفسها
                knex.raw(`(
                    SELECT SUM(current_quantity) 
                    FROM ${wcFabricOrderRequisitionDetailsTableName} 
                    WHERE wc_fabric_order_requisition_id = o.id
                    AND is_deleted = 0 
                    AND is_active = 1
                ) as current_quantity`)
            ])
            .innerJoin(
                `${bussinessmanTableName}`,
                `${bussinessmanTableName}.id`,
                'o.seller_id'
            )
            .where(whereCluse)
            // فقط الطلبيات التي ليست children (parent_id IS NULL أو parent_id = id)
            .where(function() {
                this.whereNull('o.parent_wc_fabric_order_requisition_id')
                    .orWhereRaw('o.parent_wc_fabric_order_requisition_id = o.id');
            })
            .orderBy('o.date', 'desc')
            .orderBy('o.number', 'desc');

        queryResults = await query;

    } catch (error) {
        console.error('Error in selectAllWithMergeInfo:', error);
    }

    return queryResults;
};
