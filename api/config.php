<?php
// ════════════════════════════════════════════════════
//  config.php — Database Connection
//  I-edit ang DB_USER at DB_PASS depende sa setup mo
// ════════════════════════════════════════════════════

define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // Default sa XAMPP
define('DB_PASS', '');           // Wala ng password sa XAMPP by default
define('DB_NAME', 'alab_db');

// I-allow ang CORS para makausap ng JS ang PHP API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
        exit();
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function sendJSON($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function getInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
