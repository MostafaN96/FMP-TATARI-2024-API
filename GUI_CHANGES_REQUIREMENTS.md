# متطلبات تعديلات واجهة المستخدم (GUI Changes)
## نظام دمج الطلبيات (Parent Orders System)
### 🅰️ Angular Framework

---

## 📋 نظرة عامة

تم إضافة نظام **Parent/Child للطلبيات** يسمح بدمج طلبيتين أو أكثر تحت طلبية واحدة (Parent).

**الفكرة الأساسية:**
- المستخدم يشوف بس الطلبية الأم (Parent) في الواجهة
- عند عمل أي عملية (بيع، تنفيذ، نقل)، يُرسل فقط الـ `parent_id`
- الـ Backend يتعامل مع جميع الطلبيات المدموجة (Children) تلقائياً

**التقنيات المستخدمة:**
- Framework: Angular (TypeScript)
- HTTP Client: Angular HttpClient
- RxJS: Observable Pattern
- Forms: Angular Forms/Reactive Forms

---

## 🔄 التغييرات المطلوبة في الواجهة

### 1️⃣ عرض قوائم الطلبيات (Orders Lists/Tables)

#### ❌ قبل:
```javascript
// كانت تعرض كل الطلبيات
orders = [
  { id: "001", number: 100, name: "طلبية 1", quantity: 500 },
  { id: "002", number: 101, name: "طلبية 2", quantity: 300 },
  { id: "003", number: 102, name: "طلبية 3", quantity: 200 }
]
```

#### ✅ بعد:
```javascript
// عرض فقط الطلبيات الـ Parent (الأم)
// استخدم الـ endpoint الجديد
GET /wc-fabric-order-requisition/with-parent-info

// الـ Response:
orders = [
  { 
    id: "001", 
    number: 100, 
    name: "طلبية 1", 
    total_quantity: 1000,  // مجموع الكميات من كل الـ children
    merged_count: 3,        // عدد الطلبيات المدموجة
    is_parent: true 
  }
]
```

**التعديل المطلوب:**
- تغيير الـ API endpoint من القديم إلى `/with-parent-info`
- إضافة عمود **"عدد الطلبيات المدموجة"** (اختياري)
- عرض أيقونة 🔗 بجانب الطلبيات المدموجة

---

### 2️⃣ عمليات البيع والتنفيذ (Sell/Execute Operations)

#### ❌ قبل:
```javascript
// كنت ترسل order_id العادي
const sellRequest = {
  orderId: "002",
  fabricId: "F123",
  quantity: 100
}

POST /wc-sell-requisition
```

#### ✅ بعد:
```javascript
// الآن ارسل parent_id (نفس الشيء، لكن تأكد إنه الـ parent)
const sellRequest = {
  orderId: "001",  // هذا هو الـ parent_id
  fabricId: "F123",
  quantity: 100
}

POST /wc-sell-requisition
```

**التعديل المطلوب:**
- **لا يوجد تغيير** في بنية الـ request
- فقط تأكد إنك ترسل الـ `parent_id` من القائمة
- الـ Backend بيوزع الكمية على الـ children تلقائياً

---

### 3️⃣ إضافة ميزة دمج الطلبيات (Merge Orders)

**صفحة/مودال جديدة مطلوبة:**

```
┌─────────────────────────────────────┐
│      دمج طلبيات                     │
├─────────────────────────────────────┤
│                                     │
│ اختر الطلبيات المراد دمجها:         │
│                                     │
│ ☑ طلبية #100 - كمية: 500 متر       │
│ ☑ طلبية #101 - كمية: 300 متر       │
│ ☑ طلبية #102 - كمية: 200 متر       │
│                                     │
│ الطلبية الأم (Parent):              │
│ [طلبية #100        ▼]              │
│                                     │
│      [إلغاء]    [دمج الطلبيات]     │
└─────────────────────────────────────┘
```

**الـ API Request:**
```javascript
PUT /wc-fabric-order-requisition/merge-orders

Request Body:
{
  "orderIds": ["001", "002", "003"],
  "parentOrderId": "001"  // واحدة من الطلبيات المختارة
}

Response:
{
  "status": 1,
  "message": "تم دمج 3 طلبيات بنجاح",
  "parentOrderId": "001",
  "mergedName": "طلبية قماش أحمر + طلبية قماش أزرق + طلبية قماش أخضر"
}
```

