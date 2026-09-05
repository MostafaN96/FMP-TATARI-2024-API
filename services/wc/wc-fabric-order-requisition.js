// Services
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");
const wcReportService = require("./wc-report");
const ordersRequisitionsService = require("../general/orders-requisitions");

// Queries
const wcFabricOrderRequisitionQueries = require("../../db/queries/wc/wc-fabric-order-requisition");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const wdQueries = require("../../db/queries/wd/wd");
const generalQueries = require("../../db/queries/general/general");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcFabricOrderRequisitionTableName, 
    wcFabricOrderRequisitionDetailsTableName, 
    weDyedFabricOrderRequisitionDetailsTableName,
    fabricTableName,
    wcTableName,
    wcAddRequisitionDetailsTableName,
    wcReconciliationRequisitionDetailsTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wbManufacturingOutputTableName,
    wcReconciliationRequisitionTableName,
    wdTransportRequisitionWdWcTableName,
    wcTransitionBetweenWHRequisitionTableName,
    wdTransportWcWdDetailsTableName,
    wdTableName,
    wdReconciliationRequisitionDetailsTableName,
    wdTransitionBetweenDyersRequisitionDetailsTableName,
    wcTransitionBetweenOrdersRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wcFabricOrderRequisition) => {
    wcFabricOrderRequisition.id = trans.transform();
    
    // Set parent ids to self if not provided (طلبية جديدة تكون parent لنفسها)
    if (!wcFabricOrderRequisition.parentWcFabricOrderRequisitionId) {
        wcFabricOrderRequisition.parentWcFabricOrderRequisitionId = wcFabricOrderRequisition.id;
    }

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcFabricOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcFabricOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcFabricOrderRequisitionQueries.selectOne({ number: wcFabricOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // check if orders Requisitions added
    const ordersRequisitionsResults = await ordersRequisitionsService.checkForCreateOrder(wcFabricOrderRequisition);
    if (ordersRequisitionsResults) {
        // Set parent orders requisitions id
        if (!wcFabricOrderRequisition.parentOrdersRequisitionsId) {
            wcFabricOrderRequisition.parentOrdersRequisitionsId = wcFabricOrderRequisition.ordersRequisitionsId;
        }
        
        const results = await wcFabricOrderRequisitionQueries.insert(wcFabricOrderRequisition);
        if (results) {
            return await wcFabricOrderRequisitionDetailsService.create(wcFabricOrderRequisition);
        } else {
            return constants.insertError;
        }
    } else {
        return constants.insertError;
    }
};

exports.select = async (whereCluse) => {

    const results = await wcFabricOrderRequisitionQueries.selectOne(whereCluse);
    return results;
  };

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder, true);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder, true);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectByWarehouseWc = async (warehouseId) => {
  
    let wcFabricWhereCluse = {};
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    // wcFabricWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    // wcReconciliationWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;
    // wcTransportWdWcWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    // WcManufacturingOutputWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    // transitionBetweenWhWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

    let transitionBetweenOrdersWcWhereCluse = {};
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenOrdersType;
    transitionBetweenOrdersWcWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    // transitionBetweenOrdersWcWhereCluse[`${wcFabricOrderRequisitionTableName}.is_parent`] = 1;

  let whereCluseArray = [
    wcFabricWhereCluse, 
    wcReconciliationWhereCluse, 
    wcTransportWdWcWhereCluse, 
    WcManufacturingOutputWhereCluse,
    transitionBetweenWhWhereCluse,
    transitionBetweenOrdersWcWhereCluse
]
  
    const results = await wcFabricOrderRequisitionQueries.selectStoredFabricsWc(whereCluseArray);
    return results;
  };

  
