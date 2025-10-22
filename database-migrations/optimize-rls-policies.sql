-- Optimize RLS Policies for Performance
-- Replace direct auth.jwt() calls with (SELECT auth.jwt()) to evaluate once per query instead of per row
-- This significantly improves performance for queries with many rows

-- Drop existing policies
DROP POLICY IF EXISTS "finm_books_access_policy" ON finm_books;
DROP POLICY IF EXISTS "finm_accounts_access_policy" ON finm_accounts;
DROP POLICY IF EXISTS "finm_journals_access_policy" ON finm_journals;
DROP POLICY IF EXISTS "finm_ledger_entries_access_policy" ON finm_ledger_entries;
DROP POLICY IF EXISTS "finm_contacts_access_policy" ON finm_contacts;
DROP POLICY IF EXISTS "location_currency_read_policy" ON location_currency;

-- =====================================================
-- OPTIMIZED POLICIES WITH SUBQUERIES
-- =====================================================

-- Policy for finm_books table
CREATE POLICY "finm_books_access_policy" ON finm_books
  FOR ALL
  USING (
    ((SELECT auth.jwt()) ->> 'platformId')::text = organization_platform_id
    OR
    ((SELECT auth.jwt()) ->> 'platformId')::text = entity_platform_id
    OR
    ((SELECT auth.jwt()) ->> 'platformId')::text LIKE 'SA%'
  );

-- Policy for finm_accounts table
CREATE POLICY "finm_accounts_access_policy" ON finm_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_books 
      WHERE finm_books.id = finm_accounts.book_id
      AND (
        ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.organization_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.entity_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_journals table
CREATE POLICY "finm_journals_access_policy" ON finm_journals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_accounts
      JOIN finm_books ON finm_books.id = finm_accounts.book_id
      WHERE finm_accounts.id = finm_journals.account_id
      AND (
        ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.organization_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.entity_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_ledger_entries table
CREATE POLICY "finm_ledger_entries_access_policy" ON finm_ledger_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_journals
      JOIN finm_accounts ON finm_accounts.id = finm_journals.account_id
      JOIN finm_books ON finm_books.id = finm_accounts.book_id
      WHERE finm_journals.id = finm_ledger_entries.journal_id
      AND (
        ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.organization_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.entity_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for finm_contacts table
CREATE POLICY "finm_contacts_access_policy" ON finm_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM finm_books 
      WHERE finm_books.id = finm_contacts.book_id
      AND (
        ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.organization_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text = finm_books.entity_platform_id
        OR ((SELECT auth.jwt()) ->> 'platformId')::text LIKE 'SA%'
      )
    )
  );

-- Policy for location_currency table (reference data - read-only for all authenticated users)
CREATE POLICY "location_currency_read_policy" ON location_currency
  FOR SELECT
  USING (
    -- Allow read access for all authenticated users
    (SELECT auth.jwt()) IS NOT NULL
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('finm_books', 'finm_accounts', 'finm_journals', 'finm_ledger_entries', 'finm_contacts', 'location_currency')
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies optimized successfully!';
  RAISE NOTICE '📊 All auth.jwt() calls now use subqueries for better performance';
  RAISE NOTICE '🚀 Queries with many rows will now execute faster';
END $$;
