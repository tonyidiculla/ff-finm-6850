-- Fix the entity_platform_id format constraint
-- This removes the overly strict constraint and adds a more lenient one

-- First, drop the existing constraint
ALTER TABLE finm_books 
DROP CONSTRAINT IF EXISTS finm_books_entity_platform_id_format;

-- Add a new, corrected constraint
-- Pattern: E + (01|02|03|04) + 6 alphanumeric characters
-- Example: E01abc123, E02test1, E03xyz789
ALTER TABLE finm_books 
ADD CONSTRAINT finm_books_entity_platform_id_format 
CHECK (entity_platform_id ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$');

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conname = 'finm_books_entity_platform_id_format';

-- Test that valid IDs work
SELECT 
    'E01test01' ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$' AS test1_valid,
    'E019nC8m3' ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$' AS test2_valid,
    'E02abc123' ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$' AS test3_valid,
    'E05wrong0' ~ '^E(01|02|03|04)[a-zA-Z0-9]{6}$' AS test4_invalid;
