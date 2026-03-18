/* ============================================================
   SPYCO PORTAL — app.js
   Main Application Logic - Floot Style
   ============================================================ */

'use strict';

// ── State ─────────────────────────────────────────────────────
let currentRefTab = 'subject';

// ── Reference Data (editable lookup tables) ───────────────────
const refData = {
  subject: [
    { code: 'INVOICE', name: 'Bills', desc: 'Trade invoices, utility bills, progress claims' },
    { code: 'ADVICE', name: 'Consultants', desc: 'Reports or guidance' },
    { code: 'STATEMENT', name: 'Financials', desc: 'Bank statements, rental ledgers, loan summaries' },
    { code: 'INFO', name: 'General', desc: 'Market updates, research, non-action' },
    { code: 'DATA', name: 'Numbers', desc: 'Spreadsheets, yield calcs, financial data' },
    { code: 'LEGAL', name: 'Official', desc: 'Contracts, Council DAs, Certificates, Notices' },
    { code: 'PLAN', name: 'Technical', desc: 'Site drawings, mapping, strategic guides' },
    { code: 'ACTION REQ', name: 'Urgent', desc: 'Signatures, decisions, or tasks' },
    { code: 'PHOTO', name: 'Visuals', desc: 'Site photos, progress shots, receipt snapshots' }
  ],
  systems: [
    { code: 'ELEC', name: 'Electrical', desc: 'Power, lighting, solar' },
    { code: 'PLMB', name: 'Plumbing', desc: 'Water, gas, drainage' },
    { code: 'HVAC', name: 'HVAC', desc: 'Heating, ventilation, air conditioning' },
    { code: 'STRC', name: 'Structural', desc: 'Framing, foundations, roofing' },
    { code: 'LAND', name: 'Landscaping', desc: 'Gardens, fencing, outdoor' },
    { code: 'INTR', name: 'Interior', desc: 'Painting, flooring, finishes' }
  ],
  structure: [
    { code: 'RESI', name: 'Residential', desc: 'Houses, units, townhouses' },
    { code: 'COMM', name: 'Commercial', desc: 'Shops, offices, warehouses' },
    { code: 'MIXD', name: 'Mixed Use', desc: 'Combined residential/commercial' },
    { code: 'LAND', name: 'Land', desc: 'Vacant land, subdivisions' }
  ],
  sites: [], // Populated from properties
  suppliers: [], // Populated from contacts
  financial: [
    { code: 'RENT', name: 'Rental Income', desc: 'Tenant payments' },
    { code: 'MTGE', name: 'Mortgage', desc: 'Loan payments' },
    { code: 'RATE', name: 'Rates', desc: 'Council rates, water rates' },
    { code: 'INSR', name: 'Insurance', desc: 'Property insurance' },
    { code: 'MGMT', name: 'Management', desc: 'Property management fees' },
    { code: 'MTNC', name: 'Maintenance', desc: 'Repairs and upkeep' }
  ]
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  // Check for Google auth
  try {
    const auth = await API.checkAuth();
    if (auth.authenticated) {
      showApp(auth.user);
      loadAllData();
    } else {
      showLogin();
    }
  } catch (e) {
    // Fallback to localStorage mode
    console.log('API not available, using localStorage');
    DB.seedAll();
    const session = DB.getSession();
    if (session) {
      showApp(session);
      loadLocalData();
    } else {
      showLogin();
    }
  }
  
  // Set today's date on COMMS
  document.getElementById('comms-date').valueAsDate = new Date();
  updateHeaderDate();
}

function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function showApp(user) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  
  // Set user info
  const name = user.name || user.user || 'User';
  document.getElementById('user-display').textContent = name;
  document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('header-user').textContent = name;
  document.getElementById('user-role-label').textContent = user.role === 'admin' ? 'Admin' : 'User';
  document.getElementById('greeting-name').textContent = name.split(' ')[0];
  
  // Set greeting
  const hour = new Date().getHours();
  document.getElementById('greeting-time').textContent = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
}

