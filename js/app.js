/* ============================================================
   SPYCO PORTAL — app.js
   Main Application Logic - Floot Style
   ============================================================ */

'use strict';

// ── Mobile Menu Functions ──────────────────────────────────────
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Close mobile menu when clicking a nav item
document.addEventListener('click', function(e) {
  if (e.target.closest('.nav-item') && window.innerWidth <= 767) {
    closeMobileMenu();
  }
});

// Close mobile menu on window resize to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 767) {
    closeMobileMenu();
  }
});

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
  const data = window.appData.invoices || [];
  const tbody = document.getElementById('invoices-tbody');
  
  // Calculate totals
  let unpaidTotal = 0;
  let overdueTotal = 0;
  let paidTotal = 0;
  let partialPaid = 0;
  let disputed = 0;
  
  data.forEach(i => {
    const amount = parseFloat(i.amount) || 0;
    const paidAmount = parseFloat(i.paidAmount) || 0;
    
    if (i.status === 'Paid') {
      paidTotal += amount;
    } else if (i.status === 'Overdue') {
      overdueTotal += amount;
      unpaidTotal += amount;
    } else if (i.status === 'Unpaid') {
      unpaidTotal += amount;
    } else if (i.status === 'Partial') {
      partialPaid += paidAmount;
      unpaidTotal += (amount - paidAmount);
    } else if (i.status === 'Disputed') {
      disputed += amount;
    }
  });
  
  // Update summary cards
  const unpaidEl = document.getElementById('invoice-unpaid');
  const overdueEl = document.getElementById('invoice-overdue');
  const paidEl = document.getElementById('invoice-paid');
  
  if (unpaidEl) unpaidEl.textContent = '$' + unpaidTotal.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (overdueEl) overdueEl.textContent = '$' + overdueTotal.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (paidEl) paidEl.textContent = '$' + (paidTotal + partialPaid).toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted" style="padding:32px;">No invoices yet. Click "+ Add Invoice" to create one.</td></tr>';
    return;
  }
  
  // Sort by date descending
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  tbody.innerHTML = sortedData.map(i => {
    const amount = parseFloat(i.amount) || 0;
    const paidAmount = parseFloat(i.paidAmount) || 0;
    const remaining = i.status === 'Partial' ? amount - paidAmount : amount;
    
    return `
    <tr data-status="${i.status}">
      <td>${i.date ? formatDate(i.date) : '—'}</td>
      <td><strong>${esc(i.supplier)}</strong><br><small class="text-muted">${esc(i.description || '')}</small></td>
      <td><span class="code">${esc(i.site || '-')}</span></td>
      <td style="text-align:right;">
        <strong style="color:${i.status === 'Paid' ? 'var(--success)' : 'var(--text)'};">$${amount.toLocaleString('en-AU', {minimumFractionDigits: 2})}</strong>
        ${i.status === 'Partial' ? '<br><small class="text-muted">Paid: $' + paidAmount.toLocaleString('en-AU', {minimumFractionDigits: 2}) + '</small>' : ''}
      </td>
      <td>${invoiceStatusBadge(i.status)}</td>
      <td>${i.dueDate ? formatDate(i.dueDate) : '—'}</td>
      <td class="text-muted" style="font-family:var(--mono);font-size:0.75rem;">
        ${i.fileUrl ? `<a href="${i.fileUrl}" target="_blank" title="View file">📎</a> ` : ''}
        ${esc(i.commsRef || i.invoiceRef || '') || '—'}
      </td>
      <td class="table-actions">
        <button class="btn btn-icon btn-ghost" onclick="editInvoice('${i.id}')" title="Edit">✏️</button>
        ${i.status !== 'Paid' ? `<button class="btn btn-icon btn-ghost" onclick="markInvoicePaid('${i.id}')" title="Mark Paid">✓</button>` : ''}
        ${i.fileUrl ? `<a href="${i.fileUrl}" target="_blank" class="btn btn-icon btn-ghost" title="View Invoice">📄</a>` : ''}
        <button class="btn btn-icon btn-ghost delete" onclick="deleteInvoice('${i.id}')" title="Delete">🗑</button>
      </td>
    </tr>
  `}).join('');
}

function togglePaidDate() {
  const status = document.getElementById('inv-status').value;
  document.getElementById('paid-date-group').style.display = (status === 'Paid' || status === 'Partial') ? 'block' : 'none';
  document.getElementById('partial-amount-group').style.display = status === 'Partial' ? 'block' : 'none';
}

