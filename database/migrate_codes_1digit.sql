-- Migration Script: Regenerate Supplier Codes with 4 Letters + 1 Number
-- Format: XXXX-X where XXXX = first 4 letters of supplier name

-- Step 1: Backup existing codes (create a backup table)
DROP TABLE IF EXISTS suppliers_codes_backup_4digit;
CREATE TABLE suppliers_codes_backup_4digit AS
SELECT id, code, name, category, updated_at as backup_date
FROM suppliers 
WHERE code IS NOT NULL AND code != '';

-- Step 2: Show backup summary
SELECT 
    COUNT(*) as total_backed_up,
    'Codes backed up to suppliers_codes_backup_4digit table' as message
FROM suppliers_codes_backup_4digit;

-- Step 3: Clear existing codes (they will be regenerated)
UPDATE suppliers 
SET code = NULL 
WHERE code IS NOT NULL AND code != '';

-- Step 4: Generate new codes based on supplier names
-- Format: XXXX-X (4 letters + 1 digit)
SET @row_number = 0;
SET @current_prefix = '';
SET @current_sequence = 0;

UPDATE suppliers s
JOIN (
    SELECT 
        id,
        name,
        UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 4)) as prefix,
        @row_number := IF(@current_prefix = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 4)), 
                          @row_number + 1, 
                          1) as seq_num,
        @current_sequence := IF(@current_prefix = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 4)), 
                                @current_sequence + 1, 
                                1) as sequence,
        @current_prefix := UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 4)) as dummy
    FROM suppliers 
    WHERE status != 'deleted'
    ORDER BY 
        UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^a-zA-Z]', ''), 1, 4)),
        name
) ranked ON s.id = ranked.id
SET s.code = CONCAT(
    IF(LENGTH(ranked.prefix) >= 4, ranked.prefix, LPAD(ranked.prefix, 4, 'X')),
    '-',
    ranked.sequence
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
    COUNT(DISTINCT SUBSTRING(code, 1, 4)) as unique_prefixes,
    'Codes regenerated with 4 letters + 1 digit format' as message
FROM suppliers 
WHERE status != 'deleted';

-- Step 7: Show code distribution by prefix
SELECT 
    SUBSTRING(code, 1, 4) as prefix,
    COUNT(*) as count,
    GROUP_CONCAT(code ORDER BY code SEPARATOR ', ') as codes,
    GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') as sample_names
FROM suppliers 
WHERE status != 'deleted' AND code IS NOT NULL
GROUP BY SUBSTRING(code, 1, 4)
ORDER BY prefix
LIMIT 20;

-- Note: If you need to rollback to 4-digit format, use:
-- UPDATE suppliers s JOIN suppliers_codes_backup_4digit b ON s.id = b.id SET s.code = b.code;