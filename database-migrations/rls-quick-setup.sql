-- Simplified RLS setup for immediate deployment
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ENABLE RLS ON EXISTING TABLES
-- =====================================================

-- Enable RLS on finm_books table
ALTER TABLE finm_books ENABLE ROW LEVEL SECURITY;

-- Enable RLS on location_currency table (if it exists)
ALTER TABLE location_currency ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE BASIC ACCESS POLICIES
-- =====================================================

-- Policy for finm_books: Allow access based on platformId
CREATE POLICY "finm_books_platform_access" ON finm_books
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

-- Policy for location_currency: Read-only for authenticated users
CREATE POLICY "location_currency_read_access" ON location_currency
  FOR SELECT
  USING (
    -- Allow read access for all authenticated users
    auth.jwt() IS NOT NULL
  );

-- =====================================================
-- 3. GRANT SERVICE ROLE PERMISSIONS
-- =====================================================

-- Grant permissions to service role for admin operations
GRANT ALL ON finm_books TO service_role;
GRANT SELECT ON location_currency TO service_role;