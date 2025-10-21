-- Fix the entity_platform_id constraint to accept lowercase letters
-- Current constraint only accepts uppercase: [A-Z0-9]
-- We need to accept both: [A-Za-z0-9]

ALTER TABLE finm_books 
DROP CONSTRAINT IF EXISTS finm_books_entity_platform_id_format;

ALTER TABLE finm_books 
ADD CONSTRAINT finm_books_entity_platform_id_format 
CHECK (entity_platform_id ~ '^E(01|02|03|04)[A-Za-z0-9]{6}$');

-- Verify the fix
SELECT 
    'E01TEST01' ~ '^E(01|02|03|04)[A-Za-z0-9]{6}$' AS uppercase_valid,
    'E01test01' ~ '^E(01|02|03|04)[A-Za-z0-9]{6}$' AS lowercase_valid,
    'E019nC8m3' ~ '^E(01|02|03|04)[A-Za-z0-9]{6}$' AS mixed_case_valid;
