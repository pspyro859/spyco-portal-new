# Quick Reference: New Code Format

## Format: XXXX-XXXX (4 Letters + 4 Digits)

### Examples:
| Supplier Name | Generated Code |
|---------------|----------------|
| **Tech** Solutions Inc | **TECH-0001** |
| **Elect**ronics Co | **ELEC-0001** |
| **Mate**rials Ltd | **MATE-0001** |
| **Serv**ices LLC | **SERV-0001** |
| **Soft**ware Inc | **SOFT-0001** |
| **John** Smith & Sons | **JOHN-0001** |
| **AB** Corp | **ABXX-0001** |
| **A** Corp | **AXXX-0001** |

## Key Points:

✅ **4 Letters** - First 4 letters of supplier name (uppercase)
✅ **4 Digits** - Sequential number starting from 0001
✅ **Padding** - Short names padded with 'X'
✅ **Special Chars** - Removed from prefix
✅ **Per Prefix** - Each prefix has its own sequence

## Sequences:
```
TECH-0001 (Tech Solutions Inc)
TECH-0002 (Tech Masters)
TECH-0003 (Tech World)

ELEC-0001 (Electronics Co)
ELEC-0002 (Electronics Plus)
```

## Deployment:
```bash
git pull origin main
mysql -u user -p db < database/migrate_codes_4digit.sql
```

## Benefits:
- Shorter codes (9 characters vs 10)
- More meaningful prefix
- Cleaner appearance
- Matches your workflow