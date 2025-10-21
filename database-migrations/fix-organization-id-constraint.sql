-- Fix the organization_platform_id constraint to accept lowercase letters
-- Similar to the entity_platform_id fix

-- First, check the current constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conname = 'finm_books_organization_platform_id_format';

-- Drop and recreate with correct pattern
ALTER TABLE finm_books 
DROP CONSTRAINT IF EXISTS finm_books_organization_platform_id_format;

ALTER TABLE finm_books 
ADD CONSTRAINT finm_books_organization_platform_id_format 
CHECK (organization_platform_id ~ '^C00[A-Za-z0-9]{6}$');

-- Verify the fix
SELECT 
    'C00000001' ~ '^C00[A-Za-z0-9]{6}$' AS numeric_valid,
    'C00TEST01' ~ '^C00[A-Za-z0-9]{6}$' AS uppercase_valid,
    'C00test01' ~ '^C00[A-Za-z0-9]{6}$' AS lowercase_valid,
    'C00jvdgrP' ~ '^C00[A-Za-z0-9]{6}$' AS mixed_case_valid;