**شروط مهمة:**
- يجب اختيار طلبيتين على الأقل
- الطلبية الأم (Parent) يجب أن تكون من ضمن الطلبيات المختارة
- **ملاحظة:** بعد الدمج، رح تظهر طلبية واحدة فقط في القائمة
- **تحديث تلقائي للاسم:** اسم الطلبية الأم يتحدث تلقائياً ليصبح مجموع أسماء الطلبيات المدموجة مفصولة بـ `+`
  - مثال: دمج "طلبية قماش أحمر" + "طلبية قماش أزرق" → اسم الـ parent يصير: **"طلبية قماش أحمر + طلبية قماش أزرق"**

---

### 4️⃣ إضافة ميزة فصل طلبية (Detach Order)

**زر/خيار جديد في قائمة الإجراءات:**

```
📋 الإجراءات:
  ├─ تعديل
  ├─ حذف
  ├─ عرض التفاصيل
  └─ 🔓 فصل الطلبية (جديد) ← يظهر فقط للطلبيات المدموجة
```

**الـ API Request:**
```javascript
PUT /wc-fabric-order-requisition/detach-order/:orderId

Response:
{
  "status": 1,
  "message": "تم فصل الطلبية بنجاح"
}
```

**ملاحظة:** بعد الفصل، الطلبية رح ترجع تظهر كطلبية مستقلة في القائمة.

---

### 5️⃣ عرض تفاصيل الطلبيات المدموجة (View Merged Orders)

**صفحة/مودال جديدة:**

```
┌──────────────────────────────────────────┐
│   تفاصيل الطلبية #100                    │
├──────────────────────────────────────────┤
│                                          │
│ الطلبيات المدموجة تحت هذه الطلبية:       │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ #100 │ طلبية 1 │ 500 متر │ متبقي  │ │
│ │ #101 │ طلبية 2 │ 300 متر │ متبقي  │ │
│ │ #102 │ طلبية 3 │ 200 متر │ متبقي  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ المجموع الكلي: 1000 متر                 │
│                                          │
└──────────────────────────────────────────┘
```

**الـ API Request:**
```javascript
GET /wc-fabric-order-requisition/merged-orders/:parentId

Response:
[
  {
    "id": "001",
    "number": 100,
    "name": "طلبية 1",
    "current_quantity": 500,
    "created_at": "2024-01-01"
  },
  {
    "id": "002",
    "number": 101,
    "name": "طلبية 2",
    "current_quantity": 300,
    "created_at": "2024-01-05"
  }
]
```

---

## 📊 ملخص التغييرات المطلوبة

| الميزة | نوع التغيير | الصعوبة | الأولوية |
|--------|-------------|---------|---------|
| عرض قوائم الطلبيات | تعديل | سهل | عالية ⭐⭐⭐ |
| عمليات البيع/التنفيذ | لا يوجد* | - | - |
| صفحة دمج الطلبيات | جديد | متوسط | عالية ⭐⭐⭐ |
| زر فصل الطلبية | جديد | سهل | متوسطة ⭐⭐ |
| عرض الطلبيات المدموجة | جديد | سهل | متوسطة ⭐⭐ |

*لا يوجد تغيير في بنية الـ request، فقط التأكد من إرسال الـ parent_id

---

## 🔌 الـ API Endpoints الجديدة

### 1. جلب جميع الطلبيات مع معلومات الـ Parent
```
GET /wc-fabric-order-requisition/with-parent-info
```

### 2. دمج طلبيات
```
PUT /wc-fabric-order-requisition/merge-orders
Body: { orderIds: [], parentOrderId: "" }
```

### 3. فصل طلبية
```
PUT /wc-fabric-order-requisition/detach-order/:id
```

### 4. جلب الطلبيات المدموجة
```
GET /wc-fabric-order-requisition/merged-orders/:parentId
```

---

## 🎨 تصميمات مقترحة (UI Suggestions)

### أيقونات ومؤشرات:
```
🔗 - طلبية مدموجة (بها طلبيات أخرى)
📦 - طلبية عادية (غير مدموجة)
⚠️ - طلبية child (مدموجة تحت طلبية أخرى)
```

