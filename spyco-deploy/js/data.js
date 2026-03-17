/* ============================================================
   SPYCO GROUP PORTAL — data.js
   Data management, localStorage CRUD, default seeding
   and SPY COMMS code lookup tables.
   ============================================================ */

'use strict';

// ── Storage Keys ──────────────────────────────────────────────
const KEYS = {
  USERS:      'spyco_users',
  PROPERTIES: 'spyco_properties',
  CONTACTS:   'spyco_contacts',
  PROJECTS:   'spyco_projects',
  INVOICES:   'spyco_invoices',
  DOCUMENTS:  'spyco_documents',
  SUPPLIERS:  'spyco_custom_suppliers',
  SESSION:    'spyco_session',
  ACTIVITY:   'spyco_activity',
};

// ── Helpers ───────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Default Users ─────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: 'u1', username: 'peter',  password: 'Spyco2026',   display: 'Peter Spyropoulos', role: 'admin' },
  { id: 'u2', username: 'jimmy',  password: 'Spyco2026',   display: 'Jimmy Spyropoulos', role: 'user'  },
  { id: 'u3', username: 'admin',  password: 'SpyAdmin2026', display: 'Administrator',     role: 'admin' },
];

// ── Default Properties ────────────────────────────────────────
const DEFAULT_PROPERTIES = [
  { id: uid(), code: '12-LLO',   address: '12 Lloyd Road, Lambton',          entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 550,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '66-CHA',   address: '66 Charlton Street, Lambton',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 480,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '49-MOR',   address: '49 Morpeth Road, Waratah West',   entity: 'SPY', status: 'Development', tenant: '',        rent: 0,    leaseStart: '', leaseEnd: '', notes: 'DA in progress' },
  { id: uid(), code: '33-CUR',   address: '33 Curry Street, Wallsend',       entity: 'KAL', status: 'Tenanted',    tenant: '',        rent: 420,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '35-CUR',   address: '35 Curry Street, Wallsend',       entity: 'KAL', status: 'Tenanted',    tenant: '',        rent: 420,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '05-ARM',   address: '5 Armstrong Street, Lambton',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 390,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '5A-ARM',   address: '5a Armstrong Street, Lambton',    entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 370,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '113-DUR',  address: '113 Durham Road, Lambton',        entity: 'REV', status: 'Vacant',      tenant: '',        rent: 0,    leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '29-DIC',   address: '29 Dickson Street, Lambton',      entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 460,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '19-DIC',   address: '19 Dickson Street, Lambton',      entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 440,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '9-12-CHA', address: '9/12 Channel Road, Mayfield West',entity: 'SPY', status: 'Tenanted',    tenant: 'The Shed',rent: 800,  leaseStart: '', leaseEnd: '', notes: 'Commercial' },
  { id: uid(), code: '1-1A-DAV', address: '1/1A Davis Avenue, Mayfield',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 350,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '2-1A-DAV', address: '2/1A Davis Avenue, Mayfield',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 350,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '3-A-DAV',  address: '3/1A Davis Avenue, Mayfield',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 350,  leaseStart: '', leaseEnd: '', notes: '' },
  { id: uid(), code: '4-1A-DAV', address: '4/1A Davis Avenue, Mayfield',     entity: 'SPY', status: 'Tenanted',    tenant: '',        rent: 350,  leaseStart: '', leaseEnd: '', notes: '' },
];

// ── Default Contacts ──────────────────────────────────────────
const DEFAULT_CONTACTS = [
  { id: uid(), code: 'BPP', name: 'Bay Pumps & Plumbing',    category: 'Trade',      phone: '',            email: '',                        person: '',           notes: 'Bore pump specialist' },
  { id: uid(), code: 'COL', name: 'Colorado Constructions',  category: 'Builder',    phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'OCP', name: "O'Connell Plumbing",      category: 'Trade',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'NDM', name: 'Newcastle Demolitions',   category: 'Trade',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'ARG', name: 'Argiris Lawyers',         category: 'Legal',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'GAM', name: 'GAM Solicitors',          category: 'Legal',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'AMO', name: 'Amodio Accounting',       category: 'Accounting', phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: '4WC', name: 'Four Walls & Co',         category: 'Agent',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'GSR', name: 'Green St Realty',         category: 'Agent',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'LOV', name: 'LOVE Realty',             category: 'Agent',      phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'ELK', name: 'ELK Architecture',        category: 'Architect',  phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'MUL', name: 'Multi Point Design',      category: 'Architect',  phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'YHD', name: 'Your Home Design',        category: 'Architect',  phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'BJS', name: 'BJS Planning',            category: 'Planning',   phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'BAC', name: 'Bacon Survey',            category: 'Survey',     phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'THI', name: 'Thiaki Survey',           category: 'Survey',     phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'CRI', name: 'Certify Right',           category: 'Certifier',  phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'NCC', name: 'Newcastle City Council',  category: 'Government', phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'HWC', name: 'Hunter Water',            category: 'Utility',    phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'ATO', name: 'Australian Tax Office',   category: 'Government', phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'CBA', name: 'Commonwealth Bank',       category: 'Banking',    phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'MAC', name: 'Macquarie Bank',          category: 'Banking',    phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'NAB', name: 'NAB',                     category: 'Banking',    phone: '',            email: '',                        person: '',           notes: '' },
  { id: uid(), code: 'RED', name: 'RedZed Lending',          category: 'Banking',    phone: '',            email: '',                        person: '',           notes: '' },
];