function doGoogleLogin() {
  window.location.href = '/api/auth/login';
}

// Simple username/password login
function doSimpleLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  
  // Default credentials: jimmy / spyco2024
  const validUsers = {
    'jimmy': { password: 'spyco2024', role: 'admin', name: 'Jimmy' },
    'peter': { password: 'spyco2024', role: 'admin', name: 'Peter' },
    'admin': { password: 'admin123', role: 'admin', name: 'Admin' }
  };
  
  const userLower = user.toLowerCase();
  if (validUsers[userLower] && validUsers[userLower].password === pass) {
    const userData = { user: userLower, role: validUsers[userLower].role, name: validUsers[userLower].name };
    DB.setSession(userData);
    DB.seedAll();
    showApp(userData);
    loadLocalData();
  } else {
    const errEl = document.getElementById('login-error');
    errEl.textContent = 'Invalid username or password';
    errEl.style.display = 'block';
  }
}

async function doLogout() {
  try {
    await API.logout();
  } catch (e) {
    DB.clearSession();
  }
  window.location.reload();
}

// ── Load Data ─────────────────────────────────────────────────
async function loadAllData() {
  try {
    const [props, contacts, projects, invoices, activity] = await Promise.all([
      API.getProperties(),
      API.getContacts(),
      API.getProjects(),
      API.getInvoices(),
      API.getActivity()
    ]);
    
    window.appData = {
      properties: props.data || [],
      contacts: contacts.data || [],
      projects: projects.data || [],
      invoices: invoices.data || [],
      activity: activity.data || []
    };
    
    renderAll();
  } catch (e) {
    console.error('Failed to load data:', e);
    loadLocalData();
  }
}

function loadLocalData() {
  window.appData = {
    properties: DB.get('properties') || [],
    contacts: DB.get('contacts') || [],
    projects: DB.get('projects') || [],
    invoices: DB.get('invoices') || [],
    activity: DB.get('activity') || []
  };
  renderAll();
}

