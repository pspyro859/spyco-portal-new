-- Migration Script: Regenerate Supplier Codes Based on Names
-- This script generates codes using first 3 letters of supplier name (e.g., TEC-00001)

-- Step 1: Backup existing codes (create a backup table)
CREATE TABLE IF NOT EXISTS suppliers_codes_backup AS
SELECT id, code, name, category, updated_at as backup_date
FROM suppliers 
WHERE code IS NOT NULL AND code != '';

-- Step 2: Show backup summary
SELECT 
    COUNT(*) as total_backed_up,
    'Codes backed up to suppliers_codes_backup table' as message
FROM suppliers_codes_backup;

-- Step 3: Clear existing codes (they will be regenerated)
UPDATE suppliers 
SET code = NULL 
WHERE code IS NOT NULL AND code != '';

-- Step 4: Generate new codes based on supplier names
-- This will create codes in format XXX-XXXXX where XXX = first 3 letters of name
SET @row_number = 0;
SET @current_prefix = '';
SET @current_sequence = 0;

UPDATE suppliers s
JOIN (
    SELECT 
        id,
        name,
        UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 3)) as prefix,
        @row_number := IF(@current_prefix = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 3)), 
                          @row_number + 1, 
                          1) as seq_num,
        @current_sequence := IF(@current_prefix = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 3)), 
                                @current_sequence + 1, 
                                1) as sequence,
        @current_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 3)) as dummy
    FROM suppliers 
    WHERE status != 'deleted'
    ORDER BY 
        UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 3)),
        name
) ranked ON s.id = ranked.id
SET s.code = CONCAT(
    IF(LENGTH(ranked.prefix) >= 3, ranked.prefix, LPAD(ranked.prefix, 3, 'X')),
    '-',
    LPAD(ranked.sequence, 5, '0')
);

-- Step 5: Display sample of new codes
SELECT 
    id, 
    code, 
    name, 
    category 
FROM suppliers 
WHERE status != 'deleted' 
ORDER BY code ASC 
LIMIT 20;

-- Step 6: Show migration summary
SELECT 
    COUNT(*) as total_suppliers,
    COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as suppliers_with_codes,
    COUNT(DISTINCT SUBSTRING(code, 1, 3)) as unique_prefixes,
    'Codes regenerated based on supplier names' as message
FROM suppliers 
WHERE status != 'deleted';

-- Step 7: Show code distribution by prefix
SELECT 
    SUBSTRING(code, 1, 3) as prefix,
    COUNT(*) as count,
    GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') as sample_names
FROM suppliers 
WHERE status != 'deleted' AND code IS NOT NULL
GROUP BY SUBSTRING(code, 1, 3)
ORDER BY prefix;

-- Note: If you need to rollback, use:
-- UPDATE suppliers s JOIN suppliers_codes_backup b ON s.id = b.id SET s.code = b.code;