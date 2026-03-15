<?php
/**
 * Autoload Configuration
 * 
 * Handles class autoloading for the application
 */

spl_autoload_register(function ($class) {
    // Project namespace prefix
    $prefix = 'SpycoPortal\\';
    
    // Base directory for namespace prefix
    $baseDir = __DIR__ . '/../src/';
    
    // Check if the class uses the namespace prefix
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    // Get the relative class name
    $relativeClass = substr($class, $len);
    
    // Replace namespace separators with directory separators
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    // If the file exists, require it
    if (file_exists($file)) {
        require $file;
    }
});

// Load configuration files
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Set error reporting based on environment
$config = Config::getInstance();
if ($config->isDebug()) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    ini_set('error_log', __DIR__ . '/../logs/error.log');
}

// Set timezone
date_default_timezone_set('Australia/Sydney');