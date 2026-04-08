# ملف تعديلات نظام تخصيص مخرجات التصنيع
## Implementation Steps - خطوات التطبيق

**التاريخ:** 22 فبراير 2026  
**الغرض:** إضافة نظام تخصيص مخرجات التصنيع على الطلبات الفرعية

---

## 📋 جدول المحتويات
1. [تنفيذ SQL Migration](#1-تنفيذ-sql-migration)
2. [تحديث Constants](#2-تحديث-constants)
3. [إنشاء Queries](#3-إنشاء-queries)
4. [إنشاء Service](#4-إنشاء-service)
5. [إنشاء Router](#5-إنشاء-router)
6. [تحديث app.js](#6-تحديث-appjs)
7. [الاختبار](#7-الاختبار)

---

## 1. تنفيذ SQL Migration

**الملف:** `migrations/wb_manufacturing_output_allocation.sql`

### ما الذي يتم إنشاؤه:

#### ✅ جدول جديد: `wb_manufacturing_output_allocation`
```
الجدول الرئيسي لتخصيص المخرجات على الطلبات الفرعية

الحقول الرئيسية:
- id: معرف فريد
- wb_manufacturing_output_id: المخرجات المراد تخصيصها
- orders_requisitions_id: الطلب الفرعي الذي سيستقبل الكمية
- wc_fabric_order_requisition_details_id: تفاصيل الطلب
- allocated_quantity: الكمية المخصصة
- sequence_order: ترتيب التخصيص (1, 2, 3...)
```

#### ✅ تعديلات على `wb_manufacturing_output`
```
إضافة 3 حقول للتتبع:
- total_allocated_quantity: إجمالي الكمية المخصصة
- remaining_quantity: الكمية المتبقية
- allocation_status: حالة التخصيص (pending/partial/completed)
```

#### ✅ تعديلات على `orders_requisitions`
```
إضافة حقل:
- parent_order_id: يشير للطلب الأساسي (للطلبات الهرمية)

الفائدة: تتبع الطلبات الفرعية المرتبطة بطلب أساسي واحد
```

#### ✅ Triggers للتحديث التلقائي
```
3 Triggers على جدول التخصيص:
1. INSERT: تحديث البيانات عند إنشاء تخصيص جديد
2. UPDATE: تحديث البيانات عند تعديل تخصيص
3. DELETE: تحديث البيانات عند حذف تخصيص

الفائدة: الحفاظ على البيانات متماسكة تلقائياً
```

### طريقة التنفيذ:
```bash
# في MySQL أو قاعدة البيانات التي تستخدمها
mysql -u username -p dbname < migrations/wb_manufacturing_output_allocation.sql

أو انسخ كل محتوى الملف والصقه مباشرة في MySQL Client
```

---

## 2. تحديث Constants

**الملف:** `util/database-tables-name.js`

### الخطوات:

#### أ) أضف المتغير الجديد:
```javascript
// ابحث عن هذا السطر
const wbManufacturingOutputOrderTableName = 'wb_manufacturing_output_order'

// وأضف بعده:
const wbManufacturingOutputAllocationTableName = 'wb_manufacturing_output_allocation';
```

#### ب) أضفه في module.exports:
```javascript
module.exports = {
    // ... الثوابت الأخرى ...
    
    wbManufacturingOutputTableName,
    wbManufacturingInputOutputTableName,
    wbManufacturingOutputOrderTableName,
    wbManufacturingOutputAllocationTableName,  // ← أضيف هنا
    
    // ... باقي الثوابت ...
}
```

### التحقق:
```javascript
// في ملف أي استخدام:
const { wbManufacturingOutputAllocationTableName } = require("../../util/database-tables-name");
console.log(wbManufacturingOutputAllocationTableName); // يطبع: wb_manufacturing_output_allocation
```

---

## 3. إنشاء Queries

**الملف:** `db/queries/wb/wb-manufacturing-output-allocation.js`

### ما يجب أن يتضمنه:

```javascript
- insert(allocation): إدراج تخصيص جديد
- select(whereObject): بحث عام
- selectOne(whereObject): بحث عن تخصيص واحد
- selectByOutputId(outputId): جلب جميع التخصيصات لمخرج معين
- selectByOrderId(orderId): جلب جميع التخصيصات لطلب معين
- update(id, updateObject): تحديث تخصيص
- deleteById(id): حذف (soft delete)
- getTotalAllocated(outputId): حساب إجمالي الكمية المخصصة
```

### مثال استخدام:
```javascript
// جلب جميع التخصيصات لمخرج معين
const allocations = await wbManufacturingOutputAllocationQueries.selectByOutputId('output_123');
// output_123 ← معرف المخرجات

// النتيجة:
[
  {
    id: 'alloc_1',
    wb_manufacturing_output_id: 'output_123',
    orders_requisitions_id: 'order_1',
    allocated_quantity: 300,
    sequence_order: 1
  },
  {
    id: 'alloc_2',
    wb_manufacturing_output_id: 'output_123',
    orders_requisitions_id: 'order_2',
    allocated_quantity: 400,
    sequence_order: 2
  }
]
```

---

## 4. إنشاء Service

**الملف:** `services/wb/wb-manufacturing-output-allocation.js`

### الدوال الرئيسية:

#### 1️⃣ `allocateOutput(outputId, childOrders)`
```
الغرض: تخصيص مخرجات على عدة طلبات فرعية

المدخلات:
- outputId: معرف المخرجات
- childOrders: مصفوفة بالطلبات الفرعية
  [
    { order_id: 'o1', required_quantity: 300, creator_id: 'user1', ip_address: '127.0.0.1' },
    { order_id: 'o2', required_quantity: 400, creator_id: 'user1', ip_address: '127.0.0.1' }
  ]

الآلية:
1. جلب كمية المخرجات (مثلاً 1000)
2. حلقة على كل طلب فرعي:
   - الكمية المخصصة = الحد الأدنى من (الكمية المطلوبة، الكمية المتبقية)
   - إنشاء سجل تخصيص
   - تقليل الكمية المتبقية
3. إرجاع النتائج مع الإحصائيات

المخرجات:
{
  status: 200,
  message: 'تم التخصيص بنجاح',
  data: {
    output_id: 'output_123',
    total_quantity: 1000,
    total_allocated: 1000,
    remaining: 0,
    allocations: [...]
  }
}
```

#### 2️⃣ `getAllocationsForOutput(outputId)`
```
الغرض: جلب جميع التخصيصات لمخرج معين

المخرجات:
{
  status: 200,
  data: {
    output_id: 'output_123',
    total_quantity: 1000,
    total_allocated: 1000,
    remaining: 0,
    allocations: [
      {
        id: 'alloc_1',
        order_id: 'order_1',
        allocated_quantity: 300,
        sequence_order: 1,
        created_at: '2026-02-22 12:00:00'
      },
      ...
    ]
  }
}
```

#### 3️⃣ `updateAllocation(allocationId, newQuantity)`
```
الغرض: تعديل كمية تخصيص معين

المثال:
- تغيير الكمية من 300 إلى 350
```

#### 4️⃣ `deleteAllocation(allocationId)`
```
الغرض: حذف تخصيص (soft delete)
```

---

## 5. إنشاء Router

**الملف:** `routers/wb/wb-manufacturing-output-allocation.js` (ملف جديد)

### Endpoints المتاحة:

#### 1️⃣ POST `/api/wb/output-allocation/allocate`
```
الوصف: تخصيص مخرجات على طلبات فرعية

Body (JSON):
{
  "output_id": "output_123",
  "child_orders": [
    {
      "order_id": "order_1",
      "details_id": "detail_1",
      "required_quantity": 300
    },
    {
      "order_id": "order_2",
      "details_id": "detail_2",
      "required_quantity": 400
    }
  ]
}

Response (200):
{
  "status": 200,
  "message": "تم التخصيص بنجاح",
  "data": {
    "output_id": "output_123",
    "total_quantity": 1000,
    "total_allocated": 1000,
    "remaining": 0,
    "allocations": [...]
  }
}
```

#### 2️⃣ GET `/api/wb/output-allocation/:output_id`
```
الوصف: جلب جميع التخصيصات لمخرج

Params:
- output_id: معرف المخرجات

Response (200):
{
  "status": 200,
  "data": {
    "output_id": "output_123",
    "total_quantity": 1000,
    "total_allocated": 1000,
    "remaining": 0,
    "allocations": [...]
  }
}
```

#### 3️⃣ PUT `/api/wb/output-allocation/:allocation_id`
```
الوصف: تحديث تخصيص

Params:
- allocation_id: معرف التخصيص

Body:
{
  "allocated_quantity": 350
}

Response (200):
{
  "status": 200,
  "message": "تم التحديث بنجاح"
}
```

#### 4️⃣ DELETE `/api/wb/output-allocation/:allocation_id`
```
الوصف: حذف تخصيص

Params:
- allocation_id: معرف التخصيص

Response (200):
{
  "status": 200,
  "message": "تم الحذف بنجاح"
}
```

---

## 6. تحديث app.js

**الملف:** `app.js`

### أضف السطور:
```javascript
// بعد باقي الـ routers
const wbManufacturingOutputAllocationRouter = require("./routers/wb/wb-manufacturing-output-allocation");

// بعد باقي مسارات التطبيق
app.use("/api/wb/output-allocation", wbManufacturingOutputAllocationRouter);
```

### مثال الموقع:
```javascript
// ... routes أخرى ...
const wbManufacturingOutputRouter = require("./routers/wb/wb-manufacturing-output");
app.use("/api/wb/manufacturing-output", wbManufacturingOutputRouter);

// أضف بعده:
const wbManufacturingOutputAllocationRouter = require("./routers/wb/wb-manufacturing-output-allocation");
app.use("/api/wb/output-allocation", wbManufacturingOutputAllocationRouter);
```

---

## 7. الاختبار

### استخدام Postman أو cURL:

#### اختبار 1: تخصيص مخرجات
```bash
POST http://localhost:3000/api/wb/output-allocation/allocate
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "output_id": "wb_output_001",
  "child_orders": [
    {
      "order_id": "req_order_1",
      "details_id": "detail_1",
      "required_quantity": 300
    },
    {
      "order_id": "req_order_2",
      "details_id": "detail_2",
      "required_quantity": 400
    },
    {
      "order_id": "req_order_3",
      "details_id": "detail_3",
      "required_quantity": 300
    }
  ]
}
```

#### اختبار 2: جلب التخصيصات
```bash
GET http://localhost:3000/api/wb/output-allocation/wb_output_001
Authorization: Bearer YOUR_TOKEN
```

#### اختبار 3: تحديث تخصيص
```bash
PUT http://localhost:3000/api/wb/output-allocation/alloc_001
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "allocated_quantity": 350
}
```

#### اختبار 4: حذف تخصيص
```bash
DELETE http://localhost:3000/api/wb/output-allocation/alloc_001
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 النتائج المتوقعة

### بعد التخصيص:
```sql
-- جدول التخصيصات
SELECT * FROM wb_manufacturing_output_allocation 
WHERE wb_manufacturing_output_id = 'wb_output_001';

-- النتيجة:
id             | output_id        | order_id      | quantity | sequence
---------------|------------------|---------------|----------|----------
alloc_001      | wb_output_001    | req_order_1   | 300      | 1
alloc_002      | wb_output_001    | req_order_2   | 400      | 2
alloc_003      | wb_output_001    | req_order_3   | 300      | 3
```

### بيانات المخرجات المحدثة:
```sql
SELECT 
  id, 
  quantity, 
  total_allocated_quantity, 
  remaining_quantity, 
  allocation_status 
FROM wb_manufacturing_output 
WHERE id = 'wb_output_001';

-- النتيجة:
id             | quantity | total_allocated | remaining | status
---------------|----------|-----------------|-----------|----------
wb_output_001  | 1000     | 1000            | 0         | completed
```

---

## 🔍 التحقق من الأخطاء الشائعة

| الخطأ | السبب | الحل |
|-------|-------|------|
| Foreign Key Error | المخرجات أو الطلبات غير موجودة | تأكد من وجود المعرفات صحيحة |
| Trigger Error | الـ triggers لم يتم إنشاؤها | تحقق من تنفيذ migration كاملاً |
| Table Not Found | الجدول الجديد لم يتم إنشاؤه | شغّل migration مرة أخرى |
| Column Not Found | الحقول الجديدة لم تُضف | تحقق من ALTER TABLE في migration |

---

## 📝 ملاحظات مهمة

1. **الترتيب:** تأكد من تنفيذ جميع الخطوات بالترتيب المذكور
2. **النسخ الاحتياطية:** اعمل نسخة احتياطية قبل تنفيذ migration
3. **الاختبار:** اختبر على database محلي أولاً
4. **الصلاحيات:** تأكد من أن المستخدم هو admin أو لديه صلاحيات كافية
5. **الـ Triggers:** قد تحتاج إلى SUPER privilege لإنشاء triggers

---

## ✅ قائمة التحقق النهائية

- [ ] تنفيذ SQL migration بنجاح
- [ ] إضافة الثوابت في database-tables-name.js
- [ ] إنشاء file queries للتخصيص
- [ ] إنشاء file service للتخصيص
- [ ] إنشاء file router للتخصيص
- [ ] تحديث app.js مع الـ router الجديد
- [ ] اختبار جميع الـ endpoints
- [ ] التحقق من البيانات في قاعدة البيانات

---

**تم إنشاؤه:** 22 فبراير 2026
