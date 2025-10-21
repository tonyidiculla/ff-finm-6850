# Chart of Accounts Sync - Complete Guide

## 🎯 Objective
Sync the Chart of Accounts from JSON files to Supabase `finm_accounts` table.

## ✅ What Was Done

### 1. Updated Accounts API (`src/app/api/accounts/route.ts`)
- **GET Endpoint**: Now reads from `finm_accounts` table in Supabase
- **POST Endpoint**: Writes to `finm_accounts` table in Supabase
- **Template Support**: Can create accounts from predefined templates
- **Individual Account Creation**: Can create single accounts

### 2. Created Migration SQL (`database-migrations/create-accounts-table.sql`)
Complete SQL to create the `finm_accounts` table with:
- Proper schema (id, book_id, code, name, account_type, etc.)
- Indexes for performance
- RLS policies for security
- Triggers for updated_at timestamp

## 📋 SQL to Execute in Supabase

Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create finm_accounts table with proper structure
CREATE TABLE IF NOT EXISTS finm_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    sub_type VARCHAR(100),
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    parent_account_id UUID REFERENCES finm_accounts(id),
    balance DECIMAL(15,2) DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT finm_accounts_unique_code_per_book UNIQUE(book_id, code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_finm_accounts_book_id ON finm_accounts(book_id);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_account_type ON finm_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_parent_id ON finm_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_active ON finm_accounts(is_active);

-- Enable RLS
ALTER TABLE finm_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role
DROP POLICY IF EXISTS "Service role can manage finm_accounts" ON finm_accounts;
CREATE POLICY "Service role can manage finm_accounts" ON finm_accounts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON finm_accounts TO service_role;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_finm_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_finm_accounts_updated_at ON finm_accounts;
CREATE TRIGGER update_finm_accounts_updated_at
    BEFORE UPDATE ON finm_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_finm_accounts_updated_at();

-- Verify table was created
SELECT 'finm_accounts table created successfully' AS status;
```

## 🚀 Steps to Complete Sync

### Step 1: Create Table
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
2. Paste the SQL above
3. Click "Run" or press Cmd/Ctrl + Enter
4. You should see: `finm_accounts table created successfully`

### Step 2: Verify Table
Run this query to check the table structure:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'finm_accounts'
ORDER BY ordinal_position;
```

### Step 3: Test the API
```bash
# Create accounts from template
curl -X POST http://localhost:6850/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "3078c829-3174-49d7-9f87-c48576e1f847",
    "template": "simple-business"
  }'

# Verify accounts were created
curl http://localhost:6850/api/accounts?bookId=3078c829-3174-49d7-9f87-c48576e1f847 | jq '.[0:5]'
```

### Step 4: Test in UI
1. Open http://localhost:6850/transactions
2. Click "+ New Journal Entry"
3. Select a book
4. The account dropdown should now populate from the database!

## 📊 Database Schema

### finm_accounts Table Structure
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| book_id | UUID | Foreign key to finm_books |
| code | VARCHAR(50) | Account code (e.g., "1000", "2000") |
| name | VARCHAR(255) | Account name (e.g., "Cash", "Revenue") |
| account_type | VARCHAR(50) | Type: asset, liability, equity, revenue, expense |
| sub_type | VARCHAR(100) | Subtype: current_asset, fixed_asset, etc. |
| normal_balance | VARCHAR(10) | "debit" or "credit" |
| parent_account_id | UUID | For hierarchical accounts (optional) |
| balance | DECIMAL(15,2) | Current balance (default: 0) |
| is_system | BOOLEAN | System account flag |
| is_active | BOOLEAN | Active status |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Constraints
- Unique constraint: `(book_id, code)` - No duplicate codes within a book
- Check constraint: `normal_balance` must be 'debit' or 'credit'
- Foreign key: `book_id` references `finm_books(id)`
- Foreign key: `parent_account_id` references `finm_accounts(id)` (self-referencing)

## 🎨 Available Templates

### simple-business
21 accounts covering basic business operations:
- **Assets**: Cash, Bank Account, Accounts Receivable, Inventory, Equipment
- **Liabilities**: Accounts Payable, Accrued Expenses, Loans
- **Equity**: Owner's Equity, Retained Earnings
- **Revenue**: Sales Revenue, Service Revenue
- **Expenses**: Cost of Goods Sold, Salaries, Rent, Utilities, Office Expense

## ✅ Testing Checklist
- [ ] SQL executed successfully in Supabase
- [ ] Table structure verified
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] API GET works: `curl http://localhost:6850/api/accounts`
- [ ] API POST works: Create accounts from template
- [ ] UI dropdown populates with accounts
- [ ] Can create journal entries with accounts

## 📝 Files Modified
```
src/app/api/accounts/route.ts                      # Updated to use Supabase
database-migrations/create-accounts-table.sql      # Table creation SQL
database-migrations/check-accounts-table.sql       # Check table structure
database-migrations/ACCOUNTS_SYNC_GUIDE.md         # This file
```

## 🔄 Migration Path

### Before (JSON Files)
```
data/accounts.json → JsonDataStore → API
```

### After (Supabase)
```
Supabase finm_accounts table → supabaseAdmin → API
```

## 🎯 Next Steps After Sync
1. ✅ Create accounts from template
2. ✅ Test journal entry form with accounts
3. ⏳ Verify ledger entries reference accounts correctly
4. ⏳ Build account balance calculations
5. ⏳ Build reports (Trial Balance, Balance Sheet, P&L)

## 🆘 Troubleshooting

### Error: "Table does not exist"
→ Run the SQL in Supabase SQL Editor

### Error: "Could not find column"
→ Check the table structure with the verification query

### Error: "RLS policy blocks access"
→ Ensure service role policy is created and permissions granted

### No accounts showing in dropdown
→ Check API response: `curl http://localhost:6850/api/accounts?bookId=YOUR_BOOK_ID`

---

**Status**: Ready to execute SQL in Supabase! 🚀
