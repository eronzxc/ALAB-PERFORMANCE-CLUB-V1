/* ═══════════════════════════════════════════════════
   Payments.js — Async version (PHP + MySQL)
   ═══════════════════════════════════════════════════ */

import {
  getMembers, getPayments, addPayment,
  PLANS, formatDate, formatCurrency,
  getTodayString, showToast, showLoading, showError,
} from '../data/store.js';

let allMembers = [];
let allPayments = [];

export async function renderPayments(container) {
  showLoading(container, 'Loading payments...');
  try {
    [allMembers, allPayments] = await Promise.all([getMembers(), getPayments()]);
    container.innerHTML = buildPaymentsHTML();
    attachPaymentsEvents(container);
  } catch (err) {
    showError(container, 'Hindi ma-load ang payments. Tingnan ang XAMPP.');
  }
}

function buildPaymentsHTML() {
  const totalRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const rows = allPayments.length === 0
    ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">Walang payments pa.</td></tr>`
    : allPayments.map(p => `
        <tr>
          <td><span class="member-id-text">${p.id}</span></td>
          <td><strong>${p.member_name}</strong></td>
          <td><span class="badge badge-primary">${p.plan}</span></td>
          <td style="color:var(--accent); font-weight:700;">${formatCurrency(p.amount)}</td>
          <td>${formatDate(p.date)}</td>
          <td>
            <span class="badge badge-success">${p.method}</span>
          </td>
        </tr>`).join('');

  return `
    <div class="page-header">
      <h1 class="page-title">Payments</h1>
      <p class="page-subtitle">${allPayments.length} transactions · ${formatCurrency(totalRevenue)} total revenue</p>
    </div>
    <div class="grid-2" style="align-items:start;">
      <!-- Record Payment Form -->
      <div>
        <div class="section-label">Record New Payment</div>
        <div class="card">
          <div class="form-group">
            <label class="form-label">Member *</label>
            <select class="form-control" id="pay-member">
              <option value="">Select member...</option>
              ${allMembers.map(m => `<option value="${m.id}" data-plan="${m.plan}">${m.name} (${m.id})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Plan *</label>
            <select class="form-control" id="pay-plan">
              <option value="">Select plan...</option>
              ${Object.entries(PLANS).map(([name, info]) =>
                `<option value="${name}">${name} — ${formatCurrency(info.price)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Amount (₱) *</label>
              <input type="number" class="form-control" id="pay-amount" placeholder="0" readonly
                style="color:var(--accent); font-weight:700; font-size:16px;" />
            </div>
            <div class="form-group">
              <label class="form-label">Method *</label>
              <select class="form-control" id="pay-method">
                <option value="">Select method...</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" class="form-control" id="pay-date" value="${getTodayString()}" />
          </div>
          <button class="btn btn-primary" id="btn-record-payment" style="width:100%;">
            <i class="ti ti-credit-card"></i> Record Payment
          </button>
        </div>
      </div>

      <!-- Payment History -->
      <div>
        <div class="section-label">Payment History</div>
        <div class="card">
          <div class="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Member</th><th>Plan</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachPaymentsEvents(container) {
  // Auto-fill plan based on selected member
  container.querySelector('#pay-member').addEventListener('change', e => {
    const opt  = e.target.selectedOptions[0];
    const plan = opt?.dataset.plan;
    if (plan && PLANS[plan]) {
      container.querySelector('#pay-plan').value    = plan;
      container.querySelector('#pay-amount').value  = PLANS[plan].price;
    }
  });

  // Update amount when plan changes
  container.querySelector('#pay-plan').addEventListener('change', e => {
    const plan = e.target.value;
    container.querySelector('#pay-amount').value = plan && PLANS[plan] ? PLANS[plan].price : '';
  });

  // Record payment
  container.querySelector('#btn-record-payment').addEventListener('click', async () => {
    const memberId = container.querySelector('#pay-member').value;
    const plan     = container.querySelector('#pay-plan').value;
    const method   = container.querySelector('#pay-method').value;
    const date     = container.querySelector('#pay-date').value;

    if (!memberId || !plan || !method) {
      showToast('Punan ang lahat ng required fields.', 'error');
      return;
    }

    const btn = container.querySelector('#btn-record-payment');
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2"></i> Saving...';

    try {
      await addPayment({ member_id: memberId, plan, method, date });
      showToast('Payment ay naitala na!', 'success');
      [allMembers, allPayments] = await Promise.all([getMembers(), getPayments()]);
      container.innerHTML = buildPaymentsHTML();
      attachPaymentsEvents(container);
    } catch (err) {
      showToast(err.message || 'Error sa pag-record.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-credit-card"></i> Record Payment';
    }
  });
}
