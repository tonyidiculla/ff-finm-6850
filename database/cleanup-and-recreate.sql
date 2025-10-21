-- Cleanup and Recreate FINM Database Schema
-- This script safely drops existing objects and recreates them

-- Drop triggers first (they depend on functions and tables)
DROP TRIGGER IF EXISTS update_finm_books_updated_at ON finm_books;
DROP TRIGGER IF EXISTS update_finm_accounts_updated_at ON finm_accounts;
DROP TRIGGER IF EXISTS update_finm_journals_updated_at ON finm_journals;
DROP TRIGGER IF EXISTS update_finm_ledger_entries_updated_at ON finm_ledger_entries;
DROP TRIGGER IF EXISTS update_finm_contacts_updated_at ON finm_contacts;

-- Drop indexes
DROP INDEX IF EXISTS idx_finm_books_entity_platform_id;
DROP INDEX IF EXISTS idx_finm_books_country_code;
DROP INDEX IF EXISTS idx_finm_books_created_by;
DROP INDEX IF EXISTS idx_finm_accounts_book_id;
DROP INDEX IF EXISTS idx_finm_accounts_parent_id;
DROP INDEX IF EXISTS idx_finm_accounts_account_type;
DROP INDEX IF EXISTS idx_finm_journals_book_id;
DROP INDEX IF EXISTS idx_finm_journals_date;
DROP INDEX IF EXISTS idx_finm_journals_created_by;
DROP INDEX IF EXISTS idx_finm_ledger_entries_journal_id;
DROP INDEX IF EXISTS idx_finm_ledger_entries_account_id;
DROP INDEX IF EXISTS idx_finm_ledger_entries_date;
DROP INDEX IF EXISTS idx_finm_contacts_book_id;
DROP INDEX IF EXISTS idx_finm_contacts_contact_type;

-- Drop tables (this will cascade to dependent objects)
DROP TABLE IF EXISTS finm_ledger_entries;
DROP TABLE IF EXISTS finm_journals;
DROP TABLE IF EXISTS finm_contacts;
DROP TABLE IF EXISTS finm_accounts;
DROP TABLE IF EXISTS finm_books;

-- Drop FINM-specific custom types only (don't drop shared functions)
DROP TYPE IF EXISTS account_type_enum CASCADE;
DROP TYPE IF EXISTS contact_type_enum CASCADE;
DROP TYPE IF EXISTS entry_type_enum CASCADE;

-- Now create everything fresh
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE account_type_enum AS ENUM (
    'asset',
    'liability', 
    'equity',
    'revenue',
    'expense'
);

CREATE TYPE contact_type_enum AS ENUM (
    'customer',
    'supplier',
    'employee',
    'other'
);

CREATE TYPE entry_type_enum AS ENUM (
    'debit',
    'credit'
);

-- Create or update the shared updated_at trigger function (don't drop it)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create finm_books table
CREATE TABLE finm_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_platform_id VARCHAR(10) NOT NULL, -- Format: E + entity_type_code + 6 chars
    organization_platform_id VARCHAR(10), -- Optional organization reference
    entity_name VARCHAR(255) NOT NULL, -- Cached entity name for display
    entity_type VARCHAR(50) NOT NULL, -- hospital, estore, pstore, channel_partner
    country_code VARCHAR(3) NOT NULL, -- References location_currency table
    fiscal_year_start DATE NOT NULL DEFAULT (CURRENT_DATE - INTERVAL '3 months'),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT finm_books_status_check CHECK (status IN ('active', 'inactive', 'archived')),
    CONSTRAINT finm_books_entity_platform_id_format CHECK (entity_platform_id ~ '^E(01|02|03|04)[A-Z0-9]{6}$'),
    CONSTRAINT finm_books_organization_platform_id_format CHECK (organization_platform_id IS NULL OR organization_platform_id ~ '^O[A-Z0-9]{9}$'),
    CONSTRAINT finm_books_country_code_format CHECK (country_code ~ '^[A-Z]{2,3}$')
);

-- Create finm_accounts table  
CREATE TABLE finm_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type account_type_enum NOT NULL,
    parent_id UUID REFERENCES finm_accounts(id),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT finm_accounts_unique_code_per_book UNIQUE (book_id, account_code),
    CONSTRAINT finm_accounts_no_self_parent CHECK (id != parent_id)
);

-- Create finm_journals table
CREATE TABLE finm_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    journal_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    reference VARCHAR(255),
    description TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT finm_journals_unique_number_per_book UNIQUE (book_id, journal_number),
    CONSTRAINT finm_journals_positive_amount CHECK (total_amount >= 0)
);

-- Create finm_ledger_entries table
CREATE TABLE finm_ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES finm_journals(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES finm_accounts(id),
    entry_type entry_type_enum NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT finm_ledger_entries_positive_amount CHECK (amount > 0)
);

-- Create finm_contacts table
CREATE TABLE finm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES finm_books(id) ON DELETE CASCADE,
    contact_type contact_type_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_number VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_finm_books_entity_platform_id ON finm_books(entity_platform_id);
CREATE INDEX idx_finm_books_country_code ON finm_books(country_code);
CREATE INDEX idx_finm_books_created_by ON finm_books(created_by);

CREATE INDEX idx_finm_accounts_book_id ON finm_accounts(book_id);
CREATE INDEX idx_finm_accounts_parent_id ON finm_accounts(parent_id);
CREATE INDEX idx_finm_accounts_account_type ON finm_accounts(account_type);

CREATE INDEX idx_finm_journals_book_id ON finm_journals(book_id);
CREATE INDEX idx_finm_journals_date ON finm_journals(date);
CREATE INDEX idx_finm_journals_created_by ON finm_journals(created_by);

CREATE INDEX idx_finm_ledger_entries_journal_id ON finm_ledger_entries(journal_id);
CREATE INDEX idx_finm_ledger_entries_account_id ON finm_ledger_entries(account_id);
CREATE INDEX idx_finm_ledger_entries_date ON finm_ledger_entries(date);

CREATE INDEX idx_finm_contacts_book_id ON finm_contacts(book_id);
CREATE INDEX idx_finm_contacts_contact_type ON finm_contacts(contact_type);

-- Create triggers for updated_at
CREATE TRIGGER update_finm_books_updated_at
    BEFORE UPDATE ON finm_books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_accounts_updated_at
    BEFORE UPDATE ON finm_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_journals_updated_at
    BEFORE UPDATE ON finm_journals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_ledger_entries_updated_at
    BEFORE UPDATE ON finm_ledger_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finm_contacts_updated_at
    BEFORE UPDATE ON finm_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'FINM database schema cleanup and recreation completed successfully!' as result;

-- NEXT STEPS:
-- 1. Run this entire cleanup-and-recreate.sql script in Supabase SQL Editor FIRST
-- 2. Then run database/sample-data.sql to add location_currency test data
-- 3. Test your FINM application - it should work perfectly after these steps