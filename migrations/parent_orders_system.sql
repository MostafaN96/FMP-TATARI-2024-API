-- =============================================
-- Parent Orders System - Database Migration
-- نظام دمج الطلبيات - تحديث قاعدة البيانات
-- =============================================
-- 
-- ملاحظات هامة:
-- 1. هذه التعديلات تضيف حقول parent للطلبيات
-- 2. النظام يدعم composite keys الموجودة
-- 3. كل طلبية جديدة تأخذ parent_id = id (self-parent)
-- 4. عند دمج الطلبيات، يتم تحديث parent_id لجميع العمليات
-- 5. الـ parent relation تبدأ من wc_fabric_order_requisition (بدون orders_requisitions)
--
-- تنفيذ الأوامر بالترتيب:
-- =============================================

-- 1. جدول wc_fabric_order_requisition  
-- إضافة حقول parent (نقطة البداية - composite key)
ALTER TABLE `wc_fabric_order_requisition` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `is_parent` BOOLEAN DEFAULT FALSE,
ADD INDEX `idx_parent_wc_fabric_order_requisition_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_orders_requisitions_id` (`parent_orders_requisitions_id`),
MODIFY COLUMN `name` VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. جدول wc_fabric_order_requisition_details
-- إضافة حقول parent للتفاصيل (يحتوي على composite key)
ALTER TABLE `wc_fabric_order_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wc_fab_order_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wc_fab_order_req_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wc_fab_ord_req_id` (`parent_orders_requisitions_id`);

-- 3. جدول wc_add_requisition_details_fabric_order
-- إضافة حقول parent لربط الإضافات بالطلبيات
ALTER TABLE `wc_add_requisition_details_fabric_order` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_add_req_fab_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_add_req_ord_req_id` (`parent_orders_requisitions_id`);

-- 4. جدول wc_sell_requisition_details
-- إضافة حقول parent لعمليات البيع
ALTER TABLE `wc_sell_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_sell_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_sell_req_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_sell_ord_req_id` (`parent_orders_requisitions_id`);

-- 5. جدول wc_reconcilition_requisition_details
-- إضافة حقول parent لعمليات التسوية
ALTER TABLE `wc_reconcilition_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_reconcil_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_reconcil_req_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_reconcil_ord_req_id` (`parent_orders_requisitions_id`);

-- 6. جدول wc_return_requisition_details
-- إضافة حقول parent لعمليات الإرجاع
ALTER TABLE `wc_return_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_return_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_return_req_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_return_ord_req_id` (`parent_orders_requisitions_id`);

-- 8. جدول wc_transition_between_wh_requisitions_details
-- إضافة حقول parent لعمليات النقل بين المخازن
ALTER TABLE `wc_transition_between_wh_requisitions_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_transition_wh_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_transition_wh_req_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_wh_ord_req_id` (`parent_orders_requisitions_id`);

-- 9. جدول wc_transition_between_orders_requisitions_details
-- إضافة حقول parent لعمليات النقل بين الطلبيات (6 حقول: from و to)
ALTER TABLE `wc_transition_between_orders_requisitions_details` 
ADD COLUMN `from_parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `from_parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `from_parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_transition_orders_from_details_id` (`from_parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_transition_orders_from_id` (`from_parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_orders_from_ord_id` (`from_parent_orders_requisitions_id`),
ADD INDEX `idx_parent_transition_orders_to_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_transition_orders_to_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_orders_to_ord_id` (`parent_orders_requisitions_id`);

-- =============================================
-- جداول WD (مصبغة) التي تحتوي على علاقات مع WC
-- =============================================

-- 10. جدول wd_transport_requisition_wd_wc_details
-- يربط بين WD و WC و wc_fabric_order_requisition_details
ALTER TABLE `wd_transport_requisition_wd_wc_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_transport_wc_wd_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wd_transport_wc_wd_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_transport_ord_req_id` (`parent_orders_requisitions_id`);

-- 11. جدول wd_reconcilition_requisition_details
-- عمليات التسوية في المصبغة
ALTER TABLE `wd_reconcilition_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_reconcil_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wd_reconcil_req_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_reconcil_ord_req_id` (`parent_orders_requisitions_id`);

-- 12. جدول wd_transition_between_dyers_requisition_details
-- عمليات النقل بين المصابغ
ALTER TABLE `wd_transition_between_dyers_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_transition_dyers_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wd_transition_dyers_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_transition_ord_req_id` (`parent_orders_requisitions_id`);

-- 13. جدول wd_form_dyeing_requisition_details
-- تفاصيل طلبات الصباغة - مرتبط بـ wc_fabric_order_requisition_details
ALTER TABLE `wd_form_dyeing_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_form_dyeing_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wd_form_dyeing_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_form_dyeing_ord_req_id` (`parent_orders_requisitions_id`);

-- 14. جدول wd_transport_wc_wd_details
-- عملية نقل الأقمشة من WC إلى WD
ALTER TABLE `wd_transport_wc_wd_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_transport_wc_wd_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wd_transport_wc_wd_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_transport_wc_wd_ord_req_id` (`parent_orders_requisitions_id`);


-- =============================================
-- تحديث البيانات الموجودة (Optional - اختياري)
-- جعل كل طلبية موجودة parent لنفسها (self-parent)
-- =============================================
-- 
-- ملاحظة: هذا الجزء اختياري - يمكن تنفيذه لتحديث البيانات القديمة
-- أو تركه فارغًا واعتماد parent_id = id فقط للطلبيات الجديدة
--

-- 1. تحديث wc_fabric_order_requisition (نقطة البداية)
UPDATE `wc_fabric_order_requisition` 
SET 
    `parent_wc_fabric_order_requisition_id` = `id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 2. تحديث wc_fabric_order_requisition_details
