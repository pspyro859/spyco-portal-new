-- Migration Script: Add Supplier Codes to Existing Records
-- This script generates supplier codes for existing suppliers without codes

-- Step 1: Check if there are suppliers without codes
SELECT COUNT(*) as suppliers_without_codes 
FROM suppliers 
WHERE code IS NULL OR code = '';

-- Step 2: Generate codes for suppliers without codes
-- This will create codes in the format SUP-XXXXX where XXXXX is a sequential number
UPDATE suppliers s1
SET s1.code = (
    SELECT CONCAT('SUP-', LPAD(s2.row_num, 5, '0'))
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
        FROM suppliers 
        WHERE (code IS NULL OR code = '') AND status != 'deleted'
    ) s2
    WHERE s1.id = s2.id
)
WHERE s1.code IS NULL OR s1.code = '';

-- Step 3: Verify the migration
SELECT id, code, name, category 
FROM suppliers 
WHERE status != 'deleted'
ORDER BY code ASC;

-- Step 4: Set default category for suppliers without one
UPDATE suppliers 
SET category = 'General'
WHERE category IS NULL OR category = '';

-- Step 5: Show final results
SELECT 
    COUNT(*) as total_suppliers,
    COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as suppliers_with_codes,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as suppliers_with_categories
FROM suppliers 
WHERE status != 'deleted';