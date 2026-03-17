/**
 * Data Routes
 * CRUD operations using Google Sheets as database
 */

const express = require('express');
const router = express.Router();
const sheetsDB = require('../services/sheetsDB');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.tokens) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Apply auth middleware to all routes
router.use(requireAuth);

/**
 * Helper to get tokens from session
 */
const getTokens = (req) => req.session.tokens;

// ═══════════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════════

router.get('/properties', async (req, res) => {
  try {
    const data = await sheetsDB.getAll('Properties', getTokens(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/properties', async (req, res) => {
  try {
    const data = {
      id: sheetsDB.generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await sheetsDB.add('Properties', data, getTokens(req));
    await sheetsDB.logActivity(
      `Property added — ${data.address}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/properties/:id', async (req, res) => {
  try {
    const data = await sheetsDB.update('Properties', req.params.id, req.body, getTokens(req));
    await sheetsDB.logActivity(
      `Property updated — ${data.address}`,
      '#f5a623',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/properties/:id', async (req, res) => {
  try {
    await sheetsDB.delete('Properties', req.params.id, getTokens(req));
    await sheetsDB.logActivity(
      'Property deleted',
      '#e94560',
      req.session.user.dbId,
      getTokens(req)
    );
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
    const data = await sheetsDB.getAll('Contacts', getTokens(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    const data = {
      id: sheetsDB.generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await sheetsDB.add('Contacts', data, getTokens(req));
    await sheetsDB.logActivity(
      `Contact added — ${data.name}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const data = await sheetsDB.update('Contacts', req.params.id, req.body, getTokens(req));
    await sheetsDB.logActivity(
      `Contact updated — ${data.name}`,
      '#f5a623',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await sheetsDB.delete('Contacts', req.params.id, getTokens(req));
    await sheetsDB.logActivity(
      'Contact deleted',
      '#e94560',
      req.session.user.dbId,
      getTokens(req)
    );
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
    const data = await sheetsDB.getAll('Projects', getTokens(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const data = {
      id: sheetsDB.generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await sheetsDB.add('Projects', data, getTokens(req));
    await sheetsDB.logActivity(
      `Project added — ${data.name}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const data = await sheetsDB.update('Projects', req.params.id, req.body, getTokens(req));
    await sheetsDB.logActivity(
      `Project updated — ${data.name}`,
      '#f5a623',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await sheetsDB.delete('Projects', req.params.id, getTokens(req));
    await sheetsDB.logActivity(
      'Project deleted',
      '#e94560',
      req.session.user.dbId,
      getTokens(req)
    );
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
    const data = await sheetsDB.getAll('Invoices', getTokens(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const data = {
      id: sheetsDB.generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await sheetsDB.add('Invoices', data, getTokens(req));
    await sheetsDB.logActivity(
      `Invoice added — ${data.supplier} $${data.amount}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const data = await sheetsDB.update('Invoices', req.params.id, req.body, getTokens(req));
    await sheetsDB.logActivity(
      `Invoice updated — ${data.supplier}`,
      '#f5a623',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/invoices/:id', async (req, res) => {
  try {
    await sheetsDB.delete('Invoices', req.params.id, getTokens(req));
    await sheetsDB.logActivity(
      'Invoice deleted',
      '#e94560',
      req.session.user.dbId,
      getTokens(req)
    );
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
    const data = await sheetsDB.getAll('Documents', getTokens(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/documents', async (req, res) => {
  try {
    const data = {
      id: sheetsDB.generateId(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    await sheetsDB.add('Documents', data, getTokens(req));
    await sheetsDB.logActivity(
      `Document logged — ${data.name}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    await sheetsDB.delete('Documents', req.params.id, getTokens(req));
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
    const data = await sheetsDB.getAll('Activity', getTokens(req));
    // Sort by timestamp descending
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: data.slice(0, 50) });
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
    const data = await sheetsDB.getAll('Users', getTokens(req));
    res.json({ success: true, data });
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
    await sheetsDB.update('Users', req.params.id, { role }, getTokens(req));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
