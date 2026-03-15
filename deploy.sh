#!/bin/bash

# Spyco Portal Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${GREEN}→ $1${NC}"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    print_warning "Please update .env with your database credentials before continuing."
    exit 1
fi

# Check if database credentials are set
if grep -q "your_secure_password_here" .env; then
    print_error "Database password not set in .env file!"
    print_info "Please update DB_PASS in .env with your actual database password."
    exit 1
fi

print_info "Starting Spyco Portal deployment..."

# Create necessary directories
print_info "Creating directories..."
mkdir -p logs
mkdir -p public/uploads
print_success "Directories created"

# Set file permissions
print_info "Setting file permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 755 logs
chmod 644 .env
print_success "File permissions set"

# Check if database exists
print_info "Checking database connection..."
source .env
mysql_check=$(mysql -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME;" 2>&1 || true)

if [[ $mysql_check == *"Unknown database"* ]]; then
    print_warning "Database does not exist. Creating database..."
    mysql -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    print_success "Database created"
fi

# Import schema if tables don't exist
print_info "Checking if tables exist..."
table_count=$(mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" | wc -l)

if [ "$table_count" -le 1 ]; then
    print_info "Importing database schema..."
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/schema.sql
    print_success "Database schema imported"
else
    print_success "Database tables already exist"
fi

# Clear cache if exists
print_info "Clearing cache..."
if [ -d "cache" ]; then
    rm -rf cache/*
    print_success "Cache cleared"
fi

# Test API endpoint
print_info "Testing API endpoint..."
api_test=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/check || echo "000")
if [ "$api_test" == "200" ] || [ "$api_test" == "401" ]; then
    print_success "API is responding"
else
    print_warning "API test returned status: $api_test"
fi

print_success "Deployment completed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Access your application at: http://portal.spyco.com.au"
echo "  2. Login with username: admin, password: admin123"
echo "  3. Change the default password immediately!"
echo ""
print_warning "Important: Make sure to set .env file permissions to 600 or 640"