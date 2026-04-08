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

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder);
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

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder);
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

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    
    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    
    let transitionBetweenOrdersWcWhereCluse = {};
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenOrdersWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenOrdersType;
    transitionBetweenOrdersWcWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.warehouse_id`] = warehouseId;

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
    try {
        // التحقق من وجود الطلبية الأم
        const parentOrderWhereCluse = {};
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.id`] = parentOrderId;
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
        parentOrderWhereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
        
        const parentOrderResult = await wcFabricOrderRequisitionQueries.selectOne(parentOrderWhereCluse);
        if (!parentOrderResult || parentOrderResult.length === 0) {
            return { ...constants.itemNotFound, message: 'Parent order not found' };
        }

        // الحصول على parent IDs من الطلبية الأم (composite key)
        const parentOrder = parentOrderResult[0];
        const parentWcFabricOrderRequisitionId = parentOrder.parent_wc_fabric_order_requisition_id || parentOrderId;
        const parentOrdersRequisitionsId = parentOrder.parent_orders_requisitions_id || parentOrder.orders_requisitions_id;

        // جمع أسماء جميع الطلبيات المدموجة
        let orderNames = [];
        
        // استخدام knex مباشرة للحصول على name و number
        const knex = require("../../db/config/connection").getConnection();
        
        for (let i = 0; i < orderIds.length; i++) {
            const orderId = orderIds[i];
            
            const orderResult = await knex(wcFabricOrderRequisitionTableName)
                .select('id', 'name', 'number')
                .where({
                    id: orderId,
                    is_deleted: 0,
                    is_active: 1
                })
                .limit(1);
            
            if (orderResult && orderResult.length > 0) {
                const order = orderResult[0];
                console.log('Order data:', order); // للـ debugging
                
                // استخدام name إذا موجود ومش فارغ، وإلا استخدم number
                let displayName = '';
                if (order.name && order.name.trim() !== '') {
                    displayName = order.name.trim();
                } else if (order.number) {
                    displayName = `طلبية #${order.number}`;
                } else {
                    displayName = `طلبية ${orderId.substring(0, 8)}`;
                }
                
                orderNames.push(displayName);
            }
        }
        
        // دمج الأسماء بـ + (فقط إذا كان هناك أسماء)
        const mergedName = orderNames.length > 0 ? orderNames.join(' + ') : 'Merged Order';
        
        console.log('Merged name:', mergedName); // للـ debugging

        // تحديث جميع الطلبيات المراد دمجها
        for (let i = 0; i < orderIds.length; i++) {
            const orderId = orderIds[i];
            
            // تخطي الطلبية الأم
            if (orderId === parentOrderId) continue;

            // تحديث الطلبية لتشير إلى parent
            const updateOrderWhereCluse = {
                id: orderId,
                is_deleted: 0,
                is_active: 1
            };
            
            await wcFabricOrderRequisitionQueries.update({
                parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                parent_orders_requisitions_id: parentOrdersRequisitionsId,
                is_parent: 0  // الطلبيات الـ children ليست parent
            }, updateOrderWhereCluse);

            // تحديث تفاصيل الطلبية
            const updateDetailsWhereCluse = {
                wc_fabric_order_requisition_id: orderId,
                is_deleted: 0,
                is_active: 1
            };
            
            await wcFabricOrderRequisitionDetailsQueries.update({
                parent_wc_fabric_order_requisition_id: parentWcFabricOrderRequisitionId,
                parent_orders_requisitions_id: parentOrdersRequisitionsId
            }, updateDetailsWhereCluse);
        }

        // تحديث اسم الطلبية الأم بالأسماء المدموجة وتعيين is_parent = 1
        const updateParentWhereCluse = {
            id: parentOrderId,
            is_deleted: 0,
            is_active: 1
        };
        
        await wcFabricOrderRequisitionQueries.update({
            name: mergedName,
            is_parent: 1  // الطلبية الأم تصبح parent
        }, updateParentWhereCluse);
        
        console.log('✅ تم تحديث الطلبية الأم:', {
            id: parentOrderId,
            name: mergedName,
            is_parent: 1
        });

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
        console.log('🔓 بدء عملية فصل الطلبية:', orderId);
        
        // جلب معلومات الطلبية باستخدام knex مباشرة
        const orderResult = await knex(wcFabricOrderRequisitionTableName)
            .select('id', 'orders_requisitions_id', 'parent_wc_fabric_order_requisition_id', 'name', 'number')
            .where({ id: orderId, is_deleted: 0, is_active: 1 })
            .limit(1);
        
        if (!orderResult || orderResult.length === 0) {
            console.log('❌ الطلبية غير موجودة:', orderId);
            return constants.itemNotFound;
        }

        const order = orderResult[0];
        const ordersRequisitionsId = order.orders_requisitions_id;
        
        console.log('📋 معلومات الطلبية:', {
            id: order.id,
            name: order.name,
            number: order.number,
            orders_requisitions_id: ordersRequisitionsId,
            current_parent: order.parent_wc_fabric_order_requisition_id
        });

        // استخراج الاسم الأصلي (أول جزء قبل "+")
        let originalName = order.name || '';
        if (originalName.includes(' + ')) {
            // إذا الاسم مركب (فيه +)، خذ أول جزء فقط
            originalName = originalName.split(' + ')[0].trim();
            console.log('📝 الاسم الأصلي المستخرج:', originalName);
        } else if (!originalName || originalName.trim() === '') {
            // إذا ما في اسم، استخدم رقم الطلبية
            originalName = `طلبية #${order.number}`;
            console.log('📝 اسم افتراضي:', originalName);
        } else {
            console.log('📝 الاسم الأصلي محفوظ:', originalName);
        }

        // تحديث الطلبية لتصبح parent لنفسها (فصلها) وإرجاع الاسم الأصلي
        const updateCount = await knex(wcFabricOrderRequisitionTableName)
            .where({
                id: orderId,
                is_deleted: 0,
                is_active: 1
            })
            .update({
                parent_wc_fabric_order_requisition_id: orderId,
                parent_orders_requisitions_id: ordersRequisitionsId,
                is_parent: 0,  // الطلبية المفصولة تصبح عادية (ليست parent)
                name: originalName  // إرجاع الاسم الأصلي
            });

        console.log('✅ تم تحديث الطلبية الرئيسية:', updateCount > 0 ? 'نجح' : 'فشل');
        console.log('   - الاسم الجديد:', originalName);

        const updatedOrderCheck = await knex(wcFabricOrderRequisitionTableName)
            .select('id', 'orders_requisitions_id', 'parent_orders_requisitions_id')
            .where({ id: orderId })
            .limit(1);
        
        if (updatedOrderCheck && updatedOrderCheck.length > 0) {
            console.log('🔎 تحقق بعد التحديث:', updatedOrderCheck[0]);
        }

        // تحديث تفاصيل الطلبية
        const updateDetailsWhereCluse = {
            wc_fabric_order_requisition_id: orderId,
            is_deleted: 0,
            is_active: 1
        };
        
        // الحصول على جميع التفاصيل باستخدام knex
        const detailsResult = await knex(wcFabricOrderRequisitionDetailsTableName)
            .select('id')
            .where({ 
                wc_fabric_order_requisition_id: orderId,
                is_deleted: 0,
                is_active: 1
            });
        
        console.log(`📊 عدد التفاصيل للتحديث: ${detailsResult.length}`);
        
        if (Array.isArray(detailsResult) && detailsResult.length > 0) {
            for (let i = 0; i < detailsResult.length; i++) {
                const detailId = detailsResult[i].id;
                await wcFabricOrderRequisitionDetailsQueries.update({
                    parent_wc_fabric_order_requisition_id: orderId,
                    parent_wc_fabric_order_requisition_details_id: detailId,
                    parent_orders_requisitions_id: ordersRequisitionsId
                }, { id: detailId });
            }
            console.log('✅ تم تحديث جميع التفاصيل');
        }

        // إذا كانت الطلبية المفصولة child (لها parent مختلف)، نحدث اسم الـ parent
        if (order.parent_wc_fabric_order_requisition_id && 
            order.parent_wc_fabric_order_requisition_id !== orderId) {
            
            console.log('🔄 تحديث اسم الطلبية الأم...');
            const oldParentId = order.parent_wc_fabric_order_requisition_id;
            
            // جلب جميع الطلبيات المتبقية تحت نفس الـ parent (بعد الفصل)
            const remainingChildren = await knex(wcFabricOrderRequisitionTableName)
                .select('id', 'name', 'number')
                .where({
                    parent_wc_fabric_order_requisition_id: oldParentId,
                    is_deleted: 0,
                    is_active: 1
                })
                .whereNot('id', orderId)  // استثناء الطلبية المفصولة
                .orderBy('created_at', 'asc');
            
            console.log(`📊 الطلبيات المتبقية تحت parent: ${remainingChildren.length}`);
            
            if (remainingChildren.length > 0) {
                // إعادة بناء اسم الطلبية الأم من الطلبيات المتبقية
                const childNames = remainingChildren.map(child => {
                    // استخراج الاسم الأصلي (أول جزء قبل "+")
                    let childName = child.name || `طلبية #${child.number}`;
                    if (childName.includes(' + ')) {
                        childName = childName.split(' + ')[0].trim();
                    }
                    return childName;
                });
                
                const newParentName = childNames.join(' + ');
                console.log('📝 اسم الطلبية الأم الجديد:', newParentName);
                
                // تحديث اسم الطلبية الأم
                await wcFabricOrderRequisitionQueries.update({
                    name: newParentName
                }, { id: oldParentId });
                
                console.log('✅ تم تحديث اسم الطلبية الأم');
            } else {
                // إذا ما بقي أي طلبيات تحت الـ parent، نرجع اسمها الأصلي
                const parentOrder = await knex(wcFabricOrderRequisitionTableName)
                    .select('name', 'number')
                    .where({ id: oldParentId })
                    .limit(1);
                
                if (parentOrder && parentOrder.length > 0) {
                    let parentOriginalName = parentOrder[0].name || `طلبية #${parentOrder[0].number}`;
                    if (parentOriginalName.includes(' + ')) {
                        parentOriginalName = parentOriginalName.split(' + ')[0].trim();
                    }
                    
                    await wcFabricOrderRequisitionQueries.update({
                        name: parentOriginalName,
                        is_parent: 0  // الطلبية الأم تصبح عادية
                    }, { id: oldParentId });
                    
                    console.log('✅ تم إرجاع اسم الطلبية الأم الأصلي:', parentOriginalName);
                }
            }
        }

        console.log('🎉 تمت عملية الفصل بنجاح');
        
        return { 
            status: 1,
            message: `تم فصل الطلبية "${originalName}" بنجاح`
        };

    } catch (error) {
        console.error('❌ Error in detachOrder:', error);
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

