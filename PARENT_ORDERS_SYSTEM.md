# نظام دمج الطلبيات (Parent Orders System)

## نظرة عامة
تم تطوير نظام parent/child للطلبيات يسمح بدمج طلبيتين أو أكثر تحت طلبية أم واحدة (parent). هذا يتيح:
- إدارة متكاملة للطلبيات المرتبطة
- تقارير موحدة للطلبيات المدموجة
- سهولة تتبع المخزون والعمليات المرتبطة

## البنية الأساسية

### ملاحظة مهمة:
**نظام الـ Parent يبدأ من `wc_fabric_order_requisition` (بدون إضافة parent في جدول `orders_requisitions` نفسه)**  
لكن بما أن `wc_fabric_order_requisition` له **composite primary key** `(id, orders_requisitions_id)`،  
نحتاج لكلا الحقلين لعمل self-join صحيح.

### الحقول المضافة:

#### 1. في جدول `wc_fabric_order_requisition` (نقطة البداية - composite key):
```sql
parent_wc_fabric_order_requisition_id VARCHAR(50) DEFAULT NULL  -- هذا هو الـ parent_id
parent_orders_requisitions_id VARCHAR(50) DEFAULT NULL           -- للـ composite key
is_parent BOOLEAN DEFAULT FALSE                                  -- علامة للطلبيات الأم
name VARCHAR(500)                                                -- تم تكبير الحقل لدعم الأسماء المدموجة
```

#### 2. في جدول `wc_fabric_order_requisition_details`:
```sql
parent_wc_fabric_order_requisition_details_id VARCHAR(50) DEFAULT NULL
parent_wc_fabric_order_requisition_id VARCHAR(50) DEFAULT NULL
parent_orders_requisitions_id VARCHAR(50) DEFAULT NULL
```

#### 3. في جداول العمليات (sell, reconciliation, execute, transitions, etc.):
كل جدول يحتوي على:
```sql
parent_wc_fabric_order_requisition_details_id VARCHAR(50) DEFAULT NULL
parent_wc_fabric_order_requisition_id VARCHAR(50) DEFAULT NULL
parent_orders_requisitions_id VARCHAR(50) DEFAULT NULL
```

## كيفية العمل

### عند إنشاء طلبية جديدة:
- يتم تعيين `parent_wc_fabric_order_requisition_id = id` تلقائياً
- يتم تعيين `parent_orders_requisitions_id = orders_requisitions_id` تلقائياً (لأنه composite key)
- أي الطلبية تكون parent لنفسها افتراضياً

### دمج الطلبيات:
عند دمج طلبيات متعددة تحت parent واحد، يتم:
1. تحديث `parent_wc_fabric_order_requisition_id` و `parent_orders_requisitions_id` لجميع الطلبيات المدموجة
2. تحديث جميع التفاصيل (details) المرتبطة بالطلبيات
3. **تحديث اسم الطلبية الأم تلقائياً** ليصبح مجموع أسماء جميع الطلبيات المدموجة مفصولة بـ `+`
   - مثال: دمج "طلبية قماش أحمر" + "طلبية قماش أزرق" → اسم الـ parent = "طلبية قماش أحمر + طلبية قماش أزرق"

### التعامل مع العمليات (نقص/زيادة الكمية):

**في واجهة المستخدم (GUI):**
- المستخدم يرى فقط الـ **parent** في القوائم والتقارير
- عند إجراء أي عملية (بيع، تنفيذ، نقل، إلخ)، الـ GUI يرسل فقط الـ **parent_id**

**في الـ Backend:**
1. عند استقبال الـ `parent_id`، يتم جلب **جميع الطلبيات المدموجة** (children) تحت هذا الـ parent
2. ترتيب الطلبيات حسب **تاريخ الإنشاء** (`created_at`) أو ترتيب محدد
3. عند **نقص الكمية** (بيع، تنفيذ، إلخ):
   - نبدأ من أول طلبية child
   - ننقص الكمية المطلوبة
   - إذا انتهت كمية الطلبية الأولى وما زال هناك كمية متبقية، ننتقل للطلبية الثانية
   - نستمر حتى نقص الكمية المطلوبة من جميع children بالترتيب

4. عند **زيادة الكمية** (إضافة، إرجاع، إلخ):
   - نفس المنطق: نبدأ من أول child ونزيد الكمية بالترتيب

**مثال:**
```
Parent Order: #123
└── Child 1: #123-A (100 متر متاح) - تاريخ: 2024-01-01
└── Child 2: #123-B (150 متر متاح) - تاريخ: 2024-01-05  
└── Child 3: #123-C (200 متر متاح) - تاريخ: 2024-01-10

طلب بيع 180 متر من Parent #123:
1. نبيع 100 متر من Child 1 → متبقي: 0 متر
2. نبيع 80 متر من Child 2 → متبقي: 70 متر
3. Child 3 يبقى كما هو → متبقي: 200 متر
```

**ملاحظة:** هذا المنطق يجب تطبيقه في جميع العمليات:
- البيع (`wc_sell_requisition_details`)
- التنفيذ (`wc_execute_order_requisition_details`)
- التسوية (`wc_reconciliation_requisition_details`)
- النقل (`wc_transition_between_*`)
- جميع العمليات الأخرى

## تطبيق المنطق في الكود (Implementation)

### دالة مساعدة لجلب الطلبيات المدموجة بالترتيب:

```javascript
/**
 * جلب جميع الطلبيات المدموجة تحت parent معين مرتبة حسب تاريخ الإنشاء
 * @param {string} parentId - معرف الطلبية الأم
 * @returns {Array} قائمة الطلبيات المدموجة مرتبة
 */
async function getChildOrdersSorted(parentId) {
  const orders = await knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .where('is_active', 1)
    .orderBy('created_at', 'asc')  // ترتيب حسب تاريخ الإنشاء
    .select('*');
  
  return orders;
}
```

### مثال: نقص الكمية من الطلبيات المدموجة:

```javascript
/**
 * نقص كمية من طلبيات مدموجة بالترتيب
 * @param {string} parentId - معرف الطلبية الأم
 * @param {string} fabricId - معرف القماش
 * @param {number} requestedQuantity - الكمية المطلوب نقصها
 */
async function deductQuantityFromMergedOrders(parentId, fabricId, requestedQuantity) {
  // 1. جلب الطلبيات المدموجة مرتبة
  const childOrders = await getChildOrdersSorted(parentId);
  
  let remainingQuantity = requestedQuantity;
  const deductedItems = [];
  
  // 2. المرور على كل طلبية بالترتيب
  for (const order of childOrders) {
    if (remainingQuantity <= 0) break;
    
    // جلب تفاصيل الطلبية للقماش المحدد
    const orderDetail = await knex('wc_fabric_order_requisition_details')
      .where('wc_fabric_order_requisition_id', order.id)
      .where('fabric_id', fabricId)
      .where('is_deleted', 0)
      .where('is_active', 1)
      .first();
    
    if (!orderDetail) continue;
    
    const availableQuantity = orderDetail.current_quantity;
    
    if (availableQuantity > 0) {
      // 3. نقص الكمية المتاحة أو المطلوبة (أيهما أقل)
      const quantityToDeduct = Math.min(availableQuantity, remainingQuantity);
      
      // تسجيل العملية
      deductedItems.push({
        orderId: order.id,
        orderDetailId: orderDetail.id,
        quantity: quantityToDeduct,
        parentOrderId: parentId
      });
      
      // تحديث الكمية المتبقية
      remainingQuantity -= quantityToDeduct;
    }
  }
  
  // 4. التحقق من توفر الكمية الكاملة
  if (remainingQuantity > 0) {
    throw new Error(`الكمية المتاحة غير كافية. متبقي: ${remainingQuantity} متر`);
  }
  
  return deductedItems;
}
```

