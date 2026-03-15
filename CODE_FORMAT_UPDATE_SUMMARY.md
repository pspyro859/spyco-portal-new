# Code Format Update - Summary

## What Changed?

The supplier code format has been updated from **SUP-XXXXX** to **XXX-XXXXX** where the prefix (XXX) is derived from the first 3 letters of the supplier name.

## Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Format** | SUP-XXXXX | XXX-XXXXX |
| **Example** | SUP-00001 | TEC-00001 |
| **Prefix** | Fixed "SUP" | Dynamic from name |
| **Meaning** | Generic | Name-based |
| **Example Codes** | SUP-00001, SUP-00002 | TEC-00001, ELE-00001, MAT-00001 |

## Real-World Examples

| Supplier Name | Old Code | New Code |
|---------------|----------|----------|
| Tech Solutions Inc | SUP-00001 | TEC-00001 |
| Electronics Co | SUP-00002 | ELE-00001 |
| Materials Ltd | SUP-00003 | MAT-00001 |
| Services LLC | SUP-00004 | SER-00001 |
| Software Inc | SUP-00005 | SOF-00001 |

## Benefits of New Format

✅ **More Meaningful** - Codes reflect the supplier name
✅ **Easier to Remember** - Natural connection between name and code
✅ **Better Organization** - Related suppliers grouped by prefix
✅ **Matches Your Workflow** - Consistent with how you've been doing it manually
✅ **Scalable** - Each prefix has its own sequence

## How It Works

### Prefix Generation:
1. Extract first 3 letters from supplier name
2. Convert to uppercase
3. Remove special characters and numbers
4. Pad with 'X' if name has fewer than 3 letters

### Sequencing:
- Each prefix starts at 00001
- Increments by 1 for each new supplier with same prefix
- Example: TEC-00001 → TEC-00002 → TEC-00003

## Special Cases Handled

| Input | Prefix | Code |
|-------|--------|------|
| "Tech Solutions" | TEC | TEC-00001 |
| "A & B Corp" | ABX | ABX-00001 |
| "123 Company" | COM | COM-00001 |
| "AB Ltd" | ABX | ABX-00001 |
| "NoLetters123" | GEN | GEN-00001 |

## What Happens When You Deploy?

### Migration Process:
1. ✅ Existing codes are **backed up** to `suppliers_codes_backup` table
2. ✅ All codes are **regenerated** based on supplier names
3. ✅ Suppliers are **reorganized** by their new prefixes
4. ✅ You can **verify** the changes before going live

### Example Migration:
```
Before:
SUP-00001 → Tech Solutions Inc
SUP-00002 → Electronics Co
SUP-00003 → Materials Ltd

After:
TEC-00001 → Tech Solutions Inc
ELE-00001 → Electronics Co
MAT-00001 → Materials Ltd
```

## Files Changed

### Updated:
- `src/Models/Supplier.php` - Updated code generation logic
- Documentation files updated to reflect new format

### New:
- `database/migrate_codes_name_based.sql` - New migration script
- `NAME_BASED_CODES_README.md` - Comprehensive code format guide

## Deployment Steps

### 1. Pull Latest Changes
```bash
cd /path/to/spyco-portal
git pull origin main
```

### 2. Run Migration Script
```bash
mysql -u your_user -p your_db < database/migrate_codes_name_based.sql
```

### 3. Verify Changes
```bash
# Check new codes
mysql -u your_user -p your_db -e "
SELECT id, code, name FROM suppliers 
WHERE status != 'deleted' 
ORDER BY code ASC 
LIMIT 10;
"

# Check distribution by prefix
mysql -u your_user -p your_db -e "
SELECT SUBSTRING(code, 1, 3) as prefix, COUNT(*) as count
FROM suppliers 
WHERE status != 'deleted' 
GROUP BY prefix 
ORDER BY prefix;
"
```

### 4. Clear Browser Cache
- Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### 5. Test
- Add a new supplier
- Verify the code is generated based on the name

## Rollback (If Needed)

If you want to restore the old codes:

```sql
UPDATE suppliers s 
JOIN suppliers_codes_backup b ON s.id = b.id 
SET s.code = b.code;
```

## Documentation Available

1. **NAME_BASED_CODES_README.md** - Complete guide to the new code format
2. **CATEGORY_UPDATE_README.md** - Full feature documentation
3. **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
4. **IMPLEMENTATION_SUMMARY.md** - Quick reference

## FAQ

**Q: Will this affect existing suppliers?**
A: Yes, all codes will be regenerated based on supplier names.

**Q: Can I keep my old codes?**
A: No, the migration script will regenerate all codes. However, they're backed up.

**Q: What if I don't like the new codes?**
A: You can rollback using the backup table.

**Q: Do I need to update anything else?**
A: No, just run the migration script. Everything else is automated.

**Q: Will this break any integrations?**
A: If you have integrations using the old code format, you'll need to update them.

## Next Steps

1. Review the `NAME_BASED_CODES_README.md` for detailed examples
2. Check the `DEPLOYMENT_GUIDE.md` for deployment steps
3. Plan your deployment when you're ready
4. Test thoroughly after deployment

---

**Status**: ✅ Ready for Deployment
**Migration**: Automated with backup
**Documentation**: Complete