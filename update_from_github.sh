#!/bin/bash

# Quick Update Script - Pull and Deploy from GitHub
# Use this to update your existing installation with latest changes

echo "=========================================="
echo "Spyco Portal - Update from GitHub"
echo "=========================================="
echo ""

# Configuration - UPDATE THESE VALUES
DB_USER="your_db_user"
DB_NAME="your_db_name"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please run this from your spyco-portal directory."
    exit 1
fi

# Step 1: Backup
echo "Step 1: Creating backup..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
print_success "Backup: $BACKUP_DIR"

# Step 2: Pull changes
echo ""
echo "Step 2: Pulling latest changes..."
git pull origin main
if [ $? -eq 0 ]; then
    print_success "Changes pulled"
else
    print_error "Failed to pull changes"
    exit 1
fi

# Step 3: Run migration
echo ""
echo "Step 3: Running database migration..."
read -sp "Enter database password: " DB_PASS
echo ""

mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/migrate_codes_1digit.sql
if [ $? -eq 0 ]; then
    print_success "Migration completed"
else
    print_error "Migration failed"
    print_warning "Rollback available from: $BACKUP_DIR"
    exit 1
fi

# Step 4: Set permissions
echo ""
echo "Step 4: Setting permissions..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 600 config/config.php
print_success "Permissions set"

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Update completed!${NC}"
echo "=========================================="
echo ""
echo "Backup: $BACKUP_DIR"
echo ""
echo "Next:"
echo "1. Clear browser cache (Ctrl+Shift+R)"
echo "2. Test the application"
echo ""