# GitHub Deployment Guide

## Quick Deployment from GitHub

### Option 1: Using the Update Script (Recommended)

```bash
# 1. SSH into your VPS
ssh your-user@your-vps-ip

# 2. Navigate to your spyco-portal directory
cd /path/to/spyco-portal

# 3. Make the script executable
chmod +x update_from_github.sh

# 4. Edit the script to add your database credentials
nano update_from_github.sh
# Update DB_USER="your_db_user"
# Update DB_NAME="your_db_name"

# 5. Run the update script
./update_from_github.sh
```

### Option 2: Manual Deployment

```bash
# 1. SSH into your VPS
ssh your-user@your-vps-ip

# 2. Navigate to your installation
cd /path/to/spyco-portal

# 3. Pull latest changes
git pull origin main

# 4. Run database migration
mysql -u your_db_user -p your_db_name < database/migrate_codes_1digit.sql

# 5. Set permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# 6. Clear browser cache and test
```

## What the Deployment Does

1. **Backs up** your current installation
2. **Pulls** the latest code from GitHub
3. **Runs** the database migration (updates codes to XXXX-X format)
4. **Sets** proper file permissions
5. **Clears** cache if present

## Verification

After deployment, check:

```bash
# Verify the code format
mysql -u your_db_user -p your_db_name -e "
SELECT id, code, name FROM suppliers 
WHERE status != 'deleted' 
ORDER BY code ASC 
LIMIT 10;
"
```

You should see codes like:
- TECH-1
- ELEC-1
- MATE-1
- SERV-1

## Rollback (If Needed)

If something goes wrong:

```bash
# Restore from backup
cd /path/to/spyco-portal
rm -rf *
cp -r ../backup_YYYYMMDD_HHMMSS/* .
```

## Troubleshooting

### Issue: "Not a git repository"
**Solution**: Make sure you're in the spyco-portal directory that has the `.git` folder.

### Issue: "Migration failed"
**Solution**: 
- Check database credentials in the script
- Ensure the database exists
- Check MySQL is running

### Issue: "Permission denied"
**Solution**: Make the script executable:
```bash
chmod +x update_from_github.sh
```

### Issue: Codes not updating
**Solution**: 
- Verify migration script ran successfully
- Check database for errors
- Clear browser cache

## Next Steps After Deployment

1. ✅ Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. ✅ Login to the portal
3. ✅ Add a new supplier to test code generation
4. ✅ Verify the code is in XXXX-X format
5. ✅ Test editing the code before saving
6. ✅ Check that existing suppliers have updated codes

## Automated Deployment (Optional)

If you want automatic deployment when you push to GitHub, you can set up GitHub Actions:

```bash
# This would be configured in your GitHub repository settings
# The workflow would automatically deploy when you push to main
```

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify database connection
3. Check file permissions
4. Review the troubleshooting section above

---

**Your repository**: https://github.com/pspyro859/ninja
**Branch**: main
**Latest changes**: Code format update to XXXX-X