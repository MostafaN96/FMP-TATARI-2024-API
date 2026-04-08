-- =====================================================
-- ملف هجرة البيانات الموجودة إلى جدول wb_manufacturing_output_allocation
-- =====================================================
-- التاريخ: 23 فبراير 2026
-- الغرض: إضافة تخصيصات افتراضية للمخرجات القديمة

-- =====================================================
-- الخطوة 1: التحقق من وجود الجدول
-- =====================================================
SELECT 'التحقق من وجود الجدول...' as status;
SHOW TABLES LIKE 'wb_manufacturing_output_allocation';

-- =====================================================
-- الخطوة 1.5: حذف الـ triggers القديمة وتحديثها
-- =====================================================
DROP TRIGGER IF EXISTS `trg_update_output_on_delete_allocation`;
DROP TRIGGER IF EXISTS `trg_update_output_on_insert_allocation`;
DROP TRIGGER IF EXISTS `trg_update_output_on_update_allocation`;

DELIMITER $$

-- إعادة create الـ triggers مع التحقق من @disable_triggers
CREATE TRIGGER `trg_update_output_on_delete_allocation` AFTER DELETE ON `wb_manufacturing_output_allocation`
FOR EACH ROW
BEGIN
  IF @disable_triggers IS NULL OR @disable_triggers = 0 THEN
    UPDATE `wb_manufacturing_output`
    SET 
      `total_allocated_quantity` = COALESCE((
        SELECT SUM(`allocated_quantity`) 
        FROM `wb_manufacturing_output_allocation` 
        WHERE `wb_manufacturing_output_id` = OLD.`wb_manufacturing_output_id` 
          AND `is_deleted` = 0
      ), 0),
      `updated_at` = CURRENT_TIMESTAMP
    WHERE `id` = OLD.`wb_manufacturing_output_id`;
  END IF;
END$$

CREATE TRIGGER `trg_update_output_on_insert_allocation` AFTER INSERT ON `wb_manufacturing_output_allocation`
FOR EACH ROW
BEGIN
  IF @disable_triggers IS NULL OR @disable_triggers = 0 THEN
    UPDATE `wb_manufacturing_output`
    SET 
      `total_allocated_quantity` = COALESCE((
        SELECT SUM(`allocated_quantity`) 
        FROM `wb_manufacturing_output_allocation` 
        WHERE `wb_manufacturing_output_id` = NEW.`wb_manufacturing_output_id` 
          AND `is_deleted` = 0
      ), 0),
      `updated_at` = CURRENT_TIMESTAMP
    WHERE `id` = NEW.`wb_manufacturing_output_id`;
  END IF;
END$$

CREATE TRIGGER `trg_update_output_on_update_allocation` AFTER UPDATE ON `wb_manufacturing_output_allocation`
FOR EACH ROW
BEGIN
  IF @disable_triggers IS NULL OR @disable_triggers = 0 THEN
    UPDATE `wb_manufacturing_output`
    SET 
      `total_allocated_quantity` = COALESCE((
        SELECT SUM(`allocated_quantity`) 
        FROM `wb_manufacturing_output_allocation` 
        WHERE `wb_manufacturing_output_id` = NEW.`wb_manufacturing_output_id` 
          AND `is_deleted` = 0
      ), 0),
      `updated_at` = CURRENT_TIMESTAMP
    WHERE `id` = NEW.`wb_manufacturing_output_id`;
  END IF;
END$$

DELIMITER ;

-- =====================================================
-- الخطوة 2: عرض عدد المخرجات الموجودة
-- =====================================================
SELECT 'عدد المخرجات الموجودة:' as status,
       COUNT(*) as total_outputs 
FROM wb_manufacturing_output 
WHERE is_deleted = 0;

-- =====================================================
-- الخطوة 3: عرض المخرجات التي لم تُضف لها تخصيصات بعد
-- =====================================================
SELECT 'المخرجات بدون تخصيصات:' as status,
       COUNT(DISTINCT wbo.id) as count
FROM wb_manufacturing_output wbo
LEFT JOIN wb_manufacturing_output_allocation wbaa 
  ON wbaa.wb_manufacturing_output_id = wbo.id 
  AND wbaa.is_deleted = 0
