/* ============================================================
   SPYCO GROUP PORTAL — app.js
   All application logic: login, navigation, forms,
   SPY COMMS builder/decoder, admin, PWA, Google Drive.
   ============================================================ */

'use strict';

// ── PWA Install ───────────────────────────────────────────────
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const banner = document.getElementById('pwa-banner');
  if (banner) { banner.style.display = 'flex'; }
});

function installPWA() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(() => {
    deferredInstallPrompt = null;
    const banner = document.getElementById('pwa-banner');
    if (banner) banner.style.display = 'none';
  });
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DB.seedAll();
  checkSession();
  updateHeaderDate();
  setInterval(updateHeaderDate, 60000);
});

function checkSession() {
  const session = DB.getSession();
  if (session) {
    showApp(session);
  } else {
    showLogin();
  }
}

// ── Login / Logout ────────────────────────────────────────────
function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  // Reset to sign-in panel
  showSignInPanel();
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  setTimeout(() => document.getElementById('login-user').focus(), 100);
}

function showSignInPanel() {
  const sp = document.getElementById('signin-panel');
  const fp = document.getElementById('forgot-panel');
  if (sp) sp.style.display = 'block';
  if (fp) fp.style.display = 'none';
  const err = document.getElementById('login-error');
  if (err) { err.style.display = 'none'; err.textContent = ''; }
}

function showForgotPanel() {
  const sp = document.getElementById('signin-panel');
  const fp = document.getElementById('forgot-panel');
  if (sp) sp.style.display = 'none';
  if (fp) fp.style.display = 'block';
  // Clear forgot fields
  const fu = document.getElementById('forgot-user');
  if (fu) { fu.value = ''; fu.focus(); }
  const fe = document.getElementById('forgot-error');
  if (fe) { fe.style.display = 'none'; fe.textContent = ''; }
  const fs = document.getElementById('forgot-success');
  if (fs) { fs.style.display = 'none'; fs.textContent = ''; }
  const fr = document.getElementById('forgot-result');
  if (fr) fr.style.display = 'none';
}

