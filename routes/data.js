/**
 * Data Routes
 * CRUD operations using MySQL
 */

const express = require('express');
const router = express.Router();
const { pool, logActivity } = require('../services/db');

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

const userId = (req) => req.session.user.id;

// ═══════════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════════

router.get('/properties', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM properties ORDER BY code');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/properties', async (req, res) => {
  try {
    const { code, address, entity, status, tenant, rent, leaseStart, leaseEnd, notes } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO properties (code, address, entity, status, tenant, rent, lease_start, lease_end, notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [code, address, entity, status || 'Vacant', tenant || null, rent || null, leaseStart || null, leaseEnd || null, notes || null]
    );
    await logActivity(`Property added — ${address}`, '#22c55e', userId(req));
    const [rows] = await pool.execute('SELECT * FROM properties WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/properties/:id', async (req, res) => {
  try {
    const { code, address, entity, status, tenant, rent, leaseStart, leaseEnd, notes } = req.body;
    await pool.execute(
      'UPDATE properties SET code=?, address=?, entity=?, status=?, tenant=?, rent=?, lease_start=?, lease_end=?, notes=? WHERE id=?',
      [code, address, entity, status, tenant || null, rent || null, leaseStart || null, leaseEnd || null, notes || null, req.params.id]
    );
    await logActivity(`Property updated — ${address}`, '#f5a623', userId(req));
    const [rows] = await pool.execute('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/properties/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM properties WHERE id = ?', [req.params.id]);
    await logActivity('Property deleted', '#e94560', userId(req));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// CONTACTS (Suppliers)
// ═══════════════════════════════════════════════════════════════

router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contacts ORDER BY code');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    const { code, name, category, phone, email, person, notes } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO contacts (code, name, category, phone, email, person, notes) VALUES (?,?,?,?,?,?,?)',
      [code, name, category || null, phone || null, email || null, person || null, notes || null]
    );
    await logActivity(`Contact added — ${name}`, '#22c55e', userId(req));
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const { code, name, category, phone, email, person, notes } = req.body;
    await pool.execute(
      'UPDATE contacts SET code=?, name=?, category=?, phone=?, email=?, person=?, notes=? WHERE id=?',
      [code, name, category || null, phone || null, email || null, person || null, notes || null, req.params.id]
    );
    await logActivity(`Contact updated — ${name}`, '#f5a623', userId(req));
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    await logActivity('Contact deleted', '#e94560', userId(req));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════

router.get('/projects', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, site, entity, status, type, start, due, budget, notes } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO projects (name, site, entity, status, type, start_date, due_date, budget, notes) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, site || null, entity || null, status || 'Planning', type || null, start || null, due || null, budget || null, notes || null]
    );
    await logActivity(`Project added — ${name}`, '#22c55e', userId(req));
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { name, site, entity, status, type, start, due, budget, notes } = req.body;
    await pool.execute(
      'UPDATE projects SET name=?, site=?, entity=?, status=?, type=?, start_date=?, due_date=?, budget=?, notes=? WHERE id=?',
      [name, site || null, entity || null, status, type || null, start || null, due || null, budget || null, notes || null, req.params.id]
    );
    await logActivity(`Project updated — ${name}`, '#f5a623', userId(req));
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    await logActivity('Project deleted', '#e94560', userId(req));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════

router.get('/invoices', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM invoices ORDER BY date DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const { date, dueDate, supplier, site, entity, invoiceRef, amount, gst, status, paidDate, paidAmount, description, commsRef, fileUrl, fileName, notes } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO invoices (date, due_date, supplier, site, entity, invoice_ref, amount, gst, status, paid_date, paid_amount, description, comms_ref, file_url, file_name, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [date || null, dueDate || null, supplier, site || null, entity || null, invoiceRef || null,
       amount || 0, gst || 0, status || 'Unpaid', paidDate || null, paidAmount || null,
       description || null, commsRef || null, fileUrl || null, fileName || null, notes || null]
    );
    await logActivity(`Invoice added — ${supplier} $${amount}`, '#22c55e', userId(req));
    const [rows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const { date, dueDate, supplier, site, entity, invoiceRef, amount, gst, status, paidDate, paidAmount, description, commsRef, fileUrl, fileName, notes } = req.body;
    await pool.execute(
      `UPDATE invoices SET date=?, due_date=?, supplier=?, site=?, entity=?, invoice_ref=?, amount=?, gst=?, status=?, paid_date=?, paid_amount=?, description=?, comms_ref=?, file_url=?, file_name=?, notes=? WHERE id=?`,
      [date || null, dueDate || null, supplier, site || null, entity || null, invoiceRef || null,
       amount || 0, gst || 0, status || 'Unpaid', paidDate || null, paidAmount || null,
       description || null, commsRef || null, fileUrl || null, fileName || null, notes || null, req.params.id]
    );
    await logActivity(`Invoice updated — ${supplier}`, '#f5a623', userId(req));
    const [rows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/invoices/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    await logActivity('Invoice deleted', '#e94560', userId(req));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════

router.get('/documents', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM documents ORDER BY upload_date DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/documents', async (req, res) => {
  try {
    const { name, fileName, folderPath, filePath } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO documents (name, file_name, folder_path, file_path) VALUES (?,?,?,?)',
      [name, fileName, folderPath || null, filePath || null]
    );
    await logActivity(`Document logged — ${name || fileName}`, '#22c55e', userId(req));
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACTIVITY
// ═══════════════════════════════════════════════════════════════

router.get('/activity', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM activity ORDER BY timestamp DESC LIMIT 50');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// USERS (Admin only)
// ═══════════════════════════════════════════════════════════════

router.get('/users', async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const [rows] = await pool.execute('SELECT id, email, username, name, role, created_at, last_login FROM users');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// REFERENCE DATA
// ═══════════════════════════════════════════════════════════════

router.get('/reference', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM reference_data ORDER BY category, code');
    // Group by category
    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });
    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reference', async (req, res) => {
  try {
    const { category, code, name, description } = req.body;
    if (!category || !code || !name) {
      return res.status(400).json({ success: false, message: 'Category, code, and name required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO reference_data (category, code, name, description) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)',
      [category, code, name, description || null]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/reference/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM reference_data WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// IMPORT / EXPORT (Bulk)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/data/export-all
 * Export everything as JSON for backup/transfer
 */
router.get('/export-all', async (req, res) => {
  try {
    const [properties] = await pool.execute('SELECT * FROM properties');
    const [contacts] = await pool.execute('SELECT * FROM contacts');
    const [projects] = await pool.execute('SELECT * FROM projects');
    const [invoices] = await pool.execute('SELECT * FROM invoices');
    const [documents] = await pool.execute('SELECT * FROM documents');
    const [reference] = await pool.execute('SELECT * FROM reference_data');
    const [users] = await pool.execute('SELECT id, email, name, role, created_at FROM users');

    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: req.session.user.email || req.session.user.name,
      version: '2.0',
      data: { properties, contacts, projects, invoices, documents, reference, users }
    };

    res.json({ success: true, data: exportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/data/export-csv/:table
 * Export a single table as CSV
 */
router.get('/export-csv/:table', async (req, res) => {
  const allowed = ['properties', 'contacts', 'projects', 'invoices', 'reference_data'];
  const table = req.params.table;
  if (!allowed.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table' });
  }
  try {
    const [rows] = await pool.execute(`SELECT * FROM ${table}`);
    if (!rows.length) {
      return res.status(200).send('No data');
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        let val = r[h] == null ? '' : String(r[h]);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(','))
    ].join('\n');

    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-${table}-${dateStr}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/data/import
 * Import bulk data from JSON
 */
router.post('/import', async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const { table, rows, mode } = req.body;
  // mode: 'append' (add to existing) or 'replace' (clear and import)
  const allowed = ['properties', 'contacts', 'projects', 'invoices', 'reference_data'];
  
  if (!allowed.includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table: ' + table });
  }
  if (!rows || !Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ success: false, message: 'No rows to import' });
  }

  try {
    if (mode === 'replace') {
      await pool.execute(`DELETE FROM ${table}`);
    }

    let imported = 0;
    const columnMap = {
      properties: ['code', 'address', 'entity', 'status', 'tenant', 'rent', 'lease_start', 'lease_end', 'notes'],
      contacts: ['code', 'name', 'category', 'phone', 'email', 'person', 'notes'],
      projects: ['name', 'site', 'entity', 'status', 'type', 'start_date', 'due_date', 'budget', 'notes'],
      invoices: ['date', 'due_date', 'supplier', 'site', 'entity', 'invoice_ref', 'amount', 'gst', 'status', 'description', 'comms_ref', 'notes'],
      reference_data: ['category', 'code', 'name', 'description']
    };

    const cols = columnMap[table];
    const placeholders = cols.map(() => '?').join(',');
    const sql = table === 'reference_data'
      ? `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`
      : `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = cols.map(c => {
        // Handle both snake_case and camelCase field names
        const camel = c.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase());
        let val = row[c] !== undefined ? row[c] : (row[camel] !== undefined ? row[camel] : null);
        if (val === '' || val === undefined) val = null;
        return val;
      });
      try {
        await pool.execute(sql, values);
        imported++;
      } catch (rowErr) {
        console.log(`Import row error (${table}):`, rowErr.message);
      }
    }

    await logActivity(`Imported ${imported} rows into ${table}`, '#22c55e', userId(req));
    res.json({ success: true, imported, total: rows.length });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
