# Supplier Code Format - Name-Based Generation

## Overview
Supplier codes are now automatically generated based on the supplier's name, making them more meaningful and easier to remember.

## Code Format

### Structure: `XXX-XXXXX`
- **XXX** = First 3 letters of supplier name (uppercase)
- **XXXXX** = Sequential 5-digit number

### Examples:
| Supplier Name | Generated Code | Explanation |
|---------------|----------------|-------------|
| Tech Solutions Inc | TEC-00001 | "TEC" from "Tech" |
| Electronics Co | ELE-00001 | "ELE" from "Electronics" |
| Materials Ltd | MAT-00001 | "MAT" from "Materials" |
| Services LLC | SER-00001 | "SER" from "Services" |
| Software Inc | SOF-00001 | "SOF" from "Software" |
| A & B Corporation | ABX-00001 | "AB" from name + "X" padding |
| John Smith & Sons | JOH-00001 | "JOH" from "John" |
| 123 Company | GEN-00001 | No letters → "GEN" (generic) |

## How It Works

### 1. Prefix Generation
- Takes the first 3 letters from the supplier name
- Converts to uppercase
- Removes special characters and numbers
- Pads with 'X' if name has fewer than 3 letters

### 2. Sequential Numbering
- Each prefix has its own sequence
- Starts at 00001 for each unique prefix
- Increments by 1 for each new supplier with the same prefix

### Examples of Sequences:
```
TEC-00001  (Tech Solutions Inc)
TEC-00002  (Tech Masters)
TEC-00003  (Tech World)

ELE-00001  (Electronics Co)
ELE-00002  (Electronics Plus)

MAT-00001  (Materials Ltd)
MAT-00002  (Materials Global)
```

## Special Cases

### Case 1: Names with Special Characters
**Input**: "A & B Corporation"
**Process**: 
1. Remove special characters → "AB Corporation"
2. Take first 3 letters → "AB"
3. Pad with 'X' → "ABX"
**Output**: ABX-00001

### Case 2: Names Starting with Numbers
**Input**: "123 Company"
**Process**:
1. Remove numbers → "Company"
2. Take first 3 letters → "COM"
3. No padding needed
**Output**: COM-00001

### Case 3: Names with No Letters
**Input**: "123 & 456"
**Process**:
1. Remove numbers and special characters → ""
2. No letters found
3. Use "GEN" (generic)
**Output**: GEN-00001

### Case 4: Very Short Names
**Input**: "AB Corp"
**Process**:
1. Take first 3 letters → "AB"
2. Pad with 'X' → "ABX"
**Output**: ABX-00001

## Benefits

### 1. **Meaningful Codes**
- Codes tell you about the supplier
- Easy to identify suppliers by code
- More intuitive than generic "SUP-XXXXX"

### 2. **Easy to Remember**
- Based on supplier name
- Natural connection between name and code
- No need to memorize arbitrary codes

### 3. **Organized Sequences**
- Related suppliers grouped by prefix
- Easy to see how many suppliers you have in each category
- Logical progression (TEC-00001, TEC-00002, etc.)

### 4. **Flexible**
- Handles various name formats
- Works with special characters
- Pads short names appropriately

## Manual Code Override

You can still manually specify a supplier code if needed:

```javascript
// POST /api/suppliers/
{
  "code": "CUSTOM-00001",
  "name": "Custom Supplier",
  "category": "General",
  "contact_person": "John Doe",
  "email": "john@custom.com",
  "phone": "+1-555-0123"
}
```

## Migration

When you run the migration script (`migrate_codes_name_based.sql`):

1. **Backup**: Existing codes are backed up to `suppliers_codes_backup` table
2. **Regenerate**: All codes are regenerated based on supplier names
3. **Organize**: Suppliers are grouped by their new prefixes
4. **Verify**: You can review the new codes before going live

### Rollback (if needed)
```sql
-- To restore previous codes
UPDATE suppliers s 
JOIN suppliers_codes_backup b ON s.id = b.id 
SET s.code = b.code;
```

## Code Generation Algorithm

```php
public function generateSupplierCode($supplierName = null) {
    // Step 1: Generate prefix from supplier name
    if ($supplierName && !empty($supplierName)) {
        // Remove everything except letters
        $cleanName = preg_replace('/[^a-zA-Z]/', '', $supplierName);
        
        // Take first 3 letters and convert to uppercase
        $prefix = strtoupper(substr($cleanName, 0, 3));
        
        // Pad with 'X' if needed
        while (strlen($prefix) < 3) {
            $prefix .= 'X';
        }
    } else {
        $prefix = 'GEN'; // Default prefix
    }
    
    // Step 2: Find the highest code with this prefix
    $sql = "SELECT code FROM suppliers WHERE code LIKE ? ORDER BY code DESC LIMIT 1";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["{$prefix}-%"]);
    $lastSupplier = $stmt->fetch();
    
    // Step 3: Calculate next sequence number
    if ($lastSupplier && !empty($lastSupplier['code'])) {
        $parts = explode('-', $lastSupplier['code']);
        $lastNumber = (int)$parts[1];
        $newNumber = $lastNumber + 1;
    } else {
        $newNumber = 1;
    }
    
    // Step 4: Format as XXX-XXXXX
    return sprintf('%s-%05d', $prefix, $newNumber);
}
```

## Best Practices

### 1. Naming Suppliers
- Use meaningful, descriptive names
- Start with letters if possible
- Avoid excessive special characters at the beginning

### 2. Consistent Formatting
- Use title case: "Tech Solutions Inc" not "tech solutions inc"
- Include company type: "Co", "Ltd", "Inc" for clarity
- Keep names concise but descriptive

### 3. Managing Codes
- Let the system auto-generate codes when possible
- Only override codes for special cases
- Use manual codes sparingly

## FAQ

**Q: Can I change a supplier's code later?**
A: Yes, but it's not recommended. Codes are meant to be permanent identifiers.

**Q: What happens if I change a supplier's name?**
A: The code won't automatically change. Only new suppliers get new codes based on their names.

**Q: Can I have duplicate codes?**
A: No, codes must be unique. The system will prevent duplicates.

**Q: What if two suppliers have the same prefix?**
A: They'll get sequential numbers: TEC-00001, TEC-00002, etc.

**Q: Can I customize the code format?**
A: The format is standardized to XXX-XXXXX, but you can manually override if needed.

## Support

For issues or questions about the code generation system, refer to:
- `CATEGORY_UPDATE_README.md` - Complete feature documentation
- `DEPLOYMENT_GUIDE.md` - Deployment and troubleshooting
- `IMPLEMENTATION_SUMMARY.md` - Quick reference