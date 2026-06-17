/* ═══════════════════════════════════════════════════
   Classes.js — Class Schedule Management
   ─────────────────────────────────────────────────
   Features:
   - Display class cards with trainer, day, time
   - Capacity bar (green = space, orange = full)
   - Add new class via modal
   ═══════════════════════════════════════════════════ */

import {
  classes,
  generateId,
  showToast,
} from '../data/store.js';

/**
 * renderClasses(container)
 * ─ Main render function called by main.js
 */
export function renderClasses(container) {
  container.innerHTML = buildClassesHTML();
  attachClassesEvents(container);
}

// Days of the week for sorting and display
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ─── Build HTML ───────────────────────────────────────
function buildClassesHTML() {
  // Sort classes by day of week order
  const sorted = [...classes].sort((a, b) =>
    DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return `
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Class Schedule</h1>
      <p class="page-subtitle">${classes.length} classes available this week</p>
    </div>

    <!-- Toolbar -->
    <div class="toolbar" style="justify-content:flex-end; margin-bottom:24px;">
      <button class="btn btn-primary" id="btn-add-class">
        <i class="ti ti-calendar-plus"></i> Add Class
      </button>
    </div>

    <!-- Classes Grid -->
    ${sorted.length === 0 ? `
      <div class="empty-state">
        <i class="ti ti-calendar-off"></i>
        <p>No classes scheduled yet.</p>
      </div>
    ` : `
      <div class="classes-grid">
        ${sorted.map(cls => {
          const fillPercent  = Math.round((cls.enrolled / cls.capacity) * 100);
          const isFull       = cls.enrolled >= cls.capacity;
          const slotsLeft    = cls.capacity - cls.enrolled;

          return `
            <div class="class-card">
              <div class="class-card-top">
                <div>
                  <div class="class-name">${cls.name}</div>
                  <div class="class-trainer"><i class="ti ti-user" style="font-size:12px;"></i> ${cls.trainer}</div>
                </div>
                <span class="badge ${isFull ? 'badge-warning' : 'badge-success'}">
                  ${isFull ? 'Full' : `${slotsLeft} open`}
                </span>
              </div>

              <div class="class-meta">
                <div class="class-meta-item">
                  <i class="ti ti-calendar"></i>
                  <span>${cls.day}</span>
                </div>
                <div class="class-meta-item">
                  <i class="ti ti-clock"></i>
                  <span>${cls.time}</span>
                </div>
                <div class="class-meta-item">
                  <i class="ti ti-users"></i>
                  <span>${cls.enrolled} / ${cls.capacity}</span>
                </div>
              </div>

              <!-- Capacity Progress Bar -->
              <div class="capacity-row">
                <span>Capacity</span>
                <span style="font-weight:600; color:${isFull ? 'var(--accent)' : 'var(--success)'};">${fillPercent}%</span>
              </div>
              <div class="progress">
                <div class="progress-bar ${isFull ? 'full' : ''}" style="width:${fillPercent}%"></div>
              </div>

              <!-- Quick enroll button (demo) -->
              <div style="margin-top:14px; display:flex; gap:8px;">
                ${!isFull ? `
                  <button class="btn btn-ghost btn-sm btn-enroll" data-id="${cls.id}" style="flex:1;">
                    <i class="ti ti-plus"></i> Enroll Member
                  </button>
                ` : `
                  <button class="btn btn-ghost btn-sm" disabled style="flex:1; opacity:0.4; cursor:not-allowed;">
                    <i class="ti ti-ban"></i> Class Full
                  </button>
                `}
                <button class="btn btn-danger btn-sm btn-delete-class" data-id="${cls.id}">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}

    <!-- Add Class Modal -->
    <div class="modal-overlay" id="modal-add-class" style="display:none;">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title"><i class="ti ti-calendar-plus" style="color:var(--accent)"></i> New Class</span>
          <button class="modal-close" id="btn-close-class-modal"><i class="ti ti-x"></i></button>
        </div>

        <div class="form-group">
          <label class="form-label">Class Name *</label>
          <input type="text" class="form-control" id="cls-name" placeholder="e.g. Power Yoga" />
        </div>

        <div class="form-group">
          <label class="form-label">Trainer / Coach *</label>
          <input type="text" class="form-control" id="cls-trainer" placeholder="e.g. Coach Ana" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Day *</label>
            <select class="form-control" id="cls-day">
              <option value="">Select day...</option>
              ${DAY_ORDER.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Time *</label>
            <input type="time" class="form-control" id="cls-time" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Capacity (max participants) *</label>
          <input type="number" class="form-control" id="cls-capacity" placeholder="20" min="1" max="100" />
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" id="btn-cancel-class-modal">Cancel</button>
          <button class="btn btn-primary" id="btn-save-class">
            <i class="ti ti-check"></i> Save Class
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── Attach Events ────────────────────────────────────
function attachClassesEvents(container) {
  // Open modal
  container.querySelector('#btn-add-class').addEventListener('click', () => {
    container.querySelector('#modal-add-class').style.display = 'flex';
  });

  // Close modal
  ['#btn-close-class-modal', '#btn-cancel-class-modal'].forEach(sel => {
    const btn = container.querySelector(sel);
    if (btn) btn.addEventListener('click', () => {
      container.querySelector('#modal-add-class').style.display = 'none';
    });
  });

  // Click outside to close
  container.querySelector('#modal-add-class').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  // Save new class
  container.querySelector('#btn-save-class').addEventListener('click', () => {
    const name     = container.querySelector('#cls-name').value.trim();
    const trainer  = container.querySelector('#cls-trainer').value.trim();
    const day      = container.querySelector('#cls-day').value;
    const rawTime  = container.querySelector('#cls-time').value;
    const capacity = parseInt(container.querySelector('#cls-capacity').value);

    if (!name || !trainer || !day || !rawTime || !capacity) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    // Convert 24h time to 12h format (e.g. "06:00" → "6:00 AM")
    const [h, m] = rawTime.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const timeStr = `${hour12}:${String(m).padStart(2, '0')} ${period}`;

    classes.push({
      id:       generateId('CLS'),
      name,
      trainer,
      day,
      time:     timeStr,
      capacity,
      enrolled: 0, // Starts empty
    });

    showToast(`${name} added to schedule!`, 'success');
    container.innerHTML = buildClassesHTML();
    attachClassesEvents(container);
  });

  // Enroll (demo — just increments counter)
  container.querySelectorAll('.btn-enroll').forEach(btn => {
    btn.addEventListener('click', () => {
      const cls = classes.find(c => c.id === btn.dataset.id);
      if (!cls || cls.enrolled >= cls.capacity) return;
      cls.enrolled += 1;
      showToast(`Enrolled in ${cls.name}!`, 'success');
      container.innerHTML = buildClassesHTML();
      attachClassesEvents(container);
    });
  });

  // Delete class
  container.querySelectorAll('.btn-delete-class').forEach(btn => {
    btn.addEventListener('click', () => {
      const cls = classes.find(c => c.id === btn.dataset.id);
      if (!cls) return;
      if (confirm(`Delete "${cls.name}"? This cannot be undone.`)) {
        const idx = classes.findIndex(c => c.id === cls.id);
        classes.splice(idx, 1);
        showToast(`${cls.name} removed.`, 'danger');
        container.innerHTML = buildClassesHTML();
        attachClassesEvents(container);
      }
    });
  });
}