function markInvoicePaid(id) {
  if (!confirm('Mark this invoice as paid?')) return;
  
  const invoices = DB.get('invoices') || [];
  const idx = invoices.findIndex(i => i.id === id);
  if (idx >= 0) {
    invoices[idx].status = 'Paid';
    invoices[idx].paidDate = new Date().toISOString().split('T')[0];
    DB.set('invoices', invoices);
    loadLocalData();
  }
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
  // Load reference data from SPYCO_REFERENCE if available
  const ref = window.SPYCO_REFERENCE || {};
  
  // Subject
  const subjectSelect = document.getElementById('comms-subject');
  const subjects = ref.Subject || refData.subject || [];
  subjectSelect.innerHTML = '<option value="">-- Select --</option>' + 
    subjects.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Systems
  const systemsSelect = document.getElementById('comms-systems');
  const systems = ref.Systems || refData.systems || [];
  systemsSelect.innerHTML = '<option value="">-- Select --</option>' + 
    systems.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Structure
  const structureSelect = document.getElementById('comms-structure');
  const structures = ref.Structure || refData.structure || [];
  structureSelect.innerHTML = '<option value="">-- Select --</option>' + 
    structures.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Sites
  const sitesSelect = document.getElementById('comms-sites');
  const sites = ref.Sites || refData.sites || [];
  sitesSelect.innerHTML = '<option value="">-- Select --</option>' + 
    sites.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  
  // Suppliers
  const suppliersSelect = document.getElementById('comms-suppliers');
  const suppliers = ref.Suppliers || refData.suppliers || [];
  suppliersSelect.innerHTML = '<option value="">-- Select --</option>' + 
    suppliers.map(s => `<option value="${s.code}">[${s.code}] ${s.name}</option>`).join('');
  
  // Financial Year (for archive)
  const fySelect = document.getElementById('comms-fy');
  if (fySelect) {
    const fys = ref.Financial || [];
    fySelect.innerHTML = '<option value="">-- Select FY --</option>' + 
      fys.map(f => `<option value="${f.code}">${f.code} - ${f.name}</option>`).join('');
  }
  
  // Quarters
  const quarterSelect = document.getElementById('comms-quarter');
  if (quarterSelect) {
    const quarters = ref.Quarters || [];
    quarterSelect.innerHTML = '<option value="">-- Select Quarter --</option>' + 
      quarters.map(q => `<option value="${q.code}">${q.code} - ${q.name}</option>`).join('');
  }
  
  // Also populate site selects in modals
  const siteOptions = '<option value="">-- Select --</option>' + sites.map(s => `<option value="${s.code}">${s.code} - ${s.name}</option>`).join('');
  ['pr-site', 'inv-site'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = siteOptions;
  });
  
  // Populate supplier select in invoice modal
  const invSupplierSelect = document.getElementById('inv-supplier');
  if (invSupplierSelect) {
    invSupplierSelect.innerHTML = '<option value="">-- Select --</option>' + 
      suppliers.map(s => `<option value="${s.name}">[${s.code}] ${s.name}</option>`).join('');
  }
}

function buildCommsOutput() {
  const date = document.getElementById('comms-date').value;
  const subject = document.getElementById('comms-subject').value;
  const systems = document.getElementById('comms-systems').value;
  const structure = document.getElementById('comms-structure').value;
  const sites = document.getElementById('comms-sites').value;
  const suppliers = document.getElementById('comms-suppliers').value;
  const suffix = document.getElementById('comms-suffix')?.value?.trim() || '';
  const fy = document.getElementById('comms-fy')?.value || '';
  const quarter = document.getElementById('comms-quarter')?.value || '';
  
  // Build date string (YYYYMMDD)
  const dateStr = date ? date.replace(/-/g, '') : '';
  
  // Check if archive system is selected (6-ARC)
  const isArchive = systems === '6-ARC';
  
  // Build parts array
  let parts;
  if (isArchive && (fy || quarter)) {
    // Archive format: FY_Q_SUBJECT_STRUCTURE_SITE_SUPPLIER
    parts = [fy, quarter, subject, structure, sites, suppliers].filter(Boolean);
  } else {
    // Standard format: DATE_SUBJECT_SYSTEM_STRUCTURE_SITE_SUPPLIER
    parts = [dateStr, subject, systems, structure, sites, suppliers].filter(Boolean);
  }
  
  // Email subject
  const emailOutput = parts.join('_') || dateStr || '-';
  document.getElementById('comms-email-output').textContent = emailOutput;
  
  // File name
  let fileOutput = emailOutput;
  if (suffix) fileOutput += '_' + suffix;
  document.getElementById('comms-file-output').textContent = fileOutput;
  
  const previewEl = document.getElementById('comms-preview');
  if (previewEl) previewEl.textContent = fileOutput;
}

