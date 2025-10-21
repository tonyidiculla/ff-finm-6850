-- Make created_by column nullable or add a default value
-- This allows book creation without requiring a user ID

-- Option 1: Make it nullable (recommended for now)
ALTER TABLE finm_books 
ALTER COLUMN created_by DROP NOT NULL;

-- Option 2: Set a default value (system user UUID)
-- ALTER TABLE finm_books 
-- ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Verify the change
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'finm_books'
AND column_name = 'created_by';
