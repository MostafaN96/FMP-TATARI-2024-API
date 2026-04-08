-- ============================================
-- Migration: إضافة نظام تخصيص مخرجات التصنيع
-- التاريخ: 2026-02-22
-- الوصف: إنشاء جدول التخصيص وتعديل الجداول المرتبطة
-- ============================================

-- ============================================
-- الخطوة 1: إنشاء جدول التخصيص الجديد
-- ============================================
CREATE TABLE IF NOT EXISTS `wb_manufacturing_output_allocation` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `wb_manufacturing_output_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orders_requisitions_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `wc_fabric_order_requisition_details_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocated_quantity` double(10,3) NOT NULL,
  `sequence_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creator_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `last_person_updated` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_alloc_output_idx` (`wb_manufacturing_output_id`),
  KEY `fk_alloc_order_idx` (`orders_requisitions_id`),
  KEY `fk_alloc_details_idx` (`wc_fabric_order_requisition_details_id`),
  KEY `sequence_order_idx` (`sequence_order`),
  CONSTRAINT `fk_wb_alloc_output` FOREIGN KEY (`wb_manufacturing_output_id`) 
    REFERENCES `wb_manufacturing_output` (`id`),
  CONSTRAINT `fk_wb_alloc_order` FOREIGN KEY (`orders_requisitions_id`) 
    REFERENCES `orders_requisitions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- الخطوة 2: تعديل جدول wb_manufacturing_output
-- إضافة حقول التتبع (إذا كانت غير موجودة)
-- ============================================

-- التحقق من وجود الحقول وإضافتها إن لزم الأمر
ALTER TABLE `wb_manufacturing_output`
ADD COLUMN `total_allocated_quantity` double(10,3) DEFAULT '0' AFTER `quantity`,
ADD COLUMN `remaining_quantity` double(10,3) DEFAULT '0' AFTER `total_allocated_quantity`,
ADD COLUMN `allocation_status` varchar(45) DEFAULT 'pending' AFTER `remaining_quantity`;

-- ============================================
-- الخطوة 3: تعديل جدول orders_requisitions
-- إضافة المرجع للطلب الأساسي (للطلبات الهرمية)
-- ============================================

ALTER TABLE `orders_requisitions`
ADD COLUMN `parent_order_id` varchar(50) DEFAULT NULL AFTER `id`,
ADD KEY `fk_parent_order_idx` (`parent_order_id`),
ADD CONSTRAINT `fk_parent_order` FOREIGN KEY (`parent_order_id`) 
  REFERENCES `orders_requisitions` (`id`);

-- ============================================
-- الخطوة 4: إنشاء Index لتحسين الأداء
-- ============================================

-- فهرس على المخرجات وحالة التخصيص
ALTER TABLE `wb_manufacturing_output_allocation`
ADD INDEX `idx_output_order_status` (`wb_manufacturing_output_id`, `orders_requisitions_id`, `is_active`);

-- فهرس على الطلبات والحالة
ALTER TABLE `orders_requisitions`
ADD INDEX `idx_parent_active` (`parent_order_id`, `is_active`);

-- ============================================
-- الخطوة 5: إنشاء Trigger لتحديث البيانات تلقائياً
-- ============================================

DELIMITER $$

-- Trigger عند حذف تخصيص
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

-- Trigger عند إضافة تخصيص
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

-- Trigger عند تحديث تخصيص
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

-- ============================================
-- الخطوة 6: إضافة بيانات اختبارية (اختياري)
-- ============================================
-- يمكن حذف هذا الجزء إذا كنت تختبر النظام فقط

-- تحديث بيانات المخرجات الموجودة بالقيم الافتراضية
-- UPDATE `wb_manufacturing_output`
-- SET `allocation_status` = 'pending'
-- WHERE `allocation_status` IS NULL;

-- ============================================
-- انتهى Migration
-- ============================================