UPDATE `wc_fabric_order_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_details_id` IS NULL;

-- 3. تحديث wc_add_requisition_details_fabric_order
UPDATE `wc_add_requisition_details_fabric_order` 
SET 
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 4. تحديث wc_sell_requisition_details
UPDATE `wc_sell_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 5. تحديث wc_reconcilition_requisition_details
UPDATE `wc_reconcilition_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 6. تحديث wc_return_requisition_details
UPDATE `wc_return_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;


-- 8. تحديث wc_transition_between_wh_requisitions_details
UPDATE `wc_transition_between_wh_requisitions_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 9. تحديث wc_transition_between_orders_requisitions_details
UPDATE `wc_transition_between_orders_requisitions_details` 
SET 
    `from_parent_wc_fabric_order_requisition_details_id` = `from_wc_fabric_order_requisition_details_id`,
    `from_parent_wc_fabric_order_requisition_id` = `from_wc_fabric_order_requisition_id`,
    `from_parent_orders_requisitions_id` = `from_orders_requisitions_id`,
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 10. تحديث wd_transport_requisition_wd_wc_details
UPDATE `wd_transport_requisition_wd_wc_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 11. تحديث wd_reconcilition_requisition_details
UPDATE `wd_reconcilition_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 12. تحديث wd_transition_between_dyers_requisition_details
UPDATE `wd_transition_between_dyers_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 13. تحديث wd_form_dyeing_requisition_details
UPDATE `wd_form_dyeing_requisition_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 14. تحديث wd_transport_wc_wd_details
UPDATE `wd_transport_wc_wd_details` 
SET 
    `parent_wc_fabric_order_requisition_details_id` = `wc_fabric_order_requisition_details_id`,
    `parent_wc_fabric_order_requisition_id` = `wc_fabric_order_requisition_id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;


-- =============================================
-- استعلامات التحقق من النتائج
-- =============================================

-- 1. عرض عدد الطلبيات المدمجة لكل parent
SELECT 
    `parent_wc_fabric_order_requisition_id`,
    COUNT(*) as total_orders,
    GROUP_CONCAT(`number` ORDER BY `number`) as order_numbers
FROM `wc_fabric_order_requisition`
WHERE `is_deleted` = 0 AND `is_active` = 1
GROUP BY `parent_wc_fabric_order_requisition_id`
HAVING COUNT(*) > 1
ORDER BY total_orders DESC;

-- 2. عرض الطلبيات التي هي parent (parent_id = id)
SELECT 
    `id`,
    `number`,
    `name`,
    `parent_wc_fabric_order_requisition_id`,
    (SELECT COUNT(*) 
     FROM `wc_fabric_order_requisition` wfor2 
     WHERE wfor2.`parent_wc_fabric_order_requisition_id` = wfor.`id` 
     AND wfor2.`is_deleted` = 0 
     AND wfor2.`is_active` = 1) as merged_count
FROM `wc_fabric_order_requisition` wfor
WHERE `parent_wc_fabric_order_requisition_id` = `id`
AND `is_deleted` = 0 
AND `is_active` = 1
ORDER BY merged_count DESC;

-- 3. عرض تفاصيل طلبية معينة مع الطلبيات المدمجة معها
-- (استبدل 'ORDER_ID' بـ id الطلبية المراد فحصها)
/*
SELECT 
    wfor.`id`,
    wfor.`number`,
    wfor.`name`,
    wfor.`parent_wc_fabric_order_requisition_id`,
    wfor.`created_at`,
    CASE 
        WHEN wfor.`parent_wc_fabric_order_requisition_id` = wfor.`id` THEN 'Parent Order'
        ELSE 'Child Order'
    END as order_type
FROM `wc_fabric_order_requisition` wfor
WHERE wfor.`parent_wc_fabric_order_requisition_id` = 
    (SELECT `parent_wc_fabric_order_requisition_id` 
     FROM `wc_fabric_order_requisition` 
     WHERE `id` = 'ORDER_ID')
AND wfor.`is_deleted` = 0 
AND wfor.`is_active` = 1
ORDER BY wfor.`created_at`;
*/

-- 4. عرض إحصائيات عمليات البيع حسب parent_id
SELECT 
    wcsd.`parent_wc_fabric_order_requisition_id`,
    COUNT(DISTINCT wcsd.`wc_sell_requisition_id`) as total_sell_operations,
    SUM(wcsd.`quantity`) as total_quantity_sold,
    COUNT(wcsd.`id`) as total_sell_details
FROM `wc_sell_requisition_details` wcsd
WHERE wcsd.`is_deleted` = 0 
AND wcsd.`is_active` = 1
AND wcsd.`parent_wc_fabric_order_requisition_id` IS NOT NULL
GROUP BY wcsd.`parent_wc_fabric_order_requisition_id`
ORDER BY total_quantity_sold DESC;


-- =============================================
-- ملاحظات مهمة بعد تنفيذ Migration
-- =============================================
--
-- 1. اختبر الـ API endpoints الجديدة:
--    - PUT /wc-fabric-order-requisition/merge-orders
--    - PUT /wc-fabric-order-requisition/detach-order/:id
--    - GET /wc-fabric-order-requisition/merged-orders/:id
--    - GET /wc-fabric-order-requisition/with-parent-info
--
-- 2. تأكد من أن التقارير تستخدم parent_id في الفلاتر
--
-- 3. عند إنشاء طلبية جديدة، النظام تلقائيًا يضبط parent_id = id
--
-- 4. عند دمج طلبيتين أو أكثر، استخدم الـ API endpoint
--
-- 5. الجداول التي تم تحديثها (14 جدول):
--    - wc_fabric_order_requisition (2 حقول - نقطة البداية composite key)
--    - wc_fabric_order_requisition_details (3 حقول)
--    - wc_add_requisition_details_fabric_order (2 حقول)
--    - wc_sell_requisition_details (3 حقول)
--    - wc_reconcilition_requisition_details (3 حقول)
--    - wc_return_requisition_details (3 حقول)
--    - wc_execute_order_requisition_details (3 حقول)
--    - wc_transition_between_wh_requisitions_details (3 حقول)
--    - wc_transition_between_orders_requisitions_details (6 حقول)
--    - wd_transport_requisition_wd_wc_details (3 حقول WD)
--    - wd_reconcilition_requisition_details (3 حقول WD)
--    - wd_transition_between_dyers_requisition_details (3 حقول WD)
--    - wd_form_dyeing_requisition_details (3 حقول WD)
--    - wd_transport_wc_wd_details (3 حقول WD) ← جديد
--
-- ملاحظة: لا نضيف parent لجدول orders_requisitions - نبدأ فقط من wc_fabric_order_requisition
-- لكن نضيف parent_orders_requisitions_id في wc_fabric_order_requisition لأنه composite key
-- =============================================