function clearCommsForm() {
  document.getElementById('comms-date').valueAsDate = new Date();
  document.getElementById('comms-subject').value = '';
  document.getElementById('comms-systems').value = '';
  document.getElementById('comms-structure').value = '';
  document.getElementById('comms-sites').value = '';
  document.getElementById('comms-suppliers').value = '';
  const suffixEl = document.getElementById('comms-suffix');
  if (suffixEl) suffixEl.value = '';
  const fyEl = document.getElementById('comms-fy');
  if (fyEl) fyEl.value = '';
  const quarterEl = document.getElementById('comms-quarter');
  if (quarterEl) quarterEl.value = '';
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
    reference: 'Reference',
    email: 'Email Sync',
    settings: 'Settings'
  };
  document.getElementById('header-title').textContent = titles[pageId] || 'Dashboard';
  
  // Load settings if going to settings page
  if (pageId === 'settings' || pageId === 'email') {
    loadEmailSettings();
  }
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
  const supplierSelect = document.getElementById('inv-supplier');
  const supplier = supplierSelect.value || supplierSelect.options[supplierSelect.selectedIndex]?.text || '';
  const amount = document.getElementById('inv-amount').value;
  
  if (!supplier) { alert('Supplier is required.'); return; }
  if (!amount) { alert('Amount is required.'); return; }
  
  const status = document.getElementById('inv-status').value;
  
  const invoice = {
    date: document.getElementById('inv-date').value,
    dueDate: document.getElementById('inv-due').value,
    supplier: supplier,
    site: document.getElementById('inv-site').value,
    entity: document.getElementById('inv-entity').value,
    invoiceRef: document.getElementById('inv-ref').value.trim(),
    amount: parseFloat(amount) || 0,
    gst: parseFloat(document.getElementById('inv-gst').value) || 0,
    status: status,
    paidDate: status === 'Paid' || status === 'Partial' ? document.getElementById('inv-paid-date').value : null,
    paidAmount: status === 'Partial' ? parseFloat(document.getElementById('inv-paid-amount').value) || 0 : null,
    description: document.getElementById('inv-desc').value.trim(),
    commsRef: document.getElementById('inv-comms').value.trim(),
    notes: document.getElementById('inv-notes').value.trim()
  };
  
  // Handle file upload
  const fileInput = document.getElementById('inv-file');
  const file = fileInput.files[0];
  
  if (file) {
    document.getElementById('inv-file-status').textContent = 'Uploading...';
    
    // Generate SPY COMMS filename for the invoice
    const date = invoice.date ? invoice.date.replace(/-/g, '') : new Date().toISOString().slice(0,10).replace(/-/g, '');
    const supplierCode = (invoice.supplier || 'SUP').substring(0, 3).toUpperCase();
    const siteCode = invoice.site || 'GEN';
    const ext = file.name.split('.').pop();
    const spyCommsFileName = `${date}_INVOICE_3-SUP_SPY_${siteCode}_${supplierCode}.${ext}`;
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', spyCommsFileName);
    formData.append('folderPath', `/${siteCode}/INVOICE/`);
    
    try {
      const uploadRes = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        invoice.fileUrl = uploadData.driveUrl || uploadData.localPath;
        invoice.fileName = spyCommsFileName;
        document.getElementById('inv-file-status').textContent = '✓ Uploaded';
      } else {
        document.getElementById('inv-file-status').textContent = 'Upload failed';
      }
    } catch (uploadErr) {
      console.error('File upload error:', uploadErr);
      document.getElementById('inv-file-status').textContent = 'Upload error';
    }
  }
  
  try {
    const editId = document.getElementById('invoice-modal').dataset.editId;
    if (editId) {
      await API.updateInvoice(editId, invoice);
    } else {
      await API.addInvoice(invoice);
    }
    closeModal('invoice-modal');
    clearInvoiceForm();
    loadAllData();
  } catch (e) {
    const invoices = DB.get('invoices') || [];
    const editId = document.getElementById('invoice-modal').dataset.editId;
    if (editId) {
      const idx = invoices.findIndex(i => i.id === editId);
      if (idx >= 0) invoices[idx] = { ...invoices[idx], ...invoice };
    } else {
      invoice.id = Date.now().toString(36);
      invoices.push(invoice);
    }
    DB.set('invoices', invoices);
    closeModal('invoice-modal');
    clearInvoiceForm();
    loadLocalData();
  }
}

