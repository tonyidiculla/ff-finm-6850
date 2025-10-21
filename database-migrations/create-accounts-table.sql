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
