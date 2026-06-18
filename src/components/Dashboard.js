/* ═══════════════════════════════════════════════════
   Dashboard.js — Async version (PHP + MySQL)
   ═══════════════════════════════════════════════════ */

import {
  getDashboardStats,
  getMemberStatus,
  isExpiringSoon,
  formatDate,
  formatCurrency,
  showLoading,
  showError,
} from '../data/store.js';

export async function renderDashboard(container) {
  showLoading(container, 'Loading dashboard...');

  try {
    const stats = await getDashboardStats();
    container.innerHTML = buildDashboardHTML(stats);
  } catch (err) {
    showError(container, 'Hindi ma-load ang dashboard. Siguraduhing nakabukas ang XAMPP.');
  }
}

function buildDashboardHTML(s) {
  const expiringRows = s.expiringList.length === 0
    ? `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">Walang mag-e-expire sa susunod na 14 araw.</td></tr>`
    : s.expiringList.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td><span class="badge badge-primary">${m.plan}</span></td>
          <td>${formatDate(m.end_date)}</td>
          <td><span class="badge badge-warning">Expiring</span></td>
        </tr>`).join('');

  const recentRows = s.recentCheckins.length === 0
    ? `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px;">Walang check-ins ngayon.</td></tr>`
    : s.recentCheckins.map(a => `
        <tr>
          <td><strong>${a.member_name}</strong></td>
          <td><span class="member-id-text">${a.member_id}</span></td>
          <td>${new Date(a.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>`).join('');

  return `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welcome back, Admin · ${new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- KPI Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="ti ti-users"></i></div>
        <div class="stat-info">
          <div class="stat-number">${s.totalMembers}</div>
          <div class="stat-label">Total Members</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(34,197,94,.15); color:#22c55e;"><i class="ti ti-user-check"></i></div>
        <div class="stat-info">
          <div class="stat-number">${s.activeMembers}</div>
          <div class="stat-label">Active Members</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(251,191,36,.15); color:#fbbf24;"><i class="ti ti-clock-exclamation"></i></div>
        <div class="stat-info">
          <div class="stat-number">${s.expiringSoon}</div>
          <div class="stat-label">Expiring Soon</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(239,68,68,.15); color:#ef4444;"><i class="ti ti-user-x"></i></div>
        <div class="stat-info">
          <div class="stat-number">${s.expiredMembers}</div>
          <div class="stat-label">Expired</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(168,85,247,.15); color:#a855f7;"><i class="ti ti-clipboard-check"></i></div>
        <div class="stat-info">
          <div class="stat-number">${s.todayCheckins}</div>
          <div class="stat-label">Today's Check-ins</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(20,184,166,.15); color:#14b8a6;"><i class="ti ti-currency-peso"></i></div>
        <div class="stat-info">
          <div class="stat-number">${formatCurrency(s.monthlyRevenue)}</div>
          <div class="stat-label">This Month's Revenue</div>
        </div>
      </div>
    </div>

    <!-- Tables row -->
    <div class="grid-2" style="margin-top:24px; align-items:start;">
      <!-- Expiring Members -->
      <div>
        <div class="section-label">Expiring Soon (14 days)</div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Plan</th><th>Expiry</th><th>Status</th></tr></thead>
              <tbody>${expiringRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Recent Check-ins -->
      <div>
        <div class="section-label">Recent Check-ins</div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>ID</th><th>Time</th></tr></thead>
              <tbody>${recentRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
