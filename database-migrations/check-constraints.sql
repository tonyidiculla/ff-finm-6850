-- Check the entity_platform_id format constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conname = 'finm_books_entity_platform_id_format'
    AND conrelid = 'finm_books'::regclass;

-- Also check all constraints on the table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'finm_books'::regclass
ORDER BY 
    conname;
