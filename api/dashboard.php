<?php
// ════════════════════════════════════════════════════
//  api/dashboard.php — Dashboard Stats
//  GET /api/dashboard.php → summary statistics
// ════════════════════════════════════════════════════

require_once 'config.php';

$db = getDB();

$today     = date('Y-m-d');
$thisMonth = date('Y-m');

// Total members
$totalMembers = $db->query("SELECT COUNT(*) AS c FROM members")->fetch_assoc()['c'];

// Active members (end_date >= today)
$activeMembers = $db->query(
    "SELECT COUNT(*) AS c FROM members WHERE end_date >= '$today'"
)->fetch_assoc()['c'];

// Expiring soon (within 14 days)
$soon = date('Y-m-d', strtotime('+14 days'));
$expiringSoon = $db->query(
    "SELECT COUNT(*) AS c FROM members WHERE end_date >= '$today' AND end_date <= '$soon'"
)->fetch_assoc()['c'];

// Today's check-ins
$todayCheckins = $db->query(
    "SELECT COUNT(*) AS c FROM attendance WHERE DATE(timestamp)='$today'"
)->fetch_assoc()['c'];

// Monthly revenue
$monthlyRevenue = $db->query(
    "SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE date LIKE '$thisMonth%'"
)->fetch_assoc()['total'];

// Total revenue
$totalRevenue = $db->query(
    "SELECT COALESCE(SUM(amount),0) AS total FROM payments"
)->fetch_assoc()['total'];

// Total classes
$totalClasses = $db->query("SELECT COUNT(*) AS c FROM classes")->fetch_assoc()['c'];

// Recent activity (last 5 check-ins)
$recentRes    = $db->query(
    "SELECT * FROM attendance ORDER BY timestamp DESC LIMIT 5"
);
$recentCheckins = [];
while ($row = $recentRes->fetch_assoc()) {
    $recentCheckins[] = $row;
}

// Expiring members list
$expiringRes = $db->query(
    "SELECT id, name, plan, end_date FROM members
     WHERE end_date >= '$today' AND end_date <= '$soon'
     ORDER BY end_date ASC LIMIT 5"
);
$expiringList = [];
while ($row = $expiringRes->fetch_assoc()) {
    $expiringList[] = $row;
}

sendJSON([
    'totalMembers'   => (int)$totalMembers,
    'activeMembers'  => (int)$activeMembers,
    'expiredMembers' => (int)($totalMembers - $activeMembers),
    'expiringSoon'   => (int)$expiringSoon,
    'todayCheckins'  => (int)$todayCheckins,
    'monthlyRevenue' => (float)$monthlyRevenue,
    'totalRevenue'   => (float)$totalRevenue,
    'totalClasses'   => (int)$totalClasses,
    'recentCheckins' => $recentCheckins,
    'expiringList'   => $expiringList,
]);
