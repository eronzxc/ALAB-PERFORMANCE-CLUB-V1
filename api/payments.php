<?php
// ════════════════════════════════════════════════════
//  api/payments.php — Payments API
//  GET    /api/payments.php      → all payments
//  POST   /api/payments.php      → record payment
//  DELETE /api/payments.php?id=X → delete payment
// ════════════════════════════════════════════════════

require_once 'config.php';

$db     = getDB();
$method = $_SERVER['REQUEST_METHOD'];

$PLANS = [
    'Monthly'   => ['price' => 1500,  'months' => 1 ],
    'Quarterly' => ['price' => 4000,  'months' => 3 ],
    'Annual'    => ['price' => 14000, 'months' => 12],
];

switch ($method) {

    // ── GET ──────────────────────────────────────────
    case 'GET':
        $res  = $db->query("SELECT * FROM payments ORDER BY date DESC, created_at DESC");
        $rows = [];
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        sendJSON($rows);
        break;

    // ── POST: Record payment ─────────────────────────
    case 'POST':
        $data = getInput();

        if (empty($data['member_id']) || empty($data['plan']) || empty($data['method'])) {
            sendJSON(['error' => 'member_id, plan, at method ay required.'], 422);
        }

        $memberId = $db->real_escape_string($data['member_id']);
        $member   = $db->query("SELECT * FROM members WHERE id='$memberId' LIMIT 1")->fetch_assoc();

        if (!$member) {
            sendJSON(['error' => 'Member not found.'], 404);
        }

        $plan   = $data['plan'];
        $amount = $PLANS[$plan]['price'] ?? (float)($data['amount'] ?? 0);

        // Generate payment ID
        $lastPay = $db->query("SELECT id FROM payments ORDER BY created_at DESC LIMIT 1")->fetch_assoc();
        $num     = $lastPay ? (intval(substr($lastPay['id'], 4)) + 1) : 1;
        $payId   = 'PAY-' . str_pad($num, 3, '0', STR_PAD_LEFT);

        $memberName = $db->real_escape_string($member['name']);
        $planEsc    = $db->real_escape_string($plan);
        $method2    = $db->real_escape_string($data['method']);
        $date       = $db->real_escape_string($data['date'] ?? date('Y-m-d'));

        $db->query("INSERT INTO payments (id, member_id, member_name, amount, plan, date, method)
                    VALUES ('$payId','$memberId','$memberName','$amount','$planEsc','$date','$method2')");

        if ($db->affected_rows > 0) {
            // Also update member's end_date based on plan
            if (isset($PLANS[$plan])) {
                $months   = $PLANS[$plan]['months'];
                $startNow = date('Y-m-d');
                $newEnd   = date('Y-m-d', strtotime("+$months months"));
                $db->query("UPDATE members SET plan='$planEsc', start_date='$startNow', end_date='$newEnd' WHERE id='$memberId'");
            }

            $payment = $db->query("SELECT * FROM payments WHERE id='$payId'")->fetch_assoc();
            sendJSON($payment, 201);
        } else {
            sendJSON(['error' => 'Payment failed to record.'], 500);
        }
        break;

    // ── DELETE ───────────────────────────────────────
    case 'DELETE':
        $id = $db->real_escape_string($_GET['id'] ?? '');
        if (!$id) sendJSON(['error' => 'ID required.'], 422);

        $db->query("DELETE FROM payments WHERE id='$id'");
        sendJSON($db->affected_rows > 0 ? ['success' => true] : ['error' => 'Not found.'],
                 $db->affected_rows > 0 ? 200 : 404);
        break;

    default:
        sendJSON(['error' => 'Method not allowed.'], 405);
}
