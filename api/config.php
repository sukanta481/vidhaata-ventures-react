<?php
// EstateFlow API Configuration
ini_set('display_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration - Update these values for your environment
function envValue($key, $default = null) {
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }

    return $default;
}

$is_localhost = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']) || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false;

if ($is_localhost) {
    define('DB_HOST', envValue('DB_HOST', 'localhost'));
    define('DB_NAME', envValue('DB_NAME', 'estateflow'));
    define('DB_USER', envValue('DB_USER', 'root'));
    define('DB_PASS', envValue('DB_PASS', ''));
} else {
    define('DB_HOST', envValue('DB_HOST', 'localhost'));
    define('DB_NAME', envValue('DB_NAME', 'u286257250_vidhaata_react'));
    define('DB_USER', envValue('DB_USER', 'u286257250_vidhaata_react'));
    define('DB_PASS', envValue('DB_PASS', 'Sukanta@0050'));
}
define('DB_CHARSET', 'utf8mb4');
define('JWT_SECRET', envValue('JWT_SECRET', 'Xk7#mP9@qL2$nR5wYvBz!cDfGhJtUeA_vidhaata'));
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// PDO Connection
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            jsonResponse(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
        }
    }
    return $pdo;
}

// JSON Response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }

    jsonResponse([
        'error' => $message,
        'file' => basename($file),
        'line' => $line,
    ], 500);
});

set_exception_handler(function ($exception) {
    jsonResponse([
        'error' => $exception->getMessage(),
        'file' => basename($exception->getFile()),
        'line' => $exception->getLine(),
    ], 500);
});

// Get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

function getAuthorizationHeader() {
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                return $value;
            }
        }
    }

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!empty($_SERVER['Authorization'])) {
        return $_SERVER['Authorization'];
    }

    return '';
}

// Base64URL encode
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

// Base64URL decode
function base64UrlDecode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

// JWT Token generation
function generateToken($userId, $email, $role) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $time = time();
    $payload = json_encode([
        'iss' => 'estateflow',
        'iat' => $time,
        'exp' => $time + (86400 * 7), // 7 days
        'sub' => $userId,
        'email' => $email,
        'role' => $role
    ]);
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// JWT Token verification
function verifyToken() {
    $authHeader = getAuthorizationHeader();
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }
    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    
    if (!hash_equals($base64Signature, $parts[2])) return null;
    
    $payload = json_decode(base64UrlDecode($parts[1]), true);
    if (!$payload || $payload['exp'] < time()) return null;
    
    return $payload;
}

// Require auth middleware
function requireAuth() {
    $user = verifyToken();
    if (!$user) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    return $user;
}

// Require admin middleware
function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(['error' => 'Forbidden - Admin access required'], 403);
    }
    return $user;
}