### ألوان مقترحة:
```css
/* طلبية parent */
.parent-order {
  border-left: 4px solid #4CAF50;
  background-color: #f1f8f4;
}

/* عداد الطلبيات المدموجة */
.merged-badge {
  background-color: #2196F3;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}
```

---

## ⚠️ ملاحظات مهمة

1. **الترتيب:** الـ Backend يرتب الطلبيات المدموجة حسب تاريخ الإنشاء (`created_at`)
   
2. **الكميات:** عند عرض الكمية الإجمالية، احسبها من:
   ```javascript
   totalQuantity = childOrders.reduce((sum, order) => sum + order.current_quantity, 0)
   ```

3. **الفلاتر:** إذا في فلاتر بحث/تصفية، تأكد إنها تعمل على الـ parent فقط

4. **التقارير:** جميع التقارير لازم تستخدم `parent_id` للتجميع

5. **الإشعارات:** لما تنقص كمية طلبية لحد ما تخلص، أظهر إشعار:
   ```
   "تم نقص الكمية من طلبية #100 (خلصت) وطلبية #101"
   ```

---

## 📝 أمثلة كود Angular (Code Examples)

### 1️⃣ Models/Interfaces (models/order.model.ts):
```typescript
export interface FabricOrder {
  id: string;
  number: number;
  name: string;
  current_quantity: number;
  total_quantity?: number;
  merged_count?: number;
  is_parent?: boolean;
  created_at: string;
}

export interface MergeOrdersRequest {
  orderIds: string[];
  parentOrderId: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  parentOrderId?: string;
}
```

### 2️⃣ Service (services/orders.service.ts):
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FabricOrder, MergeOrdersRequest, ApiResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = '/wc-fabric-order-requisition';

  constructor(private http: HttpClient) {}

  // جلب جميع الطلبيات مع معلومات الـ Parent
  getOrdersWithParentInfo(): Observable<FabricOrder[]> {
    return this.http.get<FabricOrder[]>(`${this.apiUrl}/with-parent-info`);
  }

  // دمج طلبيات
  mergeOrders(request: MergeOrdersRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/merge-orders`, request);
  }

  // فصل طلبية
  detachOrder(orderId: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/detach-order/${orderId}`, {});
  }

  // جلب الطلبيات المدموجة
  getMergedOrders(parentId: string): Observable<FabricOrder[]> {
    return this.http.get<FabricOrder[]>(`${this.apiUrl}/merged-orders/${parentId}`);
  }
}
```

### 3️⃣ Component TypeScript (components/orders-list/orders-list.component.ts):
```typescript
import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { FabricOrder, MergeOrdersRequest } from '../../models/order.model';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css']
})
export class OrdersListComponent implements OnInit {
  orders: FabricOrder[] = [];
  selectedOrders: string[] = [];
  loading = false;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // جلب الطلبيات
  loadOrders(): void {
    this.loading = true;
    this.ordersService.getOrdersWithParentInfo().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  // تحديد/إلغاء تحديد طلبية
  toggleOrderSelection(orderId: string): void {
    const index = this.selectedOrders.indexOf(orderId);
    if (index > -1) {
      this.selectedOrders.splice(index, 1);
    } else {
      this.selectedOrders.push(orderId);
    }
  }

  // دمج الطلبيات المحددة
  mergeSelectedOrders(parentOrderId: string): void {
    if (this.selectedOrders.length < 2) {
      alert('يجب اختيار طلبيتين على الأقل');
      return;
    }

    const request: MergeOrdersRequest = {
      orderIds: this.selectedOrders,
      parentOrderId: parentOrderId
    };

    this.ordersService.mergeOrders(request).subscribe({
      next: (response) => {
        alert(response.message);
        this.selectedOrders = [];
        this.loadOrders(); // تحديث القائمة
      },
      error: (error) => {
        alert('حدث خطأ أثناء الدمج');
        console.error(error);
      }
    });
  }

  // فصل طلبية
  detachOrder(orderId: string): void {
    if (!confirm('هل تريد فصل هذه الطلبية؟')) {
      return;
    }

    this.ordersService.detachOrder(orderId).subscribe({
      next: (response) => {
        alert(response.message);
        this.loadOrders(); // تحديث القائمة
      },
      error: (error) => {
        alert('حدث خطأ أثناء الفصل');
        console.error(error);
      }
    });
  }

  // حساب الكمية الإجمالية
  getTotalQuantity(order: FabricOrder): number {
    return order.total_quantity || order.current_quantity;
  }
}
```

### 4️⃣ Component HTML (components/orders-list/orders-list.component.html):
```html
<div class="orders-container">
  <h2>قائمة الطلبيات</h2>

