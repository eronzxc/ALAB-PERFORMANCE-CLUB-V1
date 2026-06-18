<?php
// ════════════════════════════════════════════════════
//  api/members.php — Members CRUD API
//  GET    /api/members.php         → list all
//  GET    /api/members.php?id=X    → get one
//  POST   /api/members.php         → create
//  PUT    /api/members.php         → update
//  DELETE /api/members.php?id=X    → delete
// ════════════════════════════════════════════════════

require_once 'config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ── GET: List all or get single ──────────────────
    case 'GET':
        if (!empty($_GET['id'])) {
            $id   = $db->real_escape_string($_GET['id']);
            $res  = $db->query("SELECT * FROM members WHERE id='$id' LIMIT 1");
            $row  = $res->fetch_assoc();
            sendJSON($row ?: null);
        }

        $search = !empty($_GET['q']) ? '%' . $db->real_escape_string($_GET['q']) . '%' : null;

        if ($search) {
            $stmt = $db->prepare(
                "SELECT * FROM members WHERE name LIKE ? OR email LIKE ? OR id LIKE ? ORDER BY name ASC"
            );
            $stmt->bind_param('sss', $search, $search, $search);
        } else {
            $stmt = $db->prepare("SELECT * FROM members ORDER BY name ASC");
        }

        $stmt->execute();
        $result  = $stmt->get_result();
        $members = [];
        while ($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
        sendJSON($members);
        break;

    // ── POST: Create new member ──────────────────────
    case 'POST':
        $data = getInput();

        // Basic validation
        if (empty($data['name']) || empty($data['plan'])) {
            sendJSON(['error' => 'Name at plan ay required.'], 422);
        }

        // Generate ID: APC-XXXX (similar sa JS version)
        $lastId = $db->query("SELECT id FROM members ORDER BY id DESC LIMIT 1")->fetch_assoc();
        $num    = $lastId ? (intval(substr($lastId['id'], 4)) + 1) : 1;
        $id     = 'APC-' . str_pad($num, 3, '0', STR_PAD_LEFT);

        $name       = $db->real_escape_string($data['name']);
        $email      = $db->real_escape_string($data['email'] ?? '');
        $phone      = $db->real_escape_string($data['phone'] ?? '');
        $plan       = $db->real_escape_string($data['plan']);
        $startDate  = $db->real_escape_string($data['start_date'] ?? date('Y-m-d'));
        $endDate    = $db->real_escape_string($data['end_date'] ?? '');
        $joinDate   = $db->real_escape_string($data['join_date'] ?? date('Y-m-d'));

        $db->query("INSERT INTO members (id, name, email, phone, plan, start_date, end_date, join_date)
                    VALUES ('$id','$name','$email','$phone','$plan','$startDate','$endDate','$joinDate')");

        if ($db->affected_rows > 0) {
            $member = $db->query("SELECT * FROM members WHERE id='$id'")->fetch_assoc();
            sendJSON($member, 201);
        } else {
            sendJSON(['error' => 'Hindi nai-save ang member.'], 500);
        }
        break;

    // ── PUT: Update member ───────────────────────────
    case 'PUT':
        $data = getInput();

        if (empty($data['id'])) {
            sendJSON(['error' => 'Member ID required.'], 422);
        }

        $id        = $db->real_escape_string($data['id']);
        $name      = $db->real_escape_string($data['name'] ?? '');
        $email     = $db->real_escape_string($data['email'] ?? '');
        $phone     = $db->real_escape_string($data['phone'] ?? '');
        $plan      = $db->real_escape_string($data['plan'] ?? '');
        $startDate = $db->real_escape_string($data['start_date'] ?? '');
        $endDate   = $db->real_escape_string($data['end_date'] ?? '');

        $db->query("UPDATE members SET
                    name='$name', email='$email', phone='$phone',
                    plan='$plan', start_date='$startDate', end_date='$endDate'
                    WHERE id='$id'");

        if ($db->affected_rows >= 0) {
            $member = $db->query("SELECT * FROM members WHERE id='$id'")->fetch_assoc();
            sendJSON($member);
        } else {
            sendJSON(['error' => 'Update failed.'], 500);
        }
        break;

    // ── DELETE: Remove member ────────────────────────
    case 'DELETE':
        $id = $db->real_escape_string($_GET['id'] ?? '');

        if (!$id) {
            sendJSON(['error' => 'ID required.'], 422);
        }

        $db->query("DELETE FROM members WHERE id='$id'");

        if ($db->affected_rows > 0) {
            sendJSON(['success' => true]);
        } else {
            sendJSON(['error' => 'Member not found.'], 404);
        }
        break;

    default:
        sendJSON(['error' => 'Method not allowed.'], 405);
}
