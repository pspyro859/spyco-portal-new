/**
 * Export Routes
 * Download data as CSV/Excel files
 */

const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const sheetsDB = require('../services/sheetsDB');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.tokens) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

const getTokens = (req) => req.session.tokens;

/**
 * GET /api/export/properties
 * Export properties as CSV
 */
router.get('/properties', async (req, res) => {
  try {
    const data = await sheetsDB.getAll('Properties', getTokens(req));
    
    const fields = ['code', 'address', 'entity', 'status', 'tenant', 'rent', 'leaseStart', 'leaseEnd', 'notes', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-properties-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/export/contacts
 * Export contacts/suppliers as CSV
 */
router.get('/contacts', async (req, res) => {
  try {
    const data = await sheetsDB.getAll('Contacts', getTokens(req));
    
    const fields = ['code', 'name', 'category', 'phone', 'email', 'person', 'notes', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-contacts-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/export/projects
 * Export projects as CSV
 */
router.get('/projects', async (req, res) => {
  try {
    const data = await sheetsDB.getAll('Projects', getTokens(req));
    
    const fields = ['name', 'site', 'entity', 'status', 'type', 'start', 'due', 'budget', 'notes', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-projects-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/export/invoices
 * Export invoices as CSV
 */
router.get('/invoices', async (req, res) => {
  try {
    const data = await sheetsDB.getAll('Invoices', getTokens(req));
    
    const fields = ['date', 'supplier', 'site', 'entity', 'amount', 'status', 'desc', 'notes', 'commsRef', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-invoices-${formatDateForFile()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/export/all
 * Export all data as a single JSON file (full backup)
 */
router.get('/all', async (req, res) => {
  try {
    const tokens = getTokens(req);
    
    const [properties, contacts, projects, invoices, documents, activity] = await Promise.all([
      sheetsDB.getAll('Properties', tokens),
      sheetsDB.getAll('Contacts', tokens),
      sheetsDB.getAll('Projects', tokens),
      sheetsDB.getAll('Invoices', tokens),
      sheetsDB.getAll('Documents', tokens),
      sheetsDB.getAll('Activity', tokens)
    ]);

    const backup = {
      exportDate: new Date().toISOString(),
      exportedBy: req.session.user.email,
      data: {
        properties,
        contacts,
        projects,
        invoices,
        documents,
        activity
      },
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

/**
 * GET /api/export/report
 * Generate a summary report
 */
router.get('/report', async (req, res) => {
  try {
    const tokens = getTokens(req);
    
    const [properties, contacts, projects, invoices] = await Promise.all([
      sheetsDB.getAll('Properties', tokens),
      sheetsDB.getAll('Contacts', tokens),
      sheetsDB.getAll('Projects', tokens),
      sheetsDB.getAll('Invoices', tokens)
    ]);

    // Calculate summaries
    const tenantedCount = properties.filter(p => p.status === 'Tenanted').length;
    const vacantCount = properties.filter(p => p.status === 'Vacant').length;
    const totalRent = properties.reduce((sum, p) => sum + (parseFloat(p.rent) || 0), 0);
    
    const activeProjects = projects.filter(p => !['Complete'].includes(p.status)).length;
    
    const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue');
    const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

    // Group properties by entity
    const byEntity = {};
    properties.forEach(p => {
      if (!byEntity[p.entity]) byEntity[p.entity] = { count: 0, rent: 0 };
      byEntity[p.entity].count++;
      byEntity[p.entity].rent += parseFloat(p.rent) || 0;
    });

    // Build report
    const report = [
      '═══════════════════════════════════════════════════════════════',
      '                    SPYCO GROUP PORTAL REPORT                   ',
      '═══════════════════════════════════════════════════════════════',
      `Generated: ${new Date().toLocaleString('en-AU')}`,
      `Generated by: ${req.session.user.email}`,
      '',
      '───────────────────────────────────────────────────────────────',
      '                      PROPERTY SUMMARY                          ',
      '───────────────────────────────────────────────────────────────',
      `Total Properties: ${properties.length}`,
      `  • Tenanted: ${tenantedCount}`,
      `  • Vacant: ${vacantCount}`,
      `  • Development: ${properties.filter(p => p.status === 'Development').length}`,
      `Total Weekly Rent: $${totalRent.toLocaleString()}/week`,
      `Annual Rental Income: $${(totalRent * 52).toLocaleString()}/year`,
      '',
      'By Entity:',
      ...Object.entries(byEntity).map(([entity, data]) => 
        `  [${entity}] ${data.count} properties - $${data.rent.toLocaleString()}/week`
      ),
      '',
      '───────────────────────────────────────────────────────────────',
      '                      CONTACTS SUMMARY                          ',
      '───────────────────────────────────────────────────────────────',
      `Total Contacts: ${contacts.length}`,
      '',
      '───────────────────────────────────────────────────────────────',
      '                      PROJECTS SUMMARY                          ',
      '───────────────────────────────────────────────────────────────',
      `Total Projects: ${projects.length}`,
      `  • Active: ${activeProjects}`,
      `  • Complete: ${projects.filter(p => p.status === 'Complete').length}`,
      '',
      '───────────────────────────────────────────────────────────────',
      '                      INVOICES SUMMARY                          ',
      '───────────────────────────────────────────────────────────────',
      `Total Invoices: ${invoices.length}`,
      `  • Unpaid: ${unpaidInvoices.length} ($${totalUnpaid.toLocaleString()})`,
      `  • Paid: ${invoices.filter(i => i.status === 'Paid').length} ($${totalPaid.toLocaleString()})`,
      '',
      '═══════════════════════════════════════════════════════════════',
      '                         END OF REPORT                          ',
      '═══════════════════════════════════════════════════════════════',
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-report-${formatDateForFile()}.txt`);
    res.send(report);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function
function formatDateForFile() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

module.exports = router;
