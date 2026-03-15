<?php
/**
 * Authentication API Endpoint
 * 
 * Handles login, logout, and authentication check requests
 */

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration and dependencies
require_once __DIR__ . '/../../config/autoload.php';

use SpycoPortal\Controllers\AuthController;

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';

try {
    $controller = new AuthController();
    
    // Route the request
    if ($method === 'POST' && $path === '/login') {
        $controller->login();
    } elseif ($method === 'POST' && $path === '/logout') {
        $controller->logout();
    } elseif ($method === 'GET' && $path === '/check') {
        $controller->checkAuth();
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}