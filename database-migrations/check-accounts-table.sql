-- Check if finm_accounts table exists and get its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'finm_accounts'
ORDER BY ordinal_position;
