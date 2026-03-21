/**
 * Export Routes
 * Download data as CSV/JSON files
 */

const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const { pool } = require('../services/db');

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

function formatDateForFile() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

router.get('/properties', async (req, res) => {
  try {
    const [data] = await pool.execute('SELECT code, address, entity, status, tenant, rent, lease_start, lease_end, notes, created_at FROM properties');
    const fields = ['code', 'address', 'entity', 'status', 'tenant', 'rent', 'lease_start', 'lease_end', 'notes', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-properties-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const [data] = await pool.execute('SELECT code, name, category, phone, email, person, notes, created_at FROM contacts');
    const fields = ['code', 'name', 'category', 'phone', 'email', 'person', 'notes', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-contacts-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const [data] = await pool.execute('SELECT name, site, entity, status, type, start_date, due_date, budget, notes, created_at FROM projects');
    const fields = ['name', 'site', 'entity', 'status', 'type', 'start_date', 'due_date', 'budget', 'notes', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-projects-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/invoices', async (req, res) => {
  try {
    const [data] = await pool.execute('SELECT date, supplier, site, entity, amount, status, description, notes, comms_ref, created_at FROM invoices');
    const fields = ['date', 'supplier', 'site', 'entity', 'amount', 'status', 'description', 'notes', 'comms_ref', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-invoices-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [properties] = await pool.execute('SELECT * FROM properties');
    const [contacts] = await pool.execute('SELECT * FROM contacts');
    const [projects] = await pool.execute('SELECT * FROM projects');
    const [invoices] = await pool.execute('SELECT * FROM invoices');
    const [documents] = await pool.execute('SELECT * FROM documents');
    const [activity] = await pool.execute('SELECT * FROM activity ORDER BY timestamp DESC LIMIT 200');

    const backup = {
      exportDate: new Date().toISOString(),
      exportedBy: req.session.user.email || req.session.user.username,
      data: { properties, contacts, projects, invoices, documents, activity },
      counts: {
        properties: properties.length,
        contacts: contacts.length,
        projects: projects.length,
        invoices: invoices.length,
        documents: documents.length,
        activity: activity.length
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-portal-backup-${formatDateForFile()}.json`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