function clearInvoiceForm() {
  ['inv-date','inv-due','inv-supplier','inv-site','inv-ref','inv-amount','inv-gst','inv-paid-date','inv-paid-amount','inv-desc','inv-comms','inv-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const fileInput = document.getElementById('inv-file');
  if (fileInput) fileInput.value = '';
  const fileStatus = document.getElementById('inv-file-status');
  if (fileStatus) fileStatus.textContent = '';
  document.getElementById('inv-status').value = 'Unpaid';
  document.getElementById('inv-entity').value = 'SPY';
  togglePaidDate();
  delete document.getElementById('invoice-modal').dataset.editId;
}

function editInvoice(id) {
  const invoices = DB.get('invoices') || [];
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return;
  
  document.getElementById('invoice-modal').dataset.editId = id;
  document.querySelector('#invoice-modal .modal-title').textContent = 'Edit Invoice';
  
  document.getElementById('inv-date').value = invoice.date || '';
  document.getElementById('inv-due').value = invoice.dueDate || '';
  document.getElementById('inv-supplier').value = invoice.supplier || '';
  document.getElementById('inv-site').value = invoice.site || '';
  document.getElementById('inv-entity').value = invoice.entity || 'SPY';
  document.getElementById('inv-ref').value = invoice.invoiceRef || '';
  document.getElementById('inv-amount').value = invoice.amount || '';
  document.getElementById('inv-gst').value = invoice.gst || '';
  document.getElementById('inv-status').value = invoice.status || 'Unpaid';
  document.getElementById('inv-paid-date').value = invoice.paidDate || '';
  document.getElementById('inv-paid-amount').value = invoice.paidAmount || '';
  document.getElementById('inv-desc').value = invoice.description || invoice.desc || '';
  document.getElementById('inv-comms').value = invoice.commsRef || '';
  document.getElementById('inv-notes').value = invoice.notes || '';
  
  togglePaidDate();
  openModal('invoice-modal');
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


// ── Email Settings ────────────────────────────────────────────
function loadEmailSettings() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  if (settings.imapServer) document.getElementById('set-imap-server').value = settings.imapServer;
  if (settings.imapPort) document.getElementById('set-imap-port').value = settings.imapPort;
  if (settings.email) document.getElementById('set-email').value = settings.email;
  if (settings.password) document.getElementById('set-password').value = settings.password;
  if (settings.ssl) document.getElementById('set-ssl').value = settings.ssl;
  if (settings.folder) document.getElementById('set-folder').value = settings.folder;
  if (settings.storageType) document.getElementById('set-storage-type').value = settings.storageType;
  if (settings.driveFolder) document.getElementById('set-drive-folder').value = settings.driveFolder;
  if (settings.primaryFolder) document.getElementById('set-primary-folder').value = settings.primaryFolder;
  if (settings.secondaryFolder) document.getElementById('set-secondary-folder').value = settings.secondaryFolder;
  toggleStorageOptions();
  updateEmailStatus();
  updateFolderPreview();
}

function saveEmailSettings() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  settings.imapServer = document.getElementById('set-imap-server').value.trim();
  settings.imapPort = document.getElementById('set-imap-port').value;
  settings.email = document.getElementById('set-email').value.trim();
  settings.password = document.getElementById('set-password').value;
  settings.ssl = document.getElementById('set-ssl').value;
  settings.folder = document.getElementById('set-folder').value.trim() || 'INBOX';
  localStorage.setItem('spyco_email_settings', JSON.stringify(settings));
  alert('Email settings saved!');
  updateEmailStatus();
}

function saveStorageSettings() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  settings.storageType = document.getElementById('set-storage-type').value;
  settings.driveFolder = document.getElementById('set-drive-folder').value.trim();
  localStorage.setItem('spyco_email_settings', JSON.stringify(settings));
  alert('Storage settings saved!');
}

function saveFilingRules() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  settings.primaryFolder = document.getElementById('set-primary-folder').value;
  settings.secondaryFolder = document.getElementById('set-secondary-folder').value;
  localStorage.setItem('spyco_email_settings', JSON.stringify(settings));
  alert('Filing rules saved!');
  updateFolderPreview();
}