exports.selectByDyeingWd = async (dyeingId) => {

    const groupBy = [`wc_fabric_order_requisition_id`]

    let whereCluse = {};
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [
        whereCluse, 
        reconciliationWhereCluse, 
        andWhereCluse, 
        transitionBetweenWhereCluse
    ]
    const consigmentDyeingResults = await wdQueries.selectQuantityByDyeingWd(whereCluseArray, groupBy);

    return consigmentDyeingResults;
};

  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await wcFabricOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order ??????????????????????????????
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${wcFabricOrderRequisitionTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await wcFabricOrderRequisitionQueries.update({
        //     is_order : 0
        // },
        // waYarnOrderRequisitionWhereCluse)
        // if(waYarnOrderRequisitionResult) {
        //     result = constants.updateSuccess
        // } else {
        //     result = constants.updateError
        // }

    } else {
        result = constants.invalidDataResponse
    }
    return result
}

  exports.closedOrderByOrdersRequisitionsId = async (ordersRequisitionsId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await wcFabricOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order ??????????????????????????????
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${wcFabricOrderRequisitionTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await wcFabricOrderRequisitionQueries.update({
        //     is_order : 0
        // },
        // waYarnOrderRequisitionWhereCluse)
        // if(waYarnOrderRequisitionResult) {
            result = constants.updateSuccess
        // } else {
        //     result = constants.updateError
        // }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}
  
  exports.selectFabricsOrderRequisition = async (requisitionId) => {

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let wcFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(wcFabricOrderRequisitionDetailsResult) && wcFabricOrderRequisitionDetailsResult.length > 0) {
        return wcFabricOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}
  
exports.inquireFabricsForOrderWc = async (dyeingOrderRequisitionId) => {
    let data = []

    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, [dyeingOrderRequisitionId])
    // console.log("dyeingOrderRequisitions ::: ", dyeingOrderRequisitions);

    data = await wcReportService.fabricsForOrderWc(dyeingOrderRequisitions)

    let resultData = await this.filterOrderFabricsArray(data, dyeingOrderRequisitions)
    // console.log("resultData ::::::::::::::: ", resultData);
    if (Array.isArray(resultData) && resultData.length > 0) {
        resultData[0].dyeingOrderRequisition = dyeingOrderRequisitions[0]
    }

    // console.log("resultData ::: ", resultData);
    return resultData

}

exports.filterOrderFabricsArray = async (data) => {
    // Declare a new array
    let newArray = [];
 
    // Declare an empty object
    let uniqueObject = {};
 
    // Loop for the array elements
    for (let i in data) {
 
        // Extract the title
        objTitle = data[i]['id'];
 
        // Use the title as the index
        // console.log(data[i]);
        if(uniqueObject[objTitle]) {
            // console.log("uniqueObject[objTitle] :::::: ", uniqueObject[objTitle]);
            // console.log("data[i]['id'] :::::: ", data[i]['needed_quantity']);
            data[i].needed_quantity = parseFloat((data[i]['needed_quantity'] + uniqueObject[objTitle].needed_quantity).toFixed(3))
        }
        uniqueObject[objTitle] = data[i];
    }
 
    // Loop to push unique object into array
    for (i in uniqueObject) {
        if(uniqueObject[i].needed_quantity > 0) {
            newArray.push(uniqueObject[i]);
        }
    }

    return newArray

}

/**
 * دمج طلبيتين أو أكثر تحت parent واحد
 * @param {Array} orderIds - مصفوفة من IDs الطلبيات المراد دمجها
 * @param {String} parentOrderId - ID الطلبية الأم (parent) التي سيتم الدمج تحتها
 * @returns {Object} - نتيجة العملية
 */
exports.mergeOrders = async (orderIds, parentOrderId) => {
    const knex = require("../../db/config/connection").getConnection();
    try {
        // التحقق من وجود الطلبية الأم (قبل الـ transaction)
        const parentOrderWhereCluse = {};
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.id`] = parentOrderId;
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;

        const parentOrderResult = await wcFabricOrderRequisitionQueries.selectOne(parentOrderWhereCluse);
        if (!parentOrderResult || parentOrderResult.length === 0) {
            return { ...constants.itemNotFound, message: 'Parent order not found' };
        }

        const parentOrder = parentOrderResult[0];
        const parentWcFabricOrderRequisitionId = parentOrderId;
        const parentOrdersRequisitionsId = parentOrder.orders_requisitions_id;
        const sortedOrderIds = [parentOrderId, ...orderIds.filter(id => id !== parentOrderId)];

        // جلب الـ children الموجودين مسبقاً (قبل الـ transaction)
        const existingChildrenRows = await knex(wcFabricOrderRequisitionTableName)
            .select('id', 'parent_wc_fabric_order_requisition_id')
            .whereIn('parent_wc_fabric_order_requisition_id', sortedOrderIds)
            .whereNotIn('id', sortedOrderIds)
            .where({ is_deleted: 0, is_active: 1 });

        const childrenByParent = new Map();
        for (const row of existingChildrenRows) {
            const pid = row.parent_wc_fabric_order_requisition_id;
            if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
            childrenByParent.get(pid).push(row.id);
        }

        // بناء الاسم المدموج (قبل الـ transaction)
        const orderedIdsForNames = [];
        for (const oid of sortedOrderIds) {
            orderedIdsForNames.push(oid);
            orderedIdsForNames.push(...(childrenByParent.get(oid) || []));
        }

        const allOrdersData = await knex(wcFabricOrderRequisitionTableName + ' as o')
            .select('o.id', 'o.number', 'or.name as original_name')
            .leftJoin('orders_requisitions as or', 'or.id', 'o.orders_requisitions_id')
            .whereIn('o.id', orderedIdsForNames)
            .where({ 'o.is_deleted': 0, 'o.is_active': 1 });

        const ordersMap = new Map(allOrdersData.map(o => [o.id, o]));
        const orderNames = orderedIdsForNames.map(oid => {
            const order = ordersMap.get(oid);
            if (!order) return null;
            return (order.original_name && order.original_name.trim())
                ? order.original_name.trim()
                : (order.number ? `طلبية #${order.number}` : `طلبية ${oid.substring(0, 8)}`);
        }).filter(name => name !== null);

        const mergedName = orderNames.length > 0 ? orderNames.join(' + ') : 'Merged Order';
        console.log('Merged name:', mergedName);

        // تنفيذ جميع الكتابات داخل transaction
        await knex.transaction(async (trx) => {
            for (const orderId of orderIds) {
                if (orderId === parentOrderId) continue;

                await wcFabricOrderRequisitionQueries.update({
                    parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                    parent_orders_requisitions_id: parentOrdersRequisitionsId,
                    is_parent: 0
                }, { id: orderId, is_deleted: 0, is_active: 1 }, trx);

                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                    parent_orders_requisitions_id: parentOrdersRequisitionsId
                }, { wc_fabric_order_requisition_id: orderId, is_deleted: 0, is_active: 1 }, trx);

                const existingKids = childrenByParent.get(orderId) || [];
                for (const childId of existingKids) {
                    await wcFabricOrderRequisitionQueries.update({
                        parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                        parent_orders_requisitions_id: parentOrdersRequisitionsId,
                        is_parent: 0
                    }, { id: childId, is_deleted: 0, is_active: 1 }, trx);

                    await wcFabricOrderRequisitionDetailsQueries.update({
                        parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                        parent_orders_requisitions_id: parentOrdersRequisitionsId
                    }, { wc_fabric_order_requisition_id: childId, is_deleted: 0, is_active: 1 }, trx);
                }
            }

            await wcFabricOrderRequisitionQueries.update({
                name: mergedName,
                is_parent: 1,
                parent_wc_fabric_order_requisition_id: parentOrderId,
                parent_orders_requisitions_id: parentOrdersRequisitionsId
            }, { id: parentOrderId, is_deleted: 0, is_active: 1 }, trx);
        });

        console.log('✅ تم تحديث الطلبية الأم:', { id: parentOrderId, name: mergedName, is_parent: 1 });

        return {
            status: 1,
            message: `تم دمج ${orderIds.length} طلبيات بنجاح تحت الطلبية الأم`,
            parentOrderId: parentWcFabricOrderRequisitionId,
            parentOrdersRequisitionsId: parentOrdersRequisitionsId,
            mergedName: mergedName
        };

    } catch (error) {
        console.error('Error in mergeOrders:', error);
        return constants.updateError;
    }
};

