<?php
require_once __DIR__ . '/config.php';

// Auth Controller
class AuthController {
    public function login() {
        $data = getJsonInput();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            jsonResponse(['error' => 'Email and password are required'], 400);
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT id, email, password_hash, full_name, role, avatar, is_active FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonResponse(['error' => 'Invalid credentials'], 401);
        }
        
        if (!$user['is_active']) {
            jsonResponse(['error' => 'Account is deactivated'], 403);
        }
        
        $token = generateToken($user['id'], $user['email'], $user['role']);
        
        jsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'fullName' => $user['full_name'],
                'role' => $user['role'],
                'avatar' => $user['avatar']
            ]
        ]);
    }
    
    public function me() {
        $user = requireAuth();
        $db = getDB();
        $stmt = $db->prepare("SELECT id, email, full_name, role, avatar, phone FROM users WHERE id = ?");
        $stmt->execute([$user['sub']]);
        $dbUser = $stmt->fetch();
        
        if (!$dbUser) {
            jsonResponse(['error' => 'User not found'], 404);
        }
        
        jsonResponse([
            'id' => $dbUser['id'],
            'email' => $dbUser['email'],
            'fullName' => $dbUser['full_name'],
            'role' => $dbUser['role'],
            'avatar' => $dbUser['avatar'],
            'phone' => $dbUser['phone']
        ]);
    }
    
    public function updateProfile() {
        $user = requireAuth();
        $data = getJsonInput();
        
        $db = getDB();
        $stmt = $db->prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ?");
        $stmt->execute([
            $data['fullName'] ?? '',
            $data['phone'] ?? '',
            $user['sub']
        ]);
        
        jsonResponse(['message' => 'Profile updated successfully']);
    }
    
    public function changePassword() {
        $user = requireAuth();
        $data = getJsonInput();
        
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';
        
        if (strlen($newPassword) < 6) {
            jsonResponse(['error' => 'Password must be at least 6 characters'], 400);
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user['sub']]);
        $dbUser = $stmt->fetch();
        
        if (!password_verify($currentPassword, $dbUser['password_hash'])) {
            jsonResponse(['error' => 'Current password is incorrect'], 400);
        }
        
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newHash, $user['sub']]);
        
        jsonResponse(['message' => 'Password changed successfully']);
    }
    
    public function listUsers() {
        requireAdmin();
        $db = getDB();
        $stmt = $db->query("SELECT id, email, full_name, role, phone, is_active, created_at FROM users ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
    }
    
    public function createUser() {
        requireAdmin();
        $data = getJsonInput();
        
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $fullName = $data['fullName'] ?? '';
        $role = $data['role'] ?? 'agent';
        $phone = $data['phone'] ?? '';
        
        if (empty($email) || empty($password) || empty($fullName)) {
            jsonResponse(['error' => 'Email, password, and full name are required'], 400);
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'Email already exists'], 400);
        }
        
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$email, $hash, $fullName, $role, $phone]);
        
        jsonResponse(['message' => 'User created successfully', 'id' => $db->lastInsertId()]);
    }
    
    public function updateUser($id) {
        requireAdmin();
        $data = getJsonInput();
        
        $db = getDB();
        $stmt = $db->prepare("UPDATE users SET full_name = ?, role = ?, phone = ?, is_active = ? WHERE id = ?");
        $stmt->execute([
            $data['fullName'] ?? '',
            $data['role'] ?? 'agent',
            $data['phone'] ?? '',
            $data['isActive'] ?? 1,
            $id
        ]);
        
        jsonResponse(['message' => 'User updated successfully']);
    }
    
    public function deleteUser($id) {
        requireAdmin();
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'User deleted successfully']);
    }
}