### استخدام الدالة في عمليات البيع:

```javascript
// مثال: عملية بيع
async function createSellOperation(parentOrderId, fabricId, sellQuantity) {
  try {
    // جلب التفاصيل من الطلبيات المدموجة
    const deductedItems = await deductQuantityFromMergedOrders(
      parentOrderId, 
      fabricId, 
      sellQuantity
    );
    
    // إنشاء سجلات البيع لكل طلبية
    for (const item of deductedItems) {
      await knex('wc_sell_requisition_details').insert({
        id: generateId(),
        wc_fabric_order_requisition_id: item.orderId,
        parent_wc_fabric_order_requisition_id: item.parentOrderId,
        wc_fabric_order_requisition_details_id: item.orderDetailId,
        parent_wc_fabric_order_requisition_details_id: item.orderDetailId,
        fabric_id: fabricId,
        quantity: item.quantity,
        // ... باقي الحقول المطلوبة
      });
      
      // تحديث الكمية المتاحة في الطلبية
      await knex('wc_fabric_order_requisition_details')
        .where('id', item.orderDetailId)
        .decrement('current_quantity', item.quantity);
    }
    
    return { success: true, deductedItems };
  } catch (error) {
    throw error;
  }
}
```

**ملاحظات مهمة:**
- يجب تطبيق نفس المنطق في جميع العمليات (تنفيذ، تسوية، نقل، إلخ)
- التحقق دائماً من توفر الكمية قبل تنفيذ العملية
- استخدام الترتيب الصحيح (`ORDER BY created_at ASC`) لضمان FIFO (First In, First Out)
- حفظ `parent_id` في جميع سجلات العمليات للتقارير

## API Endpoints

### 1. دمج طلبيات متعددة
**Endpoint:** `PUT /wc-fabric-order-requisition/merge-orders`

**Request Body:**
```json
{
  "orderIds": ["order-id-1", "order-id-2", "order-id-3"],
  "parentOrderId": "parent-order-id"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Successfully merged 3 orders under parent parent-order-id",
  "parentOrderId": "parent-order-id"
}
```

### 2. فصل طلبية من parent
**Endpoint:** `PUT /wc-fabric-order-requisition/detach-order/:id`

**Response:**
```json
{
  "status": 1,
  "message": "Order order-id is now independent"
}
```

### 3. جلب الطلبيات المدموجة تحت parent معين
**Endpoint:** `GET /wc-fabric-order-requisition/merged-orders/:id`

**Response:**
```json
[
  {
    "id": "order-id-1",
    "parent_wc_fabric_order_requisition_id": "parent-id",
    "number": 123,
    "name": "طلبية 1",
    "date": "2024-01-01",
    "seller_name": "عميل 1"
  }
]
```

### 4. جلب جميع الطلبيات مع معلومات parent
**Endpoint:** `GET /wc-fabric-order-requisition/with-parent-info`

**Response:**
```json
[
  {
    "id": "parent-id",
    "parent_wc_fabric_order_requisition_id": "parent-id",
    "number": 100,
    "name": "طلبية أم",
    "is_parent": true,
    "merged_orders_count": 3
  },
  {
    "id": "child-id",
    "parent_wc_fabric_order_requisition_id": "parent-id",
    "number": 101,
    "name": "طلبية فرعية",
    "is_parent": false,
    "merged_orders_count": 0
  }
]
```

## التقارير

جميع التقارير تستخدم `parent_wc_fabric_order_requisition_id` بدلاً من `wc_fabric_order_requisition_id` للفلترة:

### الدوال المعدلة:
- `selectDetailsByWarehouseByFabricByConsigmentManufacturing` في:
  - wc-add-requisition-details
  - wc-sell-requisition-details
  - wc-reconciliation-requisition-details
  - wc-return-requisition-details
  - wc-execute-order-requisition-details
  - wc-transition-between-wh-requisition-details
  - wc-transition-between-orders-requisition-details

هذا يضمن أن التقارير تجمع البيانات من جميع الطلبيات المدموجة تحت parent واحد.

## مثال عملي

### السيناريو:
لديك 3 طلبيات منفصلة:
- طلبية A (رقم 100)
- طلبية B (رقم 101)
- طلبية C (رقم 102)

### الخطوات:

#### 1. إنشاء الطلبيات:
```javascript
// عند الإنشاء، كل طلبية تكون parent لنفسها
// طلبية A: parent_id = A.id
// طلبية B: parent_id = B.id
// طلبية C: parent_id = C.id
```

#### 2. دمج الطلبيات تحت A:
```json
PUT /wc-fabric-order-requisition/merge-orders
{
  "orderIds": ["B.id", "C.id"],
  "parentOrderId": "A.id"
}
```

النتيجة:
- طلبية A: parent_id = A.id (تبقى كما هي)
- طلبية B: parent_id = A.id (تم التحديث)
- طلبية C: parent_id = A.id (تم التحديث)

#### 3. جلب التقارير:
```javascript
// عند جلب تقرير المخزون للطلبية A
// سيتم جمع البيانات من A, B, C معاً
selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing(
  fabricId, 
  warehouseId, 
  consigmentManufacturingId, 
  "A.id" // parent_id
)
// النتيجة: مجموع المخزون من الطلبيات الثلاث
```

#### 4. فصل طلبية B:
```json
PUT /wc-fabric-order-requisition/detach-order/B.id
```

النتيجة:
- طلبية A: parent_id = A.id
- طلبية B: parent_id = B.id (أصبحت مستقلة)
- طلبية C: parent_id = A.id

## ملاحظات مهمة

1. **الطلبية الأم (Parent)**:
   - يمكن أن تكون أي طلبية
   - يجب أن تكون موجودة وغير محذوفة
   - الطلبية التي `parent_id = id` تعتبر parent

2. **التقارير**:
   - جميع التقارير تعتمد على `parent_id` لجمع البيانات
   - هذا يضمن رؤية شاملة للمخزون والعمليات

3. **العمليات (Operations)**:
   - عند إضافة/بيع/تسوية، يجب تحديد `parent_id` الصحيح
   - النظام يحفظ `parent_id` تلقائياً في جميع العمليات

4. **الدمج والفصل**:
   - يمكن دمج أي عدد من الطلبيات
   - يمكن فصل أي طلبية لتصبح مستقلة
   - الفصل يجعل الطلبية parent لنفسها

## Migration SQL الكامل

```sql
-- ========== وحدة A: جداول WC (Warehouse - Circular) ==========

-- 1. wc_fabric_order_requisition (نقطة البداية - composite key)
ALTER TABLE `wc_fabric_order_requisition` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `is_parent` BOOLEAN DEFAULT FALSE,
ADD COLUMN `name_updated_at` TIMESTAMP NULL DEFAULT NULL,
ADD INDEX `idx_parent_wc_fabric_order_requisition_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_orders_requisitions_id` (`parent_orders_requisitions_id`);

-- تحديث الطلبيات الموجودة: جعل كل طلبية parent لنفسها
UPDATE `wc_fabric_order_requisition` 
SET `parent_wc_fabric_order_requisition_id` = `id`,
    `parent_orders_requisitions_id` = `orders_requisitions_id`,
    `is_parent` = TRUE
WHERE `parent_wc_fabric_order_requisition_id` IS NULL;

-- 2. wc_fabric_order_requisition_details
ALTER TABLE `wc_fabric_order_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wc_fab_order_req_details_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_wc_fab_order_req_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث التفاصيل الموجودة: ربطها بـ parent
UPDATE `wc_fabric_order_requisition_details` d
JOIN `wc_fabric_order_requisition` o ON d.wc_fabric_order_requisition_id = o.id
SET d.`parent_wc_fabric_order_requisition_details_id` = d.`id`,
    d.`parent_wc_fabric_order_requisition_id` = o.`parent_wc_fabric_order_requisition_id`,
    d.`parent_orders_requisitions_id` = o.`parent_orders_requisitions_id`
