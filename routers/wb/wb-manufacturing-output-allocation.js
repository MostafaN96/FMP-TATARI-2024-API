// Routes for wb_manufacturing_output_allocation
const express = require("express");
const router = express.Router();

// Services
const wbManufacturingOutputAllocationService = require("../../services/wb/wb-manufacturing-output-allocation");

// Middlewares
const middleware = require("../../middlewares/middlewares");

/**
 * POST /api/wb/output-allocation/allocate
 * تخصيص مخرجات على طلبات فرعية
 */
router.post("/allocate", middleware.checkAuth, async (req, res) => {
  try {
    const { output_id, child_orders } = req.body;

    // التحقق من البيانات المدخلة
    if (!output_id || !Array.isArray(child_orders) || child_orders.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "البيانات المدخلة غير صحيحة: يرجى تقديم output_id و child_orders"
      });
    }

    // إضافة بيانات المستخدم لكل طلب
    const enrichedOrders = child_orders.map(order => ({
      ...order,
      creator_id: req.user.id,
      ip_address: req.ip
    }));

    // تنفيذ التخصيص
    const result = await wbManufacturingOutputAllocationService.allocateOutput(
      output_id,
      enrichedOrders
    );

    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in POST /allocate:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * GET /api/wb/output-allocation/:output_id
 * جلب جميع التخصيصات لمخرج معين
 */
router.get("/:output_id", middleware.checkAuth, async (req, res) => {
  try {
    const { output_id } = req.params;

    if (!output_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف المخرجات مطلوب"
      });
    }

    const result = await wbManufacturingOutputAllocationService.getAllocationsForOutput(output_id);
    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in GET /:output_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * GET /api/wb/output-allocation/stats/:output_id
 * جلب إحصائيات التخصيص لمخرج
 */
router.get("/stats/:output_id", middleware.checkAuth, async (req, res) => {
  try {
    const { output_id } = req.params;

    if (!output_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف المخرجات مطلوب"
      });
    }

    const result = await wbManufacturingOutputAllocationService.getAllocationStats(output_id);
    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in GET /stats/:output_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * GET /api/wb/output-allocation/order/:order_id
 * جلب تخصيصات طلب معين
 */
router.get("/order/:order_id", middleware.checkAuth, async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف الطلب مطلوب"
      });
    }

    const result = await wbManufacturingOutputAllocationService.getAllocationsForOrder(order_id);
    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in GET /order/:order_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * PUT /api/wb/output-allocation/:allocation_id
 * تحديث تخصيص معين
 */
router.put("/:allocation_id", middleware.checkAuth, async (req, res) => {
  try {
    const { allocation_id } = req.params;
    const { allocated_quantity } = req.body;

    // التحقق من البيانات
    if (!allocation_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف التخصيص مطلوب"
      });
    }

    if (!allocated_quantity || allocated_quantity <= 0) {
      return res.status(400).json({
        status: 400,
        message: "الكمية يجب أن تكون أكبر من صفر"
      });
    }

    // تنفيذ التحديث
    const result = await wbManufacturingOutputAllocationService.updateAllocation(
      allocation_id,
      allocated_quantity
    );

    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in PUT /:allocation_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * DELETE /api/wb/output-allocation/:allocation_id
 * حذف تخصيص (soft delete)
 */
router.delete("/:allocation_id", middleware.checkAuth, async (req, res) => {
  try {
    const { allocation_id } = req.params;

    if (!allocation_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف التخصيص مطلوب"
      });
    }

    // تنفيذ الحذف
    const result = await wbManufacturingOutputAllocationService.deleteAllocation(allocation_id);
    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in DELETE /:allocation_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

/**
 * DELETE /api/wb/output-allocation/delete-all/:output_id
 * حذف جميع التخصيصات لمخرج معين
 */
router.delete("/delete-all/:output_id", middleware.checkAuth, async (req, res) => {
  try {
    const { output_id } = req.params;

    if (!output_id) {
      return res.status(400).json({
        status: 400,
        message: "معرف المخرجات مطلوب"
      });
    }

    // تنفيذ الحذف
    const result = await wbManufacturingOutputAllocationService.deleteAllocationsByOutputId(output_id);
    return res.status(result.status).json(result);

  } catch (error) {
    console.error("Error in DELETE /delete-all/:output_id:", error);
    return res.status(500).json({
      status: 500,
      message: "خطأ في الخادم",
      error: error.message
    });
  }
});

module.exports = router;
