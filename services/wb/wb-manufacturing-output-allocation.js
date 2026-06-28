// Services for wb_manufacturing_output_allocation
// Queries
const wbManufacturingOutputAllocationQueries = require("../../db/queries/wb/wb-manufacturing-output-allocation");

// Util
const constants = require("../../util/constants");
const transform = require("../../helpers/transform");
const { wcFabricOrderRequisitionDetailsTableName, wbManufacturingOutputAllocationTableName } = require("../../util/database-tables-name");

/**
 * تخصيص مخرجات التصنيع على الطلبات الفرعية
 * @param {string} outputId - معرف المخرجات
 * @param {Array} childOrders - مصفوفة الطلبات الفرعية
 * @returns {Object} نتيجة التخصيص
 */
exports.allocateOutput = async (outputId, childOrders, trx = null) => {
  try {
    // استخدم knex مع transaction للتحقق من وجود المخرجات
    const knex = require("../../db/config/connection").getConnection();
    const { wbManufacturingOutputTableName } = require("../../util/database-tables-name");
    
    const queryBuilder = trx || knex;
    const outputResult = await queryBuilder(wbManufacturingOutputTableName)
      .select('id', 'quantity', 'is_deleted', 'is_active')
      .where({ id: outputId })
      .first();
    
    if (!outputResult) {
      return {
        status: 404,
        message: "المخرجات غير موجودة",
        data: null
      };
    }

    // 2. التحقق من صحة البيانات المدخلة
    if (!childOrders || !Array.isArray(childOrders) || childOrders.length === 0) {
      return {
        status: 400,
        message: "البيانات المدخلة غير صحيحة",
        data: null
      };
    }

    let remainingQty = outputResult.quantity;
    let sequenceOrder = 0;
    const allocations = [];
    let hasError = false;

    // 3. توزيع الكمية على كل طلب فرعي
    for (let child of childOrders) {
      if (remainingQty <= 0) break;

      // حساب الكمية المخصصة
      const allocatedQty = Math.min(child.required_quantity, remainingQty);

      if (allocatedQty <= 0) continue;

      // إنشاء سجل التخصيص
      const allocation = {
        id: transform.transform(),
        wb_manufacturing_output_id: outputId,
        orders_requisitions_id: child.order_id,
        wc_fabric_order_requisition_details_id: child.details_id,
        allocated_quantity: allocatedQty,
        sequence_order: ++sequenceOrder,
        creator_id: child.creator_id,
        ip_address: child.ip_address,
        is_deleted: 0,
        is_active: 1
      };

      try {
        // 4. حفظ التخصيص في قاعدة البيانات (مع trx إن وجدت)
        const result = await wbManufacturingOutputAllocationQueries.insert(allocation, trx);
        if (result) {
          const updatedRows = await queryBuilder(wcFabricOrderRequisitionDetailsTableName)
            .where({
              id: child.details_id,
              is_deleted: 0,
              is_active: 1
            })
            .update({
              current_quantity: queryBuilder.raw("current_quantity - ?", [allocatedQty])
            });

          if (updatedRows === 0) {
            console.warn(`لم يتم تحديث كمية الطلب: ${child.details_id}`);
            hasError = true;
          }

          allocations.push(allocation);
          remainingQty -= allocatedQty;
        }
      } catch (err) {
        console.error(`خطأ في حفظ التخصيص: ${err.message}`);
        hasError = true;
      }
    }

    // 5. التحقق من النتائج
    if (allocations.length === 0) {
      return {
        status: 400,
        message: "فشل التخصيص: لم يتم إنشاء أي تخصيصات",
        data: null
      };
    }

    // 6. إرجاع النتائج
    return {
      status: hasError ? 206 : 200,
      message: hasError ? "تم التخصيص جزئياً" : "تم التخصيص بنجاح",
      data: {
        output_id: outputId,
        total_quantity: outputResult.quantity,
        total_allocated: outputResult.quantity - remainingQty,
        remaining: remainingQty,
        allocations_count: allocations.length,
        allocations: allocations
      }
    };

  } catch (error) {
    console.error("خطأ في تخصيص المخرجات:", error);
    return {
      status: 500,
      message: "خطأ في تخصيص المخرجات",
      error: error.message
    };
  }
};

