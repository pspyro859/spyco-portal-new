/**
 * Reference Data & Import/Export Routes
 */

const express = require('express');
const router = express.Router();
const { pool, logActivity } = require('../services/db');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
// REFERENCE DATA
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/reference
 * Get all reference data grouped by category
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM reference_data ORDER BY category, code');
    
    // Group by category
    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push({ code: r.code, name: r.name, description: r.description, id: r.id });
    });
    
    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// EXPORT — Download all data as CSV
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/reference/export/all
 * Export everything as a single CSV file
 */
router.get('/export/all', async (req, res) => {
  try {
    const [properties] = await pool.execute('SELECT * FROM properties ORDER BY code');
    const [contacts] = await pool.execute('SELECT * FROM contacts ORDER BY code');
    const [projects] = await pool.execute('SELECT * FROM projects ORDER BY name');
    const [invoices] = await pool.execute('SELECT * FROM invoices ORDER BY date DESC');
    const [reference] = await pool.execute('SELECT * FROM reference_data ORDER BY category, code');
    
    // Build CSV with sections
    let csv = '';
    
    // -- PROPERTIES --
    csv += '=== PROPERTIES ===\n';
    csv += 'code,address,entity,status,tenant,rent,lease_start,lease_end,notes\n';
    properties.forEach(p => {
      csv += csvRow([p.code, p.address, p.entity, p.status, p.tenant, p.rent, p.lease_start, p.lease_end, p.notes]);
    });
    
    csv += '\n=== CONTACTS ===\n';
    csv += 'code,name,category,phone,email,person,notes\n';
    contacts.forEach(c => {
      csv += csvRow([c.code, c.name, c.category, c.phone, c.email, c.person, c.notes]);
    });
    
    csv += '\n=== PROJECTS ===\n';
    csv += 'name,site,entity,status,type,start_date,due_date,budget,notes\n';
    projects.forEach(p => {
      csv += csvRow([p.name, p.site, p.entity, p.status, p.type, p.start_date, p.due_date, p.budget, p.notes]);
    });
    
    csv += '\n=== INVOICES ===\n';
    csv += 'date,due_date,supplier,site,entity,invoice_ref,amount,gst,status,paid_date,paid_amount,description,comms_ref,notes\n';
    invoices.forEach(i => {
      csv += csvRow([i.date, i.due_date, i.supplier, i.site, i.entity, i.invoice_ref, i.amount, i.gst, i.status, i.paid_date, i.paid_amount, i.description, i.comms_ref, i.notes]);
    });
    
    csv += '\n=== REFERENCE ===\n';
    csv += 'category,code,name,description\n';
    reference.forEach(r => {
      csv += csvRow([r.category, r.code, r.name, r.description]);
    });
    
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=spyco-portal-export-${date}.csv`);
    res.send('\uFEFF' + csv); // BOM for Excel
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reference/export/:type
 * Export a specific data type as CSV
 */
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let rows, headers, filename;
    
    switch (type) {
      case 'properties':
        [rows] = await pool.execute('SELECT code, address, entity, status, tenant, rent, lease_start, lease_end, notes FROM properties ORDER BY code');
        headers = 'code,address,entity,status,tenant,rent,lease_start,lease_end,notes';
        filename = 'spyco-properties';
        break;
      case 'contacts':
        [rows] = await pool.execute('SELECT code, name, category, phone, email, person, notes FROM contacts ORDER BY code');
        headers = 'code,name,category,phone,email,person,notes';
        filename = 'spyco-contacts';
        break;
      case 'projects':
        [rows] = await pool.execute('SELECT name, site, entity, status, type, start_date, due_date, budget, notes FROM projects ORDER BY name');
        headers = 'name,site,entity,status,type,start_date,due_date,budget,notes';
        filename = 'spyco-projects';
        break;
      case 'invoices':
        [rows] = await pool.execute('SELECT date, due_date, supplier, site, entity, invoice_ref, amount, gst, status, paid_date, paid_amount, description, comms_ref, notes FROM invoices ORDER BY date DESC');
        headers = 'date,due_date,supplier,site,entity,invoice_ref,amount,gst,status,paid_date,paid_amount,description,comms_ref,notes';
        filename = 'spyco-invoices';
        break;
      case 'reference':
        [rows] = await pool.execute('SELECT category, code, name, description FROM reference_data ORDER BY category, code');
        headers = 'category,code,name,description';
        filename = 'spyco-reference';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid export type' });
    }
    
    let csv = headers + '\n';
    rows.forEach(r => {
      csv += csvRow(Object.values(r));
    });
    
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}-${date}.csv`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// IMPORT — Upload CSV to bulk load data
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/reference/import
 * Import CSV data — auto-detects type from headers or section markers
 */
router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  try {
    const content = req.file.buffer.toString('utf-8').replace(/^\uFEFF/, ''); // strip BOM
    const results = { properties: 0, contacts: 0, projects: 0, invoices: 0, reference: 0, errors: [] };
    
    // Split into sections if multi-section file
    const sections = content.split(/^=== (\w+) ===/m);
    
    if (sections.length > 1) {
      // Multi-section file
      for (let i = 1; i < sections.length; i += 2) {
        const sectionName = sections[i].trim().toLowerCase();
        const sectionData = sections[i + 1].trim();
        if (sectionData) {
          const count = await importSection(sectionName, sectionData, results);
        }
      }
    } else {
      // Single section — detect from headers
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({ success: false, message: 'File is empty or has no data rows' });
      }
      
      const header = lines[0].toLowerCase().trim();
      let sectionName;
      
      if (header.includes('category') && header.includes('code') && header.includes('description')) {
        sectionName = 'reference';
      } else if (header.includes('address')) {
        sectionName = 'properties';
      } else if (header.includes('supplier') && header.includes('amount')) {
        sectionName = 'invoices';
      } else if (header.includes('category') && header.includes('phone')) {
        sectionName = 'contacts';
      } else if (header.includes('site') && header.includes('budget')) {
        sectionName = 'projects';
      } else if (header.includes('code') && header.includes('name')) {
        // Could be contacts or reference — check for category column
        sectionName = header.includes('category') ? 'contacts' : 'reference';
      } else {
        return res.status(400).json({ success: false, message: 'Could not detect data type from CSV headers. Use headers matching: properties, contacts, projects, invoices, or reference.' });
      }
      
      await importSection(sectionName, content, results);
    }
    
    await logActivity(`Data imported: ${results.properties}P ${results.contacts}C ${results.projects}Pr ${results.invoices}I ${results.reference}R`, '#22c55e', userId(req));
    
    res.json({ 
      success: true, 
      message: 'Import complete',
      imported: results,
      errors: results.errors.slice(0, 10) // max 10 errors
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Import failed: ' + error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

async function importSection(sectionName, csvData, results) {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return;
  
  const headers = parseCSVLine(lines[0]);
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('===')) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim().toLowerCase().replace(/\s+/g, '_')] = (values[idx] || '').trim();
    });
    
    try {
      switch (sectionName) {
        case 'properties':
          if (!row.code && !row.address) break;
          await pool.execute(
            'INSERT INTO properties (code, address, entity, status, tenant, rent, lease_start, lease_end, notes) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE address=VALUES(address), entity=VALUES(entity), status=VALUES(status), tenant=VALUES(tenant), rent=VALUES(rent), notes=VALUES(notes)',
            [row.code, row.address, row.entity || 'SPY', row.status || 'Vacant', row.tenant || null, row.rent || null, row.lease_start || null, row.lease_end || null, row.notes || null]
          );
          results.properties++;
          break;
          
        case 'contacts':
          if (!row.code && !row.name) break;
          await pool.execute(
            'INSERT INTO contacts (code, name, category, phone, email, person, notes) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), phone=VALUES(phone), email=VALUES(email), person=VALUES(person), notes=VALUES(notes)',
            [row.code, row.name, row.category || null, row.phone || null, row.email || null, row.person || null, row.notes || null]
          );
          results.contacts++;
          break;
          
        case 'projects':
          if (!row.name) break;
          await pool.execute(
            'INSERT INTO projects (name, site, entity, status, type, start_date, due_date, budget, notes) VALUES (?,?,?,?,?,?,?,?,?)',
            [row.name, row.site || null, row.entity || null, row.status || 'Planning', row.type || null, row.start_date || null, row.due_date || null, row.budget || null, row.notes || null]
          );
          results.projects++;
          break;
          
        case 'invoices':
          if (!row.supplier) break;
          await pool.execute(
            'INSERT INTO invoices (date, due_date, supplier, site, entity, invoice_ref, amount, gst, status, paid_date, paid_amount, description, comms_ref, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [row.date || null, row.due_date || null, row.supplier, row.site || null, row.entity || null, row.invoice_ref || null, row.amount || 0, row.gst || 0, row.status || 'Unpaid', row.paid_date || null, row.paid_amount || null, row.description || null, row.comms_ref || null, row.notes || null]
          );
          results.invoices++;
          break;
          
        case 'reference':
          if (!row.category || !row.code) break;
          await pool.execute(
            'INSERT INTO reference_data (category, code, name, description) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)',
            [row.category, row.code, row.name || row.code, row.description || null]
          );
          results.reference++;
          break;
      }
    } catch (err) {
      results.errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function csvRow(values) {
  return values.map(v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',') + '\n';
}

module.exports = router;
