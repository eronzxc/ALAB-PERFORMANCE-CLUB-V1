/* ═══════════════════════════════════════════════════
   Attendance.js — Check-in System
   ─────────────────────────────────────────────────
   Features:
   - Search members by name or ID
   - Validate: expired members cannot check in
   - Prevent duplicate check-ins (same day)
   - Show today's attendance log
   ═══════════════════════════════════════════════════ */

import {
  members,
  attendance,
  getMemberStatus,
  formatDate,
  getTodayAttendance,
  getTodayString,
  showToast,
} from '../data/store.js';

/**
 * renderAttendance(container)
 * ─ Main render function called by main.js
 */
export function renderAttendance(container) {
  container.innerHTML = buildAttendanceHTML();
  attachAttendanceEvents(container);
}

// ─── Build HTML ───────────────────────────────────────
function buildAttendanceHTML(searchQuery = '') {
  const todayLog = [...getTodayAttendance()].reverse(); // Pinakabago muna

  // Filter members based on search
  const searchResults = searchQuery.trim().length >= 2
    ? members.filter(m => {
        const q = searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
      })
    : [];

  return `
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Attendance</h1>
      <p class="page-subtitle">Check in members · ${todayLog.length} check-in${todayLog.length !== 1 ? 's' : ''} today</p>
    </div>

    <div class="checkin-layout">

      <!-- LEFT: Check-in Form -->
      <div>
        <div class="section-label">Check In Member</div>

        <div class="card" style="margin-bottom:16px;">
          <div class="search-wrap" style="margin-bottom:14px;">
            <i class="ti ti-search"></i>
            <input
              type="text"
              class="form-control"
              id="checkin-search"
              placeholder="Type member name or ID..."
              value="${searchQuery}"
              autocomplete="off"
            />
          </div>

          <!-- Search Results -->
          <div id="search-results">
            ${searchQuery.trim().length < 2 ? `
              <div class="empty-state" style="padding:20px 0;">
                <i class="ti ti-search"></i>
                <p>Type at least 2 characters to search.</p>
              </div>
            ` : searchResults.length === 0 ? `
              <div class="empty-state" style="padding:20px 0;">
                <i class="ti ti-user-off"></i>
                <p>No member found for "${searchQuery}".</p>
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${searchResults.map(m => {
                  const status = getMemberStatus(m.endDate);
                  const alreadyIn = getTodayAttendance().some(a => a.memberId === m.id);
                  const isExpired = status === 'Expired';

                  return `
                    <div class="member-result-card ${isExpired ? 'is-expired' : ''} ${alreadyIn ? 'already-in' : ''}" data-member-id="${m.id}">
                      <div class="member-result-info">
                        <div class="member-result-name">${m.name}</div>
                        <div class="member-result-meta">
                          <span>${m.id}</span> · 
                          <span>${m.plan}</span> · 
                          <span>Expires ${formatDate(m.endDate)}</span>
                        </div>
                      </div>
                      <div class="member-result-action">
                        ${isExpired ? `
                          <span class="badge badge-danger"><i class="ti ti-ban"></i> Expired</span>
                        ` : alreadyIn ? `
                          <span class="badge badge-warning"><i class="ti ti-check"></i> Already In</span>
                        ` : `
                          <button class="btn btn-primary btn-sm btn-checkin" data-id="${m.id}">
                            <i class="ti ti-door-enter"></i> Check In
                          </button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- RIGHT: Today's Log -->
      <div>
        <div class="section-label">Today's Log — ${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}</div>

        <div class="card">
          ${todayLog.length === 0 ? `
            <div class="empty-state">
              <i class="ti ti-clipboard-list"></i>
              <p>No check-ins yet today. Get moving!</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Member</th>
                    <th>ID</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${todayLog.map((a, i) => `
                    <tr>
                      <td style="color:var(--text-muted); font-size:12px;">${todayLog.length - i}</td>
                      <td><strong>${a.memberName}</strong></td>
                      <td><span class="member-id-text">${a.memberId}</span></td>
                      <td>${new Date(a.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

    </div>
  `;
}

// ─── Attach Events ────────────────────────────────────
function attachAttendanceEvents(container) {
  const searchInput = container.querySelector('#checkin-search');

  // Live search as user types
  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    container.innerHTML = buildAttendanceHTML(q);
    attachAttendanceEvents(container);
    // Restore focus at end of input
    const newInput = container.querySelector('#checkin-search');
    newInput.focus();
    newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
  });

  // Check-in buttons
  container.querySelectorAll('.btn-checkin').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = btn.dataset.id;
      const member = members.find(m => m.id === id);
      if (!member) return;

      // Push log entry to attendance array in store
      attendance.push({
        memberId:   member.id,
        memberName: member.name,
        timestamp:  new Date().toISOString(), // Full ISO timestamp
      });

      showToast(`${member.name} checked in!`, 'success');

      // Re-render to show updated log
      const q = container.querySelector('#checkin-search').value;
      container.innerHTML = buildAttendanceHTML(q);
      attachAttendanceEvents(container);
    });
  });
}