/**
 * تعديل التخصيصات لمخرج معين حسب فرق الكمية
 * @param {string} outputId - معرف المخرجات
 * @param {number} deltaQuantity - الفرق (+ زيادة، - نقصان)
 * @returns {Object} نتيجة التعديل
 */
exports.adjustAllocationsForOutput = async (outputId, deltaQuantity, trx = null) => {
  try {
    if (!deltaQuantity || deltaQuantity === 0) {
      return { status: 200, message: "لا يوجد تعديل", data: { remaining: 0 } };
    }

    const knex = require("../../db/config/connection").getConnection();
    const queryBuilder = trx || knex;
    const isIncrease = deltaQuantity > 0;
    const remainingDelta = Math.abs(deltaQuantity);

    const allocations = await queryBuilder(wbManufacturingOutputAllocationTableName)
      .select("id", "allocated_quantity", "wc_fabric_order_requisition_details_id", "sequence_order")
      .where({
        wb_manufacturing_output_id: outputId,
        is_deleted: 0
      })
      .orderBy("sequence_order", isIncrease ? "asc" : "desc");

    if (!allocations || allocations.length === 0) {
      return { status: 404, message: "لا توجد تخصيصات", data: null };
    }

    const totalAllocated = allocations.reduce((sum, alloc) => {
      return sum + (parseFloat(alloc.allocated_quantity) || 0);
    }, 0);

    // إذا الدلتا أكبر من المخصص نكمل بتخفيض كل المخصص (remaining سيكون > 0 فيرجع 206)
    const cappedDelta = !isIncrease ? Math.min(remainingDelta, totalAllocated) : remainingDelta;

    let remaining = cappedDelta;

    let lastAllocation = null;
    for (const allocation of allocations) {
      lastAllocation = allocation;
      if (remaining <= 0) break;

      if (isIncrease) {
        const detail = await queryBuilder(wcFabricOrderRequisitionDetailsTableName)
          .select("current_quantity")
          .where({
            id: allocation.wc_fabric_order_requisition_details_id,
            is_deleted: 0,
            is_active: 1
          })
          .first();

        const available = detail ? parseFloat(detail.current_quantity) || 0 : 0;
        const addQty = Math.min(remaining, available);
        if (addQty <= 0) continue;

        await queryBuilder(wbManufacturingOutputAllocationTableName)
          .where({ id: allocation.id })
          .update({
            allocated_quantity: queryBuilder.raw("allocated_quantity + ?", [addQty])
          });

        await queryBuilder(wcFabricOrderRequisitionDetailsTableName)
          .where({
            id: allocation.wc_fabric_order_requisition_details_id,
            is_deleted: 0,
            is_active: 1
          })
          .update({
            current_quantity: queryBuilder.raw("current_quantity - ?", [addQty])
          });

        remaining -= addQty;
      } else {
        const reducible = Math.min(remaining, parseFloat(allocation.allocated_quantity) || 0);
        if (reducible <= 0) continue;

        await queryBuilder(wbManufacturingOutputAllocationTableName)
          .where({ id: allocation.id })
          .update({
            allocated_quantity: queryBuilder.raw("allocated_quantity - ?", [reducible])
          });

        await queryBuilder(wcFabricOrderRequisitionDetailsTableName)
          .where({
            id: allocation.wc_fabric_order_requisition_details_id,
            is_deleted: 0,
            is_active: 1
          })
          .update({
            current_quantity: queryBuilder.raw("current_quantity + ?", [reducible])
          });

        remaining -= reducible;
      }
    }

    // إذا في زيادة وما في كفاية عند كل الطلبات، خصم الزيادة من آخر طلبية حتى لو صار بالسالب
    if (isIncrease && remaining > 0 && lastAllocation) {
      await queryBuilder(wbManufacturingOutputAllocationTableName)
        .where({ id: lastAllocation.id })
        .update({
          allocated_quantity: queryBuilder.raw("allocated_quantity + ?", [remaining])
        });

      await queryBuilder(wcFabricOrderRequisitionDetailsTableName)
        .where({
          id: lastAllocation.wc_fabric_order_requisition_details_id,
          is_deleted: 0,
          is_active: 1
        })
        .update({
          current_quantity: queryBuilder.raw("current_quantity - ?", [remaining])
        });

      remaining = 0;
    }

    return {
      status: remaining > 0 ? 206 : 200,
      message: remaining > 0 ? "تم التعديل جزئيا" : "تم التعديل بنجاح",
      data: { remaining }
    };
  } catch (error) {
    console.error("خطا في تعديل التخصيصات:", error);
    return {
      status: 500,
      message: "خطا في تعديل التخصيصات",
      error: error.message
    };
  }
};