// ── SPY COMMS Code Lookup Table ───────────────────────────────
const COMMS_DB = {
  subjects: [
    { code: 'ACTION REQ', label: 'Action Required',  desc: 'Requires a response or action from recipient' },
    { code: 'ADVICE',     label: 'Advice',           desc: 'Professional advice — legal, accounting, planning' },
    { code: 'DATA',       label: 'Data',             desc: 'Data, spreadsheets, reports, figures' },
    { code: 'INFO',       label: 'Information',      desc: 'General information, FYI, updates' },
    { code: 'INVOICE',    label: 'Invoice',          desc: 'Tax invoice, bill, progress claim, statement' },
    { code: 'LEGAL',      label: 'Legal',            desc: 'Contracts, leases, legal documents' },
    { code: 'PHOTO',      label: 'Photo',            desc: 'Site photos, inspection images' },
    { code: 'PLAN',       label: 'Plan',             desc: 'Architectural plans, drawings, site plans' },
    { code: 'STATEMENT',  label: 'Statement',        desc: 'Bank statements, rental statements, accounts' },
  ],
  systems: [
    { code: '[1-FIN]', label: 'Finance',     desc: 'Banking, invoices, statements, tax, accounting' },
    { code: '[2-PRO]', label: 'Projects',    desc: 'Development, DA, construction, renovation' },
    { code: '[3-SUP]', label: 'Suppliers',   desc: 'Trades, contractors, service providers' },
    { code: '[4-AGR]', label: 'Agreements',  desc: 'Leases, contracts, legal agreements' },
    { code: '[5-INT]', label: 'Internal',    desc: 'Internal communications, admin, management' },
    { code: '[6-ARC]', label: 'Archive',     desc: 'Archived, historical, completed items' },
  ],
  entities: [
    { code: '[VS]',          label: 'Vicki Spyropoulos',  desc: 'Personal — Vicki' },
    { code: '[JS]',          label: 'Jimmy Spyropoulos',  desc: 'Personal — Jimmy' },
    { code: '[PS]',          label: 'Peter Spyropoulos',  desc: 'Personal — Peter' },
    { code: '[KAL]',         label: 'Kalazo Pty Ltd',     desc: 'Entity — Kalazo' },
    { code: '[REV]',         label: 'Revma Pty Ltd',      desc: 'Entity — Revma' },
    { code: '[SPY]',         label: 'Spyco Pty Ltd',      desc: 'Entity — Spyco' },
    { code: '[CONSULTING]',  label: 'Consulting',         desc: 'Consulting division' },
    { code: '[GR]',          label: 'Greece',             desc: 'Greece-related matters' },
  ],
  sites: [
    { code: '[12-LLO]',   label: '12 Lloyd Road',          desc: 'Lambton — residential' },
    { code: '[66-CHA]',   label: '66 Charlton Street',     desc: 'Lambton — residential' },
    { code: '[1-1A-DAV]', label: '1/1A Davis Avenue',      desc: 'Mayfield — Unit 1' },
    { code: '[2-1A-DAV]', label: '2/1A Davis Avenue',      desc: 'Mayfield — Unit 2' },
    { code: '[3-A-DAV]',  label: '3/1A Davis Avenue',      desc: 'Mayfield — Unit 3' },
    { code: '[4-1A-DAV]', label: '4/1A Davis Avenue',      desc: 'Mayfield — Unit 4' },
    { code: '[33-CUR]',   label: '33 Curry Street',        desc: 'Wallsend — residential' },
    { code: '[35-CUR]',   label: '35 Curry Street',        desc: 'Wallsend — residential' },
    { code: '[05-ARM]',   label: '5 Armstrong Street',     desc: 'Lambton — residential' },
    { code: '[5A-ARM]',   label: '5a Armstrong Street',    desc: 'Lambton — residential' },
    { code: '[113-DUR]',  label: '113 Durham Road',        desc: 'Lambton — residential' },
    { code: '[49-MOR]',   label: '49 Morpeth Road',        desc: 'Waratah West — development' },
    { code: '[29-DIC]',   label: '29 Dickson Street',      desc: 'Lambton — residential' },
    { code: '[19-DIC]',   label: '19 Dickson Street',      desc: 'Lambton — residential' },
    { code: '[9-12-CHA]', label: '9/12 Channel Road',      desc: 'Mayfield West — The Shed (commercial)' },
  ],
  suppliers: [
    // Banking
    { code: '[CBA]', label: 'Commonwealth Bank', category: 'Banking',    desc: 'CommBank — main banking' },
    { code: '[MAC]', label: 'Macquarie Bank',    category: 'Banking',    desc: 'Macquarie — investment lending' },
    { code: '[NAB]', label: 'NAB',               category: 'Banking',    desc: 'National Australia Bank' },
    { code: '[RED]', label: 'RedZed Lending',    category: 'Banking',    desc: 'RedZed — specialist lending' },
    // Utilities
    { code: '[AGE]', label: 'AGL Electricity',   category: 'Utility',    desc: 'AGL — electricity supply' },
    { code: '[AGG]', label: 'AGL Gas',           category: 'Utility',    desc: 'AGL — gas supply' },
    { code: '[HWC]', label: 'Hunter Water',      category: 'Utility',    desc: 'Hunter Water Corporation' },
    { code: '[ORI]', label: 'Origin Energy',     category: 'Utility',    desc: 'Origin — energy supply' },
    { code: '[ENE]', label: 'Energy Australia',  category: 'Utility',    desc: 'Energy Australia — electricity' },
    // Legal
    { code: '[ARG]', label: 'Argiris Lawyers',   category: 'Legal',      desc: 'Argiris — property & commercial law' },
    { code: '[GAM]', label: 'GAM Solicitors',    category: 'Legal',      desc: 'GAM — conveyancing & legal' },
    // Accounting
    { code: '[AMO]', label: 'Amodio Accounting', category: 'Accounting', desc: 'Amodio — tax & accounting' },
    { code: '[ATO]', label: 'Tax Office',        category: 'Government', desc: 'Australian Taxation Office' },
    // Agents
    { code: '[4WC]', label: 'Four Walls & Co',   category: 'Agent',      desc: 'Four Walls — property management' },
    { code: '[GSR]', label: 'Green St Realty',   category: 'Agent',      desc: 'Green Street — real estate' },
    { code: '[LOV]', label: 'LOVE Realty',       category: 'Agent',      desc: 'LOVE Realty — property management' },
    // Trades
    { code: '[BPP]', label: 'Bay Pumps & Plumbing', category: 'Trade',   desc: 'Bay Pumps — bore pump & plumbing' },
    { code: '[COL]', label: 'Colorado Constructions',category: 'Builder', desc: 'Colorado — construction & building' },
    { code: '[OCP]', label: "O'Connell Plumbing",  category: 'Trade',    desc: "O'Connell — plumbing services" },
    { code: '[NDM]', label: 'Newcastle Demolitions',category: 'Trade',   desc: 'Newcastle Demo — demolition' },
    { code: '[REV]', label: 'Revma Pty Ltd',       category: 'Trade',    desc: 'Revma — internal entity / trades' },
    // Planning & Survey
    { code: '[BJS]', label: 'BJS Planning',        category: 'Planning', desc: 'BJS — town planning & DA' },
    { code: '[BAC]', label: 'Bacon Survey',        category: 'Survey',   desc: 'Bacon — surveying services' },
    { code: '[THI]', label: 'Thiaki Survey',       category: 'Survey',   desc: 'Thiaki — surveying services' },
    // Architects
    { code: '[ELK]', label: 'ELK Architecture',    category: 'Architect',desc: 'ELK — architectural design' },
    { code: '[MUL]', label: 'Multi Point Design',  category: 'Architect',desc: 'Multi Point — design & drafting' },
    { code: '[YHD]', label: 'Your Home Design',    category: 'Architect',desc: 'YHD — residential design' },
    // Certifiers
    { code: '[CRI]', label: 'Certify Right',       category: 'Certifier',desc: 'Certify Right — building certification' },
    { code: '[NCC]', label: 'Newcastle Council',   category: 'Government',desc: 'Newcastle City Council' },
  ],
};

