# Spyco Portal

A modern, secure web portal for managing suppliers and user authentication. Built with PHP following clean code principles and best security practices.

## Features

- **Secure Authentication**: Login/logout system with session management and CSRF protection
- **Supplier Management**: Full CRUD operations for suppliers
- **Search & Filter**: Real-time search functionality
- **Responsive Design**: Mobile-friendly interface
- **API-First Architecture**: RESTful API endpoints
- **Security**: Password hashing, SQL injection prevention, XSS protection
- **Clean Code**: Follows SOLID principles and proper separation of concerns

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server with mod_rewrite enabled
- PDO extension for MySQL
- JSON extension

## Installation

### 1. Upload Files

Upload all files from the `spyco-portal` directory to your web server's public directory (e.g., `/public_html` or `/www`).

### 2. Configure Database

Create a MySQL database and import the schema:

```bash
mysql -u your_username -p your_database < database/schema.sql
```

### 3. Set Database Configuration

Copy the `.env.example` file to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual database settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=spyco_portal
DB_USER=your_database_user
DB_PASS=your_secure_password

# Other settings as needed...
```

### 4. Set File Permissions

Ensure proper file permissions:

```bash
# Set directories to 755
find . -type d -exec chmod 755 {} \;

# Set files to 644
find . -type f -exec chmod 644 {} \;

# Make logs directory writable
chmod 755 logs
```

### 5. Configure Apache

Ensure Apache `.htaccess` files are enabled in your virtual host configuration:

```apache
<Directory /path/to/your/public>
    AllowOverride All
    Require all granted
</Directory>
```

### 6. Restart Web Server

Restart Apache to apply changes:

```bash
sudo systemctl restart apache2
```

## Default Credentials

The application comes with a default admin user:

- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change the default password immediately after first login!

## Directory Structure

```
spyco-portal/
├── config/              # Configuration files
│   ├── autoload.php    # Autoloader and initialization
│   ├── config.php      # Application configuration
│   └── database.php    # Database connection class
├── public/             # Public web root
│   ├── api/           # API endpoints
│   │   ├── auth.php   # Authentication API
│   │   ├── suppliers.php  # Suppliers API
│   │   └── .htaccess # API routing and security
│   ├── assets/        # Static assets
│   │   ├── css/       # Stylesheets
│   │   └── js/        # JavaScript files
│   ├── index.php      # Main application entry point
│   └── .htaccess      # Main .htaccess configuration
├── src/                # Application source code
│   ├── Controllers/   # Controllers
│   │   ├── AuthController.php
│   │   └── SupplierController.php
│   └── Models/        # Models
│       ├── User.php
│       └── Supplier.php
├── database/           # Database files
│   └── schema.sql     # Database schema and initial data
├── logs/              # Application logs (auto-created)
├── .env.example       # Environment variables template
└── README.md          # This file
```

## API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@spyco.com.au",
    "full_name": "System Administrator",
    "role": "admin"
  },
  "csrf_token": "abc123..."
}
```

#### Check Authentication
```
GET /api/auth/check
```

#### Logout
```
POST /api/auth/logout
```

### Supplier Endpoints

All supplier endpoints require authentication and valid CSRF token.

#### Get All Suppliers
```
GET /api/suppliers/?page=1&limit=10&search=query
```

#### Get Single Supplier
```
GET /api/suppliers/{id}
```

#### Create Supplier
```
POST /api/suppliers/
Content-Type: application/json
X-CSRF-Token: your_token_here

{
  "name": "Tech Solutions",
  "contact_person": "John Smith",
  "email": "john@techsolutions.com",
  "phone": "+61 2 9876 5432",
  "address": "123 Tech Street"
}
```

#### Update Supplier
```
PUT /api/suppliers/{id}
Content-Type: application/json
X-CSRF-Token: your_token_here

{
  "name": "Updated Name",
  "email": "new@email.com"
}
```

#### Delete Supplier
```
DELETE /api/suppliers/{id}
X-CSRF-Token: your_token_here
```

#### Search Suppliers
```
GET /api/suppliers/search?q=search_term
```

## Security Features

1. **Password Security**: Uses bcrypt with cost factor of 12
2. **SQL Injection Prevention**: All queries use prepared statements
3. **XSS Protection**: Output escaping and Content Security Policy headers
4. **CSRF Protection**: Token-based CSRF protection for all state-changing operations
5. **Session Management**: Secure session handling with timeout
6. **Input Validation**: Server-side validation for all inputs
7. **Error Handling**: Proper error messages without exposing sensitive information

## Development

### Adding New Features

1. Create Model in `src/Models/`
2. Create Controller in `src/Controllers/`
3. Add API endpoint in `public/api/`
4. Update frontend in `public/index.php` or create new pages
5. Add JavaScript functions in `public/assets/js/app.js`

### Database Migrations

When modifying the database:

1. Create new SQL migration files in `database/migrations/`
2. Update the `database/schema.sql` with the latest schema
3. Document changes in the changelog

## Troubleshooting

### 500 Internal Server Error

Check the error log:
```bash
tail -f logs/error.log
```

Common causes:
- Missing `.env` file
- Incorrect database credentials
- Missing PHP extensions
- File permission issues

### 403 Forbidden

- Check `.htaccess` file permissions
- Ensure Apache mod_rewrite is enabled
- Verify directory permissions are 755

### Database Connection Failed

- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check database exists and user has proper permissions

## Support

For issues or questions, please contact the development team.

## License

Copyright © 2026 Spyco Portal. All rights reserved.

---

**Note**: This application is provided as-is. Please review and customize according to your specific requirements before deploying to production.