function updateFolderPreview() {
  const primary = document.getElementById('set-primary-folder')?.value || 'site';
  const secondary = document.getElementById('set-secondary-folder')?.value || 'subject';
  
  // Example SPY COMMS ref: 20260318_INVOICE_ELEC_RESI_12-LLO_BAY
  const example = {
    date: '20260318',
    subject: 'INVOICE',
    system: 'ELEC',
    structure: 'RESI',
    site: '12-LLO',
    supplier: 'BAY'
  };
  
  const getValue = (key) => {
    if (key === 'date') return example.date.substring(0,4) + '/' + example.date.substring(4,6);
    return example[key] || '';
  };
  
  let path = '/' + getValue(primary);
  if (secondary !== 'none') {
    path += '/' + getValue(secondary);
  }
  path += '/20260318_INVOICE_ELEC_RESI_12-LLO_BAY.eml';
  
  const preview = document.getElementById('folder-preview');
  if (preview) preview.textContent = path;
}

// Add event listeners for folder preview
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const primarySelect = document.getElementById('set-primary-folder');
    const secondarySelect = document.getElementById('set-secondary-folder');
    if (primarySelect) primarySelect.addEventListener('change', updateFolderPreview);
    if (secondarySelect) secondarySelect.addEventListener('change', updateFolderPreview);
  }, 500);
});

function toggleStorageOptions() {
  const type = document.getElementById('set-storage-type').value;
  document.getElementById('drive-folder-group').style.display = type === 'drive' ? 'block' : 'none';
}

function updateEmailStatus() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  const statusEl = document.getElementById('email-status');
  if (settings.email && settings.imapServer) {
    statusEl.innerHTML = `
      <div style="color:var(--success);margin-bottom:8px;">✓ Email configured</div>
      <div><strong>Server:</strong> ${esc(settings.imapServer)}:${settings.imapPort}</div>
      <div><strong>Account:</strong> ${esc(settings.email)}</div>
      <div><strong>Folder:</strong> ${esc(settings.folder || 'INBOX')}</div>
    `;
  } else {
    statusEl.innerHTML = '<p class="text-muted">Configure email settings in Settings page</p>';
  }
}

function testEmailConnection() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  if (!settings.email || !settings.imapServer) {
    alert('Please configure email settings first');
    return;
  }
  
  const btn = event.target;
  btn.textContent = 'Testing...';
  btn.disabled = true;
  
  fetch('/api/email/test-imap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imapServer: settings.imapServer,
      imapPort: settings.imapPort,
      email: settings.email,
      password: settings.password,
      ssl: settings.ssl
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('✓ Connection successful!');
    } else {
      alert('Connection failed: ' + data.message);
    }
  })
  .catch(err => {
    alert('Error: ' + err.message);
  })
  .finally(() => {
    btn.textContent = 'Test Connection';
    btn.disabled = false;
  });
}

function scanEmails() {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  if (!settings.email || !settings.imapServer) {
    alert('Please configure email settings first in Settings page');
    return;
  }
  
  const btn = document.getElementById('scan-btn');
  btn.textContent = 'Scanning...';
  btn.disabled = true;
  
  fetch('/api/email/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imapServer: settings.imapServer,
      imapPort: settings.imapPort,
      email: settings.email,
      password: settings.password,
      ssl: settings.ssl,
      folder: settings.folder || 'INBOX',
      limit: 100,
      primaryFolder: settings.primaryFolder || 'site',
      secondaryFolder: settings.secondaryFolder || 'subject',
      fetchBody: true
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Store emails globally for viewing
      window.scannedEmails = data.emails || [];
      
      // Update statistics
      document.getElementById('stat-scanned').textContent = data.scanned;
      document.getElementById('stat-filed').textContent = data.filed;
      document.getElementById('stat-unmatched').textContent = data.unmatched;
      
      // Render email list
      renderEmailList(window.scannedEmails);
      
      alert(`Scan complete! Found ${data.scanned} emails.`);
    } else {
      alert('Scan failed: ' + data.message);
    }
  })
  .catch(err => {
    alert('Error: ' + err.message);
  })
  .finally(() => {
    btn.textContent = 'Scan Emails';
    btn.disabled = false;
  });
}

// Store scanned emails globally
window.scannedEmails = [];
window.currentEmailIndex = -1;

