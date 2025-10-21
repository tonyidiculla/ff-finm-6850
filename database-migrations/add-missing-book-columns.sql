-- Add missing columns to finm_books table
-- This migration aligns the database schema with the application code

-- Add book_type column
ALTER TABLE finm_books 
ADD COLUMN IF NOT EXISTS book_type VARCHAR(50) DEFAULT 'general-ledger';

-- Add fy_start_month column (extract from fiscal_year_start if it exists)
ALTER TABLE finm_books 
ADD COLUMN IF NOT EXISTS fy_start_month INTEGER DEFAULT 1;

-- Add is_active column (map from status)
ALTER TABLE finm_books 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records: set fy_start_month from fiscal_year_start
UPDATE finm_books 
SET fy_start_month = EXTRACT(MONTH FROM fiscal_year_start)
WHERE fiscal_year_start IS NOT NULL;

-- Update existing records: set is_active from status
UPDATE finm_books 
SET is_active = CASE 
  WHEN status = 'active' THEN true 
  ELSE false 
END
WHERE status IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN finm_books.book_type IS 'Type of book: general-ledger, subsidiary-ledger, etc.';
COMMENT ON COLUMN finm_books.fy_start_month IS 'Fiscal year start month (1-12)';
COMMENT ON COLUMN finm_books.is_active IS 'Whether the book is currently active';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'finm_books'
AND column_name IN ('book_type', 'fy_start_month', 'is_active')
ORDER BY column_name;