/**
 * فصل طلبية من parent وجعلها مستقلة
 * @param {String} orderId - ID الطلبية المراد فصلها
 * @returns {Object} - نتيجة العملية
 */
exports.detachOrder = async (orderId) => {
    const knex = require('../../db/config/connection').getConnection();

    try {
        // جلب معلومات الطلبية (قبل الـ transaction)
        const orderResult = await knex(wcFabricOrderRequisitionTableName)
            .select('id', 'orders_requisitions_id', 'parent_wc_fabric_order_requisition_id', 'number')
            .where({ id: orderId, is_deleted: 0, is_active: 1 })
            .limit(1);

        if (!orderResult || orderResult.length === 0) {
            return constants.itemNotFound;
        }

        const order = orderResult[0];

        const allOrders = await knex(wcFabricOrderRequisitionTableName + ' as o')
            .select('o.id', 'o.orders_requisitions_id', 'o.number', 'or.name as original_name')
            .leftJoin('orders_requisitions as or', 'or.id', 'o.orders_requisitions_id')
            .where({ 'o.parent_wc_fabric_order_requisition_id': orderId, 'o.is_deleted': 0, 'o.is_active': 1 });

        // جمع بيانات الـ parent القديم قبل الـ transaction
        let oldParentId = null;
        let remainingOrders = null;
        let oldParentData = null;
        if (order.parent_wc_fabric_order_requisition_id &&
            order.parent_wc_fabric_order_requisition_id !== orderId) {

            oldParentId = order.parent_wc_fabric_order_requisition_id;
            remainingOrders = await knex(wcFabricOrderRequisitionTableName + ' as rc')
                .select('rc.id', 'rc.number', 'or4.name as original_name')
                .leftJoin('orders_requisitions as or4', 'or4.id', 'rc.orders_requisitions_id')
                .where({ 'rc.parent_wc_fabric_order_requisition_id': oldParentId, 'rc.is_deleted': 0, 'rc.is_active': 1 })
                .whereNot('rc.id', orderId)
                .orderBy('rc.created_at', 'asc');

            if (remainingOrders.length === 0) {
                oldParentData = await knex(wcFabricOrderRequisitionTableName + ' as po')
                    .select('po.number', 'or5.name as original_name')
                    .leftJoin('orders_requisitions as or5', 'or5.id', 'po.orders_requisitions_id')
                    .where({ 'po.id': oldParentId })
                    .limit(1);
            }
        }

        // تنفيذ جميع الكتابات داخل transaction
        await knex.transaction(async (trx) => {
            for (const o of allOrders) {
                const oOrdersRequisitionsId = o.orders_requisitions_id;
                const oOriginalName = (o.original_name && o.original_name.trim())
                    ? o.original_name.trim()
                    : `طلبية #${o.number}`;

                await trx(wcFabricOrderRequisitionTableName)
                    .where({ id: o.id, is_deleted: 0, is_active: 1 })
                    .update({
                        parent_wc_fabric_order_requisition_id: o.id,
                        parent_orders_requisitions_id: oOrdersRequisitionsId,
                        is_parent: 0,
                        name: oOriginalName
                    });

                const details = await trx(wcFabricOrderRequisitionDetailsTableName)
                    .select('id')
                    .where({ wc_fabric_order_requisition_id: o.id, is_deleted: 0, is_active: 1 });

                for (const detail of details) {
                    await wcFabricOrderRequisitionDetailsQueries.update({
                        parent_wc_fabric_order_requisition_id: o.id,
                        parent_wc_fabric_order_requisition_details_id: detail.id,
                        parent_orders_requisitions_id: oOrdersRequisitionsId
                    }, { id: detail.id }, trx);
                }
            }

            if (oldParentId) {
                if (remainingOrders && remainingOrders.length > 0) {
                    const newParentName = remainingOrders.map(c =>
                        (c.original_name && c.original_name.trim()) ? c.original_name.trim() : `طلبية #${c.number}`
                    ).join(' + ');
                    await wcFabricOrderRequisitionQueries.update({ name: newParentName }, { id: oldParentId }, trx);
                } else if (oldParentData && oldParentData.length > 0) {
                    const parentOriginalName = (oldParentData[0].original_name && oldParentData[0].original_name.trim())
                        ? oldParentData[0].original_name.trim()
                        : `طلبية #${oldParentData[0].number}`;
                    await wcFabricOrderRequisitionQueries.update({ name: parentOriginalName, is_parent: 0 }, { id: oldParentId }, trx);
                }
            }
        });

        return { status: 1, message: 'تم فصل جميع الطلبيات بنجاح' };

    } catch (error) {
        console.error('❌ Error in detachOrder:', error);
        return constants.updateError;
    }
};

