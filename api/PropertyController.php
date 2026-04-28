<?php
require_once __DIR__ . '/config.php';

class PropertyController {
    private function getRequestData() {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'multipart/form-data') !== false) {
            return $_POST;
        }

        return getJsonInput();
    }

    private function decodeArrayField($value) {
        if (is_array($value)) {
            return $value;
        }

        if ($value === null || $value === '') {
            return [];
        }

        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return array_values(array_filter(array_map('trim', explode(',', (string)$value))));
    }

    private function boolValue($value) {
        if (is_bool($value)) {
            return $value ? 1 : 0;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
    }

    private function ensureUploadDir() {
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0777, true);
        }
    }

    private function storeUploadedFiles($fieldName, $prefix = 'property') {
        if (!isset($_FILES[$fieldName])) {
            return [];
        }

        $this->ensureUploadDir();
        $files = $_FILES[$fieldName];
        $saved = [];

        if (is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if (($files['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                    continue;
                }

                $savedPath = $this->moveUploadedFile(
                    $files['tmp_name'][$i],
                    $files['name'][$i],
                    $prefix
                );

                if ($savedPath) {
                    $saved[] = $savedPath;
                }
            }

            return $saved;
        }

        if (($files['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return [];
        }

        $savedPath = $this->moveUploadedFile($files['tmp_name'], $files['name'], $prefix);
        return $savedPath ? [$savedPath] : [];
    }

    private function moveUploadedFile($tmpName, $originalName, $prefix) {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $safePrefix = preg_replace('/[^a-z0-9_-]/i', '-', $prefix);
        $fileName = sprintf('%s-%s.%s', $safePrefix, uniqid(), $extension ?: 'bin');
        $targetPath = UPLOAD_DIR . $fileName;

        if (!move_uploaded_file($tmpName, $targetPath)) {
            return null;
        }

        return '/api/uploads/' . $fileName;
    }

    private function buildPropertyPayload($data, $existing = null) {
        $uploadedImages = $this->storeUploadedFiles('gallery', 'gallery');
        $uploadedCertificates = $this->storeUploadedFiles('reraCertificate', 'rera-certificate');

        $existingImages = $existing ? json_decode($existing['images'] ?? '[]', true) : [];
        if (!is_array($existingImages)) {
            $existingImages = [];
        }

        $providedImages = $this->decodeArrayField($data['images'] ?? []);
        $images = array_values(array_filter(array_merge($existingImages, $providedImages, $uploadedImages)));

        $featuredImage = $data['featuredImage'] ?? ($existing['featured_image'] ?? null);
        if (!$featuredImage && count($images) > 0) {
            $featuredImage = $images[0];
        }

        $amenities = $this->decodeArrayField($data['amenities'] ?? []);

        if (!empty($uploadedCertificates)) {
            $amenities[] = 'RERA Certificate Uploaded';
            $amenities = array_values(array_unique($amenities));
        }

        return [
            'title' => trim($data['title'] ?? ''),
            'description' => $data['description'] ?? '',
            'propertyType' => $data['propertyType'] ?? 'house',
            'status' => $data['status'] ?? 'for_sale',
            'price' => $data['price'] ?? 0,
            'bedrooms' => $data['bedrooms'] ?? 0,
            'bathrooms' => $data['bathrooms'] ?? 0,
            'squareFeet' => $data['squareFeet'] ?? null,
            'address' => $data['address'] ?? '',
            'city' => $data['city'] ?? '',
            'state' => $data['state'] ?? '',
            'zipCode' => $data['zipCode'] ?? '',
            'country' => $data['country'] ?? 'India',
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'featuredImage' => $featuredImage,
            'images' => $images,
            'amenities' => $amenities,
            'isFeatured' => $this->boolValue($data['isFeatured'] ?? 0),
            'isPublished' => $this->boolValue($data['isPublished'] ?? 1),
        ];
    }

    public function list() {
        $db = getDB();
        
        $status = $_GET['status'] ?? null;
        $type = $_GET['type'] ?? null;
        $city = $_GET['city'] ?? null;
        $minPrice = $_GET['minPrice'] ?? null;
        $maxPrice = $_GET['maxPrice'] ?? null;
        $featured = $_GET['featured'] ?? null;
        $search = $_GET['search'] ?? null;
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $where = ["is_published = 1"];
        $params = [];
        
        if ($status) {
            $where[] = "status = ?";
            $params[] = $status;
        }
        if ($type) {
            $where[] = "property_type = ?";
            $params[] = $type;
        }
        if ($city) {
            $where[] = "city = ?";
            $params[] = $city;
        }
        if ($minPrice !== null) {
            $where[] = "price >= ?";
            $params[] = $minPrice;
        }
        if ($maxPrice !== null) {
            $where[] = "price <= ?";
            $params[] = $maxPrice;
        }
        if ($featured) {
            $where[] = "is_featured = 1";
        }
        if ($search) {
            $where[] = "(title LIKE ? OR description LIKE ? OR city LIKE ? OR address LIKE ?)";
            $like = "%$search%";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Count total
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM properties WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        // Fetch properties
        $sql = "SELECT p.*, u.full_name as agent_name FROM properties p LEFT JOIN users u ON p.agent_id = u.id WHERE $whereClause ORDER BY p.is_featured DESC, p.created_at DESC LIMIT ? OFFSET ?";
        $stmt = $db->prepare($sql);
        $stmt->execute(array_merge($params, [$limit, $offset]));
        $properties = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($properties as &$prop) {
            $prop['images'] = json_decode($prop['images'] ?? '[]', true);
            $prop['amenities'] = json_decode($prop['amenities'] ?? '[]', true);
        }
        
        jsonResponse([
            'properties' => $properties,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }
    
    public function get($id) {
        $db = getDB();
        $stmt = $db->prepare("SELECT p.*, u.full_name as agent_name, u.email as agent_email, u.phone as agent_phone FROM properties p LEFT JOIN users u ON p.agent_id = u.id WHERE p.id = ? AND p.is_published = 1");
        $stmt->execute([$id]);
        $property = $stmt->fetch();
        
        if (!$property) {
            jsonResponse(['error' => 'Property not found'], 404);
        }
        
        $property['images'] = json_decode($property['images'] ?? '[]', true);
        $property['amenities'] = json_decode($property['amenities'] ?? '[]', true);
        
        jsonResponse($property);
    }
    
    public function create() {
        $user = requireAuth();
        $data = $this->getRequestData();
        $payload = $this->buildPropertyPayload($data);

        if ($payload['title'] === '') {
            jsonResponse(['error' => 'Property title is required'], 422);
        }
        
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO properties 
            (title, description, property_type, status, price, bedrooms, bathrooms, square_feet, 
             address, city, state, zip_code, country, latitude, longitude, featured_image, images, amenities, 
             agent_id, is_featured, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $payload['title'],
            $payload['description'],
            $payload['propertyType'],
            $payload['status'],
            $payload['price'],
            $payload['bedrooms'],
            $payload['bathrooms'],
            $payload['squareFeet'],
            $payload['address'],
            $payload['city'],
            $payload['state'],
            $payload['zipCode'],
            $payload['country'],
            $payload['latitude'],
            $payload['longitude'],
            $payload['featuredImage'],
            json_encode($payload['images']),
            json_encode($payload['amenities']),
            $user['sub'],
            $payload['isFeatured'],
            $payload['isPublished']
        ]);
        
        jsonResponse(['message' => 'Property created successfully', 'id' => $db->lastInsertId()]);
    }
    
    public function update($id) {
        requireAuth();
        $data = $this->getRequestData();

        $db = getDB();
        $existingStmt = $db->prepare("SELECT featured_image, images FROM properties WHERE id = ?");
        $existingStmt->execute([$id]);
        $existing = $existingStmt->fetch();

        if (!$existing) {
            jsonResponse(['error' => 'Property not found'], 404);
        }

        $payload = $this->buildPropertyPayload($data, $existing);
        
        $stmt = $db->prepare("UPDATE properties SET 
            title = ?, description = ?, property_type = ?, status = ?, price = ?, bedrooms = ?, 
            bathrooms = ?, square_feet = ?, address = ?, city = ?, state = ?, zip_code = ?, 
            country = ?, latitude = ?, longitude = ?, featured_image = ?, images = ?, amenities = ?, 
            is_featured = ?, is_published = ? WHERE id = ?");
        
        $stmt->execute([
            $payload['title'],
            $payload['description'],
            $payload['propertyType'],
            $payload['status'],
            $payload['price'],
            $payload['bedrooms'],
            $payload['bathrooms'],
            $payload['squareFeet'],
            $payload['address'],
            $payload['city'],
            $payload['state'],
            $payload['zipCode'],
            $payload['country'],
            $payload['latitude'],
            $payload['longitude'],
            $payload['featuredImage'],
            json_encode($payload['images']),
            json_encode($payload['amenities']),
            $payload['isFeatured'],
            $payload['isPublished'],
            $id
        ]);
        
        jsonResponse(['message' => 'Property updated successfully']);
    }
    
    public function delete($id) {
        requireAuth();
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Property deleted successfully']);
    }
    
    public function adminList() {
        requireAuth();
        $db = getDB();
        
        $status = $_GET['status'] ?? null;
        $where = ["1=1"];
        $params = [];
        
        if ($status) {
            $where[] = "status = ?";
            $params[] = $status;
        }
        
        $whereClause = implode(' AND ', $where);
        $stmt = $db->prepare("SELECT p.*, u.full_name as agent_name FROM properties p LEFT JOIN users u ON p.agent_id = u.id WHERE $whereClause ORDER BY p.created_at DESC");
        $stmt->execute($params);
        $properties = $stmt->fetchAll();
        
        foreach ($properties as &$prop) {
            $prop['images'] = json_decode($prop['images'] ?? '[]', true);
            $prop['amenities'] = json_decode($prop['amenities'] ?? '[]', true);
        }
        
        jsonResponse($properties);
    }
    
    public function getCities() {
        $db = getDB();
        $stmt = $db->query("SELECT DISTINCT city, state FROM properties WHERE is_published = 1 ORDER BY city");
        jsonResponse($stmt->fetchAll());
    }
}
