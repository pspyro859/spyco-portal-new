<?php
/**
 * Database Connection Class
 * 
 * Handles MySQL database connections using PDO with proper error handling
 * and connection management following best practices
 */

require_once __DIR__ . '/config.php';

class Database {
    private static $instance = null;
    private $connection = null;
    private $config;
    
    private function __construct() {
        $this->config = Config::getInstance();
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function connect() {
        try {
            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $this->config->get('db.host'),
                $this->config->get('db.port'),
                $this->config->get('db.name'),
                $this->config->get('db.charset')
            );
            
            $this->connection = new PDO(
                $dsn,
                $this->config->get('db.user'),
                $this->config->get('db.pass'),
                $this->config->get('db.options')
            );
            
            // Set timezone
            $this->connection->exec("SET time_zone = '+11:00'");
            
        } catch (PDOException $e) {
            $this->handleConnectionError($e);
        }
    }
    
    private function handleConnectionError(PDOException $e) {
        $isDebug = $this->config->isDebug();
        
        $error = [
            'message' => 'Database connection failed',
            'error' => $isDebug ? $e->getMessage() : 'Please contact administrator',
            'code' => $e->getCode()
        ];
        
        if ($isDebug) {
            error_log("Database Error: " . $e->getMessage());
        }
        
        throw new DatabaseException($error['message'], $error['code'], $e);
    }
    
    public function getConnection() {
        if ($this->connection === null) {
            $this->connect();
        }
        
        // Check if connection is still alive
        try {
            $this->connection->query("SELECT 1");
        } catch (PDOException $e) {
            $this->connect();
        }
        
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new DatabaseException("Query execution failed: " . $e->getMessage(), 0, $e);
        }
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    public function insert($table, $data) {
        $columns = array_keys($data);
        $placeholders = array_fill(0, count($columns), '?');
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        );
        
        $this->query($sql, array_values($data));
        return $this->connection->lastInsertId();
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        $setClause = [];
        foreach (array_keys($data) as $column) {
            $setClause[] = "$column = ?";
        }
        
        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s",
            $table,
            implode(', ', $setClause),
            $where
        );
        
        $params = array_merge(array_values($data), $whereParams);
        $this->query($sql, $params);
        return $this->connection->rowCount();
    }
    
    public function delete($table, $where, $params = []) {
        $sql = sprintf("DELETE FROM %s WHERE %s", $table, $where);
        $this->query($sql, $params);
        return $this->connection->rowCount();
    }
    
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollBack() {
        return $this->connection->rollBack();
    }
    
    public function close() {
        $this->connection = null;
    }
}

class DatabaseException extends Exception {
    public function __construct($message = "", $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }
}