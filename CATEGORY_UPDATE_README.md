# Spyco Portal - Category & Auto-Code Features

## Overview
This update adds two major features to the Spyco Portal:
1. **Automatic Supplier Code Generation** - Auto-generates supplier codes in SUP-XXXXX format
2. **Supplier Categories** - Categorizes suppliers and displays them alphabetically by category

## What's New

### 1. Automatic Supplier Code Generation
- **Format**: SUP-XXXXX (e.g., SUP-00001, SUP-00002, SUP-00003)
- **Behavior**: 
  - Codes are automatically generated when creating new suppliers
  - You can manually specify a code if needed
  - Codes are unique and sequential
  - Existing suppliers without codes can be migrated

### 2. Supplier Categories
- **Default Category**: "General" is used if no category is specified
- **Common Categories**: 
  - General
  - Electronics
  - Materials
  - Services
  - Software
  - Hardware
- **Custom Categories**: Any category can be added and will be saved for future use
- **Sorting**: Suppliers are automatically sorted alphabetically by category, then by name

## Database Changes

### New Fields Added to `suppliers` table:
- `code` VARCHAR(20) UNIQUE - Auto-generated supplier code
- `category` VARCHAR(100) - Supplier category (default: "General")

### New Indexes:
- `idx_code` - For faster code-based lookups
- `idx_category` - For category filtering and sorting

## API Changes

### New Endpoint: `/api/suppliers/categories`
- **Method**: GET
- **Description**: Returns all unique supplier categories
- **Response**:
```json
{
  "success": true,
  "data": ["General", "Electronics", "Materials", "Services"]
}
```

### Updated Endpoint: `/api/suppliers`
- **New Query Parameter**: `category` - Filter suppliers by category
- **Example**: `/api/suppliers/?category=Electronics`
- **Updated Sorting**: Now sorts by `category ASC, name ASC`

## Frontend Changes

### Supplier Table
- Added "Category" column (2nd column)
- Added "Supplier Code" column (1st column)
- Table now shows 8 columns instead of 7

### Supplier Form
- Added "Category" dropdown field
- Common categories are pre-loaded
- Existing categories are dynamically loaded
- "Supplier Code" field is read-only (auto-generated)

### JavaScript Functions
- `loadCategories()` - Loads available categories
- `displaySuppliers()` - Updated to show category column
- `saveSupplier()` - Updated to include category data
- `openModal()` - Updated to load and populate category

## Migration Instructions

### Step 1: Update Database Schema
Run the updated schema.sql to add the new fields:
```bash
mysql -u your_username -p spyco_portal < database/schema.sql
```

### Step 2: Run Migration Script
Run the migration script to update existing suppliers:
```bash
mysql -u your_username -p spyco_portal < database/migrate_codes.sql
```

This script will:
1. Generate codes for suppliers without them
2. Set "General" as the default category for suppliers without categories
3. Display a summary of the migration

### Step 3: Deploy Updated Files
Upload the updated files to your server:
- `src/Models/Supplier.php`
- `src/Controllers/SupplierController.php`
- `public/api/suppliers.php`
- `public/index.php`
- `public/assets/js/app.js`

## Usage Examples

### Creating a New Supplier
```javascript
// POST /api/suppliers/
{
  "name": "Tech Solutions Inc",
  "category": "Electronics",
  "contact_person": "John Smith",
  "email": "john@techsolutions.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": 10,
    "code": "SUP-00010",
    "name": "Tech Solutions Inc",
    "category": "Electronics",
    ...
  }
}
```

### Filtering by Category
```
GET /api/suppliers/?category=Electronics
```

### Searching Suppliers
The search now includes the supplier code:
```
GET /api/suppliers/?search=SUP-00005
```

## Troubleshooting

### Issue: Duplicate Code Error
**Solution**: Run the migration script to fix existing codes, or manually update duplicate codes.

### Issue: Category Not Showing
**Solution**: Ensure the database schema has been updated and the migration script has been run.

### Issue: Suppliers Not Sorted by Category
**Solution**: Verify the `idx_category` index exists in the database and the getAll() method includes the correct ORDER BY clause.

## Features Summary

✅ Auto-generated supplier codes (SUP-XXXXX format)
✅ Supplier categorization with default "General" category
✅ Alphabetical sorting by category, then by name
✅ Dynamic category loading in forms
✅ Category filtering in API
✅ Migration script for existing data
✅ Backward compatible with existing functionality

## Technical Details

### Code Generation Logic
```php
public function generateSupplierCode() {
    $sql = "SELECT code FROM suppliers WHERE code LIKE 'SUP-%' ORDER BY code DESC LIMIT 1";
    $stmt = $this->db->query($sql);
    $lastSupplier = $stmt->fetch();
    
    if ($lastSupplier && !empty($lastSupplier['code'])) {
        $lastNumber = (int)str_replace('SUP-', '', $lastSupplier['code']);
        $newNumber = $lastNumber + 1;
    } else {
        $newNumber = 1;
    }
    
    return sprintf('SUP-%05d', $newNumber);
}
```

### Sorting Logic
```php
$sql .= " ORDER BY category ASC, name ASC LIMIT ? OFFSET ?";
```

## Support
For issues or questions, please contact the development team.