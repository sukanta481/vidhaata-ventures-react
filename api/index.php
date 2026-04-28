<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/PropertyController.php';
require_once __DIR__ . '/LeadController.php';
require_once __DIR__ . '/AnalyticsController.php';

// Parse the request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = dirname($_SERVER['SCRIPT_NAME']);
$route = substr($path, strlen($basePath));
$route = trim($route, '/');

// Remove "api/" prefix if present
if (strpos($route, 'api/') === 0) {
    $route = substr($route, 4);
}

$segments = explode('/', $route);
$resource = $segments[0] ?? '';
$action = $segments[1] ?? '';
$id = $segments[2] ?? null;

// Route to controllers
switch ($resource) {
    case 'auth':
        $controller = new AuthController();
        switch ($action) {
            case 'login':
                if ($method === 'POST') $controller->login();
                break;
            case 'me':
                if ($method === 'GET') $controller->me();
                break;
            case 'profile':
                if ($method === 'PUT') $controller->updateProfile();
                break;
            case 'password':
                if ($method === 'PUT') $controller->changePassword();
                break;
            case 'users':
                if ($method === 'GET') $controller->listUsers();
                if ($method === 'POST') $controller->createUser();
                break;
            default:
                if ($method === 'PUT' && is_numeric($action)) $controller->updateUser($action);
                if ($method === 'DELETE' && is_numeric($action)) $controller->deleteUser($action);
                break;
        }
        break;
        
    case 'properties':
        $controller = new PropertyController();
        if (empty($action)) {
            if ($method === 'GET') $controller->list();
            if ($method === 'POST') $controller->create();
        } elseif ($action === 'admin') {
            if ($method === 'GET') $controller->adminList();
        } elseif ($action === 'cities') {
            if ($method === 'GET') $controller->getCities();
        } else {
            if ($method === 'GET' && is_numeric($action)) $controller->get($action);
            if ($method === 'PUT' && is_numeric($action)) $controller->update($action);
            if ($method === 'DELETE' && is_numeric($action)) $controller->delete($action);
        }
        break;
        
    case 'leads':
        $controller = new LeadController();
        if (empty($action)) {
            if ($method === 'GET') $controller->list();
            if ($method === 'POST') $controller->create();
        } elseif ($action === 'stats') {
            if ($method === 'GET') $controller->getStats();
        } elseif (is_numeric($action)) {
            if ($method === 'GET') $controller->get($action);
            if ($method === 'PUT') $controller->update($action);
            if ($method === 'DELETE') $controller->delete($action);
            
            // Lead activities
            if (isset($segments[2]) && $segments[2] === 'activities') {
                if ($method === 'POST') $controller->addActivity($action);
                if ($method === 'DELETE' && isset($segments[3]) && is_numeric($segments[3])) {
                    $controller->deleteActivity($action, $segments[3]);
                }
            }
        }
        break;
        
    case 'analytics':
        $controller = new AnalyticsController();
        switch ($action) {
            case 'dashboard':
                if ($method === 'GET') $controller->dashboard();
                break;
            case 'properties':
                if ($method === 'GET') $controller->propertyStats();
                break;
            case 'leads':
                if ($method === 'GET') $controller->leadStats();
                break;
        }
        break;
        
    default:
        jsonResponse(['error' => 'Not Found'], 404);
}

// If no route matched
jsonResponse(['error' => 'Not Found'], 404);
