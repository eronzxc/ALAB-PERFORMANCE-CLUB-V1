<?php
// ════════════════════════════════════════════════════
//  api/attendance.php — Attendance API
//  GET  /api/attendance.php          → all attendance
//  GET  /api/attendance.php?today=1  → today's log only
//  POST /api/attendance.php          → check-in
// ════════════════════════════════════════════════════

require_once 'config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ── GET ──────────────────────────────────────────
    case 'GET':
        if (!empty($_GET['today'])) {
            // Today's attendance only
            $today = date('Y-m-d');
            $res   = $db->query(
                "SELECT * FROM attendance WHERE DATE(timestamp) = '$today' ORDER BY timestamp DESC"
            );
        } else {
            $res = $db->query("SELECT * FROM attendance ORDER BY timestamp DESC LIMIT 200");
        }

        $rows = [];
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        sendJSON($rows);
        break;

    // ── POST: Check-in ───────────────────────────────
    case 'POST':
        $data = getInput();

        if (empty($data['member_id'])) {
            sendJSON(['error' => 'member_id required.'], 422);
        }

        $memberId = $db->real_escape_string($data['member_id']);

        // Get member info
        $member = $db->query("SELECT * FROM members WHERE id='$memberId' LIMIT 1")->fetch_assoc();

        if (!$member) {
            sendJSON(['error' => 'Member not found.'], 404);
        }

        // Check kung active pa
        if (!empty($member['end_date']) && strtotime($member['end_date']) < time()) {
            sendJSON(['error' => 'Member membership ay expired na.'], 400);
        }

        // Prevent duplicate check-in today
        $today    = date('Y-m-d');
        $existing = $db->query(
            "SELECT id FROM attendance WHERE member_id='$memberId' AND DATE(timestamp)='$today' LIMIT 1"
        )->fetch_assoc();

        if ($existing) {
            sendJSON(['error' => 'Naka-check in na si ' . $member['name'] . ' ngayon.'], 409);
        }

        // Record check-in
        $memberName = $db->real_escape_string($member['name']);
        $timestamp  = date('Y-m-d H:i:s');

        $db->query("INSERT INTO attendance (member_id, member_name, timestamp)
                    VALUES ('$memberId', '$memberName', '$timestamp')");

        if ($db->affected_rows > 0) {
            sendJSON([
                'success'    => true,
                'id'         => $db->insert_id,
                'member_id'  => $memberId,
                'memberName' => $member['name'],
                'timestamp'  => $timestamp,
            ], 201);
        } else {
            sendJSON(['error' => 'Check-in failed.'], 500);
        }
        break;

    default:
        sendJSON(['error' => 'Method not allowed.'], 405);
}
