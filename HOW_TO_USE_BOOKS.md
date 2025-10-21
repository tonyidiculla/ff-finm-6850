# 📚 Using Books in FINM - Quick Start Guide

## What You've Built So Far ✅

1. **Books Management** (`/dashboard/books`)
   - Create books for different entities
   - Each book has its own fiscal year, currency, and accounting standard
   - Books created: "Test Ledger Success", "Test Ledger E2E", "Frodo Ledger"

2. **Accounts Management** (`/dashboard/accounts`)
   - Chart of Accounts for each book
   - Account types: Assets, Liabilities, Equity, Revenue, Expenses

## 🎯 How Books Are Used - Complete Workflow

### Step 1: Book Selection
Every financial operation requires selecting a book first:
```
Book = Container for all financial data for one entity
Example: "Frodo Ledger" for FRODO hospital
```

### Step 2: Create Chart of Accounts
For the book "Frodo Ledger", create accounts like:

**Assets**
- 1000 - Cash
- 1100 - Bank Account
- 1200 - Accounts Receivable
- 1300 - Inventory

**Liabilities**
- 2000 - Accounts Payable
- 2100 - Loans Payable

**Equity**
- 3000 - Owner's Capital
- 3100 - Retained Earnings

**Revenue**
- 4000 - Service Revenue
- 4100 - Product Sales

**Expenses**
- 5000 - Rent Expense
- 5100 - Salary Expense
- 5200 - Utilities

### Step 3: Record Transactions
All transactions are recorded in journals with ledger entries:

**Example: Record a Sale**
```
Journal Entry:
  Date: 2025-10-21
  Book: Frodo Ledger
  
  Dr. Accounts Receivable (1200)  ₹10,000
      Cr. Service Revenue (4000)           ₹10,000
  
  Narration: Invoice #001 - Patient treatment
```

**Example: Record Payment Received**
```
Journal Entry:
  Date: 2025-10-21
  Book: Frodo Ledger
  
  Dr. Cash (1000)                  ₹10,000
      Cr. Accounts Receivable (1200)       ₹10,000
  
  Narration: Payment received for Invoice #001
```

## 🔗 Book Relationships

```
Organization (Fusionduo Technologies)
  │
  ├── Entity: FURFIELD Hospital
  │   └── Book: FURFIELD General Ledger
  │       ├── Accounts (Chart of Accounts)
  │       ├── Contacts (Patients, Suppliers)
  │       ├── Transactions (Journals)
  │       └── Reports
  │
  └── Entity: FRODO Hospital  
      └── Book: Frodo Ledger
          ├── Accounts (Chart of Accounts)
          ├── Contacts (Patients, Suppliers)
          ├── Transactions (Journals)
          └── Reports
```

## 📊 What You Can Do With Books

### Current Features (Based on your code):
1. ✅ **Create Books** - Multiple books per entity
2. ✅ **Create Accounts** - Chart of Accounts
3. ✅ **Account Templates** - Quick setup with pre-built templates
4. ✅ **Book Filtering** - Filter by organization/entity

### What Comes Next:

#### 1. **Contacts Module** (Customers/Suppliers)
```typescript
// Navigate to /dashboard/contacts?bookId=xxx
// Create customers (patients) and suppliers
```

#### 2. **Transactions Module**
- Manual Journal Entries
- Invoices (for patient billing)
- Bills (for supplier purchases)
- Payments

#### 3. **Reports Module**
- Trial Balance
- Balance Sheet
- Income Statement (P&L)
- Cash Flow Statement
- Ledger Reports

## 🚀 Try It Now!

### Create Your First Chart of Accounts:

1. **Go to Accounts Page**
   ```
   http://localhost:6850/dashboard/accounts?bookId=<your-book-id>
   ```

2. **Use Account Template** (Fastest way)
   - Click "Create from Template"
   - Select a template (simple-business, retail, hospital)
   - Click "Create Accounts"
   - ✅ Instant Chart of Accounts!

3. **Or Create Manually**
   - Click "New Account"
   - Fill in: Code, Name, Type
   - Click "Create"

### Next: Record Your First Transaction

Once you have accounts, you can record transactions:

```javascript
// Example API call to create a journal entry
POST /api/journals
{
  "bookId": "4dd51df8-faef-4443-9623-9a8f30e8a846",
  "docType": "manual",
  "docDate": "2025-10-21",
  "currency": "INR",
  "narration": "Opening balance",
  "entries": [
    {
      "accountId": "cash-account-id",
      "amountDc": 100000,  // Debit ₹100,000
      "description": "Opening cash balance"
    },
    {
      "accountId": "capital-account-id",
      "amountDc": -100000, // Credit ₹100,000
      "description": "Owner's capital"
    }
  ]
}
```

## 📝 Book Best Practices

1. **One General Ledger per Entity**
   - Each hospital/store should have its own book
   - Keeps financial data separate and organized

2. **Consistent Fiscal Year**
   - Set the correct fyStartMonth (April=4 for India)
   - All reporting aligns with your fiscal year

3. **Proper Accounting Standard**
   - Choose IFRS or GAAP based on requirements
   - Affects financial statement presentation

4. **Lock Dates**
   - Set lockDate after period close
   - Prevents changes to historical data

## 🔍 Finding Your Book IDs

To work with a specific book:

```bash
# List all books
curl http://localhost:6850/api/books | jq '.[] | {id, name, entityName}'

# Output:
# {
#   "id": "4dd51df8-faef-4443-9623-9a8f30e8a846",
#   "name": "Test Ledger Success",
#   "entityName": "FURFIELD"
# }
```

Use the `id` in API calls or URL parameters.

## 🎯 Summary

**Books are the foundation**. Everything else (accounts, transactions, reports) lives within a book.

**Current Status:**
- ✅ Books can be created
- ✅ Accounts can be created
- ⏳ Need to build: Transactions, Invoices, Payments, Reports

**Your FINM system is now ready to handle multi-entity accounting!** 🎉