/**
 * تغيير الطلبية الأم — تصبح الأم الحالية طفلاً تحت الأم الجديدة
 * @param {String} currentParentId - ID الطلبية الأم الحالية
 * @param {String} newParentId     - ID الطلبية المراد تحويلها إلى أم جديدة
 */
exports.changeParent = async (currentParentId, newParentId) => {
    const knex = require('../../db/config/connection').getConnection();

    try {
        // التحقق من الطلبية الأم الحالية
        const currentParentRows = await knex(wcFabricOrderRequisitionTableName + ' as o')
            .select('o.id', 'o.orders_requisitions_id', 'o.number', 'o.is_parent', 'or.name as original_name')
            .leftJoin('orders_requisitions as or', 'or.id', 'o.orders_requisitions_id')
            .where({ 'o.id': currentParentId, 'o.is_deleted': 0, 'o.is_active': 1 })
            .limit(1);

        if (!currentParentRows || currentParentRows.length === 0) {
            return { status: 0, message: 'الطلبية الأم الحالية غير موجودة' };
        }
        const currentParent = currentParentRows[0];

        if (!currentParent.is_parent) {
            return { status: 0, message: 'هذه الطلبية ليست أماً' };
        }

        // التحقق من الطلبية الجديدة
        const newParentRows = await knex(wcFabricOrderRequisitionTableName + ' as o')
            .select('o.id', 'o.orders_requisitions_id', 'o.number', 'or.name as original_name')
            .leftJoin('orders_requisitions as or', 'or.id', 'o.orders_requisitions_id')
            .where({
                'o.id': newParentId,
                'o.parent_wc_fabric_order_requisition_id': currentParentId,
                'o.is_deleted': 0,
                'o.is_active': 1
            })
            .limit(1);

        if (!newParentRows || newParentRows.length === 0) {
            return { status: 0, message: 'الطلبية الجديدة ليست طفلاً تحت الأم الحالية' };
        }
        const newParent = newParentRows[0];

        // جلب باقي الأطفال (بدون الأم الحالية ولا الأم الجديدة)
        const otherChildren = await knex(wcFabricOrderRequisitionTableName + ' as rc')
            .select('rc.id', 'rc.number', 'or2.name as original_name')
            .leftJoin('orders_requisitions as or2', 'or2.id', 'rc.orders_requisitions_id')
            .where({ 'rc.parent_wc_fabric_order_requisition_id': currentParentId, 'rc.is_deleted': 0, 'rc.is_active': 1 })
            .whereNot('rc.id', currentParentId)
            .whereNot('rc.id', newParentId)
            .orderBy('rc.created_at', 'asc');

        // بناء الاسم المدموج الجديد للأم الجديدة
        const allForName = [newParent, currentParent, ...otherChildren];
        const mergedName = allForName.map(o =>
            (o.original_name && o.original_name.trim()) ? o.original_name.trim() : `طلبية #${o.number}`
        ).join(' + ');

        // الاسم الأصلي للأم الحالية (ستصبح طفلاً)
        const currentParentOriginalName = (currentParent.original_name && currentParent.original_name.trim())
            ? currentParent.original_name.trim()
            : `طلبية #${currentParent.number}`;

        await knex.transaction(async (trx) => {
            // 1. الأم الجديدة تصبح parent
            await trx(wcFabricOrderRequisitionTableName)
                .where({ id: newParentId, is_deleted: 0, is_active: 1 })
                .update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id,
                    is_parent: 1,
                    name: mergedName
                });

            // تفاصيل الأم الجديدة تشير لنفسها
            const newParentDetails = await trx(wcFabricOrderRequisitionDetailsTableName)
                .select('id')
                .where({ wc_fabric_order_requisition_id: newParentId, is_deleted: 0, is_active: 1 });

            for (const detail of newParentDetails) {
                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_wc_fabric_order_requisition_details_id: detail.id,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id
                }, { id: detail.id }, trx);
            }

            // 2. الأم الحالية تصبح طفلاً تحت الأم الجديدة
            await trx(wcFabricOrderRequisitionTableName)
                .where({ id: currentParentId, is_deleted: 0, is_active: 1 })
                .update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id,
                    is_parent: 0,
                    name: currentParentOriginalName
                });

            const currentParentDetails = await trx(wcFabricOrderRequisitionDetailsTableName)
                .select('id')
                .where({ wc_fabric_order_requisition_id: currentParentId, is_deleted: 0, is_active: 1 });

            for (const detail of currentParentDetails) {
                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_wc_fabric_order_requisition_details_id: detail.id,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id
                }, { id: detail.id }, trx);
            }

            // 3. باقي الأطفال يتحولون للأم الجديدة
            for (const child of otherChildren) {
                await wcFabricOrderRequisitionQueries.update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id
                }, { id: child.id, is_deleted: 0, is_active: 1 }, trx);

                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: newParentId,
                    parent_orders_requisitions_id: newParent.orders_requisitions_id
                }, { wc_fabric_order_requisition_id: child.id, is_deleted: 0, is_active: 1 }, trx);
            }
        });

        return { status: 1, message: 'تم تغيير الطلبية الأم بنجاح' };

    } catch (error) {
        console.error('❌ Error in changeParent:', error);
        return constants.updateError;
    }
};