  <!-- زر دمج الطلبيات -->
  <button 
    *ngIf="selectedOrders.length >= 2"
    (click)="mergeSelectedOrders(selectedOrders[0])"
    class="btn btn-primary">
    🔗 دمج {{ selectedOrders.length }} طلبيات
  </button>

  <!-- جدول الطلبيات -->
  <table class="orders-table">
    <thead>
      <tr>
        <th>تحديد</th>
        <th>رقم الطلبية</th>
        <th>الاسم</th>
        <th>الكمية</th>
        <th>الحالة</th>
        <th>الإجراءات</th>
      </tr>
    </thead>
    <tbody>
      <tr 
        *ngFor="let order of orders"
        [class.parent-order]="order.is_parent && order.merged_count > 1">
        
        <!-- خانة التحديد -->
        <td>
          <input 
            type="checkbox"
            [checked]="selectedOrders.includes(order.id)"
            (change)="toggleOrderSelection(order.id)">
        </td>

        <!-- رقم الطلبية -->
        <td>{{ order.number }}</td>

        <!-- الاسم -->
        <td>{{ order.name }}</td>

        <!-- الكمية -->
        <td>{{ getTotalQuantity(order) }} متر</td>

        <!-- الحالة (عدد الطلبيات المدموجة) -->
        <td>
          <span 
            *ngIf="order.merged_count && order.merged_count > 1"
            class="merged-badge">
            🔗 {{ order.merged_count }} طلبيات
          </span>
          <span *ngIf="!order.merged_count || order.merged_count <= 1">
            📦 طلبية عادية
          </span>
        </td>

        <!-- الإجراءات -->
        <td>
          <button 
            *ngIf="order.is_parent && order.merged_count > 1"
            (click)="detachOrder(order.id)"
            class="btn-detach">
            🔓 فصل
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- مؤشر التحميل -->
  <div *ngIf="loading" class="loading-spinner">
    جاري التحميل...
  </div>
</div>
```

### 5️⃣ Component CSS (components/orders-list/orders-list.component.css):
```css
.orders-container {
  padding: 20px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.orders-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* طلبية parent */
.parent-order {
  border-right: 4px solid #4CAF50;
  background-color: #f1f8f4;
}

/* عداد الطلبيات المدموجة */
.merged-badge {
  background-color: #2196F3;
  color: white;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  display: inline-block;
}

/* أزرار */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-detach {
  background-color: #ff9800;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-detach:hover {
  background-color: #f57c00;
}

/* مؤشر التحميل */
.loading-spinner {
  text-align: center;
  padding: 20px;
  color: #666;
}
```

### 6️⃣ عرض الطلبيات المدموجة (components/merged-orders-details/merged-orders-details.component.ts):
```typescript
import { Component, Input, OnInit } from '@angular/core';
import { OrdersService } from '../../services/orders.service';
import { FabricOrder } from '../../models/order.model';

@Component({
  selector: 'app-merged-orders-details',
  template: `
    <div class="merged-details">
      <h3>الطلبيات المدموجة</h3>
      
      <table class="details-table">
        <thead>
          <tr>
            <th>الرقم</th>
            <th>الاسم</th>
            <th>الكمية المتبقية</th>
            <th>تاريخ الإنشاء</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let child of childOrders">
            <td>{{ child.number }}</td>
            <td>{{ child.name }}</td>
            <td>{{ child.current_quantity }} متر</td>
            <td>{{ child.created_at | date:'short' }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="total">
        <strong>المجموع الكلي:</strong> {{ totalQuantity }} متر
      </div>
    </div>
  `
})
export class MergedOrdersDetailsComponent implements OnInit {
  @Input() parentOrderId!: string;
  childOrders: FabricOrder[] = [];
  totalQuantity = 0;

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadMergedOrders();
  }

  loadMergedOrders(): void {
    this.ordersService.getMergedOrders(this.parentOrderId).subscribe({
      next: (data) => {
        this.childOrders = data;
        this.calculateTotal();
      },
      error: (error) => {
        console.error('Error loading merged orders:', error);
      }
    });
  }

  calculateTotal(): void {
    this.totalQuantity = this.childOrders.reduce(
      (sum, order) => sum + order.current_quantity, 
      0
    );
  }
}
```

### 7️⃣ Module Configuration (app.module.ts أو feature.module.ts):
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Components
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { MergedOrdersDetailsComponent } from './components/merged-orders-details/merged-orders-details.component';

// Services
import { OrdersService } from './services/orders.service';

@NgModule({
  declarations: [
    OrdersListComponent,
    MergedOrdersDetailsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,  // مهم للـ HTTP requests
    FormsModule        // إذا كنت تستخدم forms
  ],
  providers: [
    OrdersService      // أو providedIn: 'root' في الـ service نفسه
  ],
  exports: [
    OrdersListComponent,
    MergedOrdersDetailsComponent
  ]
})
export class OrdersModule { }
```

### 8️⃣ استخدام في Routing (app-routing.module.ts):
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersListComponent } from './components/orders-list/orders-list.component';

