/* ═══════════════════════════════════════════════════
   store.js — API Layer (PHP + MySQL backend)
   ═══════════════════════════════════════════════════ */

export const API_BASE = '/alab/api'; // Palitan kung iba ang folder name mo

export const PLANS = {
  Monthly:   { price: 1500,  months: 1  },
  Quarterly: { price: 4000,  months: 3  },
  Annual:    { price: 14000, months: 12 },
};

// ══════════════════════════════════════
//  API HELPERS
// ══════════════════════════════════════

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`[Alab API] ${endpoint}:`, err);
    throw err;
  }
}

// ══════════════════════════════════════
//  MEMBERS
// ══════════════════════════════════════

export async function getMembers(query = '') {
  const url = query ? `members.php?q=${encodeURIComponent(query)}` : 'members.php';
  return apiFetch(url);
}

export async function addMember(data) {
  return apiFetch('members.php', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteMember(id) {
  return apiFetch(`members.php?id=${id}`, { method: 'DELETE' });
}

export async function updateMember(data) {
  return apiFetch('members.php', { method: 'PUT', body: JSON.stringify(data) });
}

// ══════════════════════════════════════
//  ATTENDANCE
// ══════════════════════════════════════

export async function getTodayAttendance() {
  return apiFetch('attendance.php?today=1');
}

export async function checkIn(memberId) {
  return apiFetch('attendance.php', {
    method: 'POST',
    body: JSON.stringify({ member_id: memberId }),
  });
}

// ══════════════════════════════════════
//  PAYMENTS
// ══════════════════════════════════════

export async function getPayments() {
  return apiFetch('payments.php');
}

export async function addPayment(data) {
  return apiFetch('payments.php', { method: 'POST', body: JSON.stringify(data) });
}

export async function deletePayment(id) {
  return apiFetch(`payments.php?id=${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
//  CLASSES
// ══════════════════════════════════════

export async function getClasses() {
  return apiFetch('classes.php');
}

export async function addClass(data) {
  return apiFetch('classes.php', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteClass(id) {
  return apiFetch(`classes.php?id=${id}`, { method: 'DELETE' });
}

// ══════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════

export async function getDashboardStats() {
  return apiFetch('dashboard.php');
}

// ══════════════════════════════════════
//  UTILITY FUNCTIONS (hindi nagbabago)
// ══════════════════════════════════════

export function getMemberStatus(endDate) {
  if (!endDate) return 'Expired';
  return new Date(endDate) >= new Date() ? 'Active' : 'Expired';
}

export function isExpiringSoon(endDate, days = 14) {
  if (!endDate) return false;
  const end  = new Date(endDate);
  const now  = new Date();
  const diff = (end - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function computeEndDate(startDate, months) {
  const d = new Date(startDate + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

export function showLoading(container, message = 'Loading...') {
  container.innerHTML = `
    <div class="empty-state" style="padding: 60px 0;">
      <i class="ti ti-loader-2" style="animation: spin 1s linear infinite;"></i>
      <p>${message}</p>
    </div>
  `;
}

export function showError(container, message) {
  container.innerHTML = `
    <div class="empty-state" style="padding: 60px 0; color: var(--danger);">
      <i class="ti ti-alert-triangle"></i>
      <p>${message}</p>
    </div>
  `;
}