function doForgotPassword() {
  const username = (document.getElementById('forgot-user')?.value || '').trim();
  const errEl    = document.getElementById('forgot-error');
  const sucEl    = document.getElementById('forgot-success');
  const resBox   = document.getElementById('forgot-result');
  const resContent = document.getElementById('forgot-result-content');

  // Hide previous messages
  if (errEl)  { errEl.style.display = 'none';  errEl.textContent = ''; }
  if (sucEl)  { sucEl.style.display = 'none';  sucEl.textContent = ''; }
  if (resBox) resBox.style.display = 'none';

  if (!username) {
    if (errEl) { errEl.textContent = 'Please enter your username.'; errEl.style.display = 'block'; }
    return;
  }

  // Look up user
  const users = DB.getUsers();
  const user  = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    if (errEl) {
      errEl.textContent = 'No account found with that username. Please check and try again, or contact your administrator.';
      errEl.style.display = 'block';
    }
    return;
  }

  // User found — show reset options
  if (sucEl) {
    sucEl.textContent = `✓ Account found for "${user.display || user.username}".`;
    sucEl.style.display = 'block';
  }

  if (resBox && resContent) {
    resBox.style.display = 'block';

    // Build reset instructions based on role
    const isAdmin = user.role === 'admin';
    resContent.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">

        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:28px;height:28px;background:rgba(233,69,96,0.15);border:1px solid rgba(233,69,96,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;">1</div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:0.88rem;margin-bottom:3px;">Contact your Administrator</div>
            <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6;">Ask <strong style="color:var(--gold);">Peter</strong> or <strong style="color:var(--gold);">Admin</strong> to reset your password from the <strong>Admin → Users</strong> section of the portal.</div>
          </div>
        </div>

        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:28px;height:28px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;">2</div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:0.88rem;margin-bottom:3px;">Email the Admin</div>
            <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6;">Send a password reset request to your Spyco Group administrator.</div>
            <a href="mailto:admin@spyco.com.au?subject=Password Reset Request — ${encodeURIComponent(user.username)}&body=Hi,%0A%0APlease reset the password for my Spyco Portal account.%0A%0AUsername: ${encodeURIComponent(user.username)}%0ADisplay Name: ${encodeURIComponent(user.display || user.username)}%0A%0AThank you."
              style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:7px 14px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:7px;color:#7dd3fc;font-size:0.78rem;font-weight:700;text-decoration:none;transition:background 0.2s;"
              onmouseover="this.style.background='rgba(59,130,246,0.25)'"
              onmouseout="this.style.background='rgba(59,130,246,0.15)'">
              ✉️ Send Email to Admin
            </a>
          </div>
        </div>

        ${isAdmin ? `
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="width:28px;height:28px;background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;flex-shrink:0;">3</div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:0.88rem;margin-bottom:3px;">Admin Self-Reset</div>
            <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.6;">As an admin, you can reset your own password directly here.</div>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
              <input type="password" id="self-reset-pw" placeholder="New password (min 6 chars)"
                style="padding:9px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:0.85rem;width:100%;box-sizing:border-box;" />
              <input type="password" id="self-reset-pw2" placeholder="Confirm new password"
                style="padding:9px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#fff;font-size:0.85rem;width:100%;box-sizing:border-box;" />
              <button onclick="doSelfReset('${user.id}')"
                style="padding:9px 16px;background:rgba(245,166,35,0.2);border:1px solid rgba(245,166,35,0.4);border-radius:8px;color:#fcd34d;font-size:0.82rem;font-weight:700;cursor:pointer;transition:background 0.2s;"
                onmouseover="this.style.background='rgba(245,166,35,0.3)'"
                onmouseout="this.style.background='rgba(245,166,35,0.2)'">
                🔑 Reset My Password
              </button>
              <div id="self-reset-fb" style="font-size:0.78rem;display:none;"></div>
            </div>
          </div>
        </div>
        ` : ''}

      </div>
    `;
  }
}

function doSelfReset(userId) {
  const pw1 = document.getElementById('self-reset-pw')?.value || '';
  const pw2 = document.getElementById('self-reset-pw2')?.value || '';
  const fb  = document.getElementById('self-reset-fb');

  if (!pw1 || pw1.length < 6) {
    if (fb) { fb.textContent = '⚠ Password must be at least 6 characters.'; fb.style.color = '#fca5a5'; fb.style.display = 'block'; }
    return;
  }
  if (pw1 !== pw2) {
    if (fb) { fb.textContent = '⚠ Passwords do not match.'; fb.style.color = '#fca5a5'; fb.style.display = 'block'; }
    return;
  }

  DB.updateUser(userId, { password: pw1 });
  if (fb) { fb.textContent = '✓ Password updated! You can now sign in.'; fb.style.color = '#86efac'; fb.style.display = 'block'; }

  // Auto-redirect to sign in after 2s
  setTimeout(() => {
    showSignInPanel();
    const u = DB.getUsers().find(x => x.id === userId);
    if (u) document.getElementById('login-user').value = u.username;
  }, 2000);
}

function doLogin() {
  const username = (document.getElementById('login-user')?.value || '').trim();
  const password = document.getElementById('login-pass')?.value || '';
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

  if (!username || !password) {
    if (errEl) { errEl.textContent = '⚠ Please enter your username and password.'; errEl.style.display = 'block'; }
    return;
  }

  // Brief loading state
  if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }

  setTimeout(() => {
    const user = DB.findUser(username, password);
    if (!user) {
      if (errEl) { errEl.textContent = '⚠ Incorrect username or password. Please try again.'; errEl.style.display = 'block'; }
      if (btn)   { btn.textContent = 'Sign In →'; btn.disabled = false; }
      const passEl = document.getElementById('login-pass');
      if (passEl) { passEl.value = ''; passEl.focus(); }
      return;
    }

    if (btn) { btn.textContent = '✓ Signed in!'; }
    DB.setSession(user);
    DB.logActivity(`${user.display} signed in`, '#22c55e');

    setTimeout(() => {
      if (btn) { btn.textContent = 'Sign In →'; btn.disabled = false; }
      showApp(user);
    }, 400);
  }, 300);
}

function doLogout() {
  const session = DB.getSession();
  if (session) DB.logActivity(`${session.display} signed out`, '#9a9ab0');
  DB.clearSession();
  showLogin();
}

function showApp(user) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'grid';

  // Set user info in sidebar
  document.getElementById('user-display').textContent = user.display || user.username;
  document.getElementById('user-role-label').textContent = user.role === 'admin' ? '⭐ Admin' : '👤 User';
  document.getElementById('user-avatar').textContent = (user.display || user.username).charAt(0).toUpperCase();
  document.getElementById('header-user').textContent = user.display || user.username;

  // Show/hide admin nav
  const adminNav = document.getElementById('admin-nav');
  if (adminNav) adminNav.style.display = user.role === 'admin' ? 'flex' : 'none';

  // Set greeting
  const hour = new Date().getHours();
  const greetEl = document.getElementById('greeting-time');
  if (greetEl) {
    greetEl.textContent = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  }
  const nameEl = document.getElementById('greeting-name');
  if (nameEl) nameEl.textContent = (user.display || user.username).split(' ')[0];

  // Load dashboard
  showPage('dashboard', document.querySelector('.nav-item.active') || document.querySelector('.nav-item'));
  loadDashboardStats();
  renderActivityFeed();

  // Set today's date on builder
  const today = new Date().toISOString().split('T')[0];
  const bDate = document.getElementById('b-date');
  if (bDate && !bDate.value) bDate.value = today;
  const docDate = document.getElementById('doc-date');
  if (docDate && !docDate.value) docDate.value = today;
  const invDate = document.getElementById('inv-date');
  if (invDate && !invDate.value) invDate.value = today;
  const emDate = document.getElementById('em-date');
  if (emDate && !emDate.value) emDate.value = today;

  // Render all data
  renderProperties();
  renderContacts();
  renderProjects();
  renderInvoices();
  renderDocuments();
  renderCustomSuppliers();
  renderReference();
  renderUsers();
  buildSubject();
}

// ── Header Date ───────────────────────────────────────────────
function updateHeaderDate() {
  const el = document.getElementById('header-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Page Navigation ───────────────────────────────────────────
function showPage(pageId, navEl) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Remove active from all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target page
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  // Activate nav item
  if (navEl) navEl.classList.add('active');

  // Update header title
  const titles = {
    dashboard:  'Dashboard',
    properties: 'Properties',
    contacts:   'Suppliers',
    projects:   'Projects',
    invoices:   'Invoices',
    documents:  'Documents',
    comms:      'SPY COMMS',
    drive:      'Google Drive',
    admin:      'Admin',
  };
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) {
    headerTitle.innerHTML = (titles[pageId] || pageId) + ' <span id="header-sub"></span>';
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }

  // Refresh page-specific data
  if (pageId === 'dashboard') { loadDashboardStats(); renderActivityFeed(); }
  if (pageId === 'properties') renderProperties();
  if (pageId === 'contacts') renderContacts();
  if (pageId === 'projects') renderProjects();
  if (pageId === 'invoices') renderInvoices();
  if (pageId === 'documents') renderDocuments();
  if (pageId === 'admin') renderUsers();
  if (pageId === 'comms') { renderCustomSuppliers(); renderReference(); }
  if (pageId === 'email') { renderEmailLog(); buildEmailSubject(); }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Dashboard ─────────────────────────────────────────────────
function loadDashboardStats() {
  const props = DB.getProperties();
  const tenanted = props.filter(p => p.status === 'Tenanted').length;
  const projects = DB.getProjects().filter(p => !['Complete'].includes(p.status)).length;
  const invoices = DB.getInvoices().filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;
  const contacts = DB.getContacts().length;

  setText('stat-tenanted', tenanted);
  setText('stat-projects', projects);
  setText('stat-invoices', invoices);
  setText('stat-contacts', contacts);

  // Update property snapshot table
  const snap = document.querySelector('#page-dashboard .data-table tbody');
  if (snap) {
    const recent = props.slice(0, 5);
    snap.innerHTML = recent.map(p => `
      <tr>
        <td>${esc(p.address.split(',')[0])}</td>
        <td>${statusBadge(p.status)}</td>
        <td>${esc(p.entity)}</td>
      </tr>
    `).join('');
  }
}

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  const activities = DB.getActivity();
  if (!activities.length) return;

  const colors = { '#22c55e': '#22c55e', '#f5a623': '#f5a623', '#e94560': '#e94560', '#9a9ab0': '#9a9ab0' };
  feed.innerHTML = activities.slice(0, 8).map(a => {
    const color = colors[a.color] || '#e94560';
    const time = timeAgo(a.time);
    return `<div class="activity-item">
      <div class="activity-dot" style="background:${color};"></div>
      <div>
        <div class="activity-text">${esc(a.text)}</div>
        <div class="activity-time">${time}</div>
      </div>
    </div>`;
  }).join('');
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Properties ────────────────────────────────────────────────
function renderProperties() {
  const tbody = document.getElementById('properties-tbody');
  if (!tbody) return;
  const props = DB.getProperties();
  if (!props.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px;">No properties yet. Click + Add Property to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = props.map(p => `
    <tr>
      <td><span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">${esc(p.code)}</span></td>
      <td>${esc(p.address)}</td>
      <td><span class="badge badge-grey">${esc(p.entity)}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td>${esc(p.tenant) || '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>${p.rent ? '$' + Number(p.rent).toLocaleString() + '/wk' : '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>${p.leaseEnd ? formatDate(p.leaseEnd) : '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editProperty('${p.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteProperty('${p.id}')" style="color:var(--danger);">🗑</button>
      </td>
    </tr>
  `).join('');
}

function saveProperty() {
  const code    = val('p-code');
  const address = val('p-address');
  if (!code || !address) { alert('Site Code and Address are required.'); return; }

  const prop = {
    code, address,
    entity:     val('p-entity'),
    status:     val('p-status'),
    tenant:     val('p-tenant'),
    rent:       val('p-rent'),
    leaseStart: val('p-lease-start'),
    leaseEnd:   val('p-lease-end'),
    notes:      val('p-notes'),
  };

  const editId = document.getElementById('property-modal').dataset.editId;
  if (editId) {
    DB.updateProperty(editId, prop);
    DB.logActivity(`Property updated — ${address}`, '#f5a623');
    delete document.getElementById('property-modal').dataset.editId;
    document.querySelector('#property-modal .modal-title').textContent = 'Add Property';
  } else {
    DB.addProperty(prop);
    DB.logActivity(`Property added — ${address}`, '#22c55e');
  }

  closeModal('property-modal');
  clearForm(['p-code','p-address','p-tenant','p-rent','p-lease-start','p-lease-end','p-notes']);
  renderProperties();
  loadDashboardStats();
}

function editProperty(id) {
  const p = DB.getProperties().find(x => x.id === id);
  if (!p) return;
  setVal('p-code', p.code);
  setVal('p-address', p.address);
  setVal('p-entity', p.entity);
  setVal('p-status', p.status);
  setVal('p-tenant', p.tenant);
  setVal('p-rent', p.rent);
  setVal('p-lease-start', p.leaseStart);
  setVal('p-lease-end', p.leaseEnd);
  setVal('p-notes', p.notes);
  document.getElementById('property-modal').dataset.editId = id;
  document.querySelector('#property-modal .modal-title').textContent = 'Edit Property';
  openModal('property-modal');
}

function deleteProperty(id) {
  const p = DB.getProperties().find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete property "${p.address}"? This cannot be undone.`)) return;
  DB.deleteProperty(id);
  DB.logActivity(`Property deleted — ${p.address}`, '#e94560');
  renderProperties();
  loadDashboardStats();
}

// ── Contacts ──────────────────────────────────────────────────
function renderContacts() {
  const tbody = document.getElementById('contacts-tbody');
  if (!tbody) return;
  const contacts = DB.getContacts();
  if (!contacts.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px;">No contacts yet.</td></tr>';
    return;
  }
  tbody.innerHTML = contacts.map(c => `
    <tr>
      <td><span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">[${esc(c.code)}]</span></td>
      <td><strong>${esc(c.name)}</strong>${c.person ? '<br><span style="font-size:0.78rem;color:var(--text-muted);">' + esc(c.person) + '</span>' : ''}</td>
      <td><span class="badge badge-grey">${esc(c.category)}</span></td>
      <td>${c.phone ? '<a href="tel:' + esc(c.phone) + '" style="color:var(--info);">' + esc(c.phone) + '</a>' : ''}${c.email ? '<br><a href="mailto:' + esc(c.email) + '" style="color:var(--info);font-size:0.8rem;">' + esc(c.email) + '</a>' : ''}</td>
      <td style="font-size:0.82rem;color:var(--text-muted);">${esc(c.notes) || '—'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editContact('${c.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteContact('${c.id}')" style="color:var(--danger);">🗑</button>
      </td>
    </tr>
  `).join('');
}

function saveContact() {
  const code = val('c-code');
  const name = val('c-name');
  if (!code || !name) { alert('Code and Name are required.'); return; }

  const contact = {
    code: code.toUpperCase(), name,
    category: val('c-category'),
    phone:    val('c-phone'),
    email:    val('c-email'),
    person:   val('c-person'),
    notes:    val('c-notes'),
  };

  const editId = document.getElementById('contact-modal').dataset.editId;
  if (editId) {
    DB.updateContact(editId, contact);
    DB.logActivity(`Contact updated — ${name}`, '#f5a623');
    delete document.getElementById('contact-modal').dataset.editId;
    document.querySelector('#contact-modal .modal-title').textContent = 'Add Contact';
  } else {
    DB.addContact(contact);
    DB.logActivity(`Contact added — ${name}`, '#22c55e');
  }

  closeModal('contact-modal');
  clearForm(['c-code','c-name','c-phone','c-email','c-person','c-notes']);
  renderContacts();
  loadDashboardStats();
}

function editContact(id) {
  const c = DB.getContacts().find(x => x.id === id);
  if (!c) return;
  setVal('c-code', c.code);
  setVal('c-name', c.name);
  setVal('c-category', c.category);
  setVal('c-phone', c.phone);
  setVal('c-email', c.email);
  setVal('c-person', c.person);
  setVal('c-notes', c.notes);
  document.getElementById('contact-modal').dataset.editId = id;
  document.querySelector('#contact-modal .modal-title').textContent = 'Edit Contact';
  openModal('contact-modal');
}

function deleteContact(id) {
  const c = DB.getContacts().find(x => x.id === id);
  if (!c) return;
  if (!confirm(`Delete contact "${c.name}"?`)) return;
  DB.deleteContact(id);
  DB.logActivity(`Contact deleted — ${c.name}`, '#e94560');
  renderContacts();
  loadDashboardStats();
}

// ── Projects ──────────────────────────────────────────────────
function renderProjects() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;
  const projects = DB.getProjects();
  if (!projects.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">No projects yet. Click + Add Project to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = projects.map(p => `
    <tr>
      <td><strong>${esc(p.name)}</strong>${p.type ? '<br><span style="font-size:0.78rem;color:var(--text-muted);">' + esc(p.type) + '</span>' : ''}</td>
      <td><span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">${esc(p.site)}</span></td>
      <td><span class="badge badge-grey">${esc(p.entity)}</span></td>
      <td>${projectStatusBadge(p.status)}</td>
      <td>${p.start ? formatDate(p.start) : '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>${p.due ? formatDate(p.due) : '<span style="color:var(--text-muted);">—</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editProject('${p.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteProject('${p.id}')" style="color:var(--danger);">🗑</button>
      </td>
    </tr>
  `).join('');
}

function saveProject() {
  const name = val('pr-name');
  if (!name) { alert('Project name is required.'); return; }

  const proj = {
    name,
    site:   val('pr-site'),
    entity: val('pr-entity'),
    status: val('pr-status'),
    type:   val('pr-type'),
    start:  val('pr-start'),
    due:    val('pr-due'),
    budget: val('pr-budget'),
    notes:  val('pr-notes'),
  };

  const editId = document.getElementById('project-modal').dataset.editId;
  if (editId) {
    DB.updateProject(editId, proj);
    DB.logActivity(`Project updated — ${name}`, '#f5a623');
    delete document.getElementById('project-modal').dataset.editId;
    document.querySelector('#project-modal .modal-title').textContent = 'Add Project';
  } else {
    DB.addProject(proj);
    DB.logActivity(`Project added — ${name}`, '#22c55e');
  }

  closeModal('project-modal');
  clearForm(['pr-name','pr-start','pr-due','pr-budget','pr-notes']);
  renderProjects();
  loadDashboardStats();
}

function editProject(id) {
  const p = DB.getProjects().find(x => x.id === id);
  if (!p) return;
  setVal('pr-name', p.name);
  setVal('pr-site', p.site);
  setVal('pr-entity', p.entity);
  setVal('pr-status', p.status);
  setVal('pr-type', p.type);
  setVal('pr-start', p.start);
  setVal('pr-due', p.due);
  setVal('pr-budget', p.budget);
  setVal('pr-notes', p.notes);
  document.getElementById('project-modal').dataset.editId = id;
  document.querySelector('#project-modal .modal-title').textContent = 'Edit Project';
  openModal('project-modal');
}

function deleteProject(id) {
  const p = DB.getProjects().find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete project "${p.name}"?`)) return;
  DB.deleteProject(id);
  DB.logActivity(`Project deleted — ${p.name}`, '#e94560');
  renderProjects();
  loadDashboardStats();
}

// ── Invoices ──────────────────────────────────────────────────
function renderInvoices() {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;
  const invoices = DB.getInvoices();
  if (!invoices.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">No invoices yet. Click + Add Invoice to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = invoices.map(inv => `
    <tr>
      <td>${inv.date ? formatDate(inv.date) : '—'}</td>
      <td><strong>${esc(inv.supplier)}</strong>${inv.desc ? '<br><span style="font-size:0.78rem;color:var(--text-muted);">' + esc(inv.desc) + '</span>' : ''}</td>
      <td><span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">${esc(inv.site)}</span></td>
      <td><strong style="color:var(--success);">$${Number(inv.amount || 0).toLocaleString('en-AU', {minimumFractionDigits:2})}</strong></td>
      <td>${invoiceStatusBadge(inv.status)}</td>
      <td style="font-family:var(--mono);font-size:0.75rem;color:var(--text-muted);">${inv.commsRef || '—'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editInvoice('${inv.id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteInvoice('${inv.id}')" style="color:var(--danger);">🗑</button>
      </td>
    </tr>
  `).join('');
}

function saveInvoice() {
  const supplier = val('inv-supplier');
  const amount   = val('inv-amount');
  if (!supplier) { alert('Supplier is required.'); return; }

  const inv = {
    date:     val('inv-date'),
    supplier,
    site:     val('inv-site'),
    entity:   val('inv-entity'),
    amount:   amount || '0',
    status:   val('inv-status'),
    desc:     val('inv-desc'),
    notes:    val('inv-notes'),
    commsRef: '',
  };

  const editId = document.getElementById('invoice-modal').dataset.editId;
  if (editId) {
    DB.updateInvoice(editId, inv);
    DB.logActivity(`Invoice updated — ${supplier} $${Number(amount).toLocaleString()}`, '#f5a623');
    delete document.getElementById('invoice-modal').dataset.editId;
    document.querySelector('#invoice-modal .modal-title').textContent = 'Add Invoice';
  } else {
    DB.addInvoice(inv);
    DB.logActivity(`Invoice added — ${supplier} $${Number(amount).toLocaleString()}`, '#22c55e');
  }

  closeModal('invoice-modal');
  clearForm(['inv-supplier','inv-amount','inv-desc','inv-notes']);
  renderInvoices();
  loadDashboardStats();
}

function editInvoice(id) {
  const inv = DB.getInvoices().find(x => x.id === id);
  if (!inv) return;
  setVal('inv-date', inv.date);
  setVal('inv-supplier', inv.supplier);
  setVal('inv-site', inv.site);
  setVal('inv-entity', inv.entity);
  setVal('inv-amount', inv.amount);
  setVal('inv-status', inv.status);
  setVal('inv-desc', inv.desc);
  setVal('inv-notes', inv.notes);
  document.getElementById('invoice-modal').dataset.editId = id;
  document.querySelector('#invoice-modal .modal-title').textContent = 'Edit Invoice';
  openModal('invoice-modal');
}

function deleteInvoice(id) {
  const inv = DB.getInvoices().find(x => x.id === id);
  if (!inv) return;
  if (!confirm(`Delete invoice from "${inv.supplier}"?`)) return;
  DB.deleteInvoice(id);
  DB.logActivity(`Invoice deleted — ${inv.supplier}`, '#e94560');
  renderInvoices();
  loadDashboardStats();
}

// ── Documents ─────────────────────────────────────────────────
function renderDocuments() {
  const docs = DB.getDocuments();
  const empty = document.getElementById('docs-empty');
  const table = document.getElementById('docs-table');
  const tbody = document.getElementById('docs-tbody');
  if (!tbody) return;

  if (!docs.length) {
    if (empty) empty.classList.remove('hidden');
    if (table) table.classList.add('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  if (table) table.classList.remove('hidden');

  tbody.innerHTML = docs.map(d => `
    <tr>
      <td>${d.date ? formatDate(d.date) : '—'}</td>
      <td style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">${esc(d.name)}</td>
      <td>${esc(d.site) || '—'}</td>
      <td>${esc(d.system) || '—'}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="deleteDocument('${d.id}')" style="color:var(--danger);">🗑</button></td>
    </tr>
  `).join('');
}

function buildDocName() {
  const desc    = val('doc-desc');
  const dateRaw = val('doc-date');
  const subject = val('doc-subject');
  const system  = val('doc-system');
  const entity  = val('doc-entity');
  const site    = val('doc-site');

  const SEP = '  ';
  const parts = [];
  if (desc)    parts.push(desc);
  if (dateRaw) parts.push(fmtDate(dateRaw));
  if (subject) parts.push(subject);
  if (system)  parts.push(system);
  if (entity)  parts.push(entity);
  if (site)    parts.push(site);

  const out = document.getElementById('doc-name-output');
  if (!out) return;
  if (!parts.length) { out.textContent = 'Fill in the fields above…'; return; }
  out.textContent = parts.join(SEP);
}

function copyDocName() {
  const out = document.getElementById('doc-name-output');
  if (!out || out.textContent === 'Fill in the fields above…') return;
  copyToClipboard(out.textContent);
  flashFeedback('doc-copy-fb', '✓ Copied!');

  // Log the document
  const name = out.textContent;
  const dateRaw = val('doc-date');
  const site = val('doc-site');
  const system = val('doc-system');
  DB.addDocument({ name, date: dateRaw, site, system });
  DB.logActivity(`Document named — ${name.substring(0, 40)}`, '#22c55e');
  renderDocuments();
}

function deleteDocument(id) {
  if (!confirm('Remove this document from the log?')) return;
  DB.deleteDocument(id);
  renderDocuments();
}

// ── SPY COMMS Builder ─────────────────────────────────────────
const SEP = '\u00a0\u00a0\u2014\u00a0\u00a0'; // "  —  " with non-breaking spaces
const FSEP = '  ';

function buildSubject() {
  const desc     = val('b-desc');
  const dateRaw  = val('b-date');
  const subject  = val('b-subject');
  const system   = val('b-system');
  const entity   = val('b-structure');
  const site     = val('b-site');
  const supplier = val('b-supplier');
  const fy       = val('b-fy');

  const parts = [];
  if (dateRaw) parts.push(fmtDate(dateRaw));
  if (subject) parts.push(subject);
  if (system)  parts.push(system);
  if (entity)  parts.push(entity);
  if (site)    parts.push(site);
  if (supplier) parts.push(supplier);
  if (fy)      parts.push(fy);

  const outEl = document.getElementById('output-subject');
  const fnEl  = document.getElementById('output-filename');
  const fnBox = document.getElementById('filename-box');

  if (!parts.length && !desc) {
    if (outEl) outEl.textContent = '';
    if (fnEl)  fnEl.textContent  = '';
    return;
  }

  const codeStr = parts.join('\u00a0\u00a0');
  const subject_line = desc
    ? desc + SEP + codeStr
    : codeStr;

  if (outEl) outEl.textContent = subject_line;

  // File name: replace special chars
  const filename = subject_line
    .replace(/\u00a0/g, ' ')
    .replace(/[<>:"/\\|?*]/g, '')
    .trim();

  if (fnEl) fnEl.textContent = filename;
  if (fnBox) fnBox.style.display = parts.length ? 'block' : 'none';
}

function copySubject() {
  const out = document.getElementById('output-subject');
  if (!out || !out.textContent) return;
  copyToClipboard(out.textContent);
  flashFeedback('copy-fb', '✓ Copied!');
  DB.logActivity(`Subject copied — ${out.textContent.substring(0, 50)}`, '#22c55e');
}

function copyFilename() {
  const out = document.getElementById('output-filename');
  if (!out || !out.textContent) return;
  copyToClipboard(out.textContent);
  flashFeedback('copy-fn-fb', '✓ Copied!');
}

function resetBuilder() {
  ['b-desc','b-date','b-subject','b-system','b-structure','b-site','b-supplier','b-fy'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  // Reset date to today
  const today = new Date().toISOString().split('T')[0];
  const bDate = document.getElementById('b-date');
  if (bDate) bDate.value = today;
  buildSubject();
}

// ── SPY COMMS Decoder ─────────────────────────────────────────
function decodeSubject() {
  const input = document.getElementById('decode-input');
  const results = document.getElementById('decode-results');
  if (!input || !results) return;

  const text = input.value.trim();
  if (!text) { results.innerHTML = ''; return; }

  // Build full lookup map
  const allCodes = {};
  COMMS_DB.subjects.forEach(x => { allCodes[x.code] = { label: x.label, desc: x.desc, type: 'Subject' }; });
  COMMS_DB.systems.forEach(x => { allCodes[x.code] = { label: x.label, desc: x.desc, type: 'System' }; });
  COMMS_DB.entities.forEach(x => { allCodes[x.code] = { label: x.label, desc: x.desc, type: 'Entity' }; });
  COMMS_DB.sites.forEach(x => { allCodes[x.code] = { label: x.label, desc: x.desc, type: 'Site' }; });
  COMMS_DB.suppliers.forEach(x => { allCodes[x.code] = { label: x.label, desc: x.desc, type: x.category }; });
  DB.getCustomSuppliers().forEach(x => { allCodes['[' + x.code + ']'] = { label: x.name, desc: x.desc || '', type: x.category }; });

  // Extract date
  const dateMatch = text.match(/\b(\d{2})(\d{2})(\d{2})\b/);
  let dateStr = '';
  if (dateMatch) {
    const [, yy, mm, dd] = dateMatch;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const mIdx = parseInt(mm, 10) - 1;
    dateStr = `${dd} ${months[mIdx] || mm} 20${yy}`;
  }

  // Extract description (before the em dash)
  let desc = '';
  const dashIdx = text.indexOf('—');
  if (dashIdx > 0) {
    desc = text.substring(0, dashIdx).trim();
  }

  // Find all matching codes
  const found = [];
  Object.keys(allCodes).forEach(code => {
    if (text.includes(code)) {
      found.push({ code, ...allCodes[code] });
    }
  });

  // Build output
  let html = '<div style="display:flex;flex-direction:column;gap:10px;">';

  if (desc) {
    html += `<div style="background:var(--input-bg);border:1px solid var(--card-border);border-radius:var(--radius);padding:12px 16px;">
      <div style="font-size:0.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Description</div>
      <div style="color:var(--text);font-size:0.95rem;">${esc(desc)}</div>
    </div>`;
  }

  if (dateStr) {
    html += `<div style="background:var(--input-bg);border:1px solid var(--card-border);border-radius:var(--radius);padding:12px 16px;">
      <div style="font-size:0.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date</div>
      <div style="color:var(--gold);font-family:var(--mono);">${dateStr}</div>
    </div>`;
  }

  if (found.length) {
    found.forEach(f => {
      const typeColors = {
        'Subject': '#e94560', 'System': '#3b82f6', 'Entity': '#f5a623',
        'Site': '#22c55e', 'Banking': '#a855f7', 'Utility': '#06b6d4',
        'Legal': '#f97316', 'Accounting': '#84cc16', 'Agent': '#ec4899',
        'Trade': '#14b8a6', 'Planning': '#8b5cf6', 'Survey': '#0ea5e9',
        'Architect': '#f59e0b', 'Certifier': '#10b981', 'Government': '#6366f1',
        'Other': '#9a9ab0',
      };
      const color = typeColors[f.type] || '#9a9ab0';
      html += `<div style="background:var(--input-bg);border:1px solid var(--card-border);border-radius:var(--radius);padding:12px 16px;display:flex;align-items:flex-start;gap:12px;">
        <span style="font-family:var(--mono);font-size:0.82rem;color:${color};background:${color}22;padding:3px 8px;border-radius:4px;white-space:nowrap;">${esc(f.code)}</span>
        <div>
          <div style="font-weight:700;color:var(--text);font-size:0.9rem;">${esc(f.label)}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${esc(f.type)}${f.desc ? ' — ' + esc(f.desc) : ''}</div>
        </div>
      </div>`;
    });
  }

  if (!desc && !dateStr && !found.length) {
    html += `<div style="text-align:center;color:var(--text-muted);padding:24px;">No recognised codes found in this subject line.</div>`;
  }

  html += '</div>';
  results.innerHTML = html;
}

// ── SPY COMMS Reference ───────────────────────────────────────
function renderReference() {
  const container = document.getElementById('ref-content');
  if (!container) return;

  const customSuppliers = DB.getCustomSuppliers();

  const sections = [
    {
      title: '📌 Subject Categories',
      color: '#e94560',
      items: COMMS_DB.subjects.map(x => ({ code: x.code, label: x.label, desc: x.desc })),
    },
    {
      title: '🗂 Systems',
      color: '#3b82f6',
      items: COMMS_DB.systems.map(x => ({ code: x.code, label: x.label, desc: x.desc })),
    },
    {
      title: '🏢 Entities',
      color: '#f5a623',
      items: COMMS_DB.entities.map(x => ({ code: x.code, label: x.label, desc: x.desc })),
    },
    {
      title: '📍 Sites',
      color: '#22c55e',
      items: COMMS_DB.sites.map(x => ({ code: x.code, label: x.label, desc: x.desc })),
    },
    {
      title: '🔧 Suppliers',
      color: '#a855f7',
      items: COMMS_DB.suppliers.map(x => ({ code: x.code, label: x.label, desc: `${x.category} — ${x.desc}` })),
    },
  ];

  if (customSuppliers.length) {
    sections.push({
      title: '⭐ Custom Suppliers',
      color: '#f5a623',
      items: customSuppliers.map(x => ({ code: '[' + x.code + ']', label: x.name, desc: `${x.category}${x.desc ? ' — ' + x.desc : ''}` })),
    });
  }

  container.innerHTML = sections.map(sec => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-title" style="color:${sec.color};">${sec.title}</div>
      <table class="data-table">
        <thead><tr><th>Code</th><th>Name</th><th>Description</th></tr></thead>
        <tbody>
          ${sec.items.map(item => `
            <tr>
              <td><span style="font-family:var(--mono);font-size:0.82rem;color:${sec.color};background:${sec.color}22;padding:2px 8px;border-radius:4px;">${esc(item.code)}</span></td>
              <td><strong>${esc(item.label)}</strong></td>
              <td style="color:var(--text-muted);font-size:0.82rem;">${esc(item.desc)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function filterReference(query) {
  const q = query.toLowerCase();
  const container = document.getElementById('ref-content');
  if (!container) return;
  container.querySelectorAll('tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
}

// ── SPY COMMS Tabs ────────────────────────────────────────────
function switchCommsTab(tabId, btn) {
  document.querySelectorAll('#page-comms .tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#page-comms .tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('comms-' + tabId);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');

  if (tabId === 'reference') renderReference();
  if (tabId === 'manage-suppliers') renderCustomSuppliers();
}

// ── Custom Suppliers ──────────────────────────────────────────
function renderCustomSuppliers() {
  const suppliers = DB.getCustomSuppliers();
  const tbody = document.getElementById('custom-sup-tbody');
  const table = document.getElementById('custom-sup-table');
  const empty = document.getElementById('no-custom-msg');

  if (!tbody) return;

  if (!suppliers.length) {
    if (empty) empty.classList.remove('hidden');
    if (table) table.classList.add('hidden');
  } else {
    if (empty) empty.classList.add('hidden');
    if (table) table.classList.remove('hidden');
    tbody.innerHTML = suppliers.map(s => `
      <tr>
        <td><span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold);">[${esc(s.code)}]</span></td>
        <td><strong>${esc(s.name)}</strong></td>
        <td><span class="badge badge-grey">${esc(s.category)}</span></td>
        <td style="font-size:0.82rem;color:var(--text-muted);">${esc(s.desc) || '—'}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="deleteCustomSupplier('${s.id}')" style="color:var(--danger);">🗑</button></td>
      </tr>
    `).join('');
  }

  // Update the supplier dropdown in the builder
  const group = document.getElementById('custom-supplier-group');
  if (group) {
    group.innerHTML = suppliers.map(s =>
      `<option value="[${esc(s.code)}]">[${esc(s.code)}] — ${esc(s.name)}</option>`
    ).join('');
    group.style.display = suppliers.length ? '' : 'none';
  }
}

function addCustomSupplier() {
  const name     = val('ns-name').trim();
  const code     = val('ns-code').trim().toUpperCase();
  const category = val('ns-category');
  const desc     = val('ns-desc').trim();

  if (!name || !code) {
    showFeedback('sup-fb', '⚠ Name and Code are required.', 'var(--danger)');
    return;
  }
  if (!/^[A-Z0-9\-]{1,10}$/.test(code)) {
    showFeedback('sup-fb', '⚠ Code must be letters/numbers only (max 10).', 'var(--danger)');
    return;
  }

  const ok = DB.addCustomSupplier({ name, code, category, desc });
  if (!ok) {
    showFeedback('sup-fb', '⚠ Code already exists.', 'var(--danger)');
    return;
  }

  clearForm(['ns-name','ns-code','ns-desc']);
  showFeedback('sup-fb', `✓ ${name} added!`, 'var(--success)');
  DB.logActivity(`Custom supplier added — [${code}] ${name}`, '#22c55e');
  renderCustomSuppliers();
  renderReference();
}

function deleteCustomSupplier(id) {
  const s = DB.getCustomSuppliers().find(x => x.id === id);
  if (!s) return;
  if (!confirm(`Delete supplier "${s.name}"?`)) return;
  DB.deleteCustomSupplier(id);
  renderCustomSuppliers();
  renderReference();
}

function exportSuppliers() {
  const data = DB.exportSuppliers();
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'spyco-custom-suppliers.json';
  a.click();
  URL.revokeObjectURL(url);
  showFeedback('sup-fb', '✓ Exported!', 'var(--success)');
}

function importSuppliers(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const ok = DB.importSuppliers(e.target.result);
    if (ok) {
      showFeedback('sup-fb', '✓ Suppliers imported!', 'var(--success)');
      renderCustomSuppliers();
      renderReference();
    } else {
      showFeedback('sup-fb', '⚠ Invalid file format.', 'var(--danger)');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ── Admin — Users ─────────────────────────────────────────────
function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  const session = DB.getSession();
  const users = DB.getUsers();

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong style="font-family:var(--mono);">${esc(u.username)}</strong></td>
      <td>${esc(u.display || '—')}</td>
      <td>${u.role === 'admin'
        ? '<span class="badge badge-red">⭐ Admin</span>'
        : '<span class="badge badge-grey">👤 User</span>'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="resetUserPassword('${u.id}')">🔑 Reset PW</button>
        ${u.id !== session?.id
          ? `<button class="btn btn-ghost btn-sm" onclick="deleteUser('${u.id}')" style="color:var(--danger);">🗑</button>`
          : '<span style="font-size:0.75rem;color:var(--text-muted);">(you)</span>'}
      </td>
    </tr>
  `).join('');
}

function addUser() {
  const username = val('au-username').trim().toLowerCase();
  const password = val('au-password');
  const display  = val('au-display').trim();
  const role     = val('au-role');

  if (!username || !password) {
    showFeedback('au-fb', '⚠ Username and password are required.', 'var(--danger)');
    return;
  }
  if (password.length < 6) {
    showFeedback('au-fb', '⚠ Password must be at least 6 characters.', 'var(--danger)');
    return;
  }

  const ok = DB.addUser({ username, password, display: display || username, role });
  if (!ok) {
    showFeedback('au-fb', '⚠ Username already exists.', 'var(--danger)');
    return;
  }

  clearForm(['au-username','au-password','au-display']);
  showFeedback('au-fb', `✓ User "${username}" added!`, 'var(--success)');
  DB.logActivity(`New user added — ${username}`, '#22c55e');
  renderUsers();
}

function deleteUser(id) {
  const u = DB.getUsers().find(x => x.id === id);
  if (!u) return;
  if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
  DB.deleteUser(id);
  DB.logActivity(`User deleted — ${u.username}`, '#e94560');
  renderUsers();
}

function resetUserPassword(id) {
  const u = DB.getUsers().find(x => x.id === id);
  if (!u) return;
  const newPw = prompt(`Set new password for "${u.username}":\n(minimum 6 characters)`);
  if (!newPw) return;
  if (newPw.length < 6) { alert('Password must be at least 6 characters.'); return; }
  DB.updateUser(id, { password: newPw });
  DB.logActivity(`Password reset — ${u.username}`, '#f5a623');
  alert(`Password updated for "${u.username}".`);
}

// ── Change Password ───────────────────────────────────────────
function openPwModal() {
  clearForm(['cp-current','cp-new','cp-confirm']);
  const fb = document.getElementById('cp-fb');
  if (fb) { fb.textContent = ''; fb.style.opacity = '0'; }
  openModal('pw-modal');
}

function changePassword() {
  const current = document.getElementById('cp-current').value;
  const newPw   = document.getElementById('cp-new').value;
  const confirm = document.getElementById('cp-confirm').value;
  const fb      = document.getElementById('cp-fb');

  const session = DB.getSession();
  if (!session) return;

  const user = DB.findUser(session.username, current);
  if (!user) {
    showFeedback('cp-fb', '⚠ Current password is incorrect.', 'var(--danger)');
    return;
  }
  if (newPw.length < 6) {
    showFeedback('cp-fb', '⚠ New password must be at least 6 characters.', 'var(--danger)');
    return;
  }
  if (newPw !== confirm) {
    showFeedback('cp-fb', '⚠ New passwords do not match.', 'var(--danger)');
    return;
  }

  DB.updateUser(user.id, { password: newPw });
  DB.logActivity(`Password changed — ${user.username}`, '#f5a623');
  showFeedback('cp-fb', '✓ Password updated successfully!', 'var(--success)');
  setTimeout(() => closeModal('pw-modal'), 1500);
}

// ── Email ─────────────────────────────────────────────────────
const EMAIL_LOG_KEY = 'spyco_email_log';

function buildEmailSubject() {
  const desc    = val('em-desc');
  const dateRaw = val('em-date');
  const subject = val('em-subject');
  const system  = val('em-system');
  const entity  = val('em-entity');
  const site    = val('em-site');

  const parts = [];
  if (dateRaw) parts.push(fmtDate(dateRaw));
  if (subject) parts.push(subject);
  if (system)  parts.push(system);
  if (entity)  parts.push(entity);
  if (site)    parts.push(site);

  const preview = document.getElementById('em-subject-preview');
  if (!preview) return;

  if (!parts.length && !desc) {
    preview.textContent = 'Fill in fields above…';
    return;
  }

  const codeStr = parts.join('\u00a0\u00a0');
  const line = desc ? desc + SEP + codeStr : codeStr;
  preview.textContent = line;
}

function useEmailSubject() {
  const preview = document.getElementById('em-subject-preview');
  const subjectLine = document.getElementById('em-subject-line');
  if (!preview || !subjectLine) return;
  if (preview.textContent === 'Fill in fields above…') return;
  subjectLine.value = preview.textContent;
  subjectLine.focus();
}

function newEmail() {
  resetEmailForm();
  // Scroll to compose
  const card = document.getElementById('compose-card');
  if (card) card.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('em-to')?.focus();
}

function resetEmailForm() {
  clearForm(['em-desc','em-date','em-subject','em-system','em-entity','em-site','em-to','em-cc','em-bcc','em-subject-line','em-body']);
  const today = new Date().toISOString().split('T')[0];
  const emDate = document.getElementById('em-date');
  if (emDate) emDate.value = today;
  const preview = document.getElementById('em-subject-preview');
  if (preview) preview.textContent = 'Fill in fields above…';
  const status = document.getElementById('send-status');
  if (status) status.style.display = 'none';
  const fb = document.getElementById('send-fb');
  if (fb) { fb.textContent = ''; fb.style.opacity = '0'; }
}

function openGmailCompose() {
  const to      = val('em-to');
  const subject = val('em-subject-line');
  const body    = val('em-body');
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
}

function sendEmail() {
  const to      = val('em-to').trim();
  const subject = val('em-subject-line').trim();
  const body    = val('em-body').trim();
  const cc      = val('em-cc').trim();
  const bcc     = val('em-bcc').trim();
  const btn     = document.getElementById('send-btn');
  const status  = document.getElementById('send-status');

  if (!to)      { showSendStatus('error', '⚠ Please enter a recipient email address.'); return; }
  if (!subject) { showSendStatus('error', '⚠ Please enter a subject line.'); return; }
  if (!body)    { showSendStatus('error', '⚠ Please write a message before sending.'); return; }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    showSendStatus('error', '⚠ Please enter a valid email address.');
    return;
  }

  if (btn) { btn.textContent = '📤 Sending…'; btn.disabled = true; }

  // Send via PHP mailer proxy
  const formData = new FormData();
  formData.append('to',      to);
  formData.append('subject', subject);
  formData.append('body',    body);
  formData.append('cc',      cc);
  formData.append('bcc',     bcc);

  fetch('mailer.php', {
    method: 'POST',
    body: formData,
  })
  .then(r => r.json())
  .then(data => {
    if (btn) { btn.textContent = '📤 Send Email'; btn.disabled = false; }
    if (data.success) {
      showSendStatus('success', `✓ Email sent successfully to ${to}`);
      logEmail(to, subject, 'Sent');
      DB.logActivity(`Email sent to ${to} — ${subject.substring(0,40)}`, '#22c55e');
      setTimeout(() => resetEmailForm(), 2000);
    } else {
      showSendStatus('error', '⚠ Failed to send: ' + (data.message || 'Unknown error. Try Gmail instead.'));
      logEmail(to, subject, 'Failed');
    }
  })
  .catch(() => {
    if (btn) { btn.textContent = '📤 Send Email'; btn.disabled = false; }
    // Fallback: open Gmail
    showSendStatus('warning',
      '⚠ Direct send not available on this connection. <a onclick="openGmailCompose()" style="color:var(--info);cursor:pointer;text-decoration:underline;">Click here to open Gmail</a> with everything pre-filled.'
    );
    logEmail(to, subject, 'Fallback to Gmail');
  });
}

function showSendStatus(type, msg) {
  const el = document.getElementById('send-status');
  if (!el) return;
  const styles = {
    success: 'background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#86efac;',
    error:   'background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;',
    warning: 'background:rgba(245,166,35,0.12);border:1px solid rgba(245,166,35,0.3);color:#fcd34d;',
  };
  el.style.cssText = (styles[type] || styles.error) + 'padding:14px 18px;border-radius:var(--radius);font-size:0.85rem;margin-top:16px;';
  el.innerHTML = msg;
  el.style.display = 'block';
}

function logEmail(to, subject, status) {
  try {
    const log = JSON.parse(localStorage.getItem(EMAIL_LOG_KEY) || '[]');
    log.unshift({ id: uid(), date: new Date().toISOString(), to, subject, status });
    if (log.length > 100) log.length = 100;
    localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(log));
    renderEmailLog();
  } catch(e) {}
}

function renderEmailLog() {
  const log    = JSON.parse(localStorage.getItem(EMAIL_LOG_KEY) || '[]');
  const empty  = document.getElementById('email-log-empty');
  const table  = document.getElementById('email-log-table');
  const tbody  = document.getElementById('email-log-tbody');
  if (!tbody) return;

  if (!log.length) {
    if (empty) empty.classList.remove('hidden');
    if (table) table.classList.add('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  if (table) table.classList.remove('hidden');

  tbody.innerHTML = log.map(e => {
    const statusBadge = e.status === 'Sent'
      ? '<span class="badge badge-green">✓ Sent</span>'
      : e.status === 'Failed'
      ? '<span class="badge badge-red">✗ Failed</span>'
      : '<span class="badge badge-gold">→ Gmail</span>';
    return `<tr>
      <td style="font-size:0.78rem;color:var(--text-muted);">${formatDate(e.date.split('T')[0])}</td>
      <td>${esc(e.to)}</td>
      <td style="font-family:var(--mono);font-size:0.78rem;color:var(--gold);">${esc(e.subject)}</td>
      <td>${statusBadge}</td>
    </tr>`;
  }).join('');
}

// ── Google Drive ──────────────────────────────────────────────
let gapiLoaded = false;

function connectGoogleDrive() {
  const clientId = val('google-client-id').trim();
  if (!clientId) {
    alert('Please enter your Google Client ID first.\nSee the instructions above for how to get one.');
    return;
  }
  localStorage.setItem('spyco_google_client_id', clientId);

  // Load Google API
  if (!gapiLoaded) {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapiLoaded = true;
      initGoogleDrive(clientId);
    };
    script.onerror = () => alert('Could not load Google API. Check your internet connection.');
    document.head.appendChild(script);
  } else {
    initGoogleDrive(clientId);
  }
}

function initGoogleDrive(clientId) {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      return gapi.auth2.getAuthInstance().signIn();
    }).then(() => {
      loadDriveFiles();
    }).catch(err => {
      alert('Google Drive connection failed.\n\nMake sure:\n• Your Client ID is correct\n• portal.spyco.com.au is added as an authorised origin\n\nError: ' + (err.error || err.message || JSON.stringify(err)));
    });
  });
}

function loadDriveFiles() {
  gapi.client.drive.files.list({
    pageSize: 30,
    fields: 'files(id, name, mimeType, modifiedTime, size)',
    orderBy: 'modifiedTime desc',
  }).then(response => {
    const files = response.result.files;
    const browser = document.getElementById('drive-browser');
    const filesEl = document.getElementById('drive-files');
    if (browser) browser.classList.remove('hidden');

    if (!files || !files.length) {
      if (filesEl) filesEl.innerHTML = '<p style="color:var(--text-muted);">No files found in your Drive.</p>';
      return;
    }

    if (filesEl) {
      filesEl.innerHTML = `
        <table class="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Modified</th></tr></thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td><a href="https://drive.google.com/file/d/${f.id}/view" target="_blank" style="color:var(--info);">${esc(f.name)}</a></td>
                <td style="font-size:0.78rem;color:var(--text-muted);">${esc(f.mimeType.split('.').pop().split('/').pop())}</td>
                <td style="font-size:0.78rem;color:var(--text-muted);">${new Date(f.modifiedTime).toLocaleDateString('en-AU')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    DB.logActivity('Google Drive connected', '#22c55e');
  }).catch(err => {
    alert('Failed to load Drive files: ' + (err.message || JSON.stringify(err)));
  });
}

// ── Modal Helpers ─────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('active');
    delete el.dataset.editId;
  }
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ── Table Filter ──────────────────────────────────────────────
function filterTable(input, tbodyId) {
  const q = input.value.toLowerCase();
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── Utility Helpers ───────────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function clearForm(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return (y.slice(2)) + (m) + (d);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function flashFeedback(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

function showFeedback(id, msg, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || 'var(--success)';
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

// ── Status Badges ─────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    'Tenanted':    'badge-green',
    'Vacant':      'badge-grey',
    'Development': 'badge-gold',
    'For Sale':    'badge-red',
  };
  return `<span class="badge ${map[status] || 'badge-grey'}">${esc(status)}</span>`;
}

function projectStatusBadge(status) {
  const map = {
    'Planning':     'badge-grey',
    'DA Submitted': 'badge-gold',
    'DA Approved':  'badge-green',
    'In Progress':  'badge-green',
    'On Hold':      'badge-red',
    'Complete':     'badge-grey',
  };
  return `<span class="badge ${map[status] || 'badge-grey'}">${esc(status)}</span>`;
}

function invoiceStatusBadge(status) {
  const map = {
    'Unpaid':   'badge-gold',
    'Paid':     'badge-green',
    'Overdue':  'badge-red',
    'Disputed': 'badge-red',
  };
  return `<span class="badge ${map[status] || 'badge-grey'}">${esc(status)}</span>`;
}

// ── Responsive sidebar toggle ─────────────────────────────────
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.getElementById('sidebar-toggle');
  if (!sidebar || !toggle) return;
  if (window.innerWidth <= 768) {
    toggle.style.display = 'block';
  } else {
    toggle.style.display = 'none';
    sidebar.classList.remove('open');
  }
});

// Trigger resize check on load
window.dispatchEvent(new Event('resize'));