# 🏗️ FINM Microservices Integration Architecture

## Service Boundaries & Responsibilities

### ff-orgn-6820 (Organization Management)
**Owns:**
- Organizations (C00XXXXXX)
- Entities (E01XXXXXX, E02XXXXXX, etc.)
- **Customers** (Patients in hospitals, buyers in stores)

**Provides APIs:**
- `GET /api/organizations`
- `GET /api/entities`
- `GET /api/customers` ← FINM calls this
- `GET /api/customers/{id}`

---

### ff-purc-6870 (Purchasing)
**Owns:**
- **Suppliers/Vendors**
- Purchase Orders
- Purchase Invoices

**Provides APIs:**
- `GET /api/suppliers` ← FINM calls this
- `GET /api/suppliers/{id}`
- `POST /api/purchase-orders`

---

### ff-finm-6850 (Financial Management) 
**Owns:**
- Books (General Ledgers)
- Chart of Accounts
- Transactions (Journals)
- Invoices (Sales documents)
- Bills (Purchase documents - mirrors ff-purc)
- Payments
- Financial Reports

**Does NOT own:**
- ❌ Customers (references from ff-orgn)
- ❌ Suppliers (references from ff-purc)
- ❌ Entities (references from ff-orgn)

**Integration Pattern:**
```typescript
// When creating an invoice in FINM
const invoice = {
  bookId: "book-uuid",
  customerId: "customer-id-from-ff-orgn", // Reference only
  invoiceDate: "2025-10-21",
  items: [...],
  total: 10000
}

// To display customer name, FINM calls ff-orgn:
const customer = await fetch('http://localhost:6820/api/customers/{id}')
```

---

## 📊 Updated: How Books Are Used in FINM

### Current Architecture (Corrected):

```
Book (Frodo Ledger)
  │
  ├── Chart of Accounts ✅ (FINM owns)
  │   ├── Assets
  │   ├── Liabilities
  │   ├── Equity
  │   ├── Revenue
  │   └── Expenses
  │
  ├── Transactions ✅ (FINM owns)
  │   ├── Journals (Manual entries)
  │   ├── Invoices (references customers from ff-orgn)
  │   ├── Bills (references suppliers from ff-purc)
  │   └── Payments
  │
  ├── Reports ✅ (FINM owns)
  │   ├── Balance Sheet
  │   ├── Income Statement
  │   ├── Trial Balance
  │   └── Cash Flow
  │
  ├── Customer References ❌ (ff-orgn owns, FINM references)
  └── Supplier References ❌ (ff-purc owns, FINM references)
```

---

## 🔄 Integration Flows

### Flow 1: Create Sales Invoice in FINM

```typescript
// Step 1: User selects customer (dropdown fetches from ff-orgn)
const customers = await fetch('http://localhost:6820/api/customers?entityId=E01x7yTu1')

// Step 2: Create invoice in FINM with customer reference
POST http://localhost:6850/api/invoices
{
  "bookId": "book-uuid",
  "customerId": "customer-uuid-from-ff-orgn", // Just a reference
  "invoiceDate": "2025-10-21",
  "items": [
    {
      "itemId": "item-uuid",
      "quantity": 1,
      "price": 10000,
      "accountId": "revenue-account-uuid"
    }
  ]
}

// Step 3: FINM creates accounting entries
Journal Entry:
  Dr. Accounts Receivable  ₹10,000
      Cr. Service Revenue           ₹10,000
```

### Flow 2: Record Purchase Bill in FINM

```typescript
// Step 1: Get supplier from ff-purc
const suppliers = await fetch('http://localhost:6870/api/suppliers?entityId=E01x7yTu1')

// Step 2: Create bill in FINM
POST http://localhost:6850/api/bills
{
  "bookId": "book-uuid",
  "supplierId": "supplier-uuid-from-ff-purc", // Just a reference
  "billDate": "2025-10-21",
  "items": [...]
}

// Step 3: FINM creates accounting entries
Journal Entry:
  Dr. Expense Account     ₹5,000
      Cr. Accounts Payable        ₹5,000
```

---

## 🚀 What FINM Should Build Next

### Priority 1: Transactions Module ⭐⭐⭐
**Why:** Core accounting functionality
**What:**
- Manual Journal Entries
- Journal listing and viewing
- Transaction validation (debits = credits)