const routes: Routes = [
  {
    path: 'orders',
    component: OrdersListComponent
  },
  // ... باقي الـ routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 🧪 سيناريوهات الاختبار (Test Scenarios)

### Test 1: دمج طلبيتين
```
1. اختر طلبية #100 (500 متر)
2. اختر طلبية #101 (300 متر)
3. اضغط "دمج" واختر #100 كـ parent
✓ يجب أن تظهر طلبية واحدة فقط برقم #100 وكمية 800 متر
```

### Test 2: بيع من طلبية مدموجة
```
1. اختر طلبية #100 المدموجة (800 متر)
2. ابيع 600 متر
✓ يجب أن ينقص 500 من #100 و 100 من #101
✓ الطلبية #100 المدموجة يصبح متبقي فيها 200 متر
```

### Test 3: فصل طلبية
```
1. افتح طلبية #100 المدموجة
2. اضغط "فصل الطلبية" على #101
✓ يجب أن تظهر #101 كطلبية مستقلة في القائمة
✓ الطلبية #100 يصبح متبقي معاها طلبية واحدة فقط
```

---

## � أفضل الممارسات في Angular (Best Practices)

### 1. استخدام RxJS Operators:
```typescript
// في الـ Component
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

export class OrdersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loadOrders(): void {
    this.loading = true;
    this.ordersService.getOrdersWithParentInfo()
      .pipe(
        takeUntil(this.destroy$),  // لتجنب memory leaks
        finalize(() => this.loading = false)  // يتنفذ في كل الأحوال
      )
      .subscribe({
        next: (data) => this.orders = data,
        error: (error) => console.error(error)
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. استخدام Async Pipe (بديل للـ subscribe):
```typescript
// في الـ Component
orders$ = this.ordersService.getOrdersWithParentInfo();

// في الـ Template
<tr *ngFor="let order of orders$ | async">
  ...
</tr>
```

### 3. Error Handling محسّن:
```typescript
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

mergeOrders(request: MergeOrdersRequest): Observable<ApiResponse> {
  return this.http.put<ApiResponse>(`${this.apiUrl}/merge-orders`, request)
    .pipe(
      catchError(error => {
        console.error('Merge error:', error);
        // يمكن إرسال لـ logging service
        return of({ status: 0, message: 'حدث خطأ في الدمج' });
      })
    );
}
```

### 4. استخدام Interceptor لـ Loading & Errors:
```typescript
// http.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // يمكن إضافة loading indicator عام
    // أو headers إضافية
    return next.handle(req);
  }
}
```

### 5. Reactive Forms لنموذج الدمج:
```typescript
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

export class MergeOrdersComponent implements OnInit {
  mergeForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.mergeForm = this.fb.group({
      orderIds: this.fb.array([]),
      parentOrderId: ['']
    });
  }
  
  get orderIds(): FormArray {
    return this.mergeForm.get('orderIds') as FormArray;
  }
}
```

---

## �📞 للدعم والاستفسارات

إذا في أي استفسارات أو مشاكل في التطبيق، تواصل مع فريق الـ Backend.

**الوثائق الكاملة:** `PARENT_ORDERS_SYSTEM.md`

---

**تاريخ التحديث:** 2024-01-01  
**الإصدار:** 1.0.0
