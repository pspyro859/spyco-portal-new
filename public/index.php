<?php
/**
 * Spyco Portal - Main Entry Point
 * 
 * This is the main frontend application file
 */

// Load configuration
require_once __DIR__ . '/../config/autoload.php';

use SpycoPortal\Controllers\AuthController;

// Start session
session_start();

// Check authentication
$authController = new AuthController();
$authenticated = false;
$user = null;

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $authenticated = true;
    $user = [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spyco Portal</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="app">
        <?php if ($authenticated): ?>
            <!-- Dashboard -->
            <div class="dashboard">
                <header class="header">
                    <div class="logo">
                        <i class="fas fa-cube"></i>
                        <span>Spyco Portal</span>
                    </div>
                    <div class="user-menu">
                        <span><?php echo htmlspecialchars($user['username']); ?></span>
                        <button onclick="logout()" class="btn-logout">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>
                
                <main class="main-content">
                    <div class="sidebar">
                        <nav>
                            <a href="#" class="active" onclick="showSection('suppliers')">
                                <i class="fas fa-truck"></i> Suppliers
                            </a>
                            <a href="#" onclick="showSection('dashboard')">
                                <i class="fas fa-chart-line"></i> Dashboard
                            </a>
                            <a href="#" onclick="showSection('reports')">
                                <i class="fas fa-file-alt"></i> Reports
                            </a>
                        </nav>
                    </div>
                    
                    <div class="content">
                        <section id="suppliers-section" class="section active">
                            <div class="section-header">
                                <h2>Suppliers Management</h2>
                                <button onclick="openModal()" class="btn-primary">
                                    <i class="fas fa-plus"></i> Add Supplier
                                </button>
                            </div>
                            
                            <div class="search-bar">
                                <input type="text" id="search-input" placeholder="Search suppliers..." onkeyup="searchSuppliers()">
                                <button onclick="searchSuppliers()" class="btn-secondary">
                                    <i class="fas fa-search"></i> Search
                                </button>
                            </div>
                            
                            <div id="suppliers-table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Supplier Code</th>
                                            <th>Category</th>
                                            <th>Name</th>
                                            <th>Contact Person</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="suppliers-tbody">
                                        <!-- Data loaded via AJAX -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="pagination" id="pagination">
                                <!-- Pagination loaded via AJAX -->
                            </div>
                        </section>
                        
                        <section id="dashboard-section" class="section">
                            <h2>Dashboard</h2>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <i class="fas fa-truck"></i>
                                    <h3>Total Suppliers</h3>
                                    <p id="total-suppliers">0</p>
                                </div>
                                <div class="stat-card">
                                    <i class="fas fa-check-circle"></i>
                                    <h3>Active Suppliers</h3>
                                    <p id="active-suppliers">0</p>
                                </div>
                                <div class="stat-card">
                                    <i class="fas fa-users"></i>
                                    <h3>Total Users</h3>
                                    <p id="total-users">0</p>
                                </div>
                            </div>
                        </section>
                        
                        <section id="reports-section" class="section">
                            <h2>Reports</h2>
                            <p>Reports feature coming soon...</p>
                        </section>
                    </div>
                </main>
            </div>
        <?php else: ?>
            <!-- Login Page -->
            <div class="login-container">
                <div class="login-box">
                    <div class="logo">
                        <i class="fas fa-cube"></i>
                        <span>Spyco Portal</span>
                    </div>
                    
                    <form id="login-form" onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        
                        <div id="login-error" class="error-message"></div>
                        
                        <button type="submit" class="btn-primary btn-block">
                            Login
                        </button>
                    </form>
                    
                    <p class="login-info">
                        Default credentials:<br>
                        Username: <strong>admin</strong><br>
                        Password: <strong>admin123</strong>
                    </p>
                </div>
            </div>
        <?php endif; ?>
    </div>
    
    <!-- Supplier Modal -->
    <div id="supplier-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Add Supplier</h3>
                <button onclick="closeModal()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form id="supplier-form" onsubmit="saveSupplier(event)">
                <input type="hidden" id="supplier-id">
                
                <div class="form-group">
                    <label for="supplier-code">Supplier Code</label>
                    <input type="text" id="supplier-code" name="code" placeholder="Auto-generated" onkeyup="generateCode()" oninput="this.dataset.manual='true'">
                    <small style="color: #666;">Auto-generated based on name (format: XXXX-X), or enter manually</small>
                </div>
                
                <div class="form-group">
                    <label for="supplier-name">Name *</label>
                    <input type="text" id="supplier-name" name="name" required onkeyup="generateCode()">
                </div>
                
                <div class="form-group">
                    <label for="supplier-category">Category</label>
                    <select id="supplier-category" name="category">
                        <option value="">Select Category</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="contact-person">Contact Person *</label>
                    <input type="text" id="contact-person" name="contact_person" required>
                </div>
                
                <div class="form-group">
                    <label for="supplier-email">Email *</label>
                    <input type="email" id="supplier-email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="supplier-phone">Phone *</label>
                    <input type="text" id="supplier-phone" name="phone" required>
                </div>
                
                <div class="form-group">
                    <label for="supplier-address">Address</label>
                    <textarea id="supplier-address" name="address" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Save</button>
                </div>
            </form>
        </div>
    </div>
    
    <script src="assets/js/app.js"></script>
</body>
</html>