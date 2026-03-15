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
    
    public function getAll($limit = 50, $offset = 0, $search = null) {
        $sql = "SELECT id, name, contact_person, email, phone, address, status, created_at 
                FROM suppliers 
                WHERE status != 'deleted'";
        
        $params = [];
        
        if ($search) {
            $sql .= " AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?)";
            $searchTerm = "%$search%";
            $params = [$searchTerm, $searchTerm, $searchTerm];
        }
        
        $sql .= " ORDER BY name ASC LIMIT ? OFFSET ?";
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
    
    public function create($data) {
        $sql = "INSERT INTO suppliers (name, contact_person, email, phone, address, status, created_at) 
                VALUES (?, ?, ?, ?, ?, 'active', NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['name'],
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
    
    public function search($query) {
        $sql = "SELECT id, name, contact_person, email 
                FROM suppliers 
                WHERE status = 'active' 
                AND (name LIKE ? OR contact_person LIKE ? OR email LIKE ?) 
                LIMIT 20";
        
        $searchTerm = "%$query%";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
        return $stmt->fetchAll();
    }
}