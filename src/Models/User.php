<?php
/**
 * User Model
 * 
 * Handles user-related database operations
 */

namespace SpycoPortal\Models;

use PDO;

class User {
    private $db;
    
    public function __construct() {
        $this->db = \Database::getInstance()->getConnection();
    }
    
    public function authenticate($username, $password) {
        $sql = "SELECT id, username, password, email, full_name, role, status, created_at 
                FROM users 
                WHERE username = ? AND status = 'active' LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            return $user;
        }
        
        return false;
    }
    
    public function getById($id) {
        $sql = "SELECT id, username, email, full_name, role, status, created_at 
                FROM users 
                WHERE id = ? LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function getAll($limit = 50, $offset = 0) {
        $sql = "SELECT id, username, email, full_name, role, status, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$limit, $offset]);
        return $stmt->fetchAll();
    }
    
    public function create($data) {
        $sql = "INSERT INTO users (username, password, email, full_name, role, status, created_at) 
                VALUES (?, ?, ?, ?, ?, 'active', NOW())";
        
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $data['username'],
            $hashedPassword,
            $data['email'],
            $data['full_name'],
            $data['role']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            if ($key !== 'id' && $key !== 'password') {
                $fields[] = "$key = ?";
                $params[] = $value;
            }
        }
        
        if (isset($data['password'])) {
            $fields[] = "password = ?";
            $params[] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }
        
        $params[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    
    public function delete($id) {
        $sql = "UPDATE users SET status = 'deleted' WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function count() {
        $sql = "SELECT COUNT(*) as count FROM users WHERE status != 'deleted'";
        $stmt = $this->db->query($sql);
        $result = $stmt->fetch();
        return $result['count'];
    }
}