function renderEmailList(emails, filter = 'all') {
  const tbody = document.getElementById('emails-tbody');
  
  let filteredEmails = emails;
  if (filter === 'matched') {
    filteredEmails = emails.filter(e => e.spyCommsRef);
  } else if (filter === 'unmatched') {
    filteredEmails = emails.filter(e => !e.spyCommsRef);
  }
  
  if (!filteredEmails.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:32px;">No emails found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredEmails.map((e, idx) => `
    <tr data-email-index="${emails.indexOf(e)}">
      <td><input type="checkbox" class="email-checkbox" onchange="updateFileButton()" /></td>
      <td>${e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
      <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis;">${esc(e.from)}</td>
      <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis;" title="${esc(e.subject)}">${esc(e.subject.substring(0, 50))}${e.subject.length > 50 ? '...' : ''}</td>
      <td>${e.spyCommsRef ? '<span class="code" style="color:var(--accent);">' + esc(e.spyCommsRef) + '</span>' : '<span class="text-muted">—</span>'}</td>
      <td>
        <button class="btn btn-icon btn-ghost" onclick="viewEmail(${emails.indexOf(e)})" title="View Email">👁</button>
        ${e.spyCommsRef ? '<button class="btn btn-icon btn-ghost" onclick="fileSingleEmail(' + emails.indexOf(e) + ')" title="File to Drive">📁</button>' : ''}
      </td>
    </tr>
  `).join('');
}

function filterEmails() {
  const filter = document.getElementById('email-filter').value;
  renderEmailList(window.scannedEmails, filter);
}

function toggleAllEmails(masterCheckbox) {
  const checkboxes = document.querySelectorAll('#emails-tbody .email-checkbox');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
  updateFileButton();
}

function updateFileButton() {
  const checked = document.querySelectorAll('#emails-tbody .email-checkbox:checked').length;
  const btn = document.getElementById('file-selected-btn');
  btn.disabled = checked === 0;
  btn.textContent = checked > 0 ? `File Selected (${checked})` : 'File Selected';
}

function viewEmail(index) {
  const email = window.scannedEmails[index];
  if (!email) return;
  
  window.currentEmailIndex = index;
  
  // Show preview card
  document.getElementById('email-preview-card').style.display = 'block';
  
  // Fill in details
  document.getElementById('preview-from').textContent = email.from || 'Unknown';
  document.getElementById('preview-to').textContent = email.to || 'Unknown';
  document.getElementById('preview-date').textContent = email.date ? new Date(email.date).toLocaleString() : '—';
  document.getElementById('preview-subject').textContent = email.subject || 'No Subject';
  
  if (email.spyCommsRef) {
    document.getElementById('preview-ref-row').style.display = 'block';
    document.getElementById('preview-ref').textContent = email.spyCommsRef;
    document.getElementById('file-current-btn').disabled = false;
  } else {
    document.getElementById('preview-ref-row').style.display = 'none';
    document.getElementById('file-current-btn').disabled = true;
  }
  
  // Show body (fetch if not loaded)
  const bodyEl = document.getElementById('preview-body');
  if (email.body) {
    bodyEl.textContent = email.body;
  } else {
    bodyEl.innerHTML = '<span class="text-muted">Loading email body...</span>';
    fetchEmailBody(index);
  }
  
  // Scroll to preview
  document.getElementById('email-preview-card').scrollIntoView({ behavior: 'smooth' });
}

function fetchEmailBody(index) {
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  const email = window.scannedEmails[index];
  
  fetch('/api/email/fetch-body', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imapServer: settings.imapServer,
      imapPort: settings.imapPort,
      email: settings.email,
      password: settings.password,
      ssl: settings.ssl,
      folder: settings.folder || 'INBOX',
      seqno: email.seqno
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.scannedEmails[index].body = data.body;
      window.scannedEmails[index].to = data.to;
      if (window.currentEmailIndex === index) {
        document.getElementById('preview-body').textContent = data.body || '(No content)';
        document.getElementById('preview-to').textContent = data.to || 'Unknown';
      }
    } else {
      document.getElementById('preview-body').textContent = 'Failed to load: ' + data.message;
    }
  })
  .catch(err => {
    document.getElementById('preview-body').textContent = 'Error: ' + err.message;
  });
}

function closeEmailPreview() {
  document.getElementById('email-preview-card').style.display = 'none';
  window.currentEmailIndex = -1;
}

function fileCurrentEmail() {
  if (window.currentEmailIndex < 0) return;
  fileSingleEmail(window.currentEmailIndex);
}

function fileSingleEmail(index) {
  const email = window.scannedEmails[index];
  if (!email || !email.spyCommsRef) {
    alert('This email has no SPY COMMS reference. Please edit the reference first.');
    return;
  }
  
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  
  alert(`Email would be filed to:\n${email.filedTo}${email.spyCommsRef}.eml\n\nNote: Full Google Drive integration coming soon!`);
}

function fileSelectedEmails() {
  const checkboxes = document.querySelectorAll('#emails-tbody .email-checkbox:checked');
  const indices = [];
  
  checkboxes.forEach(cb => {
    const row = cb.closest('tr');
    const index = parseInt(row.dataset.emailIndex);
    indices.push(index);
  });
  
  const emailsToFile = indices.map(i => window.scannedEmails[i]).filter(e => e && e.spyCommsRef);
  
  if (emailsToFile.length === 0) {
    alert('No selected emails have SPY COMMS references.');
    return;
  }
  
  alert(`Would file ${emailsToFile.length} email(s) to Google Drive.\n\nNote: Full Google Drive integration coming soon!`);
}

function editEmailRef() {
  if (window.currentEmailIndex < 0) return;
  
  const email = window.scannedEmails[window.currentEmailIndex];
  const currentRef = email.spyCommsRef || '';
  
  const newRef = prompt('Enter SPY COMMS reference:\n(Format: DATE_SUBJECT_SYSTEM_STRUCTURE_SITE_SUPPLIER)\n\nExample: 20260318_INVOICE_ELEC_RESI_12-LLO_BAY', currentRef);
  
  if (newRef && newRef !== currentRef) {
    window.scannedEmails[window.currentEmailIndex].spyCommsRef = newRef;
    window.scannedEmails[window.currentEmailIndex].filedTo = '/' + newRef.split('_')[4] + '/' + newRef.split('_')[1] + '/';
    
    // Refresh view
    viewEmail(window.currentEmailIndex);
    renderEmailList(window.scannedEmails, document.getElementById('email-filter').value);
    
    // Update stats
    const matched = window.scannedEmails.filter(e => e.spyCommsRef).length;
    document.getElementById('stat-filed').textContent = matched;
    document.getElementById('stat-unmatched').textContent = window.scannedEmails.length - matched;
  }
}

function markAsRead() {
  alert('Mark as read - Coming soon!');
}

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadEmailSettings, 500);
});

// Update navigation titles
const emailTitles = {
  email: 'Email Sync',
  settings: 'Settings'
};


// ── Document Upload ────────────────────────────────────────────
window.selectedFile = null;
window.uploadedDocuments = JSON.parse(localStorage.getItem('spyco_documents') || '[]');

function openDocumentUpload() {
  document.getElementById('document-upload-panel').style.display = 'block';
  document.getElementById('upload-step-1').style.display = 'block';
  document.getElementById('upload-step-2').style.display = 'none';
  document.getElementById('selected-file-name').textContent = '';
  document.getElementById('upload-btn').disabled = true;
  window.selectedFile = null;
  
  // Populate dropdowns from reference data
  populateDocDropdowns();
}

function closeDocumentUpload() {
  document.getElementById('document-upload-panel').style.display = 'none';
  window.selectedFile = null;
}

function populateDocDropdowns() {
  const refs = window.appData?.reference || {};
  
  const populateSelect = (id, category) => {
    const select = document.getElementById(id);
    const items = refs[category] || [];
    select.innerHTML = '<option value="">Select...</option>' + 
      items.map(r => `<option value="${r.code}">${r.code} - ${r.name}</option>`).join('');
  };
  
  populateSelect('doc-subject', 'Subject');
  populateSelect('doc-system', 'Systems');
  populateSelect('doc-structure', 'Structure');
  populateSelect('doc-supplier', 'Suppliers');
  
  // Sites from properties
  const sites = (window.appData?.properties || []).map(p => p.code).filter(Boolean);
  const siteSelect = document.getElementById('doc-site');
  siteSelect.innerHTML = '<option value="">Select...</option>' + 
    sites.map(s => `<option value="${s}">${s}</option>`).join('');
}

function handleFileSelect(input) {
  const file = input.files[0];
  if (file) {
    window.selectedFile = file;
    document.getElementById('selected-file-name').textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('upload-step-2').style.display = 'block';
    document.getElementById('upload-btn').disabled = false;
    
    // Get file extension
    const ext = file.name.split('.').pop();
    window.selectedFileExt = ext;
    
    updateDocFileName();
  }
}

// Drag and drop
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent)';
        dropZone.style.background = 'rgba(233, 69, 96, 0.1)';
      });
      
      dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'transparent';
      });
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'transparent';
        
        const file = e.dataTransfer.files[0];
        if (file) {
          document.getElementById('file-input').files = e.dataTransfer.files;
          handleFileSelect(document.getElementById('file-input'));
        }
      });
    }
  }, 500);
});

function updateDocFileName() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const subject = document.getElementById('doc-subject').value || 'DOC';
  const system = document.getElementById('doc-system').value || 'GEN';
  const structure = document.getElementById('doc-structure').value || 'GEN';
  const site = document.getElementById('doc-site').value || 'SITE';
  const supplier = document.getElementById('doc-supplier').value || 'SUP';
  const ext = window.selectedFileExt || 'pdf';
  
  const fileName = `${date}_${subject}_${system}_${structure}_${site}_${supplier}.${ext}`;
  document.getElementById('doc-final-name').value = fileName;
  
  // Update folder path based on settings
  const settings = JSON.parse(localStorage.getItem('spyco_email_settings') || '{}');
  const primary = settings.primaryFolder || 'site';
  const secondary = settings.secondaryFolder || 'subject';
  
  const getValue = (key) => {
    switch(key) {
      case 'site': return site;
      case 'subject': return subject;
      case 'system': return system;
      case 'structure': return structure;
      case 'supplier': return supplier;
      case 'date': return date.substring(0,4) + '/' + date.substring(4,6);
      default: return '';
    }
  };
  
  let folderPath = '/' + getValue(primary);
  if (secondary && secondary !== 'none') {
    folderPath += '/' + getValue(secondary);
  }
  folderPath += '/';
  
  document.getElementById('doc-folder-path').value = folderPath;
}

function uploadDocumentToDrive() {
  if (!window.selectedFile) {
    alert('Please select a file first');
    return;
  }
  
  const fileName = document.getElementById('doc-final-name').value;
  const folderPath = document.getElementById('doc-folder-path').value;
  
  // Show progress
  document.getElementById('upload-progress').style.display = 'block';
  document.getElementById('upload-btn').disabled = true;
  document.getElementById('upload-status').textContent = 'Preparing upload...';
  
  // Create form data
  const formData = new FormData();
  formData.append('file', window.selectedFile);
  formData.append('fileName', fileName);
  formData.append('folderPath', folderPath);
  
  // Simulate progress (actual upload would use XMLHttpRequest for progress)
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    document.getElementById('progress-bar').style.width = progress + '%';
    if (progress >= 90) clearInterval(progressInterval);
  }, 200);
  
  fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    clearInterval(progressInterval);
    document.getElementById('progress-bar').style.width = '100%';
    
    if (data.success) {
      document.getElementById('upload-status').textContent = '✓ Upload complete!';
      
      // Save to local documents list
      const doc = {
        id: Date.now().toString(),
        fileName: fileName,
        folderPath: folderPath,
        uploadDate: new Date().toISOString(),
        driveId: data.driveId || null,
        driveUrl: data.driveUrl || null
      };
      
      window.uploadedDocuments.unshift(doc);
      localStorage.setItem('spyco_documents', JSON.stringify(window.uploadedDocuments));
      
      // Refresh list
      renderDocuments();
      
      // Close panel after delay
      setTimeout(() => {
        closeDocumentUpload();
        document.getElementById('upload-progress').style.display = 'none';
        document.getElementById('progress-bar').style.width = '0%';
      }, 1500);
      
    } else {
      document.getElementById('upload-status').textContent = '✗ Upload failed: ' + data.message;
      document.getElementById('upload-btn').disabled = false;
    }
  })
  .catch(err => {
    clearInterval(progressInterval);
    document.getElementById('upload-status').textContent = '✗ Error: ' + err.message;
    document.getElementById('upload-btn').disabled = false;
  });
}

function renderDocuments() {
  const tbody = document.getElementById('documents-tbody');
  const docs = window.uploadedDocuments || [];
  
  if (!docs.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:32px;">No documents uploaded yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = docs.map(d => {
    // Parse SPY COMMS ref from filename
    const parts = d.fileName.split('_');
    const site = parts[4] || '—';
    const type = parts[1] || '—';
    
    return `
      <tr>
        <td><span class="code">${esc(d.fileName)}</span></td>
        <td>${d.uploadDate ? new Date(d.uploadDate).toLocaleDateString() : '—'}</td>
        <td>${esc(site)}</td>
        <td>${esc(type)}</td>
        <td class="table-actions">
          ${d.driveUrl ? `<a href="${d.driveUrl}" target="_blank" class="btn btn-icon btn-ghost" title="Open in Drive">🔗</a>` : ''}
          <button class="btn btn-icon btn-ghost delete" onclick="deleteDocument('${d.id}')" title="Delete">🗑</button>
        </td>
      </tr>
    `;
  }).join('');
}

function deleteDocument(id) {
  if (!confirm('Delete this document record?')) return;
  
  window.uploadedDocuments = window.uploadedDocuments.filter(d => d.id !== id);
  localStorage.setItem('spyco_documents', JSON.stringify(window.uploadedDocuments));
  renderDocuments();
}

function refreshDocuments() {
  // In future, this would fetch from Google Drive
  renderDocuments();
  alert('Document list refreshed');
}

// Load documents on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderDocuments, 600);
});

// ── PWA ───────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
