-- Furfield Finance Management Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Note: Organizations and entities are created and managed by ff-orgn-6820 app
-- Note: location_currency table exists and is managed by the central system
-- Note: We use logical references to location_currency without FK constraints
--       since the table structure is managed by another service
-- This schema creates FINM-specific tables with finm_ prefix
-- Organizations are subscribers to the service (managed by ff-orgn-6820)
-- Entities are business units within organizations (managed by ff-orgn-6820)
-- FINM only references existing entities through entity_platform_id
-- Entity types: 01-hospital, 02-estore, 03-pstore, 04-channel partner

-- Create finm_books table (accounting books for entities)
CREATE TABLE IF NOT EXISTS finm_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_platform_id VARCHAR(9) NOT NULL, -- E + 01-04 + 6 alphanumeric chars
    organization_platform_id VARCHAR(9) NOT NULL, -- C00XXXXXX format (reference to organization)
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- hospital, estore, pstore, channel_partner
    name VARCHAR(255) NOT NULL,
    book_type VARCHAR(50) DEFAULT 'general-ledger',
    country_code VARCHAR(3) NOT NULL, -- References location_currency.country_code (no FK constraint)
    fy_start_month INTEGER DEFAULT 1 CHECK (fy_start_month >= 1 AND fy_start_month <= 12),
    accounting_standard VARCHAR(50) DEFAULT 'GAAP',
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_entity_platform_id_format 
        CHECK (entity_platform_id ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$'),
    CONSTRAINT chk_organization_platform_id_format 
        CHECK (organization_platform_id ~ '^C00[a-zA-Z0-9]{6}$'),
    CONSTRAINT chk_entity_type_mapping
        CHECK (
            (entity_platform_id LIKE 'E01%' AND entity_type = 'hospital') OR
            (entity_platform_id LIKE 'E02%' AND entity_type = 'estore') OR
            (entity_platform_id LIKE 'E03%' AND entity_type = 'pstore') OR
            (entity_platform_id LIKE 'E04%' AND entity_type = 'channel_partner')
        ),
    UNIQUE(entity_platform_id)
);

-- Create finm_accounts table (Chart of Accounts)
CREATE TABLE IF NOT EXISTS finm_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    sub_type VARCHAR(100), -- current_asset, fixed_asset, etc.
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    parent_account_id UUID REFERENCES finm_accounts(id),
    balance DECIMAL(15,2) DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, code)
);

-- Create finm_journals table (Transaction headers)
CREATE TABLE IF NOT EXISTS finm_journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    journal_number VARCHAR(50),
    reference VARCHAR(100),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    total_amount DECIMAL(15,2) NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(book_id, journal_number)
);

-- Create finm_ledger_entries table (Transaction lines)
CREATE TABLE IF NOT EXISTS finm_ledger_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES finm_journals(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES finm_accounts(id) ON DELETE RESTRICT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    line_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CHECK (debit_amount = 0 OR credit_amount = 0), -- Ensure only one side has amount
    CHECK (debit_amount > 0 OR credit_amount > 0)  -- Ensure at least one side has amount
);

-- Create finm_contacts table (Customers/Suppliers)
CREATE TABLE IF NOT EXISTS finm_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('customer', 'supplier', 'both')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    payment_terms INTEGER DEFAULT 30, -- days
    credit_limit DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
-- Note: location_currency indexes are managed by the central system
CREATE INDEX IF NOT EXISTS idx_finm_books_entity_platform_id ON finm_books(entity_platform_id);
CREATE INDEX IF NOT EXISTS idx_finm_books_org_platform_id ON finm_books(organization_platform_id);
CREATE INDEX IF NOT EXISTS idx_finm_books_country_code ON finm_books(country_code);
CREATE INDEX IF NOT EXISTS idx_finm_books_active ON finm_books(is_active);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_book_id ON finm_accounts(book_id);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_type ON finm_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_parent_id ON finm_accounts(parent_account_id);
CREATE INDEX IF NOT EXISTS idx_finm_accounts_active ON finm_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_finm_journals_book_id ON finm_journals(book_id);
CREATE INDEX IF NOT EXISTS idx_finm_journals_date ON finm_journals(date);
CREATE INDEX IF NOT EXISTS idx_finm_journals_status ON finm_journals(status);
CREATE INDEX IF NOT EXISTS idx_finm_ledger_entries_journal_id ON finm_ledger_entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_finm_ledger_entries_account_id ON finm_ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_finm_contacts_book_id ON finm_contacts(book_id);
CREATE INDEX IF NOT EXISTS idx_finm_contacts_type ON finm_contacts(contact_type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at on all tables
-- Note: location_currency triggers are managed by the central system
CREATE TRIGGER update_finm_books_updated_at BEFORE UPDATE ON finm_books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_accounts_updated_at BEFORE UPDATE ON finm_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_journals_updated_at BEFORE UPDATE ON finm_journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_contacts_updated_at BEFORE UPDATE ON finm_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
    account_record RECORD;
    new_balance DECIMAL(15,2);
BEGIN
    -- Get account details
    SELECT * INTO account_record FROM finm_accounts WHERE id = COALESCE(NEW.account_id, OLD.account_id);
    
    IF account_record IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calculate new balance based on normal balance type
    SELECT 
        CASE 
            WHEN account_record.normal_balance = 'debit' THEN
                COALESCE(SUM(le.debit_amount - le.credit_amount), 0)
            ELSE
                COALESCE(SUM(le.credit_amount - le.debit_amount), 0)
        END INTO new_balance
    FROM finm_ledger_entries le
    JOIN finm_journals j ON le.journal_id = j.id
    WHERE le.account_id = account_record.id 
    AND j.status = 'posted';
    
    -- Update account balance
    UPDATE finm_accounts 
    SET balance = new_balance, updated_at = NOW()
    WHERE id = account_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers to update account balances when ledger entries change
CREATE TRIGGER update_account_balance_on_insert AFTER INSERT ON finm_ledger_entries
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER update_account_balance_on_update AFTER UPDATE ON finm_ledger_entries
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

CREATE TRIGGER update_account_balance_on_delete AFTER DELETE ON finm_ledger_entries
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to auto-generate journal numbers
CREATE OR REPLACE FUNCTION generate_journal_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    new_journal_number VARCHAR(50);
BEGIN
    IF NEW.journal_number IS NULL THEN
        -- Get the next number for this book
        SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(journal_number, '[^0-9]', '', 'g') AS INTEGER)), 0) + 1
        INTO next_number
        FROM finm_journals 
        WHERE book_id = NEW.book_id 
        AND journal_number ~ '^JE[0-9]+$';
        
        NEW.journal_number = 'JE' || LPAD(next_number::TEXT, 6, '0');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-generate journal numbers
