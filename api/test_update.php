<?php
// Force local DB connection
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['REQUEST_METHOD'] = 'GET';

require_once __DIR__ . '/config.php';

$data = [
    'firstName' => 'sukanta',
    'lastName' => 'saha',
    'email' => 'sukantasaha481@gmail.com',
    'phone' => '8910671339',
    'message' => '',
    'source' => 'referral',
    'status' => 'visit',
    'propertyInterestId' => null,
    'assignedAgentId' => null,
    'notes' => '',
];

$db = getDB();

// Check current status
$stmt = $db->prepare("SELECT id, first_name, status FROM leads WHERE id = 12");
$stmt->execute();
$before = $stmt->fetch();
echo "BEFORE: id={$before['id']}, name={$before['first_name']}, status='{$before['status']}'\n";

// Run the exact same update the API does
$stmt = $db->prepare("UPDATE leads SET 
    first_name = ?, last_name = ?, email = ?, phone = ?, message = ?, 
    source = ?, status = ?, property_interest_id = ?, assigned_agent_id = ?, notes = ? 
    WHERE id = ?");

$result = $stmt->execute([
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
    12
]);

echo "Execute result: " . ($result ? 'true' : 'false') . "\n";
echo "Rows affected: " . $stmt->rowCount() . "\n";

// Check after
$stmt = $db->prepare("SELECT id, first_name, status FROM leads WHERE id = 12");
$stmt->execute();
$after = $stmt->fetch();
echo "AFTER: id={$after['id']}, name={$after['first_name']}, status='{$after['status']}'\n";
