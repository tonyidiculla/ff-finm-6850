-- Verify RLS Setup
-- Run this to check if RLS is properly configured

-- =====================================================
-- CHECK RLS STATUS
-- =====================================================

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('finm_books', 'location_currency')
ORDER BY tablename;

-- =====================================================
-- LIST ALL POLICIES
-- =====================================================

-- Check existing policies on finm_books
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
WHERE tablename IN ('finm_books', 'location_currency')
ORDER BY tablename, policyname;

-- =====================================================
-- TEST QUERIES (Run these after RLS is enabled)
-- =====================================================

-- Test 1: Check if books are accessible (should work with valid JWT)
-- SELECT COUNT(*) as book_count FROM finm_books;

-- Test 2: Check if location_currency is accessible
-- SELECT COUNT(*) as currency_count FROM location_currency;

-- Test 3: Try to access specific book (replace with actual book ID)
-- SELECT * FROM finm_books WHERE id = 'some-book-id' LIMIT 1;