**No external dependencies** - can build immediately!

---

### Priority 2: Invoices Module (Sales) ⭐⭐
**Why:** Revenue tracking
**What:**
- Create sales invoices
- Reference customers from ff-orgn (API integration)
- Generate accounting entries automatically
- Track payment status

**Dependencies:**
- Need ff-orgn API for customer list
- Need customer dropdown component

---

### Priority 3: Bills Module (Purchases) ⭐⭐
**Why:** Expense tracking
**What:**
- Record supplier bills
- Reference suppliers from ff-purc (API integration)
- Generate accounting entries automatically
- Track payment status

**Dependencies:**
- Need ff-purc API for supplier list
- Need supplier dropdown component

---

### Priority 4: Payments Module ⭐
**Why:** Cash flow management
**What:**
- Record payments received (from customers)
- Record payments made (to suppliers)
- Update invoice/bill status

---

### Priority 5: Reports Module ⭐⭐⭐
**Why:** Financial visibility
**What:**
- Trial Balance (easiest)
- Balance Sheet
- Income Statement (P&L)
- Cash Flow Statement
- Ledger Reports

**No external dependencies** - works with FINM data only!

---

## 📝 Data Model Updates Needed

### Current Contact Type (Needs Update):

```typescript
// ❌ OLD - FINM should NOT store contacts
export type Contact = {
  id: string
  bookId: string  // Don't need this
  kind: ContactKind
  displayName: string
  email?: string
  // ...
}
```

### New Approach (Reference Only):

```typescript
// ✅ NEW - FINM only stores references
export type Invoice = {
  id: string
  bookId: string
  customerId: string  // Reference to ff-orgn customer
  customerName?: string  // Cached for display (optional)
  invoiceNo?: string
  invoiceDate: Date
  // ...
}

export type Bill = {
  id: string
  bookId: string
  supplierId: string  // Reference to ff-purc supplier
  supplierName?: string  // Cached for display (optional)
  billNo?: string
  billDate: Date
  // ...
}
```

---

## 🎯 Recommended Next Steps

### Option A: Build Transactions First (Recommended) ✅
**Pros:**
- No external dependencies
- Core accounting functionality
- Can be built and tested immediately
- Foundation for invoices/bills

**Steps:**
1. Create `/dashboard/transactions` page
2. Build manual journal entry form
3. List journals
4. View journal details

---

### Option B: Build Reports First
**Pros:**
- Show value immediately
- No external dependencies
- Use existing data (accounts, books)

**Steps:**
1. Create `/dashboard/reports` page
2. Build Trial Balance report
3. Build Balance Sheet
4. Build Income Statement

---

### Option C: Build Invoice/Bill Flow (Requires ff-orgn & ff-purc APIs)
**Pros:**
- Complete business flow
- Real-world usage

**Cons:**
- Need coordination with ff-orgn and ff-purc services
- More complex integration

---

## 🔧 Technical Notes

### API Integration Pattern:

```typescript
// Helper to fetch customers from ff-orgn
export async function getCustomers(entityId: string) {
  const response = await fetch(`http://localhost:6820/api/customers?entityId=${entityId}`)
  return response.json()
}

// Helper to fetch suppliers from ff-purc
export async function getSuppliers(entityId: string) {
  const response = await fetch(`http://localhost:6870/api/suppliers?entityId=${entityId}`)
  return response.json()
}
```

### Service Discovery (Future):
Consider environment variables for service URLs:
```env
ORGN_SERVICE_URL=http://localhost:6820
PURC_SERVICE_URL=http://localhost:6870
```

---

## Summary

**FINM Focus:**
- ✅ Books & Chart of Accounts (Done!)
- ⏳ Transactions (Next priority)
- ⏳ Reports (Can do in parallel)
- ⏳ Invoices (needs ff-orgn API)
- ⏳ Bills (needs ff-purc API)

**Don't Build in FINM:**
- ❌ Customer management (ff-orgn owns)
- ❌ Supplier management (ff-purc owns)
- ❌ Entity management (ff-orgn owns)

**What would you like to build next: Transactions, Reports, or the integration with ff-orgn/ff-purc?**
