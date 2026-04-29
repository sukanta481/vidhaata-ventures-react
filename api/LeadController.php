<?php
require_once __DIR__ . '/config.php';

class LeadController {
    private function leadActivitiesSupportsFollowUpFields($db) {
        static $supports = null;

        if ($supports !== null) {
            return $supports;
        }

        try {
            $stmt = $db->query("SHOW COLUMNS FROM lead_activities LIKE 'follow_up_date'");
            $hasFollowUpDate = (bool)$stmt->fetch();

            $stmt = $db->query("SHOW COLUMNS FROM lead_activities LIKE 'property_interest_id'");
            $hasPropertyInterestId = (bool)$stmt->fetch();

            $supports = $hasFollowUpDate && $hasPropertyInterestId;
        } catch (Throwable $e) {
            $supports = false;
        }

        return $supports;
    }

    private function splitFullName($fullName) {
        $fullName = trim((string)$fullName);
        if ($fullName === '') {
            return ['', ''];
        }

        $parts = preg_split('/\s+/', $fullName);
        $firstName = array_shift($parts) ?? '';
        $lastName = trim(implode(' ', $parts));

        return [$firstName, $lastName];
    }

    public function list() {
        requireAuth();
        $db = getDB();
        
        $status = $_GET['status'] ?? null;
        $source = $_GET['source'] ?? null;
        $search = $_GET['search'] ?? null;
        $filter = $_GET['filter'] ?? null;
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $where = ["1=1"];
        $params = [];
        
        if ($status) {
            $where[] = "l.status = ?";
            $params[] = $status;
        }
        if ($source) {
            $where[] = "l.source = ?";
            $params[] = $source;
        }
        if ($search) {
            $where[] = "(l.first_name LIKE ? OR l.last_name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)";
            $like = "%$search%";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        
        if ($filter === 'today_visits') {
            $where[] = "EXISTS (SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.activity_type = 'meeting' AND la.follow_up_date IS NOT NULL AND DATE(la.follow_up_date) = CURDATE())";
        } elseif ($filter === 'month_leads') {
            $where[] = "MONTH(l.created_at) = MONTH(CURRENT_DATE()) AND YEAR(l.created_at) = YEAR(CURRENT_DATE())";
        }
        
        $whereClause = implode(' AND ', $where);
        
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM leads l WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        $sql = "SELECT l.*, p.title as property_title, u.full_name as assigned_agent_name 
                FROM leads l 
                LEFT JOIN properties p ON l.property_interest_id = p.id 
                LEFT JOIN users u ON l.assigned_agent_id = u.id 
                WHERE $whereClause 
                ORDER BY l.created_at DESC 
                LIMIT ? OFFSET ?";
        $stmt = $db->prepare($sql);
        $stmt->execute(array_merge($params, [$limit, $offset]));
        $leads = $stmt->fetchAll();
        
        jsonResponse([
            'leads' => $leads,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }
    
    public function get($id) {
        requireAuth();
        $db = getDB();
        
        $stmt = $db->prepare("SELECT l.*, p.title as property_title, u.full_name as assigned_agent_name 
                              FROM leads l 
                              LEFT JOIN properties p ON l.property_interest_id = p.id 
                              LEFT JOIN users u ON l.assigned_agent_id = u.id 
                              WHERE l.id = ?");
        $stmt->execute([$id]);
        $lead = $stmt->fetch();
        
        if (!$lead) {
            jsonResponse(['error' => 'Lead not found'], 404);
        }
        
        // Get activities
        if ($this->leadActivitiesSupportsFollowUpFields($db)) {
            $stmt = $db->prepare("SELECT la.*, u.full_name as created_by_name, p.title as activity_property_title
                                  FROM lead_activities la 
                                  LEFT JOIN users u ON la.created_by = u.id 
                                  LEFT JOIN properties p ON la.property_interest_id = p.id
                                  WHERE la.lead_id = ? 
                                  ORDER BY la.created_at DESC");
        } else {
            $stmt = $db->prepare("SELECT la.*, u.full_name as created_by_name
                                  FROM lead_activities la 
                                  LEFT JOIN users u ON la.created_by = u.id 
                                  WHERE la.lead_id = ? 
                                  ORDER BY la.created_at DESC");
        }
        $stmt->execute([$id]);
        $lead['activities'] = $stmt->fetchAll();
        
        jsonResponse($lead);
    }
    
    public function create() {
        $data = getJsonInput();

        if (!empty($data['fullName'])) {
            [$firstName, $lastName] = $this->splitFullName($data['fullName']);
        } else {
            $firstName = trim($data['firstName'] ?? '');
            $lastName = trim($data['lastName'] ?? '');
        }

        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $message = $data['message'] ?? '';
        $notes = $data['notes'] ?? '';
        $source = $data['source'] ?? 'website';
        $propertyInterestId = $data['propertyInterestId'] ?? null;

        if (empty($firstName) || empty($phone)) {
            jsonResponse(['error' => 'Full name and phone number are required'], 400);
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['error' => 'Invalid email address'], 400);
        }

        $db = getDB();
        $stmt = $db->prepare("INSERT INTO leads (first_name, last_name, email, phone, message, source, status, property_interest_id, notes) 
                              VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?)");
        $stmt->execute([$firstName, $lastName, $email, $phone, $message, $source, $propertyInterestId, $notes]);
        $leadId = $db->lastInsertId();
        
        jsonResponse(['message' => 'Lead submitted successfully', 'id' => $leadId], 201);
    }
    
    public function update($id) {
        requireAuth();
        $data = getJsonInput();
        
        $db = getDB();
        $stmt = $db->prepare("UPDATE leads SET 
            first_name = ?, last_name = ?, email = ?, phone = ?, message = ?, 
            source = ?, status = ?, property_interest_id = ?, assigned_agent_id = ?, notes = ? 
            WHERE id = ?");
        
        $stmt->execute([
            $data['firstName'] ?? '',
            $data['lastName'] ?? '',
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['message'] ?? '',
            $data['source'] ?? 'website',
            $data['status'] ?? 'new',
            $data['propertyInterestId'] ?? null,
            $data['assignedAgentId'] ?? null,
            $data['notes'] ?? '',
            $id
        ]);
        
        jsonResponse(['message' => 'Lead updated successfully']);
    }
    
    public function delete($id) {
        requireAuth();
        $db = getDB();
        
        // Delete activities first
        $stmt = $db->prepare("DELETE FROM lead_activities WHERE lead_id = ?");
        $stmt->execute([$id]);
        
        $stmt = $db->prepare("DELETE FROM leads WHERE id = ?");
        $stmt->execute([$id]);
        
        jsonResponse(['message' => 'Lead deleted successfully']);
    }
    
    public function addActivity($leadId) {
        requireAuth();
        $data = getJsonInput();
        $user = verifyToken();
        
        $db = getDB();
        $followUpDate = $data['followUpDate'] ?? null;
        $propertyInterestId = $data['propertyInterestId'] ?? null;

        if ($this->leadActivitiesSupportsFollowUpFields($db)) {
            $stmt = $db->prepare("INSERT INTO lead_activities (lead_id, activity_type, description, follow_up_date, property_interest_id, created_by) 
                                  VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $leadId,
                $data['activityType'] ?? 'note',
                $data['description'] ?? '',
                $followUpDate,
                $propertyInterestId,
                $user['sub']
            ]);
        } else {
            $fallbackDescription = $data['description'] ?? '';

            if ($followUpDate) {
                $fallbackDescription .= "\nFollow-up Date: " . $followUpDate;
            }

            if ($propertyInterestId) {
                $fallbackDescription .= "\nProperty Interest ID: " . $propertyInterestId;
            }

            $stmt = $db->prepare("INSERT INTO lead_activities (lead_id, activity_type, description, created_by) 
                                  VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $leadId,
                $data['activityType'] ?? 'note',
                trim($fallbackDescription),
                $user['sub']
            ]);
        }
        
        jsonResponse(['message' => 'Activity added successfully', 'id' => $db->lastInsertId()]);
    }
    
    public function deleteActivity($leadId, $activityId) {
        requireAuth();
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM lead_activities WHERE id = ? AND lead_id = ?");
        $stmt->execute([$activityId, $leadId]);
        jsonResponse(['message' => 'Activity deleted successfully']);
    }
    public function import() {
        requireAuth();
        
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(['error' => 'No file uploaded or upload error'], 400);
        }
        
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        if ($fileExtension !== 'csv') {
            jsonResponse(['error' => 'Only CSV files are allowed'], 400);
        }
        
        $handle = fopen($fileTmpPath, 'r');
        if ($handle === false) {
            jsonResponse(['error' => 'Failed to read the file'], 500);
        }
        
        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            jsonResponse(['error' => 'File is empty'], 400);
        }
        
        // Normalize headers to lower case and trimmed for easier matching
        $headers = array_map('strtolower', array_map('trim', $headers));
        
        // Find indexes
        $idxFullName = array_search('full name', $headers);
        $idxFirstName = array_search('first name', $headers);
        $idxLastName = array_search('last name', $headers);
        $idxPhone = array_search('phone', $headers);
        $idxEmail = array_search('email', $headers);
        $idxSource = array_search('source', $headers);
        $idxMessage = array_search('message', $headers);
        $idxNotes = array_search('notes', $headers);
        
        // At least Phone is required. We also need some name.
        if ($idxPhone === false || ($idxFullName === false && $idxFirstName === false)) {
            fclose($handle);
            jsonResponse(['error' => 'CSV must contain at least a Name (Full Name or First Name) and Phone column'], 400);
        }
        
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO leads (first_name, last_name, email, phone, message, source, status, notes) 
                              VALUES (?, ?, ?, ?, ?, ?, 'new', ?)");
                              
        $successCount = 0;
        $failCount = 0;
        
        $db->beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                // Pad row if it has fewer columns than headers
                $row = array_pad($row, count($headers), '');
                
                $firstName = '';
                $lastName = '';
                
                if ($idxFullName !== false && !empty($row[$idxFullName])) {
                    [$firstName, $lastName] = $this->splitFullName($row[$idxFullName]);
                } else {
                    $firstName = $idxFirstName !== false ? trim($row[$idxFirstName]) : '';
                    $lastName = $idxLastName !== false ? trim($row[$idxLastName]) : '';
                }
                
                $phone = $idxPhone !== false ? trim($row[$idxPhone]) : '';
                $email = $idxEmail !== false ? trim($row[$idxEmail]) : '';
                $source = $idxSource !== false && !empty(trim($row[$idxSource])) ? trim($row[$idxSource]) : 'website';
                $message = $idxMessage !== false ? trim($row[$idxMessage]) : '';
                $notes = $idxNotes !== false ? trim($row[$idxNotes]) : '';
                
                if (empty($firstName) || empty($phone)) {
                    $failCount++;
                    continue;
                }
                
                $stmt->execute([$firstName, $lastName, $email, $phone, $message, $source, $notes]);
                $successCount++;
            }
            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            fclose($handle);
            jsonResponse(['error' => 'Failed to process CSV data: ' . $e->getMessage()], 500);
        }
        
        fclose($handle);
        jsonResponse([
            'message' => 'Import completed',
            'success_count' => $successCount,
            'fail_count' => $failCount
        ]);
    }
    
    public function getStats() {
        requireAuth();
        $db = getDB();
        
        // Total leads
        $stmt = $db->query("SELECT COUNT(*) as total FROM leads");
        $total = $stmt->fetch()['total'];
        
        // By status
        $stmt = $db->query("SELECT status, COUNT(*) as count FROM leads GROUP BY status");
        $byStatus = $stmt->fetchAll();
        
        // By source
        $stmt = $db->query("SELECT source, COUNT(*) as count FROM leads GROUP BY source");
        $bySource = $stmt->fetchAll();
        
        // New this month
        $stmt = $db->query("SELECT COUNT(*) as count FROM leads WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
        $newThisMonth = $stmt->fetch()['count'];
        
        // Conversion rate (closed_won / total)
        $stmt = $db->query("SELECT COUNT(*) as count FROM leads WHERE status = 'closed_won'");
        $closedWon = $stmt->fetch()['count'];
        $conversionRate = $total > 0 ? round(($closedWon / $total) * 100, 1) : 0;
        
        jsonResponse([
            'total' => $total,
            'newThisMonth' => $newThisMonth,
            'closedWon' => $closedWon,
            'conversionRate' => $conversionRate,
            'byStatus' => $byStatus,
            'bySource' => $bySource
        ]);
    }
}