/**
 * فصل طلبية واحدة فقط من الدمج دون المساس بباقي الطلبيات
 * @param {String} childOrderId - ID الطلبية المراد فصلها
 */
exports.detachSingleOrder = async (childOrderId) => {
    const knex = require('../../db/config/connection').getConnection();

    try {
        // جلب بيانات الطلبية المراد فصلها
        const childRows = await knex(wcFabricOrderRequisitionTableName + ' as o')
            .select('o.id', 'o.orders_requisitions_id', 'o.parent_wc_fabric_order_requisition_id', 'o.number', 'or.name as original_name')
            .leftJoin('orders_requisitions as or', 'or.id', 'o.orders_requisitions_id')
            .where({ 'o.id': childOrderId, 'o.is_deleted': 0, 'o.is_active': 1 })
            .limit(1);

        if (!childRows || childRows.length === 0) {
            return constants.itemNotFound;
        }

        const child = childRows[0];
        const parentId = child.parent_wc_fabric_order_requisition_id;

        // التحقق أنها فعلاً child وليست standalone
        if (!parentId || parentId === childOrderId) {
            return { status: 0, message: 'هذه الطلبية ليست مدموجة تحت طلبية أم' };
        }

        // جلب الأشقاء المتبقين بعد فصل هذه الطلبية
        // نستثني الطلبية المفصولة والطلبية الأم نفسها (لأن الأم تشير لنفسها parent=parentId)
        const remainingSiblings = await knex(wcFabricOrderRequisitionTableName + ' as rc')
            .select('rc.id', 'rc.number', 'or2.name as original_name')
            .leftJoin('orders_requisitions as or2', 'or2.id', 'rc.orders_requisitions_id')
            .where({ 'rc.parent_wc_fabric_order_requisition_id': parentId, 'rc.is_deleted': 0, 'rc.is_active': 1 })
            .whereNot('rc.id', childOrderId)
            .whereNot('rc.id', parentId)
            .orderBy('rc.created_at', 'asc');

        // جلب بيانات الطلبية الأم (للاسم الأصلي في حالة لم يبق أشقاء)
        let parentData = null;
        if (remainingSiblings.length === 0) {
            const parentRows = await knex(wcFabricOrderRequisitionTableName + ' as po')
                .select('po.number', 'or3.name as original_name')
                .leftJoin('orders_requisitions as or3', 'or3.id', 'po.orders_requisitions_id')
                .where({ 'po.id': parentId })
                .limit(1);
            parentData = parentRows.length > 0 ? parentRows[0] : null;
        }

        // الاسم الأصلي للطلبية المفصولة
        const childOriginalName = (child.original_name && child.original_name.trim())
            ? child.original_name.trim()
            : `طلبية #${child.number}`;

        // تنفيذ جميع الكتابات داخل transaction
        await knex.transaction(async (trx) => {
            // استعادة الطلبية المفصولة كـ standalone
            await trx(wcFabricOrderRequisitionTableName)
                .where({ id: childOrderId, is_deleted: 0, is_active: 1 })
                .update({
                    parent_wc_fabric_order_requisition_id: childOrderId,
                    parent_orders_requisitions_id: child.orders_requisitions_id,
                    is_parent: 0,
                    name: childOriginalName
                });

            // تحديث تفاصيل الطلبية المفصولة
            const childDetails = await trx(wcFabricOrderRequisitionDetailsTableName)
                .select('id')
                .where({ wc_fabric_order_requisition_id: childOrderId, is_deleted: 0, is_active: 1 });

            for (const detail of childDetails) {
                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: childOrderId,
                    parent_wc_fabric_order_requisition_details_id: detail.id,
                    parent_orders_requisitions_id: child.orders_requisitions_id
                }, { id: detail.id }, trx);
            }

            // تحديث اسم الطلبية الأم
            if (remainingSiblings.length > 0) {
                // لا تزال هناك أشقاء → حدّث اسم الأم فقط
                const newParentName = remainingSiblings.map(s =>
                    (s.original_name && s.original_name.trim()) ? s.original_name.trim() : `طلبية #${s.number}`
                ).join(' + ');
                await wcFabricOrderRequisitionQueries.update({ name: newParentName }, { id: parentId }, trx);
            } else {
                // لا يوجد أشقاء → الأم تصبح standalone
                const parentOriginalName = parentData && parentData.original_name && parentData.original_name.trim()
                    ? parentData.original_name.trim()
                    : (parentData ? `طلبية #${parentData.number}` : null);
                const updatePayload = { is_parent: 0 };
                if (parentOriginalName) updatePayload.name = parentOriginalName;
                await wcFabricOrderRequisitionQueries.update(updatePayload, { id: parentId }, trx);
            }
        });

        return { status: 1, message: 'تم فصل الطلبية بنجاح' };

    } catch (error) {
        console.error('❌ Error in detachSingleOrder:', error);
        return constants.updateError;
    }
};

