<?php
/**
 * Authentication Controller
 * 
 * Handles user authentication, login, logout, and session management
 */

namespace SpycoPortal\Controllers;

use SpycoPortal\Models\User;
use Exception;

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
        session_start();
    }
    
    public function login() {
        header('Content-Type: application/json');
        
        try {
            // Get JSON input
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid request data');
            }
            
            $username = trim($input['username'] ?? '');
            $password = trim($input['password'] ?? '');
            
            // Validate input
            if (empty($username) || empty($password)) {
                throw new Exception('Username and password are required');
            }
            
            // Authenticate user
            $user = $this->userModel->authenticate($username, $password);
            
            if (!$user) {
                throw new Exception('Invalid username or password');
            }
            
            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['logged_in'] = true;
            $_SESSION['last_activity'] = time();
            
            // Generate CSRF token
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            
            // Log successful login
            $this->logActivity($user['id'], 'login', 'User logged in successfully');
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ],
                'csrf_token' => $_SESSION['csrf_token']
            ]);
            
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function logout() {
        header('Content-Type: application/json');
        
        try {
            if (isset($_SESSION['user_id'])) {
                $this->logActivity($_SESSION['user_id'], 'logout', 'User logged out');
            }
            
            session_unset();
            session_destroy();
            
            echo json_encode([
                'success' => true,
                'message' => 'Logout successful'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Logout failed'
            ]);
        }
    }
    
    public function checkAuth() {
        header('Content-Type: application/json');
        
        try {
            // Check session timeout
            if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
                session_unset();
                session_destroy();
                throw new Exception('Session expired');
            }
            
            // Update last activity
            $_SESSION['last_activity'] = time();
            
            if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
                throw new Exception('Not authenticated');
            }
            
            $user = $this->userModel->getById($_SESSION['user_id']);
            
            if (!$user) {
                throw new Exception('User not found');
            }
            
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ],
                'csrf_token' => $_SESSION['csrf_token'] ?? ''
            ]);
            
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'authenticated' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    private function logActivity($userId, $action, $description) {
        // Activity logging implementation
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $logFile = $logDir . '/activity.log';
        $logEntry = sprintf(
            "[%s] User ID: %d | Action: %s | %s\n",
            date('Y-m-d H:i:s'),
            $userId,
            $action,
            $description
        );
        
        file_put_contents($logFile, $logEntry, FILE_APPEND);
    }
}