/**
 * جلب جميع التخصيصات لمخرج معين
 * @param {string} outputId - معرف المخرجات
 * @returns {Object} بيانات التخصيصات
 */
exports.getAllocationsForOutput = async (outputId) => {
  try {
    // التحقق من وجود المخرجات
    const [output] = await wbManufacturingOutputQueries.selectOne({ id: outputId });
    if (!output) {
      return {
        status: 404,
        message: "المخرجات غير موجودة",
        data: null
      };
    }

    // جلب التخصيصات
    const allocations = await wbManufacturingOutputAllocationQueries.selectByOutputId(outputId);
    const summary = await wbManufacturingOutputAllocationQueries.getAllocationSummary(outputId);

    const totalAllocated = summary?.total_allocated || 0;
    const remaining = output.quantity - totalAllocated;

    return {
      status: 200,
      data: {
        output_id: outputId,
        total_quantity: output.quantity,
        total_allocated: totalAllocated,
        remaining: remaining,
        allocation_count: allocations.length,
        allocations: allocations.map(alloc => ({
          id: alloc.id,
          order_id: alloc.orders_requisitions_id,
          details_id: alloc.wc_fabric_order_requisition_details_id,
          allocated_quantity: alloc.allocated_quantity,
          sequence_order: alloc.sequence_order,
          is_active: alloc.is_active,
          created_at: alloc.created_at
        }))
      }
    };

  } catch (error) {
    console.error("خطأ في جلب التخصيصات:", error);
    return {
      status: 500,
      message: "خطأ في جلب التخصيصات",
      error: error.message
    };
  }
};

/**
 * تحديث تخصيص معين
 * @param {string} allocationId - معرف التخصيص
 * @param {number} newQuantity - الكمية الجديدة
 * @returns {Object} نتيجة التحديث
 */
exports.updateAllocation = async (allocationId, newQuantity) => {
  try {
    // التحقق من الكمية
    if (!newQuantity || newQuantity <= 0) {
      return {
        status: 400,
        message: "الكمية يجب أن تكون أكبر من صفر",
        data: null
      };
    }

    // التحقق من وجود التخصيص
    const [allocation] = await wbManufacturingOutputAllocationQueries.selectOne({ id: allocationId });
    if (!allocation) {
      return {
        status: 404,
        message: "التخصيص غير موجود",
        data: null
      };
    }

    // تحديث التخصيص
    const result = await wbManufacturingOutputAllocationQueries.update(
      allocationId,
      { 
        allocated_quantity: newQuantity,
        is_active: 1
      }
    );

    if (result) {
      return {
        status: 200,
        message: "تم تحديث التخصيص بنجاح",
        data: { id: allocationId }
      };
    }
    return constants.updateError;

  } catch (error) {
    console.error("خطأ في تحديث التخصيص:", error);
    return {
      status: 500,
      message: "خطأ في تحديث التخصيص",
      error: error.message
    };
  }
};

/**
 * حذف تخصيص (soft delete)
 * @param {string} allocationId - معرف التخصيص
 * @returns {Object} نتيجة الحذف
 */
