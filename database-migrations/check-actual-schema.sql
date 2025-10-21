-- Check actual structure of finm_accounts table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'finm_accounts'
ORDER BY ordinal_position;

-- Also check if table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'finm_accounts'
) as table_exists;
