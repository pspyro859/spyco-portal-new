<?php
/**
 * Supplier Controller
 * 
 * Handles supplier-related API endpoints
 */

namespace SpycoPortal\Controllers;

use SpycoPortal\Models\Supplier;
use Exception;

class SupplierController {
    private $supplierModel;
    
    public function __construct() {
        $this->supplierModel = new Supplier();
        $this->checkAuthentication();
    }
    
    private function checkAuthentication() {
        session_start();
        
        if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized access'
            ]);
            exit;
        }
    }
    
    private function validateCSRF() {
        $headers = getallheaders();
        $token = $headers['X-CSRF-Token'] ?? '';
        
        if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid CSRF token'
            ]);
            exit;
        }
    }
    
    public function index() {
        header('Content-Type: application/json');
        
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = isset($_GET['search']) ? trim($_GET['search']) : null;
            
            $offset = ($page - 1) * $limit;
            
            $suppliers = $this->supplierModel->getAll($limit, $offset, $search);
            $total = $this->supplierModel->count($search);
            
            echo json_encode([
                'success' => true,
                'data' => $suppliers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve suppliers'
            ]);
        }
    }
    
    public function show($id) {
        header('Content-Type: application/json');
        
        try {
            $supplier = $this->supplierModel->getById($id);
            
            if (!$supplier) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Supplier not found'
                ]);
                return;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $supplier
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to retrieve supplier'
            ]);
        }
    }
    
    public function create() {
        header('Content-Type: application/json');
        $this->validateCSRF();
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid request data');
            }
            
            // Validate required fields
            $required = ['name', 'contact_person', 'email', 'phone'];
            foreach ($required as $field) {
                if (empty($input[$field])) {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            // Validate email
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format');
            }
            
            $supplierId = $this->supplierModel->create($input);
            
            if (!$supplierId) {
                throw new Exception('Failed to create supplier');
            }
            
            $supplier = $this->supplierModel->getById($supplierId);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => $supplier
            ]);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function update($id) {
        header('Content-Type: application/json');
        $this->validateCSRF();
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid request data');
            }
            
            // Check if supplier exists
            $existing = $this->supplierModel->getById($id);
            if (!$existing) {
                http_response_code(404);
                throw new Exception('Supplier not found');
            }
            
            // Validate email if provided
            if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format');
            }
            
            $updated = $this->supplierModel->update($id, $input);
            
            if (!$updated) {
                throw new Exception('Failed to update supplier');
            }
            
            $supplier = $this->supplierModel->getById($id);
            
            echo json_encode([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => $supplier
            ]);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function delete($id) {
        header('Content-Type: application/json');
        $this->validateCSRF();
        
        try {
            // Check if supplier exists
            $existing = $this->supplierModel->getById($id);
            if (!$existing) {
                http_response_code(404);
                throw new Exception('Supplier not found');
            }
            
            $deleted = $this->supplierModel->delete($id);
            
            if (!$deleted) {
                throw new Exception('Failed to delete supplier');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Supplier deleted successfully'
            ]);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function search() {
        header('Content-Type: application/json');
        
        try {
            $query = isset($_GET['q']) ? trim($_GET['q']) : '';
            
            if (strlen($query) < 2) {
                echo json_encode([
                    'success' => true,
                    'data' => []
                ]);
                return;
            }
            
            $suppliers = $this->supplierModel->search($query);
            
            echo json_encode([
                'success' => true,
                'data' => $suppliers
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Search failed'
            ]);
        }
    }
}