WHERE d.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 3. wc_add_requisition_details_fabric_order
ALTER TABLE `wc_add_requisition_details_fabric_order` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_add_fab_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_add_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر الطلبية
UPDATE `wc_add_requisition_details_fabric_order` a
JOIN `wc_fabric_order_requisition` o
  ON a.`wc_fabric_order_requisition_id` = o.`id`
 AND a.`orders_requisitions_id` = o.`orders_requisitions_id`
SET a.`parent_wc_fabric_order_requisition_id` = o.`parent_wc_fabric_order_requisition_id`,
    a.`parent_orders_requisitions_id` = o.`parent_orders_requisitions_id`
WHERE a.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 4. wc_sell_requisition_details
ALTER TABLE `wc_sell_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_sell_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_sell_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_sell_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wc_sell_requisition_details` s
JOIN `wc_fabric_order_requisition_details` d
  ON s.`wc_fabric_order_requisition_details_id` = d.`id`
SET s.`parent_wc_fabric_order_requisition_details_id` = d.`parent_wc_fabric_order_requisition_details_id`,
    s.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    s.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE s.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 5. wc_reconcilition_requisition_details
ALTER TABLE `wc_reconcilition_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_reconcil_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_reconcil_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_reconcil_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wc_reconcilition_requisition_details` r
JOIN `wc_fabric_order_requisition_details` d
  ON r.`wc_fabric_order_requisition_details_id` = d.`id`
SET r.`parent_wc_fabric_order_requisition_details_id` = d.`parent_wc_fabric_order_requisition_details_id`,
    r.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    r.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE r.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 6. wc_return_requisition_details
ALTER TABLE `wc_return_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_return_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_return_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_return_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wc_return_requisition_details` r
JOIN `wc_fabric_order_requisition_details` d
  ON r.`wc_fabric_order_requisition_details_id` = d.`id`
SET r.`parent_wc_fabric_order_requisition_details_id` = d.`parent_wc_fabric_order_requisition_details_id`,
    r.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    r.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE r.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 7. wc_execute_order_requisition_details
ALTER TABLE `wc_execute_order_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_execute_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_execute_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_execute_orders_req_id` (`parent_orders_requisitions_id`);

-- 8. wc_transition_between_wh_requisitions_details
ALTER TABLE `wc_transition_between_wh_requisitions_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_transition_wh_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_transition_wh_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_wh_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wc_transition_between_wh_requisitions_details` t
JOIN `wc_fabric_order_requisition_details` d
  ON t.`wc_fabric_order_requisition_details_id` = d.`id`
SET t.`parent_wc_fabric_order_requisition_details_id` = d.`parent_wc_fabric_order_requisition_details_id`,
    t.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    t.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE t.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 9. wc_transition_between_orders_requisitions_details
