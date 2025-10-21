-- Clean up duplicate RLS policies
-- Run this to remove redundant policies and keep only the essential ones

-- =====================================================
-- REMOVE DUPLICATE POLICIES
-- =====================================================

-- Remove the duplicate finm_books policies (keep the comprehensive ones)
DROP POLICY IF EXISTS "finm_books_platform_access" ON finm_books;

-- Remove duplicate location_currency policies (keep the most specific ones)
DROP POLICY IF EXISTS "location_currency_read_access" ON location_currency;
DROP POLICY IF EXISTS "location_currency_read_policy" ON location_currency;

-- Remove the dev policy (this should not be in production)
DROP POLICY IF EXISTS "dev_all_anon" ON location_currency;

-- =====================================================
-- VERIFY CLEAN POLICIES
-- =====================================================

-- Check remaining policies after cleanup
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('finm_books', 'location_currency')
ORDER BY tablename, policyname;

-- =====================================================
-- RECREATE CLEAN LOCATION_CURRENCY POLICY
-- =====================================================

-- Create a single, clean policy for location_currency
CREATE POLICY "location_currency_authenticated_read" ON location_currency
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant explicit access to service role
GRANT SELECT ON location_currency TO service_role;