-- Spyco Portal Database Schema
-- This file creates the necessary database tables and initial data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS spyco_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spyco_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: admin123 (change this immediately after deployment)
INSERT INTO users (username, password, email, full_name, role, status) VALUES 
('admin', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7VG/3Yx.3e', 'admin@spyco.com.au', 'System Administrator', 'admin', 'active')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample suppliers for testing
INSERT INTO suppliers (name, contact_person, email, phone, address, status) VALUES
('Tech Solutions Pty Ltd', 'John Smith', 'john@techsolutions.com.au', '+61 2 9876 5432', '123 Tech Street, Sydney NSW 2000', 'active'),
('Office Supplies Co', 'Jane Doe', 'jane@officesupplies.com', '+61 3 8765 4321', '456 Office Road, Melbourne VIC 3000', 'active'),
('Digital Services Group', 'Mike Johnson', 'mike@digitalservices.com', '+61 4 7654 3210', '789 Digital Ave, Brisbane QLD 4000', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Create views for common queries
CREATE OR REPLACE VIEW active_suppliers AS
SELECT id, name, contact_person, email, phone
FROM suppliers
WHERE status = 'active'
ORDER BY name;

CREATE OR REPLACE VIEW active_users AS
SELECT id, username, email, full_name, role
FROM users
WHERE status = 'active'
ORDER BY username;