exports.deleteAllocation = async (allocationId) => {
  try {
    // التحقق من وجود التخصيص
    const [allocation] = await wbManufacturingOutputAllocationQueries.selectOne({ id: allocationId });
    if (!allocation) {
      return {
        status: 404,
        message: "التخصيص غير موجود",
        data: null
      };
    }

    // حذف التخصيص
    const result = await wbManufacturingOutputAllocationQueries.deleteById(allocationId);
    if (result) {
      return {
        status: 200,
        message: "تم حذف التخصيص بنجاح",
        data: { id: allocationId }
      };
    }
    return constants.deleteError;

  } catch (error) {
    console.error("خطأ في حذف التخصيص:", error);
    return {
      status: 500,
      message: "خطأ في حذف التخصيص",
      error: error.message
    };
  }
};

/**
 * حذف جميع التخصيصات لمخرج معين
 * @param {string} outputId - معرف المخرجات
 * @returns {Object} نتيجة الحذف
 */
exports.deleteAllocationsByOutputId = async (outputId) => {
  try {
    // التحقق من وجود المخرجات
    const [output] = await wbManufacturingOutputQueries.selectOne({ id: outputId });
    if (!output) {
      return {
        status: 404,
        message: "المخرجات غير موجودة",
        data: null
      };
    }

    // حذف جميع التخصيصات
    const result = await wbManufacturingOutputAllocationQueries.deleteByOutputId(outputId);
    if (result >= 0) {
      return {
        status: 200,
        message: `تم حذف ${result} تخصيص بنجاح`,
        data: { deleted_count: result }
      };
    }
    return constants.deleteError;

  } catch (error) {
    console.error("خطأ في حذف التخصيصات:", error);
    return {
      status: 500,
      message: "خطأ في حذف التخصيصات",
      error: error.message
    };
  }
};

/**
 * جلب تخصيصات طلب معين
 * @param {string} orderId - معرف الطلب
 * @returns {Object} بيانات التخصيصات
 */
exports.getAllocationsForOrder = async (orderId) => {
  try {
    // التحقق من وجود الطلب
    const [order] = await ordersRequisitionsQueries.selectOne({ id: orderId });
    if (!order) {
      return {
        status: 404,
        message: "الطلب غير موجود",
        data: null
      };
    }

    // جلب التخصيصات
    const allocations = await wbManufacturingOutputAllocationQueries.selectByOrderId(orderId);

    return {
      status: 200,
      data: {
        order_id: orderId,
        allocations_count: allocations.length,
        allocations: allocations.map(alloc => ({
          id: alloc.id,
          output_id: alloc.wb_manufacturing_output_id,
          allocated_quantity: alloc.allocated_quantity,
          sequence_order: alloc.sequence_order,
          created_at: alloc.created_at
        }))
      }
    };

  } catch (error) {
    console.error("خطأ في جلب تخصيصات الطلب:", error);
    return {
      status: 500,
      message: "خطأ في جلب التخصيصات",
      error: error.message
    };
  }
};

/**
 * جلب إحصائيات التخصيص لمخرج
 * @param {string} outputId - معرف المخرجات
 * @returns {Object} الإحصائيات
 */
exports.getAllocationStats = async (outputId) => {
  try {
    // التحقق من وجود المخرجات
    const [output] = await wbManufacturingOutputQueries.selectOne({ id: outputId });
    if (!output) {
      return {
        status: 404,
        message: "المخرجات غير موجودة",
        data: null
      };
    }

    // جلب الإحصائيات
    const summary = await wbManufacturingOutputAllocationQueries.getAllocationSummary(outputId);

    const totalAllocated = summary?.total_allocated || 0;
    const allocationCount = summary?.allocation_count || 0;
    const remaining = output.quantity - totalAllocated;

    let status = 'pending';
    if (totalAllocated > 0 && totalAllocated < output.quantity) {
      status = 'partial';
    } else if (totalAllocated === output.quantity) {
      status = 'completed';
    }

    return {
      status: 200,
      data: {
        output_id: outputId,
        total_quantity: output.quantity,
        total_allocated: totalAllocated,
        remaining: remaining,
        allocation_count: allocationCount,
        percentage_allocated: ((totalAllocated / output.quantity) * 100).toFixed(2),
        allocation_status: status
      }
    };

  } catch (error) {
    console.error("خطأ في جلب إحصائيات التخصيص:", error);
    return {
      status: 500,
      message: "خطأ في جلب الإحصائيات",
      error: error.message
    };
  }
};
