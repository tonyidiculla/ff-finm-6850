-- Verify the finm_books table structure
-- Run this in Supabase SQL Editor to check if the table exists and has the correct columns

-- Check if table exists
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'finm_books'
ORDER BY 
    ordinal_position;

-- If the table exists but book_type column is missing, add it:
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 
--         FROM information_schema.columns 
--         WHERE table_name = 'finm_books' 
--         AND column_name = 'book_type'
--     ) THEN
--         ALTER TABLE finm_books 
--         ADD COLUMN book_type VARCHAR(50) DEFAULT 'general-ledger';
--     END IF;
-- END $$;

-- Verify the table was created/updated
SELECT * FROM finm_books LIMIT 1;
