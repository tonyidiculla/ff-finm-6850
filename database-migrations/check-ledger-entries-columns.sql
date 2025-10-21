-- Check the actual column names in finm_ledger_entries
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'finm_ledger_entries'
ORDER BY ordinal_position;