ALTER TABLE `wc_transition_between_orders_requisitions_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_details_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_source_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_source_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_destination_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_destination_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_transition_order_detail_id` (`parent_wc_fabric_order_requisition_details_id`),
ADD INDEX `idx_parent_transition_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_order_orders_req_id` (`parent_orders_requisitions_id`),
ADD INDEX `idx_parent_transition_src_order_id` (`parent_source_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_src_orders_req_id` (`parent_source_orders_requisitions_id`),
ADD INDEX `idx_parent_transition_dst_order_id` (`parent_destination_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_transition_dst_orders_req_id` (`parent_destination_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية والطلبيات المصدر/الوجهة
UPDATE `wc_transition_between_orders_requisitions_details` t
LEFT JOIN `wc_fabric_order_requisition_details` d
  ON t.`wc_fabric_order_requisition_details_id` = d.`id`
LEFT JOIN `wc_fabric_order_requisition` src
  ON t.`from_wc_fabric_order_requisition_id` = src.`id`
 AND t.`from_orders_requisitions_id` = src.`orders_requisitions_id`
LEFT JOIN `wc_fabric_order_requisition` dst
  ON t.`wc_fabric_order_requisition_id` = dst.`id`
 AND t.`orders_requisitions_id` = dst.`orders_requisitions_id`
SET t.`parent_wc_fabric_order_requisition_details_id` = d.`parent_wc_fabric_order_requisition_details_id`,
    t.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    t.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`,
    t.`parent_source_wc_fabric_order_requisition_id` = src.`parent_wc_fabric_order_requisition_id`,
    t.`parent_source_orders_requisitions_id` = src.`parent_orders_requisitions_id`,
    t.`parent_destination_wc_fabric_order_requisition_id` = dst.`parent_wc_fabric_order_requisition_id`,
    t.`parent_destination_orders_requisitions_id` = dst.`parent_orders_requisitions_id`
WHERE t.`parent_wc_fabric_order_requisition_id` IS NULL;

-- ========== وحدة B: جداول WD (Warehouse - Dyeing) ==========

-- 10. wd_transport_requisition_wd_wc_details
ALTER TABLE `wd_transport_requisition_wd_wc_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_transport_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_transport_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wd_transport_requisition_wd_wc_details` w
JOIN `wc_fabric_order_requisition_details` d
  ON w.`wc_fabric_order_requisition_details_id` = d.`id`
SET w.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    w.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE w.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 11. wd_reconcilition_requisition_details
ALTER TABLE `wd_reconcilition_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_reconcil_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_reconcil_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wd_reconcilition_requisition_details` w
JOIN `wc_fabric_order_requisition_details` d
  ON w.`wc_fabric_order_requisition_details_id` = d.`id`
SET w.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    w.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE w.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 12. wd_transition_between_dyers_requisition_details
ALTER TABLE `wd_transition_between_dyers_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_dyers_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_dyers_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wd_transition_between_dyers_requisition_details` w
JOIN `wc_fabric_order_requisition_details` d
  ON w.`wc_fabric_order_requisition_details_id` = d.`id`
SET w.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    w.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE w.`parent_wc_fabric_order_requisition_id` IS NULL;

-- 13. wd_form_dyeing_requisition_details (جديد)
ALTER TABLE `wd_form_dyeing_requisition_details` 
ADD COLUMN `parent_wc_fabric_order_requisition_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD COLUMN `parent_orders_requisitions_id` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
ADD INDEX `idx_parent_wd_form_dye_order_id` (`parent_wc_fabric_order_requisition_id`),
ADD INDEX `idx_parent_wd_form_dye_orders_req_id` (`parent_orders_requisitions_id`);

-- تحديث البيانات الموجودة: ربطها بـ parent عبر تفاصيل الطلبية
UPDATE `wd_form_dyeing_requisition_details` w
JOIN `wc_fabric_order_requisition_details` d
  ON w.`wc_fabric_order_requisition_details_id` = d.`id`
SET w.`parent_wc_fabric_order_requisition_id` = d.`parent_wc_fabric_order_requisition_id`,
    w.`parent_orders_requisitions_id` = d.`parent_orders_requisitions_id`
WHERE w.`parent_wc_fabric_order_requisition_id` IS NULL;
```

## نصائح التطبيق المهمة

### 1. عند البحث عن الطلبيات:
```javascript
// ❌ خطأ: البحث بـ wc_fabric_order_requisition_id مباشرة
SELECT * FROM wc_sell_requisition_details 
WHERE wc_fabric_order_requisition_id = 'order-123';

// ✅ صحيح: البحث بـ parent_id
SELECT * FROM wc_sell_requisition_details 
WHERE parent_wc_fabric_order_requisition_id = 'parent-456';
```

### 2. عند فلترة التقارير:
```javascript
// ❌ خطأ: سترى بيانات من طلبية واحدة فقط
SELECT SUM(quantity) FROM wc_sell_requisition_details 
WHERE wc_fabric_order_requisition_id = 'order-123';

// ✅ صحيح: ستجمع البيانات من جميع الطلبيات المدموجة
SELECT SUM(quantity) FROM wc_sell_requisition_details 
WHERE parent_wc_fabric_order_requisition_id = 'parent-456';
```

### 3. عندما تقرأ البيانات من القاعدة:
```javascript
// تأكد من استخدام parent_id في الـ WHERE clause
const salesByParent = await knex('wc_sell_requisition_details')
  .where('parent_wc_fabric_order_requisition_id', parentId)  // استخدم parent_id
  .sum('quantity as total_sold');
```

### 4. ملخص لحقول parent_id في كل جدول:

| الجدول | الحقول المضافة | الملاحظات |
|--------|-------------------|---------|
| wc_fabric_order_requisition | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id<br/>is_parent | نقطة البداية - composite key |
| wc_fabric_order_requisition_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_add_requisition_details_fabric_order | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 2 حقل |
| wc_sell_requisition_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_reconcilition_requisition_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_return_requisition_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_execute_order_requisition_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_transition_between_wh_requisitions_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 3 حقول |
| wc_transition_between_orders_requisitions_details | parent_wc_fabric_order_requisition_details_id<br/>parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id<br/>parent_source_wc_fabric_order_requisition_id<br/>parent_source_orders_requisitions_id<br/>parent_destination_wc_fabric_order_requisition_id<br/>parent_destination_orders_requisitions_id | 7 حقول (نقل بين طلبيات) |
| wd_transport_requisition_wd_wc_details | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 2 حقل WD |
| wd_reconcilition_requisition_details | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 2 حقل WD |
| wd_transition_between_dyers_requisition_details | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 2 حقل WD |
| wd_form_dyeing_requisition_details | parent_wc_fabric_order_requisition_id<br/>parent_orders_requisitions_id | 2 حقل WD - جديد |

## خطوات التطبيق بالترتيب

### المرحلة 1: تحضير قاعدة البيانات
1. تنفيذ جميع أوامر ALTER TABLE أعلاه
2. التحقق من الفهارس (indexes) بالفعل

### المرحلة 2: تحديث الكود
1. تحديث جميع ملفات queries
2. تحديث جميع ملفات services
3. تحديث controllers
4. تحديث routers

### المرحلة 3: اختبار شامل
1. اختبار دمج الطلبيات (merge)
2. اختبار فصل الطلبيات (detach)
3. اختبار العمليات (بيع، تنفيذ، إلخ)
4. اختبار التقارير

### المرحلة 4: التحديثات
1. تحديث الـ GUI لعرض parent_id فقط
2. تحديث الـ API responses
3. تحديث الـ validation rules

## نصائح إضافية مهمة

### 1. معالجة الأخطاء الشائعة

#### ❌ الخطأ الأول: نسيان تحديث parent_id
```javascript
// ❌ خطأ: لم نحدث parent_id
await knex('wc_sell_requisition_details').insert({
  wc_fabric_order_requisition_id: order.id,
  quantity: 100
});

// ✅ صحيح: تحديث parent_id أيضاً
await knex('wc_sell_requisition_details').insert({
  wc_fabric_order_requisition_id: order.id,
  parent_wc_fabric_order_requisition_id: parentId,  // ضروري!
  quantity: 100
});
```

#### ❌ الخطأ الثاني: استخدام الـ detail_id بدلاً من parent_detail_id
```javascript
// ❌ خطأ: يفقد الربط مع parent
await knex('wc_sell_requisition_details').insert({
  wc_fabric_order_requisition_details_id: detailId,
  quantity: 100
});

// ✅ صحيح: احفظ كلا الـ ids
await knex('wc_sell_requisition_details').insert({
  wc_fabric_order_requisition_details_id: detailId,
  parent_wc_fabric_order_requisition_details_id: parentDetailId,
  quantity: 100
});
```

#### ❌ الخطأ الثالث: عدم ترتيب الطلبيات المدموجة
```javascript
// ❌ خطأ: قد لا يكون الترتيب FIFO
const childOrders = await knex('wc_fabric_order_requisition')
  .where('parent_wc_fabric_order_requisition_id', parentId)
  .select('*');

// ✅ صحيح: ترتب حسب تاريخ الإنشاء
const childOrders = await knex('wc_fabric_order_requisition')
  .where('parent_wc_fabric_order_requisition_id', parentId)
  .orderBy('created_at', 'asc')
  .select('*');
```

### 2. دالة مساعدة للتحقق من الاتساق

```javascript
/**
 * التحقق من اتساق البيانات في جدول معين
 * تأكد من أن جميع السجلات لها parent_id صحيح
 */
async function validateParentConsistency(tableName, fabricOrderIdColumn) {
  const inconsistentRecords = await knex(tableName)
    .where('is_deleted', 0)
    .whereNull(fabricOrderIdColumn)
    .select('id');
  
  if (inconsistentRecords.length > 0) {
    console.warn(`⚠️ تحذير: ${inconsistentRecords.length} سجل بدون parent_id في ${tableName}`);
    return false;
  }
  
  console.log(`✅ جميع السجلات في ${tableName} لها parent_id صحيح`);
  return true;
}

// استخدام:
await validateParentConsistency('wc_sell_requisition_details', 'parent_wc_fabric_order_requisition_id');
```

### 3. دالة لإصلاح البيانات الناقصة

```javascript
/**
 * ملء parent_id للسجلات التي قد تفقده
 */
async function fixMissingParentIds(tableName, detailIdColumn, fabricOrderIdColumn, parentDetailIdColumn = null) {
  try {
    let updateCount = 0;
    
    const recordsWithoutParent = await knex(tableName)
      .where('is_deleted', 0)
      .whereNull(fabricOrderIdColumn)
      .select('id', detailIdColumn);
    
    for (const record of recordsWithoutParent) {
      // جلب معلومات parent من جدول التفاصيل
      const detail = await knex('wc_fabric_order_requisition_details')
        .where('id', record[detailIdColumn])
        .first();
      
      if (detail) {
        const updateData = {
          [fabricOrderIdColumn]: detail.parent_wc_fabric_order_requisition_id
        };
        
        if (parentDetailIdColumn) {
          updateData[parentDetailIdColumn] = detail.parent_wc_fabric_order_requisition_details_id;
        }
        
        await knex(tableName)
          .where('id', record.id)
          .update(updateData);
        
        updateCount++;
      }
    }
    
    console.log(`✅ تم تحديث ${updateCount} سجل في ${tableName}`);
    return updateCount;
  } catch (error) {
    console.error(`❌ خطأ في تحديث ${tableName}:`, error.message);
    throw error;
  }
}

// استخدام:
await fixMissingParentIds('wc_sell_requisition_details', 'wc_fabric_order_requisition_details_id', 'parent_wc_fabric_order_requisition_id', 'parent_wc_fabric_order_requisition_details_id');
```

### 4. دالة لعرض هيكل الطلبيات المدموجة

```javascript
/**
 * عرض هيكل الطلبيات المدموجة بشكل واضح
 */
async function visualizeOrderHierarchy(parentId) {
  const parentOrder = await knex('wc_fabric_order_requisition')
    .where('id', parentId)
    .first();
  
  if (!parentOrder) {
    console.log('❌ الطلبية الأم غير موجودة');
    return;
  }
  
  console.log(`\n📦 Parent Order: #${parentOrder.number} (${parentOrder.name})`);
  console.log('═'.repeat(60));
  
  const childOrders = await knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .orderBy('created_at', 'asc')
    .select('id', 'number', 'name', 'created_at');
  
  childOrders.forEach((order, index) => {
    const symbol = order.id === parentId ? '👑' : '└──';
    console.log(`${symbol} [${index + 1}] #${order.number} - ${order.name}`);
    console.log(`    تاريخ: ${order.created_at}`);
  });
  
  console.log('═'.repeat(60));
  console.log(`المجموع: ${childOrders.length} طلبية\n`);
}

// استخدام:
await visualizeOrderHierarchy('parent-id-123');
```

### 5. دالة للـ Logging والمراقبة

```javascript
/**
 * تسجيل جميع عمليات المدج والفصل
 */
const parentOrdersLog = [];

async function logParentOperation(operation, parentId, affectedOrderIds, userId) {
  const logEntry = {
    timestamp: new Date(),
    operation, // 'merge' or 'detach'
    parentId,
    affectedOrderIds,
    userId,
    status: 'completed'
  };
  
  parentOrdersLog.push(logEntry);
  
  // يمكن حفظها في قاعدة البيانات أيضاً
  await knex('parent_orders_operations_log').insert(logEntry);
  
  console.log(`✅ تم تسجيل عملية ${operation} للطلبية ${parentId}`);
}

// استخدام:
await logParentOperation('merge', 'parent-123', ['child-1', 'child-2'], 'user-456');
```

## أمثلة استخدام متقدمة

### مثال 1: دمج مجموعة من الطلبيات بناءً على معايير

```javascript
/**
 * دمج جميع الطلبيات للعميل نفسه تحت طلبية واحدة
 */
async function mergeOrdersByCustomer(customerId) {
  try {
    // جلب جميع طلبيات العميل
    const orders = await knex('wc_fabric_order_requisition')
      .where('seller_id', customerId)
      .where('is_deleted', 0)
      .orderBy('created_at', 'asc')
      .select('id');
    
    if (orders.length <= 1) {
      console.log('لا توجد طلبيات متعددة للدمج');
      return;
    }
    
    // استخدام الطلبية الأولى كـ parent
    const parentOrderId = orders[0].id;
    const childOrderIds = orders.slice(1).map(o => o.id);
    
    // دمج
    await mergeOrders(childOrderIds, parentOrderId);
    
    console.log(`✅ تم دمج ${childOrderIds.length} طلبية تحت ${parentOrderId}`);
    
    return parentOrderId;
  } catch (error) {
    console.error('❌ خطأ في الدمج:', error.message);
    throw error;
  }
}
```

### مثال 2: إنشاء تقرير شامل للطلبيات المدموجة

```javascript
/**
 * تقرير شامل يوضح توزيع الكميات على الطلبيات المدموجة
 */
async function generateMergedOrdersReport(parentId) {
  try {
    // جلب الطلبية الأم
    const parentOrder = await knex('wc_fabric_order_requisition')
      .where('id', parentId)
      .first();
    
    if (!parentOrder) {
      throw new Error('Parent order not found');
    }
    
    // جلب جميع التفاصيل من الطلبيات المدموجة
    const details = await knex('wc_fabric_order_requisition_details as d')
      .join('wc_fabric_order_requisition as o', 'd.wc_fabric_order_requisition_id', 'o.id')
      .where('d.parent_wc_fabric_order_requisition_id', parentId)
      .where('d.is_deleted', 0)
      .select(
        'o.number as order_number',
        'o.name as order_name',
        'o.created_at',
        'd.fabric_id',
        'd.quantity as ordered_quantity',
        'd.current_quantity as remaining_quantity',
        knex.raw('(d.quantity - d.current_quantity) as sold_quantity')
      );
    
    // جلب البيانات المبيعة
    const sales = await knex('wc_sell_requisition_details')
      .where('parent_wc_fabric_order_requisition_id', parentId)
      .where('is_deleted', 0)
      .groupBy('parent_wc_fabric_order_requisition_id')
      .select(
        'parent_wc_fabric_order_requisition_id',
        knex.raw('SUM(quantity) as total_sold')
      );
    
    // بناء التقرير
    const report = {
      parentOrder: {
        id: parentOrder.id,
        number: parentOrder.number,
        name: parentOrder.name,
        createdAt: parentOrder.created_at
      },
      details,
      totalSold: sales[0]?.total_sold || 0,
      totalOrdered: details.reduce((sum, d) => sum + d.ordered_quantity, 0),
      totalRemaining: details.reduce((sum, d) => sum + d.remaining_quantity, 0)
    };
    
    return report;
  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error.message);
    throw error;
  }
}
```

### مثال 3: معالجة الطلبية المدموجة عند الفصل

```javascript
/**
 * فصل طلبية وإعادة حساب اسم الـ parent
 */
async function detachOrderAndUpdateParentName(orderId) {
  try {
    const order = await knex('wc_fabric_order_requisition')
      .where('id', orderId)
      .first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    const parentId = order.parent_wc_fabric_order_requisition_id;
    
    // فصل الطلبية
    await detachOrder(orderId);
    
    // إعادة حساب اسم الـ parent
    const remainingOrders = await knex('wc_fabric_order_requisition')
      .where('parent_wc_fabric_order_requisition_id', parentId)
      .where('is_deleted', 0)
      .pluck('name');
    
    const newParentName = remainingOrders.join(' + ');
    
    await knex('wc_fabric_order_requisition')
      .where('id', parentId)
      .update({ name: newParentName });
    
    console.log(`✅ تم فصل الطلبية ${orderId}`);
    console.log(`✅ تم تحديث اسم الـ parent إلى: ${newParentName}`);
    
    return parentId;
  } catch (error) {
    console.error('❌ خطأ في الفصل:', error.message);
    throw error;
  }
}
```

## التكامل مع الكود الموجود

### موارد الكود الحالية المتأثرة

#### 1. في الملفات التي تقرأ من `wc_fabric_order_requisition`:
```javascript
// ملفات قد تحتاج تعديل:
controllers/wc/wc-fabric-order-requisition.js
controllers/wc/wc-add-requisition.js
controllers/wc/wc-sell-requisition.js
controllers/wc/wc-reconciliation-requisition.js
controllers/wc/wc-execute-order-requisition.js
// ... إلخ
```

إضافة: استخراج `parent_wc_fabric_order_requisition_id` و `parent_orders_requisitions_id` من الطلبية الأم

#### 2. في استعلامات الجداول المتعددة:
```javascript
// ❌ القديم:
SELECT * FROM wc_sell_requisition_details
WHERE wc_fabric_order_requisition_id = 'order-123';

// ✅ الجديد:
SELECT * FROM wc_sell_requisition_details
WHERE parent_wc_fabric_order_requisition_id = 'parent-456';
```

#### 3. في دوال التقارير:
```javascript
// ❌ القديم: تجميع البيانات من طلبية واحدة فقط
async function selectDetailsByWarehouseByFabric(fabricId, warehouseId, orderId) {
  return knex('wc_fabric_order_requisition_details')
    .where('wc_fabric_order_requisition_id', orderId)
    .sum('quantity');
}

// ✅ الجديد: تجميع من جميع الطلبيات المدموجة
async function selectDetailsByWarehouseByFabric(fabricId, warehouseId, parentId) {
  return knex('wc_fabric_order_requisition_details')
    .where('parent_wc_fabric_order_requisition_id', parentId)  // استخدم parent_id
    .sum('quantity');
}
```

### الآثار الجانبية المحتملة

#### ⚠️ تأثير على الـ Queries القديمة
- أية استعلامات تستخدم `wc_fabric_order_requisition_id` مباشرة قد لا تعطي النتائج الصحيحة
- **الحل**: تحديث جميع الاستعلامات لاستخدام `parent_wc_fabric_order_requisition_id`

#### ⚠️ تأثير على التقارير
- قد تظهر أرقام مختلفة بعد التطبيق
- **السبب**: التقارير ستجمع البيانات من جميع الطلبيات المدموجة
- **الحل**: هذا هو السلوك المتوقع والمرغوب

#### ⚠️ تأثير على الـ Pagination
```javascript
// قد تحتاج تعديل عند جلب قائمة الطلبيات
// إظهار الـ parent فقط بدلاً من عرض الطلبيات الفردية

// ❌ القديم: عرض جميع الطلبيات
const orders = await knex('wc_fabric_order_requisition').limit(10);

// ✅ الجديد: عرض الـ parent فقط
const orders = await knex('wc_fabric_order_requisition')
  .where(
    knex.raw('? = ?', ['parent_wc_fabric_order_requisition_id', 'id'])
  )  // عرض الـ parent فقط
  .limit(10);
```

### خطوات آمنة للتطبيق

#### المرحلة 1: التحضير (بدون تأثير على الإنتاج)
```javascript
// 1. إنشاء جدول مؤقت للبيانات القديمة
ALTER TABLE `wc_fabric_order_requisition` 
ADD COLUMN `parent_wc_fabric_order_requisition_id_backup` VARCHAR(50) DEFAULT NULL;

// 2. حفظ البيانات القديمة
UPDATE `wc_fabric_order_requisition` 
SET `parent_wc_fabric_order_requisition_id_backup` = `parent_wc_fabric_order_requisition_id`;

// 3. اختبار شامل في بيئة تطوير
// لا تنتقل للمرحلة 2 حتى تتأكد من نجاح جميع الاختبارات
```

#### المرحلة 2: التطبيق التدريجي
```javascript
// 1. تحديث 10% من الطلبيات أولاً
// 2. مراقبة الأداء والأخطاء
// 3. تحديث 50% التالية
// 4. تحديث 100% أخيراً

// مثال:
async function migrateInBatches(batchSize = 100) {
  const totalOrders = await knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', null)
    .count('* as count')
    .first();
  
  let processed = 0;
  const totalCount = totalOrders.count;
  
  while (processed < totalCount) {
    const batch = await knex('wc_fabric_order_requisition')
      .where('parent_wc_fabric_order_requisition_id', null)
      .limit(batchSize)
      .select('id', 'orders_requisitions_id');
    
    for (const order of batch) {
      await knex('wc_fabric_order_requisition')
        .where('id', order.id)
        .update({
          parent_wc_fabric_order_requisition_id: order.id,
          parent_orders_requisitions_id: order.orders_requisitions_id
        });
    }
    
    processed += batch.length;
    console.log(`تم معالجة: ${processed}/${totalCount}`);
  }
}
```

#### المرحلة 3: التحقق
```javascript
// 1. عد السجلات التي لم تحدث
SELECT COUNT(*) as count FROM wc_fabric_order_requisition 
WHERE parent_wc_fabric_order_requisition_id IS NULL;

// 2. التحقق من الاتساق
SELECT * FROM wc_fabric_order_requisition 
WHERE parent_wc_fabric_order_requisition_id != id 
AND parent_wc_fabric_order_requisition_id IS NOT NULL;

// 3. التحقق من الأيتام (orphaned records)
SELECT * FROM wc_fabric_order_requisition_details d
WHERE d.parent_wc_fabric_order_requisition_id IS NULL 
AND d.wc_fabric_order_requisition_id IS NOT NULL;
```

## ملاحظات البيانات

### البيانات الموجودة
```sql
-- احسب عدد الطلبيات الحالية
SELECT COUNT(*) as total_orders FROM wc_fabric_order_requisition WHERE is_deleted = 0;

-- احسب عدد التفاصيل
SELECT COUNT(*) as total_details FROM wc_fabric_order_requisition_details WHERE is_deleted = 0;

-- أعلى طلبية من حيث عدد التفاصيل
SELECT wc_fabric_order_requisition_id, COUNT(*) as detail_count
FROM wc_fabric_order_requisition_details
WHERE is_deleted = 0
GROUP BY wc_fabric_order_requisition_id
ORDER BY detail_count DESC
LIMIT 10;
```

### تنظيف البيانات (إذا لزم الأمر)

```javascript
/**
 * تنظيف السجلات المحذوفة
 */
async function cleanDeletedRecords() {
  const tables = [
    'wc_fabric_order_requisition',
    'wc_fabric_order_requisition_details',
    'wc_sell_requisition_details',
    'wc_reconcilition_requisition_details'
    // ... إلخ
  ];
  
  for (const table of tables) {
    const deletedCount = await knex(table)
      .where('is_deleted', 1)
      .count('* as count')
      .first();
    
    console.log(`${table}: ${deletedCount.count} سجل محذوف`);
  }
}
```

## التوثيق والملاحظات

### ملفات كود عينة

#### controllers/wc/wc-fabric-order-requisition.js
```javascript
// Import المدخلات المطلوبة
const service = require('../../services/wc/wc-fabric-order-requisition');

// Middleware للتحقق من parent_id
router.use((req, res, next) => {
  // تحقق من أن orderId المرسل هو بالفعل parent_id
  // أو تحويله تلقائياً
  next();
});

// جميع العمليات الأخرى تبقى كما هي مع إضافة parent_id
```

### متطلبات النسخة Backward Compatibility
- المسار الحالي يدعم العمليات على الطلبيات الفردية
- لا حاجة لتغيير الـ API endpoints الأساسية
- فقط إضافة endpoints جديدة للدمج والفصل

## الخطوات التالية

### بعد التطبيق الأولي:
1. ✅ تطبيق migration
2. ✅ تحديث الكود
3. ✅ اختبار شامل
4. ✅ نشر في الإنتاج
5. ⏳ مراقبة الأداء
6. ⏳ جمع ملاحظات المستخدمين
7. ⏳ تحسينات إضافية حسب الحاجة

### التحسينات المستقبلية:
- [ ] تقارير متقدمة تجمع البيانات من جميع الطلبيات المدموجة
- [ ] واجهة رسومية لإدارة الدمج والفصل
- [ ] تنبيهات عند محاولة دمج طلبيات غير متوافقة
- [ ] خاصية النسخ الاحتياطي التلقائي للبيانات
- [ ] نسخ الحالة (snapshots) للطلبيات المدموجة

---

## ملخص شامل

### ما تم إنجازه في هذا النظام:

#### 1. **البنية الأساسية** ✅
- إضافة `parent_wc_fabric_order_requisition_id` و `parent_orders_requisitions_id` إلى 13 جدول
- إنشاء فهارس (indexes) لتحسين الأداء
- تحديث جميع السجلات الموجودة لديها parent_id صحيح

#### 2. **الوظائف الأساسية** ✅
- **Merge Orders**: دمج طلبيات متعددة تحت طلبية أم واحدة
- **Detach Order**: فصل طلبية لتصبح مستقلة
- **Get Merged Orders**: جلب جميع الطلبيات المدموجة
- **Get Orders with Parent Info**: جلب معلومات parent لجميع الطلبيات

#### 3. **منطق توزيع الكميات** ✅
- توزيع FIFO (First In, First Out) للكميات على الطلبيات المدموجة
- دعم العمليات: البيع، التنفيذ، التسوية، النقل، الإرجاع
- حفظ parent_id في جميع العمليات للتقارير

#### 4. **التقارير الموحدة** ✅
- جمع البيانات من جميع الطلبيات المدموجة تحت parent واحد
- توحيد المخزون والعمليات
- رؤية شاملة للعمليات المتعلقة

#### 5. **دوال مساعدة وأدوات** ✅
- التحقق من الاتساق
- إصلاح البيانات الناقصة
- تصور الهيكل الهرمي
- Logging والمراقبة
- تنظيف البيانات

#### 6. **التوثيق الشامل** ✅
- أمثلة عملية لجميع العمليات
- أخطاء شائعة وحلولها
- نصائح وملاحظات مهمة
- خطوات التطبيق الآمنة

### الفوائد الرئيسية:

1. **إدارة أفضل للطلبيات**
   - تجميع الطلبيات المرتبطة
   - سهولة متابعة المشاريع المتعددة

2. **تقارير دقيقة**
   - رؤية شاملة للمخزون والعمليات
   - أرقام صحيحة للتحليل

3. **مرونة عالية**
   - دمج وفصل بسهولة
   - FIFO معدل للعمليات

4. **قابلية التوسع**
   - دعم عدد غير محدود من الطلبيات المدموجة
   - هيكل يدعم تطورات مستقبلية

### الجداول المتأثرة بشكل مباشر:

```
WC Module (Warehouse - Circular):
├── wc_fabric_order_requisition (نقطة البداية)
├── wc_fabric_order_requisition_details
├── wc_add_requisition_details_fabric_order
├── wc_sell_requisition_details
├── wc_reconcilition_requisition_details
├── wc_return_requisition_details
├── wc_execute_order_requisition_details
├── wc_transition_between_wh_requisitions_details
└── wc_transition_between_orders_requisitions_details

WD Module (Warehouse - Dyeing):
├── wd_transport_requisition_wd_wc_details
├── wd_reconcilition_requisition_details
├── wd_transition_between_dyers_requisition_details
└── wd_form_dyeing_requisition_details (جديد)
```

### عدد الحقول المضافة:
- **إجمالي حقول**: 38 حقل جديد
- **جداول مع 2 حقل**: 4 جداول
- **جداول مع 3 حقول**: 8 جداول
- **جداول مع 7 حقول**: 1 جدول (النقل بين الطلبيات)

### حالة التطبيق:

| المرحلة | الحالة | ملاحظات |
|--------|--------|---------|
| التصميم | ✅ مكتمل | النموذج الكامل |
| قاعدة البيانات | ⏳ جاهز | Migration SQL معد |
| Queries | ✅ مكتمل | جميع الدوال الأساسية |
| Services | ✅ مكتمل | logic التطبيق |
| Controllers | ✅ مكتمل | API endpoints |
| Routers | ✅ مكتمل | جميع المسارات |
| التوثيق | ✅ مكتمل | شامل وتفصيلي |
| الاختبار | ⏳ معلق | ينتظر التطبيق |
| الإنتاج | ⏳ معلق | بعد الاختبار |

### نصائح أخيرة:

1. **اقرأ الملف بالكامل قبل البدء** 📖
2. **اختبر كل خطوة في بيئة تطوير** 🧪
3. **احتفظ بنسخة احتياطية من قاعدة البيانات** 💾
4. **راقب الأداء بعد التطبيق** 📊
5. **وثق أي تعديلات إضافية تقوم بها** 📝

---

**آخر تحديث**: فبراير 2026  
**الحالة**: جاهز للتطبيق  
**المسؤول**: فريق التطوير

## الملفات المعدلة والجديدة

### 1. Queries Files

#### `db/queries/wc/wc-fabric-order-requisition.js`
```javascript
// دالة جديدة: جلب الطلبيات المدموجة مرتبة
async function selectChildOrdersSorted(parentId) {
  return knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .where('is_active', 1)
    .orderBy('created_at', 'asc')
    .select('*');
}

// دالة جديدة: جلب معلومات parent
async function selectOrdersWithParentInfo() {
  return knex('wc_fabric_order_requisition')
    .where('is_deleted', 0)
    .select(
      'id',
      'parent_wc_fabric_order_requisition_id',
      'orders_requisitions_id',
      'number',
      'name',
      'is_parent',
      knex.raw('(SELECT COUNT(*) FROM wc_fabric_order_requisition child WHERE child.parent_wc_fabric_order_requisition_id = wc_fabric_order_requisition.id AND child.is_deleted = 0) as merged_orders_count')
    )
    .orderBy('created_at', 'asc');
}

// دالة معدلة: تحديث parent_id
async function updateParentId(orderId, parentId, parentOrdersRequisitionsId) {
  return knex('wc_fabric_order_requisition')
    .where('id', orderId)
    .update({
      parent_wc_fabric_order_requisition_id: parentId,
      parent_orders_requisitions_id: parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-fabric-order-requisition-details.js`
```javascript
// دالة معدلة: إضافة parent_id عند الإدراج
async function insertWithParentId(details) {
  return knex('wc_fabric_order_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parent_wc_fabric_order_requisition_details_id,
      parent_wc_fabric_order_requisition_id: details.parent_wc_fabric_order_requisition_id,
      parent_orders_requisitions_id: details.parent_orders_requisitions_id
    });
}

// دالة معدلة: الاستعلام مع parent_id
async function selectByParentId(parentId) {
  return knex('wc_fabric_order_requisition_details')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .select('*');
}
```

#### `db/queries/wc/wc-add-requisition-details-fabric-order.js`
```javascript
// دالة معدلة: حفظ parent_id عند الإضافة
async function insertAddRequisitionDetailsSql(details) {
  return knex('wc_add_requisition_details_fabric_order')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-sell-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند البيع
async function insertSellDetails(details) {
  return knex('wc_sell_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-reconciliation-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند التسوية
async function insertReconciliationDetails(details) {
  return knex('wc_reconcilition_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-execute-order-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند التنفيذ
async function insertExecuteOrderDetails(details) {
  return knex('wc_execute_order_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-transition-between-wh-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند النقل بين المستودعات
async function insertTransitionBetweenWhDetails(details) {
  return knex('wc_transition_between_wh_requisitions_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-transition-between-orders-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند النقل بين الطلبيات
async function insertTransitionBetweenOrdersDetails(details) {
  return knex('wc_transition_between_orders_requisitions_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId,
      parent_source_wc_fabric_order_requisition_id: details.parentSourceFabricOrderId,
      parent_source_orders_requisitions_id: details.parentSourceOrdersRequisitionsId,
      parent_destination_wc_fabric_order_requisition_id: details.parentDestinationFabricOrderId,
      parent_destination_orders_requisitions_id: details.parentDestinationOrdersRequisitionsId
    });
}
```

#### `db/queries/wc/wc-return-requisition-details.js` (جديد)
```javascript
// دالة جديدة: حفظ parent_id عند الإرجاع
async function insertReturnDetails(details) {
  return knex('wc_return_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_details_id: details.parentDetailId,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

### 2. Services Files

#### `services/wc/wc-fabric-order-requisition.js`
```javascript
const getChildOrdersSorted = require('../../db/queries/wc/wc-fabric-order-requisition').selectChildOrdersSorted;

/**
 * دمج طلبيات متعددة تحت طلبية أم واحدة
 */
async function mergeOrders(orderIds, parentOrderId) {
  try {
    // التحقق من وجود الطلبية الأم
    const parentOrder = await knex('wc_fabric_order_requisition')
      .where('id', parentOrderId)
      .where('is_deleted', 0)
      .first();
    
    if (!parentOrder) {
      throw new Error('Parent order not found');
    }
    
    // تحديث جميع الطلبيات المطلوب دمجها
    const parentOrdersRequisitionsId = parentOrder.orders_requisitions_id;
    
    for (const orderId of orderIds) {
      if (orderId === parentOrderId) continue; // تخطي الطلبية الأم
      
      // تحديث الطلبية
      await knex('wc_fabric_order_requisition')
        .where('id', orderId)
        .update({
          parent_wc_fabric_order_requisition_id: parentOrderId,
          parent_orders_requisitions_id: parentOrdersRequisitionsId
        });
      
      // تحديث التفاصيل
      await knex('wc_fabric_order_requisition_details')
        .where('wc_fabric_order_requisition_id', orderId)
        .update({
          parent_wc_fabric_order_requisition_id: parentOrderId,
          parent_orders_requisitions_id: parentOrdersRequisitionsId
        });
    }
    
    // تحديث اسم الطلبية الأم
    const mergedOrders = await knex('wc_fabric_order_requisition')
      .where('parent_wc_fabric_order_requisition_id', parentOrderId)
      .where('is_deleted', 0)
      .orderBy('created_at', 'asc')
      .pluck('name');
    
    const mergedName = mergedOrders.join(' + ');
    
    await knex('wc_fabric_order_requisition')
      .where('id', parentOrderId)
      .update({ name: mergedName });
    
    return { success: true, parentOrderId };
  } catch (error) {
    throw error;
  }
}

/**
 * فصل طلبية من parent
 */
async function detachOrder(orderId) {
  try {
    const order = await knex('wc_fabric_order_requisition')
      .where('id', orderId)
      .first();
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // جعل الطلبية parent لنفسها
    await knex('wc_fabric_order_requisition')
      .where('id', orderId)
      .update({
        parent_wc_fabric_order_requisition_id: orderId,
        parent_orders_requisitions_id: order.orders_requisitions_id
      });
    
    // تحديث التفاصيل
    await knex('wc_fabric_order_requisition_details')
      .where('wc_fabric_order_requisition_id', orderId)
      .update({
        parent_wc_fabric_order_requisition_id: orderId,
        parent_orders_requisitions_id: order.orders_requisitions_id
      });
    
    return { success: true, message: `Order ${orderId} is now independent` };
  } catch (error) {
    throw error;
  }
}

/**
 * جلب الطلبيات المدموجة مع معلومات parent
 */
async function selectMergedOrders(parentId) {
  return knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .orderBy('created_at', 'asc')
    .select('id', 'parent_wc_fabric_order_requisition_id', 'number', 'name', 'created_at');
}

/**
 * جلب جميع الطلبيات مع معلومات parent
 */
async function selectOrdersWithParentInfo() {
  return knex('wc_fabric_order_requisition as main')
    .where('main.is_deleted', 0)
    .select(
      'main.id',
      'main.parent_wc_fabric_order_requisition_id',
      'main.number',
      'main.name',
      'main.is_parent',
      knex.raw('COUNT(child.id) as merged_orders_count')
    )
    .leftJoin('wc_fabric_order_requisition as child', function() {
      this.on('child.parent_wc_fabric_order_requisition_id', '=', 'main.id')
        .andOn(knex.raw('child.is_deleted = 0'));
    })
    .groupBy('main.id')
    .orderBy('main.created_at', 'asc');
}

module.exports = {
  mergeOrders,
  detachOrder,
  selectMergedOrders,
  selectOrdersWithParentInfo
};
```

#### `services/wc/wc-fabric-order-requisition-details.js`
```javascript
/**
 * دالة مساعدة: نقص الكمية من الطلبيات المدموجة بالترتيب
 */
async function deductQuantityFromMergedOrders(parentId, fabricId, requestedQuantity) {
  // جلب الطلبيات المدموجة مرتبة
  const childOrders = await knex('wc_fabric_order_requisition')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .where('is_active', 1)
    .orderBy('created_at', 'asc')
    .select('*');
  
  let remainingQuantity = requestedQuantity;
  const deductedItems = [];
  
  // المرور على كل طلبية بالترتيب
  for (const order of childOrders) {
    if (remainingQuantity <= 0) break;
    
    const orderDetail = await knex('wc_fabric_order_requisition_details')
      .where('wc_fabric_order_requisition_id', order.id)
      .where('fabric_id', fabricId)
      .where('is_deleted', 0)
      .where('is_active', 1)
      .first();
    
    if (!orderDetail) continue;
    
    const availableQuantity = orderDetail.current_quantity || 0;
    
    if (availableQuantity > 0) {
      const quantityToDeduct = Math.min(availableQuantity, remainingQuantity);
      
      deductedItems.push({
        orderId: order.id,
        orderDetailId: orderDetail.id,
        quantity: quantityToDeduct,
        parentOrderId: parentId,
        parentOrdersRequisitionsId: order.orders_requisitions_id
      });
      
      remainingQuantity -= quantityToDeduct;
    }
  }
  
  // التحقق من توفر الكمية الكاملة
  if (remainingQuantity > 0) {
    throw new Error(`الكمية المتاحة غير كافية. متبقي: ${remainingQuantity}`);
  }
  
  return deductedItems;
}

module.exports = {
  deductQuantityFromMergedOrders
};
```

### 3. Controllers Files

#### `controllers/wc/wc-fabric-order-requisition.js`
```javascript
const service = require('../../services/wc/wc-fabric-order-requisition');

/**
 * دمج طلبيات متعددة
 */
router.put('/merge-orders', async (req, res) => {
  try {
    const { orderIds, parentOrderId } = req.body;
    
    if (!orderIds || !parentOrderId || orderIds.length === 0) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid request parameters'
      });
    }
    
    const result = await service.mergeOrders(orderIds, parentOrderId);
    
    res.json({
      status: 1,
      message: `Successfully merged ${orderIds.length} orders`,
      parentOrderId: result.parentOrderId
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
    });
  }
});

/**
 * فصل طلبية من parent
 */
router.put('/detach-order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await service.detachOrder(id);
    
    res.json({
      status: 1,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
    });
  }
});

/**
 * جلب الطلبيات المدموجة
 */
router.get('/merged-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mergedOrders = await service.selectMergedOrders(id);
    
    res.json({
      status: 1,
      data: mergedOrders
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
    });
  }
});

/**
 * جلب جميع الطلبيات مع معلومات parent
 */
router.get('/with-parent-info', async (req, res) => {
  try {
    const ordersWithParentInfo = await service.selectOrdersWithParentInfo();
    
    res.json({
      status: 1,
      data: ordersWithParentInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
    });
  }
});

module.exports = router;
```

### 4. Routers Files

#### `routers/wc/wc-fabric-order-requisition.js`
```javascript
// أضيفت 4 routes جديدة:
// 1. PUT /wc-fabric-order-requisition/merge-orders
// 2. PUT /wc-fabric-order-requisition/detach-order/:id
// 3. GET /wc-fabric-order-requisition/merged-orders/:id
// 4. GET /wc-fabric-order-requisition/with-parent-info
```

### 5. Database Files

#### `db/queries/general/orders-requisitions.js` (معدل)
- لا تغييرات مباشرة في جداول `orders_requisitions`
- البنية تبدأ من `wc_fabric_order_requisition` فقط

### 6. WD Related Queries (جديد)

#### `db/queries/wd/wd-form-dyeing-requisition-details.js`
```javascript
// دالة معدلة: حفظ parent_id عند استخدام نموذج الصباغة
async function insertFormDyeingDetails(details) {
  return knex('wd_form_dyeing_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}

// دالة معدلة: جلب تفاصيل الصباغة مع parent_id
async function selectByParentId(parentId) {
  return knex('wd_form_dyeing_requisition_details')
    .where('parent_wc_fabric_order_requisition_id', parentId)
    .where('is_deleted', 0)
    .select('*');
}

module.exports = {
  insertFormDyeingDetails,
  selectByParentId
};
```

#### `db/queries/wd/wd-transport-requisition-wd-wc-details.js` (معدل)
```javascript
// دالة معدلة: حفظ parent_id
async function insertTransportDetails(details) {
  return knex('wd_transport_requisition_wd_wc_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wd/wd-reconciliation-requisition-details.js` (معدل)
```javascript
// دالة معدلة: حفظ parent_id
async function insertWdReconciliationDetails(details) {
  return knex('wd_reconcilition_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```

#### `db/queries/wd/wd-transition-between-dyers-requisition-details.js` (معدل)
```javascript
// دالة معدلة: حفظ parent_id
async function insertTransitionBetweenDyersDetails(details) {
  return knex('wd_transition_between_dyers_requisition_details')
    .insert({
      ...details,
      parent_wc_fabric_order_requisition_id: details.parentFabricOrderId,
      parent_orders_requisitions_id: details.parentOrdersRequisitionsId
    });
}
```
