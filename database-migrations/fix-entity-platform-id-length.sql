-- Fix entity platform_id from 8 characters to 9 characters
-- Update E01x7yTu to E01x7yTu1 to meet the 9-character requirement

-- First, check the current entity
SELECT platform_id, name 
FROM hospital_master 
WHERE platform_id LIKE 'E01x7yTu%';

-- Update the platform_id by appending '1'
UPDATE hospital_master 
SET platform_id = 'E01x7yTu1'
WHERE platform_id = 'E01x7yTu';

-- Verify the update
SELECT platform_id, name, LENGTH(platform_id) as id_length
FROM hospital_master 
WHERE platform_id = 'E01x7yTu1';

-- Check for any other 8-character entity IDs that need fixing
SELECT platform_id, name, LENGTH(platform_id) as id_length
FROM hospital_master 
WHERE platform_id ~ '^E(01|02|03|04)[A-Za-z0-9]+$'
  AND LENGTH(platform_id) < 9
ORDER BY platform_id;
