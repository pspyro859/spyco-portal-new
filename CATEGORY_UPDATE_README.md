# Spyco Portal - Category & Auto-Code Features

## Overview
This update adds two major features to the Spyco Portal:
1. **Automatic Supplier Code Generation** - Auto-generates supplier codes in SUP-XXXXX format
2. **Supplier Categories** - Categorizes suppliers and displays them alphabetically by category

## What's New

### 1. Automatic Supplier Code Generation
- **Format**: XXX-XXXXX where XXX = first 3 letters of supplier name (e.g., TEC-00001 for "Tech Solutions Inc", MAT-00001 for "Materials Co")
- **Behavior**: 
  - Codes are automatically generated when creating new suppliers
  - The prefix is derived from the first 3 letters of the supplier name (uppercase)
  - Sequential numbering is maintained per prefix
  - You can manually specify a code if needed
  - Codes are unique and sequential within each prefix
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

### Code Generation Details
- **Format**: XXX-XXXXX (e.g., TEC-00001, ELE-00001, SER-00001)
- **Prefix**: First 3 letters of supplier name (uppercase)
- **Numbering**: Sequential per prefix (e.g., TEC-00001, TEC-00002, TEC-00003)
- **Special Handling**: 
  - Names with fewer than 3 letters are padded with 'X'
  - Special characters and numbers are removed from the prefix
  - Examples:
    - "Tech Solutions Inc" → TEC-00001
    - "Electronics Co" → ELE-00001
    - "Services LLC" → SER-00001
    - "A & B Corp" → ABX-00001 (padded)
    - "123 Company" → GEN-00001 (no letters)

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
mysql -u your_username -p spyco_portal < database/migrate_codes_name_based.sql
```

This script will:
1. Backup existing codes to a backup table
2. Clear existing codes
3. Generate new codes based on supplier names
4. Set "General" as the default category for suppliers without categories
5. Display a summary of the migration with code distribution

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
    "code": "TEC-00001",
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
GET /api/suppliers/?search=TEC-00001
```

## Troubleshooting

### Issue: Duplicate Code Error
**Solution**: Run the migration script to fix existing codes, or manually update duplicate codes.

### Issue: Category Not Showing
**Solution**: Ensure the database schema has been updated and the migration script has been run.

### Issue: Suppliers Not Sorted by Category
**Solution**: Verify the `idx_category` index exists in the database and the getAll() method includes the correct ORDER BY clause.

## Features Summary

✅ Auto-generated supplier codes (XXX-XXXXX format based on name)
✅ Prefix derived from first 3 letters of supplier name
✅ Sequential numbering per prefix
✅ Supplier categorization with default "General" category
✅ Alphabetical sorting by category, then by name
✅ Dynamic category loading in forms
✅ Category filtering in API
✅ Migration script for existing data with backup
✅ Backward compatible with existing functionality

## Technical Details

### Code Generation Logic
```php
public function generateSupplierCode($supplierName = null) {
    // Generate prefix from supplier name (first 3 letters, uppercase)
    if ($supplierName && !empty($supplierName)) {
        $cleanName = preg_replace('/[^a-zA-Z]/', '', $supplierName);
        $prefix = strtoupper(substr($cleanName, 0, 3));
        
        // If name doesn't have enough letters, pad with 'X'
        while (strlen($prefix) < 3) {
            $prefix .= 'X';
        }
    } else {
        $prefix = 'GEN'; // Default prefix if no name provided
    }
    
    // Find the highest code with this prefix
    $sql = "SELECT code FROM suppliers WHERE code LIKE ? ORDER BY code DESC LIMIT 1";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(["{$prefix}-%"]);
    $lastSupplier = $stmt->fetch();
    
    if ($lastSupplier && !empty($lastSupplier['code'])) {
        $parts = explode('-', $lastSupplier['code']);
        $lastNumber = (int)$parts[1];
        $newNumber = $lastNumber + 1;
    } else {
        $newNumber = 1;
    }
    
    // Format as XXX-XXXXX (prefix + 5-digit number)
    return sprintf('%s-%05d', $prefix, $newNumber);
}
```

### Sorting Logic
```php
$sql .= " ORDER BY category ASC, name ASC LIMIT ? OFFSET ?";
```

## Support
For issues or questions, please contact the development team.