CREATE TRIGGER generate_journal_number_trigger BEFORE INSERT ON finm_journals
    FOR EACH ROW EXECUTE FUNCTION generate_journal_number();

-- Enable Row Level Security (RLS)
-- Note: location_currency RLS is managed by the central system
ALTER TABLE finm_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE finm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finm_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finm_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finm_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow service role access for now)
-- Note: location_currency RLS policies are managed by the central system
CREATE POLICY "Service role can manage finm_books" ON finm_books
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage finm_accounts" ON finm_accounts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage finm_journals" ON finm_journals
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage finm_ledger_entries" ON finm_ledger_entries
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage finm_contacts" ON finm_contacts
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions to service role
-- Note: location_currency permissions are managed by the central system
GRANT ALL ON finm_books TO service_role;
GRANT ALL ON finm_accounts TO service_role;
GRANT ALL ON finm_journals TO service_role;
GRANT ALL ON finm_ledger_entries TO service_role;
GRANT ALL ON finm_contacts TO service_role;

-- Insert sample chart of accounts for new books
CREATE OR REPLACE FUNCTION create_default_accounts(book_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Assets
    INSERT INTO finm_accounts (book_id, code, name, account_type, sub_type, normal_balance, is_system) VALUES
    (book_id_param, '1000', 'Assets', 'asset', 'header', 'debit', true),
    (book_id_param, '1100', 'Current Assets', 'asset', 'current_asset', 'debit', true),
    (book_id_param, '1110', 'Cash and Cash Equivalents', 'asset', 'current_asset', 'debit', true),
    (book_id_param, '1120', 'Accounts Receivable', 'asset', 'current_asset', 'debit', true),
    (book_id_param, '1130', 'Inventory', 'asset', 'current_asset', 'debit', true),
    (book_id_param, '1200', 'Non-Current Assets', 'asset', 'non_current_asset', 'debit', true),
    (book_id_param, '1210', 'Property, Plant & Equipment', 'asset', 'non_current_asset', 'debit', true),
    (book_id_param, '1220', 'Accumulated Depreciation', 'asset', 'non_current_asset', 'credit', true),
    
    -- Liabilities
    (book_id_param, '2000', 'Liabilities', 'liability', 'header', 'credit', true),
    (book_id_param, '2100', 'Current Liabilities', 'liability', 'current_liability', 'credit', true),
    (book_id_param, '2110', 'Accounts Payable', 'liability', 'current_liability', 'credit', true),
    (book_id_param, '2120', 'Accrued Expenses', 'liability', 'current_liability', 'credit', true),
    (book_id_param, '2200', 'Non-Current Liabilities', 'liability', 'non_current_liability', 'credit', true),
    (book_id_param, '2210', 'Long-term Debt', 'liability', 'non_current_liability', 'credit', true),
    
    -- Equity
    (book_id_param, '3000', 'Equity', 'equity', 'equity', 'credit', true),
    (book_id_param, '3100', 'Share Capital', 'equity', 'equity', 'credit', true),
    (book_id_param, '3200', 'Retained Earnings', 'equity', 'equity', 'credit', true),
    
    -- Revenue
    (book_id_param, '4000', 'Revenue', 'revenue', 'operating_revenue', 'credit', true),
    (book_id_param, '4100', 'Sales Revenue', 'revenue', 'operating_revenue', 'credit', true),
    (book_id_param, '4200', 'Service Revenue', 'revenue', 'operating_revenue', 'credit', true),
    
    -- Expenses
    (book_id_param, '5000', 'Expenses', 'expense', 'operating_expense', 'debit', true),
    (book_id_param, '5100', 'Cost of Goods Sold', 'expense', 'operating_expense', 'debit', true),
    (book_id_param, '5200', 'Operating Expenses', 'expense', 'operating_expense', 'debit', true),
    (book_id_param, '5300', 'Administrative Expenses', 'expense', 'operating_expense', 'debit', true);
END;
$$ language 'plpgsql';

-- Note: location_currency data is managed by the central system
-- FINM app only references existing location_currency records