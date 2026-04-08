# قائمة الملفات والتعديلات - Quick Reference

## 📁 الملفات المطلوبة

### ✅ ملفات موجودة بالفعل (تحتاج قراءة فقط)
```
- app.js                          ← سنضيف router جديد هنا
- util/database-tables-name.js    ← سنضيف ثابت جديد هنا
```

### 🆕 ملفات جديدة يجب إنشاؤها

#### 1. SQL Migration
```
📄 migrations/wb_manufacturing_output_allocation.sql
   - إنشاء جدول: wb_manufacturing_output_allocation
   - تعديل جدول: wb_manufacturing_output (إضافة 3 حقول)
   - تعديل جدول: orders_requisitions (إضافة parent_order_id)
   - إنشاء 3 Triggers للتحديث التلقائي
   - إنشاء Indexes لتحسين الأداء
```

#### 2. Database Queries
```
📄 db/queries/wb/wb-manufacturing-output-allocation.js
   ├── insert()
   ├── select()
   ├── selectOne()
   ├── selectByOutputId()
   ├── selectByOrderId()
   ├── update()
   ├── deleteById()
   └── getTotalAllocated()
```

#### 3. Service Layer
```
📄 services/wb/wb-manufacturing-output-allocation.js
   ├── allocateOutput()              ← دالة التخصيص الرئيسية
   ├── getAllocationsForOutput()
   ├── updateAllocation()
   └── deleteAllocation()
```

#### 4. API Router
```
📄 routers/wb/wb-manufacturing-output-allocation.js
   ├── POST   /allocate              ← تخصيص جديد
   ├── GET    /:output_id            ← جلب التخصيصات
   ├── PUT    /:allocation_id        ← تحديث
   └── DELETE /:allocation_id        ← حذف
```

---

## 📝 التعديلات على الملفات الموجودة

### الملف 1: `util/database-tables-name.js`

**الموقع:** حوالي السطر 86 (بعد wbManufacturingOutputOrderTableName)

**إضافة:**
```javascript
// في الأعلى مع باقي الثوابت (حوالي السطر 86)
const wbManufacturingOutputAllocationTableName = 'wb_manufacturing_output_allocation';

// في module.exports (حوالي السطر 320)
wbManufacturingOutputAllocationTableName,
```

---

### الملف 2: `app.js`

**البحث عن:** الأسطر التي تتضمن باقي الـ routers

**إضافة (مثال):**
```javascript
// في الأعلى مع باقي require
const wbManufacturingOutputAllocationRouter = require("./routers/wb/wb-manufacturing-output-allocation");

// في مسارات التطبيق (مع باقي routes)
app.use("/api/wb/output-allocation", wbManufacturingOutputAllocationRouter);
```

---

## 🔄 ترتيب التطبيق الموصى به

```
1️⃣  تنفيذ SQL Migration
    └─ ملف: migrations/wb_manufacturing_output_allocation.sql
    
2️⃣  تحديث Constants
    └─ ملف: util/database-tables-name.js
    
3️⃣  إنشاء Queries
    └─ ملف: db/queries/wb/wb-manufacturing-output-allocation.js
    
4️⃣  إنشاء Service
    └─ ملف: services/wb/wb-manufacturing-output-allocation.js
    
5️⃣  إنشاء Router
    └─ ملف: routers/wb/wb-manufacturing-output-allocation.js
    
6️⃣  تحديث app.js
    └─ ملف: app.js
    
7️⃣  الاختبار
    └─ استخدام Postman أو cURL
```

---

## 📊 جدول الملفات

| الملف | الوصف | النوع | الحالة |
|-------|-------|--------|--------|
| `migrations/wb_manufacturing_output_allocation.sql` | SQL Migration | جديد | ✅ موجود |
| `util/database-tables-name.js` | إضافة ثابت | تعديل | ⏳ يحتاج تعديل |
| `db/queries/wb/wb-manufacturing-output-allocation.js` | Database Queries | جديد | ⏳ يحتاج إنشاء |
| `services/wb/wb-manufacturing-output-allocation.js` | Business Logic | جديد | ⏳ يحتاج إنشاء |
| `routers/wb/wb-manufacturing-output-allocation.js` | API Endpoints | جديد | ⏳ يحتاج إنشاء |
| `app.js` | تسجيل Router | تعديل | ⏳ يحتاج تعديل |
| `IMPLEMENTATION_STEPS.md` | دليل التطبيق | وثائق | ✅ موجود |

---

## 🗂️ هيكل المشروع بعد التطبيق

```
API Tatary 2024/
├── migrations/
│   ├── parent_orders_system.sql
│   ├── fix_wc_transition_between_orders_parent_columns.sql
│   └── wb_manufacturing_output_allocation.sql        ✅ جديد
│
├── db/
│   └── queries/
│       └── wb/
│           ├── wb-manufacturing-input.js
│           ├── wb-manufacturing-output.js
│           └── wb-manufacturing-output-allocation.js ✅ جديد
│
├── services/
│   └── wb/
│       ├── wb-manufacturing-input.js
│       ├── wb-manufacturing-output.js
│       └── wb-manufacturing-output-allocation.js     ✅ جديد
│
├── routers/
│   └── wb/
│       ├── wb-manufacturing-input.js
│       ├── wb-manufacturing-output.js
│       └── wb-manufacturing-output-allocation.js     ✅ جديد
│
├── util/
│   ├── database-tables-name.js                       📝 تعديل
│   └── ...
│
├── app.js                                             📝 تعديل
└── ...
```

---

## 💡 معلومات تقنية

### Endpoints الرئيسية
- `POST /api/wb/output-allocation/allocate` - تخصيص مخرجات
- `GET /api/wb/output-allocation/:output_id` - جلب التخصيصات
- `PUT /api/wb/output-allocation/:allocation_id` - تعديل تخصيص
- `DELETE /api/wb/output-allocation/:allocation_id` - حذف تخصيص

### الجداول المُنشأة/المُعدّلة
- `wb_manufacturing_output_allocation` (جديد)
- `wb_manufacturing_output` (تعديل: +3 حقول)
- `orders_requisitions` (تعديل: +1 حقل)

### الـ Triggers المُنشأة
- `trg_update_output_on_insert_allocation`
- `trg_update_output_on_update_allocation`
- `trg_update_output_on_delete_allocation`

### Database Functions المستخدمة
- SUM() - لحساب إجمالي الكميات المخصصة
- COALESCE() - للتعامل مع القيم الفارغة

---

## ⚠️ متطلبات مسبقة

- صلاحيات Admin على قاعدة البيانات
- Node.js v14+ (أو الإصدار المستخدم حالياً)
- Knex.js (أو نفس مكتبة الـ queries المستخدمة)
- Express.js (موجود في المشروع)

---

## 🔐 المراجع الأمان

- جميع التخصيصات تُسجل مع معرف المستخدم والـ IP
- استخدام soft delete (is_deleted = 1) وليس hard delete
- التحقق من الصلاحيات موجود في middleware
- All timestamps مُسجلة تلقائياً

---

**ملاحظة:** جميع الملفات جاهزة للاستخدام في الملف `IMPLEMENTATION_STEPS.md`
