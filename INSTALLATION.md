# Installation Guide - Spyco Portal

This guide will walk you through the complete installation and setup process for the Spyco Portal.

## Prerequisites

Before you begin, ensure you have:

- A web server (Apache recommended) with PHP 7.4+
- MySQL 5.7+ or MariaDB 10.2+
- Access to cPanel or similar control panel
- FTP/SFTP access or File Manager access
- Database creation privileges

## Step 1: Upload Files

### Option A: Using cPanel File Manager

1. Log in to your cPanel
2. Navigate to **File Manager**
3. Go to your public directory (usually `public_html` or `www`)
4. Create a new folder (optional) or use the root
5. Upload the `spyco-portal` folder contents
6. Ensure all files are uploaded correctly

### Option B: Using FTP/SFTP

1. Connect to your server using FileZilla or similar
2. Navigate to your web root directory
3. Upload all files from the `spyco-portal` directory
4. Verify transfer completion

### Option C: Using SSH

```bash
# Extract the archive
unzip spyco-portal.zip

# Move to your web directory
mv spyco-portal/* /path/to/your/public_html/
cd /path/to/your/public_html
```

## Step 2: Create Database

### Using cPanel

1. Log in to cPanel
2. Navigate to **MySQL Database Wizard**
3. Create a new database (e.g., `spyco_portal`)
4. Create a new database user
5. Assign the user to the database with **ALL PRIVILEGES**
6. Note down the database name, username, and password

### Using phpMyAdmin

1. Log in to phpMyAdmin
2. Click **New** to create a database
3. Name it `spyco_portal` (or your preferred name)
4. Click **Create**
5. Go to the **Users** tab to create a new user
6. Grant all privileges on the new database

### Using SSH/Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE spyco_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'spyco_user'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON spyco_portal.* TO 'spyco_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Import Database Schema

### Using cPanel/phpMyAdmin

1. Log in to phpMyAdmin
2. Select your database
3. Click **Import** tab
4. Choose the `database/schema.sql` file
5. Click **Go**

### Using SSH

```bash
mysql -u your_username -p your_database < database/schema.sql
```

## Step 4: Configure Environment

1. Locate the `.env.example` file
2. Rename it to `.env`
3. Edit the file with your actual database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=spyco_portal          # Your database name
DB_USER=spyco_user           # Your database username
DB_PASS=your_secure_password  # Your database password

# Application Settings
APP_NAME=Spyco Portal
APP_ENV=production
APP_DEBUG=false
APP_URL=http://your-domain.com

# Security
SESSION_TIMEOUT=3600
PASSWORD_MIN_LENGTH=8

# API Settings
API_VERSION=v1
CORS_ENABLED=true
```

## Step 5: Set File Permissions

### Using cPanel File Manager

1. Select all folders and set permissions to **755**
2. Select all files and set permissions to **644**
3. Ensure the `logs` directory has **755** permissions

### Using SSH

```bash
# Navigate to your installation directory
cd /path/to/your/public_html

# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Make logs directory writable
chmod 755 logs
chmod 644 logs/.gitkeep
```

## Step 6: Configure Apache (if needed)

If you're using a custom Apache configuration, ensure:

1. `AllowOverride All` is set in your virtual host
2. `mod_rewrite` is enabled
3. `mod_headers` is enabled

Example virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/your-domain.com/public
    
    <Directory /var/www/html/your-domain.com/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

## Step 7: Restart Web Server

### Using cPanel

The changes should take effect automatically. If not, contact your hosting provider.

### Using SSH

```bash
# For Apache
sudo systemctl restart apache2

# Or
sudo service apache2 restart
```

## Step 8: Test Installation

1. Open your web browser
2. Navigate to your domain (e.g., `http://your-domain.com`)
3. You should see the login page

### Test Login

Use the default credentials:
- **Username**: `admin`
- **Password**: `admin123`

## Step 9: Change Default Password

**IMPORTANT**: Change the default password immediately!

1. Login with the default credentials
2. Update the admin password in the database or through the user management interface
3. Or run this SQL query:

```sql
UPDATE users SET password = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7VG/3Yx.3e' WHERE username = 'admin';
```

Replace the password hash with a new bcrypt hash generated from your chosen password.

## Troubleshooting

### 403 Forbidden Error

- Check `.htaccess` file exists in `public/` and `public/api/` directories
- Verify file permissions (755 for directories, 644 for files)
- Ensure `mod_rewrite` is enabled on Apache

### 500 Internal Server Error

- Check error logs in `logs/error.log`
- Verify `.env` file exists and has correct permissions (644)
- Ensure database credentials in `.env` are correct
- Check if all PHP extensions are installed (PDO, JSON, etc.)

### Database Connection Failed

- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check database exists and user has proper permissions
- Test database connection manually:

```bash
mysql -u your_user -p your_database
```

### Session Issues

- Check `session.save_path` in php.ini
- Ensure session directory is writable
- Verify cookies are enabled in your browser

### CSS/JavaScript Not Loading

- Check file paths in `index.php`
- Verify assets exist in `public/assets/`
- Clear browser cache

## Post-Installation Checklist

- [ ] Upload all files successfully
- [ ] Create database and import schema
- [ ] Configure `.env` file with correct credentials
- [ ] Set proper file permissions
- [ ] Test login functionality
- [ ] Change default admin password
- [ ] Test supplier management features
- [ ] Configure SSL (HTTPS) for production
- [ ] Set up regular database backups
- [ ] Configure email notifications (if needed)

## Security Recommendations

1. **Enable HTTPS**: Install an SSL certificate and force HTTPS
2. **Change Default Password**: Immediately change the admin password
3. **Secure .env File**: Set `.env` permissions to 600 or 640
4. **Regular Backups**: Set up automated database backups
5. **Update Regularly**: Keep PHP and MySQL updated
6. **Monitor Logs**: Regularly check `logs/error.log` and `logs/activity.log`
7. **Disable Debug Mode**: Set `APP_DEBUG=false` in production
8. **Use Strong Passwords**: Enforce strong password policies for all users

## Next Steps

1. Customize the application to match your branding
2. Add more users and suppliers as needed
3. Configure additional features and integrations
4. Set up monitoring and alerting
5. Create user documentation for your team

## Support

If you encounter any issues during installation:

1. Check the error logs in `logs/error.log`
2. Review this guide's troubleshooting section
3. Consult the main README.md for API documentation
4. Contact your hosting provider's support team

## Additional Resources

- [Main README.md](README.md) - Complete documentation
- [API Documentation](README.md#api-documentation) - API endpoints guide
- [Database Schema](database/schema.sql) - Database structure

---

**Installation Complete!** 🎉

Your Spyco Portal is now ready to use. Start by logging in with the default credentials and changing the admin password.