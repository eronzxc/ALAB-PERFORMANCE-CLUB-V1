/* ═══════════════════════════════════════════════════
   Members.js — Async version (PHP + MySQL)
   ═══════════════════════════════════════════════════ */

import {
  getMembers, addMember, deleteMember,
  PLANS, getMemberStatus, isExpiringSoon,
  formatDate, computeEndDate, getTodayString,
  showToast, showLoading, showError,
} from '../data/store.js';

let allMembers = [];

export async function renderMembers(container) {
  showLoading(container, 'Loading members...');
  try {
    allMembers = await getMembers();
    container.innerHTML = buildMembersHTML();
    attachEvents(container);
  } catch (err) {
    showError(container, 'Hindi ma-load ang members. Tingnan ang XAMPP connection.');
  }
}

function buildMembersHTML(searchQuery = '') {
  const filtered = allMembers.filter(m => {
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.email||'').toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });

  const activeCount = allMembers.filter(m => getMemberStatus(m.end_date) === 'Active').length;

  const rows = filtered.length === 0
    ? `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">Walang members na nahanap.</td></tr>`
    : filtered.map(m => {
        const status      = getMemberStatus(m.end_date);
        const expiring    = isExpiringSoon(m.end_date);
        const badgeClass  = status === 'Active' ? (expiring ? 'badge-warning' : 'badge-success') : 'badge-danger';
        const badgeLabel  = status === 'Active' ? (expiring ? 'Expiring' : 'Active') : 'Expired';
        return `
          <tr>
            <td><span class="member-id-text">${m.id}</span></td>
            <td><strong>${m.name}</strong></td>
            <td style="color:var(--text-muted); font-size:13px;">${m.email || '—'}</td>
            <td>${m.phone || '—'}</td>
            <td><span class="badge badge-primary">${m.plan}</span></td>
            <td>${formatDate(m.end_date)}</td>
            <td>
              <span class="badge ${badgeClass}">${badgeLabel}</span>
              <button class="btn btn-ghost btn-sm btn-delete-member" data-id="${m.id}" style="margin-left:8px; color:var(--danger);">
                <i class="ti ti-trash"></i>
              </button>
            </td>
          </tr>`;
      }).join('');

  return `
    <div class="page-header">
      <h1 class="page-title">Members</h1>
      <p class="page-subtitle">${allMembers.length} total members · ${activeCount} active</p>
    </div>
    <div class="toolbar">
      <div class="search-wrap">
        <i class="ti ti-search"></i>
        <input type="text" class="form-control" id="member-search" placeholder="Search by name, email, or ID..." value="${searchQuery}" />
      </div>
      <button class="btn btn-primary" id="btn-add-member">
        <i class="ti ti-user-plus"></i> Add Member
      </button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Expires</th><th>Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div class="modal-overlay" id="modal-add-member" style="display:none;">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Add New Member</h3>
          <button class="modal-close" id="btn-close-modal"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-control" id="new-name" placeholder="Juan dela Cruz" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" id="new-email" placeholder="juan@email.com" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" id="new-phone" placeholder="09XXXXXXXXX" />
            </div>
            <div class="form-group">
              <label class="form-label">Plan *</label>
              <select class="form-control" id="new-plan">
                <option value="">Select plan...</option>
                ${Object.entries(PLANS).map(([name, info]) =>
                  `<option value="${name}">${name} — ₱${info.price.toLocaleString()}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input type="date" class="form-control" id="new-startDate" value="${getTodayString()}" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="btn-cancel-modal">Cancel</button>
          <button class="btn btn-primary" id="btn-submit-member">
            <i class="ti ti-user-plus"></i> Add Member
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachEvents(container) {
  // Search
  container.querySelector('#member-search').addEventListener('input', e => {
    const q = e.target.value;
    const tbody = container.querySelector('tbody');
    const filtered = allMembers.filter(m => {
      const ql = q.toLowerCase();
      return m.name.toLowerCase().includes(ql) || (m.email||'').toLowerCase().includes(ql) || m.id.toLowerCase().includes(ql);
    });
    tbody.innerHTML = filtered.length === 0
      ? `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">Walang nahanap.</td></tr>`
      : filtered.map(m => {
          const status     = getMemberStatus(m.end_date);
          const expiring   = isExpiringSoon(m.end_date);
          const badgeClass = status === 'Active' ? (expiring ? 'badge-warning' : 'badge-success') : 'badge-danger';
          const badgeLabel = status === 'Active' ? (expiring ? 'Expiring' : 'Active') : 'Expired';
          return `
            <tr>
              <td><span class="member-id-text">${m.id}</span></td>
              <td><strong>${m.name}</strong></td>
              <td style="color:var(--text-muted); font-size:13px;">${m.email || '—'}</td>
              <td>${m.phone || '—'}</td>
              <td><span class="badge badge-primary">${m.plan}</span></td>
              <td>${formatDate(m.end_date)}</td>
              <td>
                <span class="badge ${badgeClass}">${badgeLabel}</span>
                <button class="btn btn-ghost btn-sm btn-delete-member" data-id="${m.id}" style="margin-left:8px; color:var(--danger);">
                  <i class="ti ti-trash"></i>
                </button>
              </td>
            </tr>`;
        }).join('');
    reattachDeleteButtons(container);
  });

  // Open modal
  container.querySelector('#btn-add-member').addEventListener('click', () => {
    container.querySelector('#modal-add-member').style.display = 'flex';
  });

  // Close modal
  ['btn-close-modal', 'btn-cancel-modal'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('click', () => {
      container.querySelector('#modal-add-member').style.display = 'none';
    });
  });

  // Plan change → auto compute end date hint
  container.querySelector('#new-plan').addEventListener('change', () => {
    // nothing shown but ready for future
  });

  // Submit new member
  container.querySelector('#btn-submit-member').addEventListener('click', async () => {
    const name      = container.querySelector('#new-name').value.trim();
    const email     = container.querySelector('#new-email').value.trim();
    const phone     = container.querySelector('#new-phone').value.trim();
    const plan      = container.querySelector('#new-plan').value;
    const startDate = container.querySelector('#new-startDate').value;

    if (!name || !plan) {
      showToast('Punan ang Name at Plan.', 'error');
      return;
    }

    const endDate = computeEndDate(startDate, PLANS[plan].months);
    const btn = container.querySelector('#btn-submit-member');
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2"></i> Saving...';

    try {
      await addMember({ name, email, phone, plan, start_date: startDate, end_date: endDate, join_date: startDate });
      showToast(`${name} ay naidagdag na!`, 'success');
      allMembers = await getMembers();
      container.innerHTML = buildMembersHTML();
      attachEvents(container);
    } catch (err) {
      showToast(err.message || 'Error sa pag-save.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-user-plus"></i> Add Member';
    }
  });

  reattachDeleteButtons(container);
}

function reattachDeleteButtons(container) {
  container.querySelectorAll('.btn-delete-member').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id     = btn.dataset.id;
      const member = allMembers.find(m => m.id === id);
      if (!confirm(`Tanggalin si ${member?.name}? Hindi na ito mababawi.`)) return;

      try {
        await deleteMember(id);
        allMembers = allMembers.filter(m => m.id !== id);
        showToast('Member ay natanggal na.', 'success');
        container.innerHTML = buildMembersHTML();
        attachEvents(container);
      } catch (err) {
        showToast(err.message || 'Error sa pag-delete.', 'error');
      }
    });
  });
}
