-- Enable Row Level Security (RLS) on FINM tables
-- This script enables RLS and creates policies based on platform_id access control

-- =====================================================
-- ENABLE RLS ON ALL FINM TABLES
-- =====================================================

-- Enable RLS on finm_books table
ALTER TABLE finm_books ENABLE ROW LEVEL SECURITY;

-- Enable RLS on finm_accounts table (if exists)
ALTER TABLE finm_accounts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on finm_journals table (if exists) 
ALTER TABLE finm_journals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on finm_ledger_entries table (if exists)
ALTER TABLE finm_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on finm_contacts table (if exists)
ALTER TABLE finm_contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on location_currency table (reference data - read-only)
ALTER TABLE location_currency ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Policy for finm_books table
-- Users can access books based on their platform_id in JWT token
CREATE POLICY "finm_books_access_policy" ON finm_books
  FOR ALL 
  USING (
    -- Allow access if user's platform_id matches organization_platform_id
    (auth.jwt() ->> 'platformId')::text = organization_platform_id
    OR
    -- Allow access if user's platform_id matches entity_platform_id  
    (auth.jwt() ->> 'platformId')::text = entity_platform_id
    OR
    -- Allow super admin access (platform_id starts with 'SA')
    (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
  );

-- Policy for finm_accounts table
-- Users can access accounts based on book ownership
CREATE POLICY "finm_accounts_access_policy" ON finm_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_books 
      WHERE finm_books.id = finm_accounts.book_id
      AND (
        (auth.jwt() ->> 'platformId')::text = finm_books.organization_platform_id
        OR (auth.jwt() ->> 'platformId')::text = finm_books.entity_platform_id
        OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_journals table
-- Users can access journals based on book ownership
CREATE POLICY "finm_journals_access_policy" ON finm_journals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_books 
      WHERE finm_books.id = finm_journals.book_id
      AND (
        (auth.jwt() ->> 'platformId')::text = finm_books.organization_platform_id
        OR (auth.jwt() ->> 'platformId')::text = finm_books.entity_platform_id
        OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_ledger_entries table
-- Users can access ledger entries based on journal/book ownership
CREATE POLICY "finm_ledger_entries_access_policy" ON finm_ledger_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_journals
      JOIN finm_books ON finm_books.id = finm_journals.book_id
      WHERE finm_journals.id = finm_ledger_entries.journal_id
      AND (
        (auth.jwt() ->> 'platformId')::text = finm_books.organization_platform_id
        OR (auth.jwt() ->> 'platformId')::text = finm_books.entity_platform_id
        OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_contacts table
-- Users can access contacts based on book ownership
CREATE POLICY "finm_contacts_access_policy" ON finm_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_books 
      WHERE finm_books.id = finm_contacts.book_id
      AND (
        (auth.jwt() ->> 'platformId')::text = finm_books.organization_platform_id
        OR (auth.jwt() ->> 'platformId')::text = finm_books.entity_platform_id
        OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for location_currency table (reference data - read-only for all authenticated users)
CREATE POLICY "location_currency_read_policy" ON location_currency
  FOR SELECT
  USING (
    -- Allow read access for all authenticated users
    auth.jwt() IS NOT NULL
  );

-- =====================================================
-- ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Policy to prevent unauthorized insertions on finm_books
CREATE POLICY "finm_books_insert_policy" ON finm_books
  FOR INSERT
  WITH CHECK (
    -- Users can only create books for their own platform or entities they manage
    (auth.jwt() ->> 'platformId')::text = organization_platform_id
    OR (auth.jwt() ->> 'platformId')::text = entity_platform_id
    OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
  );

-- Policy to prevent unauthorized updates on finm_books
CREATE POLICY "finm_books_update_policy" ON finm_books
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'platformId')::text = organization_platform_id
    OR (auth.jwt() ->> 'platformId')::text = entity_platform_id
    OR (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
  );

-- Policy to prevent unauthorized deletions on finm_books
CREATE POLICY "finm_books_delete_policy" ON finm_books
  FOR DELETE
  USING (
    -- Only super admins can delete books
    (auth.jwt() ->> 'platformId')::text LIKE 'SA%'
  );

-- =====================================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- =====================================================

-- Grant necessary permissions to the service role (for admin operations)
GRANT ALL ON finm_books TO service_role;
GRANT ALL ON finm_accounts TO service_role;
GRANT ALL ON finm_journals TO service_role;
GRANT ALL ON finm_ledger_entries TO service_role;
GRANT ALL ON finm_contacts TO service_role;
GRANT SELECT ON location_currency TO service_role;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "finm_books_access_policy" ON finm_books IS 
'Allows access to books based on user platformId matching organization or entity platformId, or super admin access';

COMMENT ON POLICY "finm_accounts_access_policy" ON finm_accounts IS 
'Allows access to accounts based on book ownership through platformId matching';

COMMENT ON POLICY "finm_journals_access_policy" ON finm_journals IS 
'Allows access to journals based on book ownership through platformId matching';

COMMENT ON POLICY "finm_ledger_entries_access_policy" ON finm_ledger_entries IS 
'Allows access to ledger entries based on journal/book ownership through platformId matching';

COMMENT ON POLICY "finm_contacts_access_policy" ON finm_contacts IS 
'Allows access to contacts based on book ownership through platformId matching';

COMMENT ON POLICY "location_currency_read_policy" ON location_currency IS 
'Allows read-only access to location/currency reference data for all authenticated users';