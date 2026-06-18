/* ═══════════════════════════════════════════════════
   main.js — Router / Entry Point (Async version)
   ═══════════════════════════════════════════════════ */

import { renderDashboard  } from './components/Dashboard.js';
import { renderMembers    } from './components/Members.js';
import { renderAttendance } from './components/Attendance.js';
import { renderPayments   } from './components/Payments.js';
import { renderClasses    } from './components/Classes.js';

const PAGES = {
  dashboard:  renderDashboard,
  members:    renderMembers,
  attendance: renderAttendance,
  payments:   renderPayments,
  classes:    renderClasses,
};

let currentPage = 'dashboard';

async function navigateTo(page) {
  if (!PAGES[page]) return;
  currentPage = page;

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  const app = document.getElementById('app');
  app.innerHTML = '';

  try {
    await PAGES[page](app);
  } catch (err) {
    app.innerHTML = `
      <div style="padding:40px; color:#ff4444; font-family:monospace;">
        <h2>⚠️ Error rendering "${page}"</h2>
        <pre style="background:#1a1a1a; padding:16px; border-radius:8px; overflow:auto;">${err.stack || err.message}</pre>
        <p>Siguraduhing nakabukas ang XAMPP (Apache + MySQL) at naka-import ang database.</p>
      </div>
    `;
    console.error(`[Alab] Error in page "${page}":`, err);
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

// Add spinner CSS for loading animation
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

initNavigation();
navigateTo('dashboard');
console.log('🔥 Alab Performance Club — PHP/MySQL Version Loaded');
