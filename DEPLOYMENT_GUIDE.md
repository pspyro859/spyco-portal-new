# Quick Deployment Guide for Category & Auto-Code Features

## Overview
Your Spyco Portal has been updated with supplier categories and auto-generated codes. Follow these steps to deploy the changes to your VPS.

## Files Changed
- `src/Models/Supplier.php` - Added category handling and code generation
- `src/Controllers/SupplierController.php` - Added categories endpoint
- `public/api/suppliers.php` - Added categories route
- `public/index.php` - Added category field to form and table
- `public/assets/js/app.js` - Updated JavaScript for category support
- `database/schema.sql` - Updated schema with new fields
- `database/migrate_codes.sql` - New migration script
- `CATEGORY_UPDATE_README.md` - Comprehensive documentation

## Deployment Steps

### Step 1: Backup Your Current Installation
```bash
# SSH into your VPS
ssh your-user@your-vps-ip

# Navigate to your installation directory
cd /path/to/spyco-portal

# Create a backup
tar -czf spyco-portal-backup-$(date +%Y%m%d).tar.gz .
```

### Step 2: Pull Latest Changes from GitHub
```bash
cd /path/to/spyco-portal
git pull origin main
```

### Step 3: Update Database Schema
```bash
# Run the updated schema (this will add the new fields)
mysql -u your_db_user -p your_db_name < database/schema.sql
```

### Step 4: Run Migration Script
```bash
# This will regenerate codes based on supplier names (4 letters + 4 digits) and set default categories
mysql -u your_db_user -p your_db_name < database/migrate_codes_4digit.sql
```

### Step 5: Verify the Update
```bash
# Check if the migration was successful
mysql -u your_db_user -p your_db_name -e "
SELECT id, code, name, category 
FROM suppliers 
WHERE status != 'deleted' 
ORDER BY code ASC 
LIMIT 10;
"

# Check code distribution by prefix
mysql -u your_db_user -p your_db_name -e "
SELECT 
    SUBSTRING(code, 1, 3) as prefix,
    COUNT(*) as count
FROM suppliers 
WHERE status != 'deleted' AND code IS NOT NULL
GROUP BY SUBSTRING(code, 1, 3)
ORDER BY prefix;
"
```

### Step 6: Clear Browser Cache
- Open your browser
- Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to hard refresh
- This ensures you get the latest JavaScript and CSS files

### Step 7: Test the New Features
1. **Test Auto-Code Generation**:
   - Go to Suppliers section
   - Click "Add Supplier"
   - Leave the "Supplier Code" field empty
   - Fill in supplier name (e.g., "Tech Solutions Inc")
   - Fill in other details and save
   - Verify a code was automatically generated based on the name (e.g., TECH-0001)

2. **Test Categories**:
   - Add a new supplier
   - Select a category from the dropdown
   - Save and verify the category appears in the table
   - Check that suppliers are sorted alphabetically by category

3. **Test Category Filtering** (if implemented in frontend):
   - Filter suppliers by category
   - Verify the results show only the selected category

## What to Expect

### New Features You'll See:
1. **Supplier Code Column** - First column in the table showing name-based codes (e.g., TECH-0001)
2. **Category Column** - Second column showing supplier categories
3. **Category Dropdown** - When adding/editing suppliers, you'll see a category selector
4. **Auto-Generated Codes** - New suppliers get codes automatically based on their name (4 letters + 4 digits)

### Data Migration:
- All existing suppliers will receive codes based on their names (e.g., Tech Solutions → TEC-00001)
- Suppliers without categories will be set to "General"
- Suppliers will be sorted alphabetically by category, then by name
- Previous codes are backed up to `suppliers_codes_backup` table

## Troubleshooting

### Issue: "Column 'code' doesn't exist"
**Solution**: The database schema wasn't updated. Run Step 3 again.

### Issue: "Column 'category' doesn't exist"
**Solution**: The database schema wasn't updated. Run Step 3 again.

### Issue: Existing suppliers don't have codes or codes look wrong
**Solution**: Run the name-based migration script (Step 4) again. This will regenerate all codes based on supplier names.

### Issue: Suppliers not sorted by category
**Solution**: 
1. Check if the migration script ran successfully
2. Clear your browser cache
3. Check the database to verify categories are set

### Issue: Categories not showing in dropdown
**Solution**:
1. Clear browser cache
2. Check browser console for JavaScript errors
3. Verify the API endpoint `/api/suppliers/categories` is accessible

### Issue: Git pull conflicts
**Solution**:
```bash
# If you have local changes, stash them first
git stash
git pull origin main
git stash pop
```

## Rollback Plan
If something goes wrong, you can rollback to the previous version:

```bash
# Restore from backup
cd /path/to/spyco-portal
tar -xzf spyco-portal-backup-YYYYMMDD.tar.gz

# Or rollback git commit (if database changes are also needed)
git reset --hard HEAD~1
```

## Verification Checklist

- [ ] All existing suppliers have auto-generated codes
- [ ] All suppliers have a category (default: "General")
- [ ] Suppliers are sorted alphabetically by category
- [ ] New suppliers receive auto-generated codes
- [ ] Category dropdown shows common categories
- [ ] Category dropdown shows existing custom categories
- [ ] Table displays Category column correctly
- [ ] Table displays Supplier Code column correctly
- [ ] Search functionality works with codes
- [ ] No JavaScript errors in browser console

## Need Help?

If you encounter any issues:
1. Check the `CATEGORY_UPDATE_README.md` file for detailed documentation
2. Review the migration script output
3. Check browser console for JavaScript errors
4. Verify database schema was updated correctly

## Next Steps

After successful deployment, you may want to:
1. Update existing suppliers with appropriate categories
2. Customize the common categories list in the JavaScript
3. Add category filtering to the search interface (if needed)
4. Set up category-based permissions or access control (if needed)

---

**Deployment Date**: Use today's date
**Version**: 2.0 (with categories and auto-codes)