function renderAll() {
  renderProperties();
  renderContacts();
  renderProjects();
  renderInvoices();
  renderDashboard();
  populateDropdowns();
  renderRefTable();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const data = window.appData;
  
  // Stats
  document.getElementById('stat-properties').textContent = data.properties.length;
  document.getElementById('stat-tenanted').textContent = data.properties.filter(p => p.status === 'Tenanted').length;
  document.getElementById('stat-projects').textContent = data.projects.filter(p => p.status !== 'Complete').length;
  document.getElementById('stat-invoices').textContent = data.invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;
  document.getElementById('stat-contacts').textContent = data.contacts.length;
  
  // Dashboard properties table
  const tbody = document.getElementById('dashboard-properties');
  tbody.innerHTML = data.properties.slice(0, 5).map(p => `
    <tr>
      <td>${esc(p.code || p.address)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${esc(p.entity || '-')}</td>
    </tr>
  `).join('');
  
  // Activity feed
  const feed = document.getElementById('activity-feed');
  if (data.activity.length > 0) {
    feed.innerHTML = data.activity.slice(0, 5).map(a => `
      <div class="activity-item">
        <div class="activity-dot" style="background:${a.color || '#e94560'}"></div>
        <div>
          <div class="activity-text">${esc(a.text)}</div>
          <div class="activity-time">${timeAgo(a.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }
}

// ── Properties ────────────────────────────────────────────────
function renderProperties() {
  const data = window.appData.properties;
  const tbody = document.getElementById('properties-tbody');
  
  // Calculate income
  const weeklyTotal = data.reduce((sum, p) => sum + (parseFloat(p.rent) || 0), 0);
  document.getElementById('income-weekly').textContent = '$' + weeklyTotal.toLocaleString('en-AU', {minimumFractionDigits: 2});
  document.getElementById('income-monthly').textContent = '$' + (weeklyTotal * 4.33).toLocaleString('en-AU', {minimumFractionDigits: 2});
  document.getElementById('income-yearly').textContent = '$' + (weeklyTotal * 52).toLocaleString('en-AU', {minimumFractionDigits: 2});
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted" style="padding:32px;">No properties yet. Click + Add Property to get started.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><input type="checkbox" class="table-checkbox" /></td>
      <td><span class="code">${esc(p.code)}</span></td>
      <td>${esc(p.address)}</td>
      <td><span class="badge badge-grey">${esc(p.entity || '-')}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td>${esc(p.tenant) || '<span class="text-muted">—</span>'}</td>
      <td>${p.rent ? '$' + parseFloat(p.rent).toLocaleString() + '/wk' : '<span class="text-muted">—</span>'}</td>
      <td>${p.leaseEnd ? formatDate(p.leaseEnd) : '<span class="text-muted">—</span>'}</td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editProperty('${p.id}')">✏️</button>
        <button class="btn btn-icon btn-ghost delete" onclick="deleteProperty('${p.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
  
  // Update ref data for sites
  refData.sites = data.map(p => ({ code: p.code, name: p.address, desc: p.entity || '' }));
}

// ── Contacts/Suppliers ────────────────────────────────────────
function renderContacts() {
  const data = window.appData.contacts;
  const tbody = document.getElementById('contacts-tbody');
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:32px;">No suppliers yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><span class="code">[${esc(c.code)}]</span></td>
      <td><strong>${esc(c.name)}</strong></td>
      <td><span class="badge badge-${getCategoryColor(c.category)}">${esc(c.category || '-')}</span></td>
      <td>${c.phone || c.email ? (c.phone || '') + (c.phone && c.email ? '<br>' : '') + (c.email || '') : '<span class="text-muted">—</span>'}</td>
      <td class="text-muted">${esc(c.notes) || '—'}</td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editContact('${c.id}')">✏️</button>
        <button class="btn btn-icon btn-ghost delete" onclick="deleteContact('${c.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
  
  // Update ref data for suppliers
  refData.suppliers = data.map(c => ({ code: c.code, name: c.name, desc: c.category || '' }));
}

// ── Projects ──────────────────────────────────────────────────
function renderProjects() {
  const data = window.appData.projects;
  const tbody = document.getElementById('projects-tbody');
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:32px;">No projects yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(p => `
    <tr>
      <td><strong>${esc(p.name)}</strong></td>
      <td><span class="code">${esc(p.site || '-')}</span></td>
      <td><span class="badge badge-grey">${esc(p.entity || '-')}</span></td>
      <td>${projectStatusBadge(p.status)}</td>
      <td>${p.start ? formatDate(p.start) : '—'}</td>
      <td>${p.due ? formatDate(p.due) : '—'}</td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editProject('${p.id}')">✏️</button>
        <button class="btn btn-icon btn-ghost delete" onclick="deleteProject('${p.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

// ── Invoices ──────────────────────────────────────────────────
function renderInvoices() {
  const data = window.appData.invoices;
  const tbody = document.getElementById('invoices-tbody');
  
  // Calculate totals
  let unpaidTotal = 0;
  let overdueTotal = 0;
  let paidTotal = 0;
  
  data.forEach(i => {
    const amount = parseFloat(i.amount) || 0;
    if (i.status === 'Paid') {
      paidTotal += amount;
    } else if (i.status === 'Overdue') {
      overdueTotal += amount;
      unpaidTotal += amount;
    } else if (i.status === 'Unpaid') {
      unpaidTotal += amount;
    }
  });
  
  // Update summary cards
  document.getElementById('invoice-unpaid').textContent = '$' + unpaidTotal.toLocaleString('en-AU', {minimumFractionDigits: 2});
  document.getElementById('invoice-overdue').textContent = '$' + overdueTotal.toLocaleString('en-AU', {minimumFractionDigits: 2});
  document.getElementById('invoice-paid').textContent = '$' + paidTotal.toLocaleString('en-AU', {minimumFractionDigits: 2});
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding:32px;">No invoices yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map(i => `
    <tr>
      <td>${i.date ? formatDate(i.date) : '—'}</td>
      <td><strong>${esc(i.supplier)}</strong></td>
      <td><span class="code">${esc(i.site || '-')}</span></td>
      <td><strong style="color:var(--success);">$${parseFloat(i.amount || 0).toLocaleString()}</strong></td>
      <td>${invoiceStatusBadge(i.status)}</td>
      <td class="text-muted" style="font-family:var(--mono);font-size:0.8rem;">${esc(i.commsRef) || '—'}</td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editInvoice('${i.id}')">✏️</button>
        <button class="btn btn-icon btn-ghost delete" onclick="deleteInvoice('${i.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

// ── Reference Tables ──────────────────────────────────────────
function switchRefTab(tab, el) {
  currentRefTab = tab;
  document.querySelectorAll('#reference-tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderRefTable();
}

function renderRefTable() {
  const data = refData[currentRefTab] || [];
  const tbody = document.getElementById('reference-tbody');
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:32px;">No codes yet. Click + Add to create one.</td></tr>';
    return;
  }
  
  tbody.innerHTML = data.map((item, idx) => `
    <tr>
      <td><span class="code" style="color:var(--accent);">${esc(item.code)}</span></td>
      <td>${esc(item.name)}</td>
      <td class="text-muted">${esc(item.desc || '—')}</td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editRefCode(${idx})">✏️</button>
        <button class="btn btn-icon btn-ghost delete" onclick="deleteRefCode(${idx})">🗑</button>
      </td>
    </tr>
  `).join('');
}

function filterRefTable() {
  const search = document.getElementById('ref-search').value.toLowerCase();
  const rows = document.querySelectorAll('#reference-tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}

function openAddRefModal() {
  document.getElementById('ref-modal-type').textContent = currentRefTab.charAt(0).toUpperCase() + currentRefTab.slice(1) + ' Code';
  document.getElementById('ref-code').value = '';
  document.getElementById('ref-name').value = '';
  document.getElementById('ref-desc').value = '';
  delete document.getElementById('ref-modal').dataset.editIdx;
  openModal('ref-modal');
}

function saveRefCode() {
  const code = document.getElementById('ref-code').value.trim().toUpperCase();
  const name = document.getElementById('ref-name').value.trim();
  const desc = document.getElementById('ref-desc').value.trim();
  
  if (!code || !name) {
    alert('Code and Name are required');
    return;
  }
  
  const editIdx = document.getElementById('ref-modal').dataset.editIdx;
  if (editIdx !== undefined) {
    refData[currentRefTab][editIdx] = { code, name, desc };
  } else {
    refData[currentRefTab].push({ code, name, desc });
  }
  
  closeModal('ref-modal');
  renderRefTable();
  populateDropdowns();
}

function editRefCode(idx) {
  const item = refData[currentRefTab][idx];
  document.getElementById('ref-modal-type').textContent = 'Edit ' + currentRefTab.charAt(0).toUpperCase() + currentRefTab.slice(1) + ' Code';
  document.getElementById('ref-code').value = item.code;
  document.getElementById('ref-name').value = item.name;
  document.getElementById('ref-desc').value = item.desc || '';
  document.getElementById('ref-modal').dataset.editIdx = idx;
  openModal('ref-modal');
}

function deleteRefCode(idx) {
  if (!confirm('Delete this code?')) return;
  refData[currentRefTab].splice(idx, 1);
  renderRefTable();
  populateDropdowns();
}

// ── SPY COMMS Builder ─────────────────────────────────────────
function populateDropdowns() {
  // Subject
  const subjectSelect = document.getElementById('comms-subject');
  subjectSelect.innerHTML = '<option value="">-- None --</option>' + 
    refData.subject.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Systems
  const systemsSelect = document.getElementById('comms-systems');
  systemsSelect.innerHTML = '<option value="">-- None --</option>' + 
    refData.systems.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Structure
  const structureSelect = document.getElementById('comms-structure');
  structureSelect.innerHTML = '<option value="">-- None --</option>' + 
    refData.structure.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Sites (from properties)
  const sitesSelect = document.getElementById('comms-sites');
  sitesSelect.innerHTML = '<option value="">-- None --</option>' + 
    refData.sites.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Suppliers (from contacts)
  const suppliersSelect = document.getElementById('comms-suppliers');
  suppliersSelect.innerHTML = '<option value="">-- None --</option>' + 
    refData.suppliers.map(s => `<option value="${s.code}">[${s.code}] ${s.name}</option>`).join('');
  
  // Also populate site selects in modals
  const siteOptions = '<option value="">-- Select --</option>' + refData.sites.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  ['pr-site', 'inv-site'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = siteOptions;
  });
}

function buildCommsOutput() {
  const date = document.getElementById('comms-date').value;
  const subject = document.getElementById('comms-subject').value;
  const systems = document.getElementById('comms-systems').value;
  const structure = document.getElementById('comms-structure').value;
  const sites = document.getElementById('comms-sites').value;
  const suppliers = document.getElementById('comms-suppliers').value;
  const suffix = document.getElementById('comms-suffix').value.trim();
  
  // Build date string (YYYYMMDD)
  const dateStr = date ? date.replace(/-/g, '') : '';
  
  // Build parts array
  const parts = [dateStr, subject, systems, structure, sites, suppliers].filter(Boolean);
  
  // Email subject
  const emailOutput = parts.join('_') || dateStr || '-';
  document.getElementById('comms-email-output').textContent = emailOutput;
  
  // File name
  let fileOutput = emailOutput;
  if (suffix) fileOutput += '_' + suffix;
  document.getElementById('comms-file-output').textContent = fileOutput;
  document.getElementById('comms-preview').textContent = fileOutput;
}

function clearCommsForm() {
  document.getElementById('comms-date').valueAsDate = new Date();
  document.getElementById('comms-subject').value = '';
  document.getElementById('comms-systems').value = '';
  document.getElementById('comms-structure').value = '';
  document.getElementById('comms-sites').value = '';
  document.getElementById('comms-suppliers').value = '';
  document.getElementById('comms-suffix').value = '';
  buildCommsOutput();
}

function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    const btn = event.target.closest('.copy-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✓ Copied';
    setTimeout(() => btn.innerHTML = originalHTML, 1500);
  });
}

// ── Navigation ────────────────────────────────────────────────
function showPage(pageId, navEl) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Show selected page
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (navEl) navEl.classList.add('active');
  
  // Update header title
  const titles = {
    dashboard: 'Dashboard',
    properties: 'Properties',
    suppliers: 'Suppliers',
    projects: 'Projects',
    invoices: 'Invoices',
    documents: 'Documents',
    spycomms: 'SPY COMMS',
    reference: 'Reference'
  };
  document.getElementById('header-title').textContent = titles[pageId] || 'Dashboard';
}

// ── Modal Functions ───────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ── CRUD Operations ───────────────────────────────────────────
async function saveProperty() {
  const code = document.getElementById('p-code').value.trim();
  const address = document.getElementById('p-address').value.trim();
  if (!code || !address) { alert('Site Code and Address are required.'); return; }
  
  const prop = {
    code, address,
    entity: document.getElementById('p-entity').value,
    status: document.getElementById('p-status').value,
    tenant: document.getElementById('p-tenant').value.trim(),
    rent: document.getElementById('p-rent').value,
    leaseStart: document.getElementById('p-lease-start').value,
    leaseEnd: document.getElementById('p-lease-end').value,
    notes: document.getElementById('p-notes').value.trim()
  };
  
  try {
    const editId = document.getElementById('property-modal').dataset.editId;
    if (editId) {
      await API.updateProperty(editId, prop);
    } else {
      await API.addProperty(prop);
    }
    closeModal('property-modal');
    clearPropertyForm();
    loadAllData();
  } catch (e) {
    // Fallback to localStorage
    saveLocalProperty(prop);
  }
}

function saveLocalProperty(prop) {
  const editId = document.getElementById('property-modal').dataset.editId;
  const properties = DB.get('properties') || [];
  if (editId) {
    const idx = properties.findIndex(p => p.id === editId);
    if (idx >= 0) properties[idx] = { ...properties[idx], ...prop };
  } else {
    prop.id = Date.now().toString(36);
    properties.push(prop);
  }
  DB.set('properties', properties);
  closeModal('property-modal');
  clearPropertyForm();
  loadLocalData();
}

function clearPropertyForm() {
  ['p-code','p-address','p-tenant','p-rent','p-lease-start','p-lease-end','p-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  delete document.getElementById('property-modal').dataset.editId;
}

async function deleteProperty(id) {
  if (!confirm('Delete this property?')) return;
  try {
    await API.deleteProperty(id);
    loadAllData();
  } catch (e) {
    const properties = (DB.get('properties') || []).filter(p => p.id !== id);
    DB.set('properties', properties);
    loadLocalData();
  }
}

function editProperty(id) {
  const prop = window.appData.properties.find(p => p.id === id);
  if (!prop) return;
  document.getElementById('p-code').value = prop.code || '';
  document.getElementById('p-address').value = prop.address || '';
  document.getElementById('p-entity').value = prop.entity || 'SPY';
  document.getElementById('p-status').value = prop.status || 'Tenanted';
  document.getElementById('p-tenant').value = prop.tenant || '';
  document.getElementById('p-rent').value = prop.rent || '';
  document.getElementById('p-lease-start').value = prop.leaseStart || '';
  document.getElementById('p-lease-end').value = prop.leaseEnd || '';
  document.getElementById('p-notes').value = prop.notes || '';
  document.getElementById('property-modal').dataset.editId = id;
  openModal('property-modal');
}

// Similar functions for contacts, projects, invoices...
async function saveContact() {
  const code = document.getElementById('c-code').value.trim().toUpperCase();
  const name = document.getElementById('c-name').value.trim();
  if (!code || !name) { alert('Code and Name are required.'); return; }
  
  const contact = {
    code, name,
    category: document.getElementById('c-category').value,
    person: document.getElementById('c-person').value.trim(),
    phone: document.getElementById('c-phone').value.trim(),
    email: document.getElementById('c-email').value.trim(),
    notes: document.getElementById('c-notes').value.trim()
  };
  
  try {
    const editId = document.getElementById('contact-modal').dataset.editId;
    if (editId) {
      await API.updateContact(editId, contact);
    } else {
      await API.addContact(contact);
    }
    closeModal('contact-modal');
    loadAllData();
  } catch (e) {
    // LocalStorage fallback
    const contacts = DB.get('contacts') || [];
    contact.id = Date.now().toString(36);
    contacts.push(contact);
    DB.set('contacts', contacts);
    closeModal('contact-modal');
    loadLocalData();
  }
}

async function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  try { await API.deleteContact(id); loadAllData(); } 
  catch (e) {
    const contacts = (DB.get('contacts') || []).filter(c => c.id !== id);
    DB.set('contacts', contacts);
    loadLocalData();
  }
}

async function saveProject() {
  const name = document.getElementById('pr-name').value.trim();
  if (!name) { alert('Project name is required.'); return; }
  
  const project = {
    name,
    site: document.getElementById('pr-site').value,
    entity: document.getElementById('pr-entity').value,
    status: document.getElementById('pr-status').value,
    type: document.getElementById('pr-type').value,
    start: document.getElementById('pr-start').value,
    due: document.getElementById('pr-due').value,
    budget: document.getElementById('pr-budget').value,
    notes: document.getElementById('pr-notes').value.trim()
  };
  
  try {
    await API.addProject(project);
    closeModal('project-modal');
    loadAllData();
  } catch (e) {
    const projects = DB.get('projects') || [];
    project.id = Date.now().toString(36);
    projects.push(project);
    DB.set('projects', projects);
    closeModal('project-modal');
    loadLocalData();
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  try { await API.deleteProject(id); loadAllData(); }
  catch (e) {
    const projects = (DB.get('projects') || []).filter(p => p.id !== id);
    DB.set('projects', projects);
    loadLocalData();
  }
}

async function saveInvoice() {
  const supplier = document.getElementById('inv-supplier').value.trim();
  if (!supplier) { alert('Supplier is required.'); return; }
  
  const invoice = {
    date: document.getElementById('inv-date').value,
    supplier,
    site: document.getElementById('inv-site').value,
    entity: document.getElementById('inv-entity').value,
    amount: document.getElementById('inv-amount').value,
    status: document.getElementById('inv-status').value,
    desc: document.getElementById('inv-desc').value.trim(),
    notes: document.getElementById('inv-notes').value.trim()
  };
  
  try {
    await API.addInvoice(invoice);
    closeModal('invoice-modal');
    loadAllData();
  } catch (e) {
    const invoices = DB.get('invoices') || [];
    invoice.id = Date.now().toString(36);
    invoices.push(invoice);
    DB.set('invoices', invoices);
    closeModal('invoice-modal');
    loadLocalData();
  }
}

async function deleteInvoice(id) {
  if (!confirm('Delete this invoice?')) return;
  try { await API.deleteInvoice(id); loadAllData(); }
  catch (e) {
    const invoices = (DB.get('invoices') || []).filter(i => i.id !== id);
    DB.set('invoices', invoices);
    loadLocalData();
  }
}

// ── Utility Functions ─────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return then.toLocaleDateString('en-AU');
}

function statusBadge(status) {
  const colors = {
    'Tenanted': 'green',
    'Vacant': 'grey',
    'Development': 'gold',
    'For Sale': 'blue'
  };
  return `<span class="badge badge-${colors[status] || 'grey'}">${esc(status || '-')}</span>`;
}

function projectStatusBadge(status) {
  const colors = {
    'Planning': 'grey',
    'DA Submitted': 'blue',
    'DA Approved': 'purple',
    'In Progress': 'gold',
    'On Hold': 'red',
    'Complete': 'green'
  };
  return `<span class="badge badge-${colors[status] || 'grey'}">${esc(status || '-')}</span>`;
}

function invoiceStatusBadge(status) {
  const colors = {
    'Unpaid': 'gold',
    'Paid': 'green',
    'Overdue': 'red',
    'Disputed': 'purple'
  };
  return `<span class="badge badge-${colors[status] || 'grey'}">${esc(status || '-')}</span>`;
}

function getCategoryColor(category) {
  const colors = {
    'Trade': 'gold',
    'Utility': 'blue',
    'Accounting': 'purple',
    'Legal': 'red',
    'Agent': 'green',
    'Government': 'grey',
    'IT': 'blue',
    'Compliance': 'purple'
  };
  return colors[category] || 'grey';
}

function updateHeaderDate() {
  const now = new Date();
  document.getElementById('header-date').textContent = now.toLocaleDateString('en-AU', { 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
  });
}

function filterTable(input, tbodyId) {
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll('#' + tbodyId + ' tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

function toggleAllCheckboxes(masterCheckbox, tbodyId) {
  const checkboxes = document.querySelectorAll('#' + tbodyId + ' .table-checkbox');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

// ── PWA ───────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