/**
 * جلب الطلبيات المدموجة تحت parent معين
 * @param {String} parentOrderId - ID الطلبية الأم
 * @returns {Array} - مصفوفة الطلبيات المدموجة
 */
exports.selectMergedOrders = async (parentOrderId) => {
    const results = await wcFabricOrderRequisitionQueries.selectMergedOrders(parentOrderId);
    return results;
};

/**
 * جلب جميع الطلبيات مع معلومات parent وعدد الطلبيات المدموجة
 * @returns {Array} - مصفوفة الطلبيات مع parent info
 */
exports.selectOrdersWithParentInfo = async () => {
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    
    const results = await wcFabricOrderRequisitionQueries.selectWithParentInfo(whereCluse);
    
    // إضافة عدد الطلبيات المدموجة لكل طلبية
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const order = results[i];
            
            // إذا كانت الطلبية هي parent (parent_id = id)
            if (order.parent_wc_fabric_order_requisition_id === order.id) {
                // جلب عدد الطلبيات المدموجة تحتها
                const mergedOrders = await this.selectMergedOrders(order.id);
                order.merged_orders_count = mergedOrders ? mergedOrders.length : 0;
                order.is_parent = true;
            } else {
                order.merged_orders_count = 0;
                order.is_parent = false;
            }
        }
    }
    
    return results;
};

