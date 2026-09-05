// ValidationwaCottonSellRequisitionService
const wcFabricOrderRequisitionValidation = require("../../validations/wc/wc-fabric-order-requisition");

// Services
const wcFabricOrderRequisitionService = require("../../services/wc/wc-fabric-order-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wcFabricOrderRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wcFabricOrderRequisitionService.create(bodyPalod);

    if (results === constants.insertError) {
        return response.status(500).json(results);
    } else if (results === constants.duplicatedData) {
        return response.status(200).json(constants.duplicatedData);
    } else if (results === constants.invalidDataResponse) {
        return response.status(400).json(constants.invalidDataResponse);
    } else {
        return response.status(201).json(results);
    }
};

exports.selectOpenedOrders = async (request, response) => {
    // logging

    // call service
    const results = await wcFabricOrderRequisitionService.selectOpenedOrders();
    response.status(200).json(results);
};

exports.selectClosedOrders = async (request, response) => {
    // logging

    // call service
    const results = await wcFabricOrderRequisitionService.selectClosedOrders();
    response.status(200).json(results);
};

exports.closedOrderByRequisition = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await wcFabricOrderRequisitionService.closedOrderByRequisition(id);
    if (results === constants.insertError) {
        return response.status(500).json(results);
    } else if (results === constants.updateError) {
        return response.status(200).json(constants.updateError);
    } else if (results === constants.invalidDataResponse) {
        return response.status(400).json(constants.invalidDataResponse);
    } else {
        return response.status(201).json(constants.updateSuccess);
    }
};

exports.selectFabricsOrderRequisition = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectFabricsOrderRequisition(id);
    response.status(200).json(results);
  };

exports.inquireFabricsForOrderWc = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.inquireFabricsForOrderWc(id);
    response.status(200).json(results);
  };
  
exports.selectByWarehouseWc = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectByWarehouseWc(id);
    response.status(200).json(results);
  };
  
exports.selectByDyeingWd = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectByDyeingWd(id);
    response.status(200).json(results);
  };

/**
 * دمج طلبيات متعددة تحت parent واحد
 * Body: { orderIds: [id1, id2, id3], parentOrderId: id }
 */
exports.mergeOrders = async (request, response) => {
    const { orderIds, parentOrderId } = request.body;

    // Validation
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
        return response.status(400).json({ 
            ...constants.invalidDataResponse, 
            message: 'يجب تحديد طلبيتين على الأقل للدمج' 
        });
    }

    if (!parentOrderId) {
        return response.status(400).json({ 
            ...constants.invalidDataResponse, 
            message: 'يجب تحديد الطلبية الأم (parent)' 
        });
    }

    // Call service
    const results = await wcFabricOrderRequisitionService.mergeOrders(orderIds, parentOrderId);
    
    if (results === constants.updateError) {
        return response.status(500).json(results);
    } else if (results.status === constants.itemNotFound.status) {
        return response.status(404).json(results);
    } else {
        return response.status(200).json(results);
    }
};

/**
 * فصل طلبية من parent وجعلها مستقلة
 * Params: { id } - ID الطلبية المراد فصلها
 */
exports.detachOrder = async (request, response) => {
    const { id } = request.params;

    if (!id) {
        return response.status(400).json({ 
            ...constants.invalidDataResponse, 
            message: 'يجب تحديد ID الطلبية' 
        });
    }

    // Call service
    const results = await wcFabricOrderRequisitionService.detachOrder(id);
    
    if (results === constants.updateError) {
        return response.status(500).json(results);
    } else if (results === constants.itemNotFound) {
        return response.status(404).json(results);
    } else {
        return response.status(200).json(results);
    }
};

/**
 * تغيير الطلبية الأم
 * Body: { currentParentId, newParentId }
 */
exports.changeParent = async (request, response) => {
    const { currentParentId, newParentId } = request.body;

    if (!currentParentId || !newParentId) {
        return response.status(400).json({
            ...constants.invalidDataResponse,
            message: 'يجب تحديد currentParentId و newParentId'
        });
    }

    if (currentParentId === newParentId) {
        return response.status(400).json({
            ...constants.invalidDataResponse,
            message: 'الطلبية الأم الحالية والجديدة متطابقتان'
        });
    }

    const results = await wcFabricOrderRequisitionService.changeParent(currentParentId, newParentId);

    if (results === constants.updateError) {
        return response.status(500).json(results);
    } else if (results.status === 0) {
        return response.status(400).json(results);
    } else {
        return response.status(200).json(results);
    }
};

/**
 * فصل طلبية واحدة فقط من الدمج
 * Params: { id } - ID الطلبية المراد فصلها
 */
exports.detachSingleOrder = async (request, response) => {
    const { id } = request.params;

    if (!id) {
        return response.status(400).json({
            ...constants.invalidDataResponse,
            message: 'يجب تحديد ID الطلبية'
        });
    }

    const results = await wcFabricOrderRequisitionService.detachSingleOrder(id);

    if (results === constants.updateError) {
        return response.status(500).json(results);
    } else if (results === constants.itemNotFound) {
        return response.status(404).json(results);
    } else {
        return response.status(200).json(results);
    }
};

/**
 * جلب الطلبيات المدموجة تحت parent معين
 * Params: { id } - ID الطلبية الأم
 */
exports.selectMergedOrders = async (request, response) => {
    const { id } = request.params;

    if (!id) {
        return response.status(400).json({ 
            ...constants.invalidDataResponse, 
            message: 'يجب تحديد ID الطلبية الأم' 
        });
    }

    const results = await wcFabricOrderRequisitionService.selectMergedOrders(id);
    response.status(200).json(results);
};

/**
 * جلب جميع الطلبيات مع معلومات parent
 */
exports.selectOrdersWithParentInfo = async (request, response) => {
    const results = await wcFabricOrderRequisitionService.selectOrdersWithParentInfo();
    response.status(200).json(results);
};

/**
 * جلب جميع الطلبيات مع معلومات الدمج
 * يرجع فقط الطلبيات الأم (Parent) والطلبيات العادية (بدون children)
 * Query params: { status } - "opened" أو "closed" - اختياري
 */
exports.selectAllWithMergeInfo = async (request, response) => {
    const { status } = request.query;
    
    // تحويل status إلى قيمة is_order (1 = opened, 0 = closed) أو null
    let isOrderValue = null;
    if (status === 'opened' || status === '1') {
        isOrderValue = 1;  // مفتوحة
    } else if (status === 'closed' || status === '0') {
        isOrderValue = 0;  // مغلقة
    }
    
    const results = await wcFabricOrderRequisitionService.selectAllWithMergeInfo(isOrderValue);
    response.status(200).json(results);
};