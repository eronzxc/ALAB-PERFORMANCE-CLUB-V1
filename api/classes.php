<?php
// ════════════════════════════════════════════════════
//  api/classes.php — Classes CRUD API
//  GET    /api/classes.php      → all classes
//  POST   /api/classes.php      → add class
//  PUT    /api/classes.php      → update class
//  DELETE /api/classes.php?id=X → delete class
// ════════════════════════════════════════════════════

require_once 'config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $res   = $db->query(
            "SELECT * FROM classes ORDER BY FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')"
        );
        $rows  = [];
        while ($row = $res->fetch_assoc()) {
            $row['capacity'] = (int)$row['capacity'];
            $row['enrolled'] = (int)$row['enrolled'];
            $rows[] = $row;
        }
        sendJSON($rows);
        break;

    case 'POST':
        $data = getInput();

        if (empty($data['name']) || empty($data['trainer']) || empty($data['day'])) {
            sendJSON(['error' => 'name, trainer, at day ay required.'], 422);
        }

        // Generate ID
        $last = $db->query("SELECT id FROM classes ORDER BY id DESC LIMIT 1")->fetch_assoc();
        $num  = $last ? (intval(substr($last['id'], 4)) + 1) : 1;
        $id   = 'CLS-' . str_pad($num, 3, '0', STR_PAD_LEFT);

        $name     = $db->real_escape_string($data['name']);
        $trainer  = $db->real_escape_string($data['trainer']);
        $day      = $db->real_escape_string($data['day']);
        $time     = $db->real_escape_string($data['time'] ?? '');
        $capacity = (int)($data['capacity'] ?? 20);

        $db->query("INSERT INTO classes (id, name, trainer, day, time, capacity, enrolled)
                    VALUES ('$id','$name','$trainer','$day','$time','$capacity', 0)");

        if ($db->affected_rows > 0) {
            $cls = $db->query("SELECT * FROM classes WHERE id='$id'")->fetch_assoc();
            sendJSON($cls, 201);
        } else {
            sendJSON(['error' => 'Failed to add class.'], 500);
        }
        break;

    case 'PUT':
        $data = getInput();
        if (empty($data['id'])) sendJSON(['error' => 'ID required.'], 422);

        $id       = $db->real_escape_string($data['id']);
        $name     = $db->real_escape_string($data['name'] ?? '');
        $trainer  = $db->real_escape_string($data['trainer'] ?? '');
        $day      = $db->real_escape_string($data['day'] ?? '');
        $time     = $db->real_escape_string($data['time'] ?? '');
        $capacity = (int)($data['capacity'] ?? 20);
        $enrolled = (int)($data['enrolled'] ?? 0);

        $db->query("UPDATE classes SET name='$name', trainer='$trainer', day='$day',
                    time='$time', capacity='$capacity', enrolled='$enrolled' WHERE id='$id'");

        $cls = $db->query("SELECT * FROM classes WHERE id='$id'")->fetch_assoc();
        sendJSON($cls);
        break;

    case 'DELETE':
        $id = $db->real_escape_string($_GET['id'] ?? '');
        if (!$id) sendJSON(['error' => 'ID required.'], 422);

        $db->query("DELETE FROM classes WHERE id='$id'");
        sendJSON($db->affected_rows > 0 ? ['success' => true] : ['error' => 'Not found.'],
                 $db->affected_rows > 0 ? 200 : 404);
        break;

    default:
        sendJSON(['error' => 'Method not allowed.'], 405);
}
