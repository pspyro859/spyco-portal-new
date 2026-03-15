<?php
/**
 * Supplier Model
 * 
 * Handles supplier-related database operations
 */

namespace SpycoPortal\Models;

use PDO;

class Supplier {
    private $db;
    
    public function __construct() {
        $this->db = \Database::getInstance()->getConnection();
    }
    
    public function getAll($limit = 50, $offset = 0, $search = null, $category = null) {
        $sql = "SELECT id, code, name, category, contact_person, email, phone, address, status, created_at 
                FROM suppliers 
                WHERE status != 'deleted'";
        
        $params = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR code LIKE ?)";
            $searchTerm = "%$search%";
            $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm];
        }
        
        if ($category && $category !== 'all') {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        $sql .= " ORDER BY category ASC, name ASC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM suppliers WHERE id = ? AND status != 'deleted' LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function getByCode($code) {
        $sql = "SELECT * FROM suppliers WHERE code = ? AND status != 'deleted' LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$code]);
        return $stmt->fetch();
    }
    
    public function create($data) {
        // Auto-generate code if not provided
        if (!isset($data['code']) || empty($data['code'])) {
            $data['code'] = $this->generateSupplierCode();
        }
        
        // Set default category if not provided
        $category = isset($data['category']) && !empty($data['category']) ? $data['category'] : 'General';
        
        $sql = "INSERT INTO suppliers (code, name, category, contact_person, email, phone, address, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['code'],
            $data['name'],
            $category,
            $data['contact_person'],
            $data['email'],
            $data['phone'],
            $data['address']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = ?";
                $params[] = $value;
            }
        }
        
        $params[] = $id;
        $sql = "UPDATE suppliers SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    
    /**
     * Get all unique categories
     */
    public function getCategories() {
        $sql = "SELECT DISTINCT category FROM suppliers 
                WHERE status != 'deleted' AND category IS NOT NULL 
                ORDER BY category ASC";
        $stmt = $this->db->query($sql);
        $results = $stmt->fetchAll();
        
        // Extract category names
        $categories = array_map(function($row) {
            return $row['category'];
        }, $results);
        
        return $categories;
    }
    
    public function delete($id) {
        $sql = "UPDATE suppliers SET status = 'deleted' WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function count($search = null) {
        $sql = "SELECT COUNT(*) as count FROM suppliers WHERE status != 'deleted'";
        $params = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)";
            $searchTerm = "%$search%";
            $params = [$searchTerm, $searchTerm, $searchTerm];
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result['count'];
    }
    
    /**
     * Generate next supplier code
     * Format: SUP-XXXXX (e.g., SUP-00001)
     */
    public function generateSupplierCode() {
        $sql = "SELECT code FROM suppliers WHERE code LIKE 'SUP-%' ORDER BY code DESC LIMIT 1";
        $stmt = $this->db->query($sql);
        $lastSupplier = $stmt->fetch();
        
        if ($lastSupplier && !empty($lastSupplier['code'])) {
            // Extract number from last code (e.g., SUP-00005 -> 5)
            $lastNumber = (int)str_replace('SUP-', '', $lastSupplier['code']);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        // Format as 5-digit number with leading zeros
        return sprintf('SUP-%05d', $newNumber);
    }
    
    public function search($query) {
        $sql = "SELECT id, code, name, contact_person, email 
                FROM suppliers 
                WHERE status = 'active' 
                AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR code LIKE ?) 
                ORDER BY code ASC 
                LIMIT 20";
        
        $searchTerm = "%$query%";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        return $stmt->fetchAll();
    }
}