/**
 * جلب جميع الطلبيات مع معلومات الدمج
 * يرجع فقط الطلبيات الأم (Parent) والطلبيات العادية (بدون children)
 * @param {number} isOrder - حالة الطلبية (1 = مفتوحة, 0 = مغلقة) - اختياري
 * @returns {Array} - مصفوفة الطلبيات مع معلومات الدمج
 */
exports.selectAllWithMergeInfo = async (isOrder = null) => {
    let whereCluse = {};
    whereCluse[`o.is_deleted`] = 0;
    whereCluse[`o.is_active`] = 1;
    
    // إضافة فلتر حالة الطلبية إذا تم تحديده (1 = مفتوحة, 0 = مغلقة)
    if (isOrder !== null) {
        whereCluse[`o.is_order`] = isOrder;
    }
    
    const results = await wcFabricOrderRequisitionQueries.selectAllWithMergeInfo(whereCluse);
    
    // معالجة النتائج وإضافة parent_name (null لأنها ليست children)
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const order = results[i];
            
            // parent_name دائماً null لأن هذه ليست children
            order.parent_name = null;
            
            // تحويل is_parent إلى boolean
            order.is_parent = order.is_parent === 1 || order.is_parent === '1' || order.is_parent === true;
            
            // تحويل merged_count إلى رقم
            order.merged_count = parseInt(order.merged_count) || 0;
            
            // تحويل total_quantity إلى رقم (null إذا لم يكن هناك كمية)
            order.total_quantity = order.total_quantity ? parseFloat(order.total_quantity) : null;
            
            // تحويل current_quantity إلى رقم
            order.current_quantity = order.current_quantity ? parseFloat(order.current_quantity) : 0;
        }
    }
    
    return results;
};

