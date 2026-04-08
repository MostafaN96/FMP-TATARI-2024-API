# تعليمات هجرة البيانات الموجودة إلى جدول wb_manufacturing_output_allocation

## 📌 المشكلة
الجدول الجديد `wb_manufacturing_output_allocation` تم إضافته حديثاً، والبيانات الموجودة في قاعدة البيانات لا تحتوي على تخصيصات سابقة.

## ✅ الحل

### الخطوة 1: التحقق من وجود الجدول
```sql
-- تحقق من وجود الجدول
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'wb_manufacturing_output_allocation' AND TABLE_SCHEMA = 'fmp_tatari_2024';
```

إذا ظهرت قائمة فارغة، قم بتنفيذ الـ migration من الملف:
```
migrations/wb_manufacturing_output_allocation.sql
```

---

### الخطوة 2: ملء البيانات الموجودة

#### الخيار أ: إذا كانت لديك مخرجات تصنيع قديمة بدون تخصيصات

```sql
-- 1. أولاً، تحقق من عدد المخرجات الموجودة
SELECT COUNT(*) as total_outputs FROM wb_manufacturing_output WHERE is_deleted = 0;

-- 2. إنشاء تخصيصات افتراضية لكل مخرج
-- (كل مخرج موجود = تخصيص واحد كامل للطلب الأصلي)
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
  is_active,
  date_added,
  last_person_updated
)
SELECT 
  CONCAT('ALL-', UUID()),
  wbo.id,
  wbo.orders_requisitions_id,
  wbo.wc_fabric_order_requisition_details_id,
  wbo.quantity,  -- تخصيص كامل الكمية للطلب الأساسي
  1 as sequence_order,
  wbo.creator_id,
  wbo.ip_address,
  0 as is_deleted,
  1 as is_active,
  NOW(),
  wbo.creator_id
FROM wb_manufacturing_output wbo
WHERE wbo.is_deleted = 0
AND NOT EXISTS (
  SELECT 1 FROM wb_manufacturing_output_allocation wbaa 
  WHERE wbaa.wb_manufacturing_output_id = wbo.id
);
```

---

### الخطوة 3: تحديث أعمدة المخرجات

```sql
-- تحديث أعمدة الكمية والحالة في جدول wb_manufacturing_output
UPDATE wb_manufacturing_output wbo
SET 
  wbo.total_allocated_quantity = wbo.quantity,
  wbo.remaining_quantity = 0,
  wbo.allocation_status = 'completed'
WHERE wbo.is_deleted = 0
AND NOT EXISTS (
  SELECT 1 FROM wb_manufacturing_output_allocation wbaa 
  WHERE wbaa.wb_manufacturing_output_id = wbo.id 
  AND wbaa.is_deleted = 0
  AND wbaa.remaining_quantity > 0
);
```

---

### الخطوة 4: التحقق من البيانات

```sql
-- تحقق من التخصيصات المضافة
SELECT 
  wbo.id as output_id,
  wbo.quantity as output_quantity,
  COUNT(wbaa.id) as allocation_count,
  SUM(wbaa.allocated_quantity) as total_allocated
FROM wb_manufacturing_output wbo
LEFT JOIN wb_manufacturing_output_allocation wbaa 
  ON wbaa.wb_manufacturing_output_id = wbo.id 
  AND wbaa.is_deleted = 0
WHERE wbo.is_deleted = 0
GROUP BY wbo.id
ORDER BY wbo.date_added DESC;
```

---

## 🔄 الخيار ب: إذا كانت البيانات القديمة تحتوي على تخصيصات متعددة

إذا كانت لديك معلومات عن كيفية توزيع المخرجات على طلبات متعددة في الماضي:

```sql
-- أضف البيانات يدوياً أو من خلال ملف CSV
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
  is_active,
  date_added,
  last_person_updated
)
VALUES (
  'ALLOCATION-ID-HERE',  -- معرف فريد جديد
  'OUTPUT-ID-HERE',      -- معرف المخرج
  'ORDER-ID-HERE',       -- معرف الطلب
  'DETAIL-ID-HERE',      -- معرف تفاصيل الطلب
  100,                   -- الكمية المخصصة
  1,                     -- ترتيب التخصيص
  'USER-ID',             -- معرف المستخدم
  'IP-ADDRESS',          -- عنوان IP
  0,                     -- غير محذوف
  1,                     -- نشط
  NOW(),                 -- التاريخ الحالي
  'USER-ID'              -- آخر محدّث
);
```

---

## ⚠️ ملاحظات مهمة

### 1. **نسخ احتياطي قبل الهجرة**
```bash
# من قبل تشغيل أي أوامر SQL، قم بأخذ نسخة احتياطية
mysqldump -h localhost -u root -p fmp_tatari_2024 > backup_before_migration.sql
```

### 2. **المعرّفات الفريدة**
- تأكد من استخدام معرّفات فريدة في العمود `id`
- يمكنك استخدام `UUID()` أو `CONCAT('ALL-', NOW(), RAND())`

### 3. **عدم فقدان البيانات**
جميع المخرجات الموجودة ستبقى كما هي، فقط سيتم إضافة سجلات تخصيص جديدة.

### 4. **الـ Triggers**
بعد إضافة البيانات، تأكد من أن الـ triggers تعمل بشكل صحيح:
```sql
-- تحقق من الـ triggers
SHOW TRIGGERS FROM fmp_tatari_2024 LIKE 'wb_manufacturing_output_allocation%';
```

---

## 🧪 اختبر النظام بعد الهجرة

### اختبار 1: إنشاء مخرج جديد مع تخصيصات
```javascript
// في Postman أو أي API client
POST /api/wb-manufacturing-requisition/create

Body:
{
  "fabricId": "FABRIC-ID",
  "ordersRequisitionsId": "ORDER-ID",
  "industryId": "INDUSTRY-ID",
  "items": [...]
  "childOrders": [
    {
      "order_id": "ORDER-1",
      "details_id": "DETAIL-1",
      "required_quantity": 50
    },
    {
      "order_id": "ORDER-2",
      "details_id": "DETAIL-2",
      "required_quantity": 30
    }
  ]
}
```

### اختبار 2: التحقق من التخصيصات
```
GET /api/wb-output-allocation/:output_id
```

---

## 📋 ملخص الخطوات

| الخطوة | الإجراء | الملف |
|------|--------|------|
| 1 | تنفيذ الـ migration | `migrations/wb_manufacturing_output_allocation.sql` |
| 2 | إضافة البيانات القديمة (if any) | SQL في هذا الملف |
| 3 | التحقق من البيانات | SQL للتحقق |
| 4 | اختبار النظام الجديد | API testing |

---

## ❓ الأسئلة الشائعة

**س: هل سأفقد البيانات القديمة؟**
ج: لا، جميع البيانات القديمة ستبقى وسيتم فقط إضافة جداول وسجلات جديدة.

**س: هل يجب إيقاف النظام أثناء الهجرة؟**
ج: نعم، من الأفضل إيقاف التطبيق لتجنب أي تضارب في البيانات.

**س: كيف أتراجع إذا حدث خطأ؟**
ج: استعد النسخة الاحتياطية: `mysql -h localhost -u root -p fmp_tatari_2024 < backup_before_migration.sql`

---

**تاريخ الإنشاء:** 23 فبراير 2026
**الإصدار:** 1.0