// ── DB API ────────────────────────────────────────────────────

const DB = {

  // ── Users ──────────────────────────────────────────────────
  getUsers() {
    return load(KEYS.USERS) || DEFAULT_USERS;
  },
  saveUsers(users) {
    save(KEYS.USERS, users);
  },
  seedUsers() {
    if (!load(KEYS.USERS)) save(KEYS.USERS, DEFAULT_USERS);
  },
  findUser(username, password) {
    return this.getUsers().find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    ) || null;
  },
  addUser(user) {
    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) return false;
    users.push({ id: uid(), ...user });
    this.saveUsers(users);
    return true;
  },
  updateUser(id, updates) {
    const users = this.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveUsers(users);
  },
  deleteUser(id) {
    this.saveUsers(this.getUsers().filter(u => u.id !== id));
  },

  // ── Session ────────────────────────────────────────────────
  getSession() {
    return load(KEYS.SESSION);
  },
  setSession(user) {
    save(KEYS.SESSION, { id: user.id, username: user.username, display: user.display, role: user.role });
  },
  clearSession() {
    localStorage.removeItem(KEYS.SESSION);
  },

  // ── Properties ────────────────────────────────────────────
  getProperties() {
    return load(KEYS.PROPERTIES) || [];
  },
  seedProperties() {
    if (!load(KEYS.PROPERTIES)) save(KEYS.PROPERTIES, DEFAULT_PROPERTIES);
  },
  addProperty(prop) {
    const list = this.getProperties();
    list.push({ id: uid(), ...prop });
    save(KEYS.PROPERTIES, list);
  },
  updateProperty(id, updates) {
    save(KEYS.PROPERTIES, this.getProperties().map(p => p.id === id ? { ...p, ...updates } : p));
  },
  deleteProperty(id) {
    save(KEYS.PROPERTIES, this.getProperties().filter(p => p.id !== id));
  },

  // ── Contacts ──────────────────────────────────────────────
  getContacts() {
    return load(KEYS.CONTACTS) || [];
  },
  seedContacts() {
    if (!load(KEYS.CONTACTS)) save(KEYS.CONTACTS, DEFAULT_CONTACTS);
  },
  addContact(contact) {
    const list = this.getContacts();
    list.push({ id: uid(), ...contact });
    save(KEYS.CONTACTS, list);
  },
  updateContact(id, updates) {
    save(KEYS.CONTACTS, this.getContacts().map(c => c.id === id ? { ...c, ...updates } : c));
  },
  deleteContact(id) {
    save(KEYS.CONTACTS, this.getContacts().filter(c => c.id !== id));
  },

  // ── Projects ──────────────────────────────────────────────
  getProjects() {
    return load(KEYS.PROJECTS) || [];
  },
  addProject(proj) {
    const list = this.getProjects();
    list.push({ id: uid(), ...proj });
    save(KEYS.PROJECTS, list);
  },
  updateProject(id, updates) {
    save(KEYS.PROJECTS, this.getProjects().map(p => p.id === id ? { ...p, ...updates } : p));
  },
  deleteProject(id) {
    save(KEYS.PROJECTS, this.getProjects().filter(p => p.id !== id));
  },

  // ── Invoices ──────────────────────────────────────────────
  getInvoices() {
    return load(KEYS.INVOICES) || [];
  },
  addInvoice(inv) {
    const list = this.getInvoices();
    list.push({ id: uid(), ...inv });
    save(KEYS.INVOICES, list);
  },
  updateInvoice(id, updates) {
    save(KEYS.INVOICES, this.getInvoices().map(i => i.id === id ? { ...i, ...updates } : i));
  },
  deleteInvoice(id) {
    save(KEYS.INVOICES, this.getInvoices().filter(i => i.id !== id));
  },

  // ── Documents ─────────────────────────────────────────────
  getDocuments() {
    return load(KEYS.DOCUMENTS) || [];
  },
  addDocument(doc) {
    const list = this.getDocuments();
    list.push({ id: uid(), ...doc });
    save(KEYS.DOCUMENTS, list);
  },
  deleteDocument(id) {
    save(KEYS.DOCUMENTS, this.getDocuments().filter(d => d.id !== id));
  },

  // ── Custom Suppliers ──────────────────────────────────────
  getCustomSuppliers() {
    return load(KEYS.SUPPLIERS) || [];
  },
  addCustomSupplier(sup) {
    const list = this.getCustomSuppliers();
    if (list.find(s => s.code.toUpperCase() === sup.code.toUpperCase())) return false;
    list.push({ id: uid(), ...sup });
    save(KEYS.SUPPLIERS, list);
    return true;
  },
  deleteCustomSupplier(id) {
    save(KEYS.SUPPLIERS, this.getCustomSuppliers().filter(s => s.id !== id));
  },
  exportSuppliers() {
    return JSON.stringify(this.getCustomSuppliers(), null, 2);
  },
  importSuppliers(json) {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return false;
      save(KEYS.SUPPLIERS, data);
      return true;
    } catch { return false; }
  },

  // ── Activity Log ──────────────────────────────────────────
  getActivity() {
    return load(KEYS.ACTIVITY) || [];
  },
  logActivity(text, color) {
    const list = this.getActivity();
    list.unshift({ id: uid(), text, color: color || '#e94560', time: new Date().toISOString() });
    if (list.length > 50) list.length = 50;
    save(KEYS.ACTIVITY, list);
  },

  // ── Seed All ──────────────────────────────────────────────
  seedAll() {
    this.seedUsers();
    this.seedProperties();
    this.seedContacts();
  },
};