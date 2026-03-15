<?php
/**
 * Spyco Portal Configuration
 * 
 * This file handles application configuration and environment loading
 */

class Config {
    private static $instance = null;
    private $config = [];
    
    private function __construct() {
        $this->loadEnvironment();
        $this->loadConfiguration();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadEnvironment() {
        $envFile = __DIR__ . '/../.env';
        
        if (!file_exists($envFile)) {
            // Try to load example file for development
            $envFile = __DIR__ . '/../.env.example';
        }
        
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                // Parse KEY=VALUE pairs
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $this->config[trim($key)] = trim($value);
                    
                    // Set as environment variable
                    putenv(trim($key) . '=' . trim($value));
                    $_ENV[trim($key)] = trim($value);
                }
            }
        }
    }
    
    private function loadConfiguration() {
        // Database Configuration
        $this->config['db'] = [
            'host' => getenv('DB_HOST') ?: 'localhost',
            'port' => getenv('DB_PORT') ?: '3306',
            'name' => getenv('DB_NAME') ?: 'spyco_portal',
            'user' => getenv('DB_USER') ?: 'spyco_user',
            'pass' => getenv('DB_PASS') ?: '',
            'charset' => 'utf8mb4',
            'options' => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false
            ]
        ];
        
        // Application Configuration
        $this->config['app'] = [
            'name' => getenv('APP_NAME') ?: 'Spyco Portal',
            'env' => getenv('APP_ENV') ?: 'production',
            'debug' => getenv('APP_DEBUG') === 'true',
            'url' => getenv('APP_URL') ?: 'http://localhost',
            'timezone' => 'Australia/Sydney'
        ];
        
        // Security Configuration
        $this->config['security'] = [
            'session_timeout' => (int)(getenv('SESSION_TIMEOUT') ?: '3600'),
            'password_min_length' => (int)(getenv('PASSWORD_MIN_LENGTH') ?: '8'),
            'bcrypt_cost' => 12
        ];
        
        // API Configuration
        $this->config['api'] = [
            'version' => getenv('API_VERSION') ?: 'v1',
            'cors_enabled' => getenv('CORS_ENABLED') === 'true'
        ];
    }
    
    public function get($key, $default = null) {
        $keys = explode('.', $key);
        $value = $this->config;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }
        
        return $value;
    }
    
    public function set($key, $value) {
        $keys = explode('.', $key);
        $config = &$this->config;
        
        foreach ($keys as $k) {
            if (!isset($config[$k])) {
                $config[$k] = [];
            }
            $config = &$config[$k];
        }
        
        $config = $value;
    }
    
    public function isDebug() {
        return $this->get('app.debug', false);
    }
    
    public function isProduction() {
        return $this->get('app.env') === 'production';
    }
}