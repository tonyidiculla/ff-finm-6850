-- Update entity_platform_id constraint to accept 5 OR 6 characters after the E01-E04 prefix
-- This accommodates both 8-char (E01x7yTu) and 9-char (E019nC8m3) formats

ALTER TABLE finm_books 
DROP CONSTRAINT IF EXISTS finm_books_entity_platform_id_format;

ALTER TABLE finm_books 
ADD CONSTRAINT finm_books_entity_platform_id_format 
CHECK (entity_platform_id ~ '^E(01|02|03|04)[A-Za-z0-9]{5,6}$');

-- Verify the fix with test cases
SELECT 
    'E01x7yTu' ~ '^E(01|02|03|04)[A-Za-z0-9]{5,6}$' AS eight_char_valid,
    'E019nC8m3' ~ '^E(01|02|03|04)[A-Za-z0-9]{5,6}$' AS nine_char_valid,
    'E01test01' ~ '^E(01|02|03|04)[A-Za-z0-9]{5,6}$' AS nine_char_valid2,
    'E01abc' ~ '^E(01|02|03|04)[A-Za-z0-9]{5,6}$' AS six_char_valid;