WHERE wbo.is_deleted = 0
AND wbaa.id IS NULL;

-- =====================================================
-- الخطوة 4: إضافة تخصيصات افتراضية
-- =====================================================
-- هذا الأمر سيضيف تخصيص كامل لكل مخرج موجود
-- بحيث تكون الكمية بالكاملة مخصصة للطلب الأساسي

-- تعطيل الـ triggers قبل الإدراج
SET @disable_triggers = 1;

INSERT INTO wb_manufacturing_output_allocation (
  id,
  wb_manufacturing_output_id,
  orders_requisitions_id,
  wc_fabric_order_requisition_details_id,
  allocated_quantity,
  sequence_order,
  creator_id,
  ip_address,
  is_deleted,
  is_active
)
SELECT 
  CONCAT('MIGR-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', LPAD(ROW_NUMBER() OVER (ORDER BY wbo.id), 5, '0')) as id,
  wbo.id as wb_manufacturing_output_id,
  wbo.orders_requisitions_id,
  wbo.wc_fabric_order_requisition_details_id,
  wbo.quantity as allocated_quantity,
  1 as sequence_order,
  COALESCE(wbo.creator_id, 'SYSTEM') as creator_id,
  COALESCE(wbo.ip_address, '127.0.0.1') as ip_address,
  0 as is_deleted,
  1 as is_active
FROM wb_manufacturing_output wbo
WHERE wbo.is_deleted = 0
AND NOT EXISTS (
  SELECT 1 FROM wb_manufacturing_output_allocation wbaa 
  WHERE wbaa.wb_manufacturing_output_id = wbo.id
  AND wbaa.is_deleted = 0
);

-- إعادة تفعيل الـ triggers
SET @disable_triggers = 0;

-- =====================================================
-- الخطوة 5: تعطيل الـ triggers مؤقتاً لـ UPDATE
-- =====================================================
SET @disable_triggers = 1;

-- =====================================================
-- الخطوة 6: تحديث أعمدة المخرجات
-- =====================================================
-- تحديث أعمدة الكمية والحالة
UPDATE wb_manufacturing_output wbo
SET 
  wbo.total_allocated_quantity = wbo.quantity,
  wbo.remaining_quantity = 0,
  wbo.allocation_status = 'completed'
WHERE wbo.is_deleted = 0;

-- =====================================================
-- الخطوة 7: إعادة تفعيل الـ triggers
-- =====================================================
SET @disable_triggers = 0;

-- =====================================================
-- الخطوة 8: التحقق من نتائج الهجرة
-- =====================================================
SELECT 'نتائج الهجرة:' as status;

SELECT 
  COUNT(*) as total_allocations,
  COUNT(DISTINCT wb_manufacturing_output_id) as outputs_with_allocation,
  ROUND(SUM(allocated_quantity), 2) as total_quantity_allocated
FROM wb_manufacturing_output_allocation 
WHERE is_deleted = 0;

-- =====================================================
-- الخطوة 9: عرض تفاصيل الهجرة
-- =====================================================
SELECT 'تفاصيل الهجرة:' as status;

SELECT 
  wbo.id as output_id,
  wbo.quantity as output_quantity,
  COUNT(wbaa.id) as allocation_count,
  SUM(wbaa.allocated_quantity) as total_allocated,
  (wbo.quantity - SUM(wbaa.allocated_quantity)) as remaining,
  wbo.allocation_status,
  wbo.created_at
FROM wb_manufacturing_output wbo
LEFT JOIN wb_manufacturing_output_allocation wbaa 
  ON wbaa.wb_manufacturing_output_id = wbo.id 
  AND wbaa.is_deleted = 0
WHERE wbo.is_deleted = 0
GROUP BY wbo.id
ORDER BY wbo.created_at DESC
LIMIT 10;

-- =====================================================
-- النتيجة النهائية
-- =====================================================
SELECT '✅ تمت عملية الهجرة بنجاح!' as message;
SELECT 'يمكنك الآن اختبار النظام الجديد' as next_step;
