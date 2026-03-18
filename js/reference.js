/* ============================================================
   SPYCO PORTAL — Reference Data from SPY COMMS Master Sheet
   ============================================================ */

'use strict';

const SPYCO_REFERENCE = {
  // SUBJECT CODES
  Subject: [
    { code: 'ACTION REQ', name: 'Execution', description: 'Urgent: Signatures, decisions, or tasks Pete needs to do.' },
    { code: 'ADVICE', name: 'Expertise', description: 'Consultants: Reports or guidance from Amodio, Legal, or Architects.' },
    { code: 'DATA', name: 'Analysis', description: 'Numbers: Spreadsheets, yield calcs, or financial data files.' },
    { code: 'INFO', name: 'General', description: 'General: Market updates, research, and non-action correspondence.' },
    { code: 'INVOICE', name: 'Payable', description: 'Bills: Trade invoices, utility bills, or progress claims.' },
    { code: 'LEGAL', name: 'Compliance', description: 'Official: Contracts, Council DAs, Certificates, or formal Notices.' },
    { code: 'PHOTO', name: 'Evidence', description: 'Visuals: Site photos, progress shots, or receipt snapshots.' },
    { code: 'PLAN', name: 'Technical', description: 'Technical: Site drawings, mapping, or strategic guides.' },
    { code: 'STATEMENT', name: 'Accounting/Tax', description: 'Financials: Bank statements, rental ledgers, or loan summaries.' }
  ],

  // SYSTEMS CODES
  Systems: [
    { code: '1-FIN', name: 'FINANCE', description: 'Active Financials: Bank statements, loan records, tax returns.' },
    { code: '2-PRO', name: 'PROJECTS', description: 'Active Works: Site development, renovation plans, maintenance.' },
    { code: '3-SUP', name: 'SUPPLIERS', description: 'Trades/Vendors: Utility bills, trade invoices, vendor receipts.' },
    { code: '4-AGR', name: 'AGREEMENTS', description: 'Legal/Leases: Tenancy contracts, NDAs, signed legal docs.' },
    { code: '5-INT', name: 'INTERNAL', description: 'Personal Admin: Family schedules, personal travel, admin notes.' },
    { code: '6-ARC', name: 'ARCHIVE', description: 'Dead Data: Closed financial years, expired contracts, old logs.' }
  ],

  // STRUCTURE CODES (Entities)
  Structure: [
    { code: 'VS', name: 'Vicki Spyropoulos', description: 'Individual Director/Owner.' },
    { code: 'JS', name: 'Jimmy Spyropoulos', description: 'Dimitrios (Jimmy) Spyropoulos: Managing Director.' },
    { code: 'PS', name: 'Peter Spyropoulos', description: 'Peter (Pete) Spyropoulos: Individual Director/Owner.' },
    { code: 'KAL', name: 'Kalazo', description: 'Kalazo Pty Ltd: ATF The Kalazo SMSF.' },
    { code: 'REV', name: 'Revma', description: 'Revma Pty Ltd: Electrical, Building & Property Maintenance.' },
    { code: 'SPY', name: 'SPYCO', description: 'Spyco Pty Ltd: ATF The Spyropoulos Family Trust.' },
    { code: 'CONSULTING', name: 'SPY Consulting', description: 'Business Development Consulting: Revma, Equal Care, Dreamtime.' },
    { code: 'GR', name: 'Greece', description: 'International: Offshore Assets & Logistics.' }
  ],

  // SITES
  Sites: [
    { code: '12-LLO', name: 'LLOYD', description: '12 Lloyd Road Lambton, NSW 2299' },
    { code: '66-CHA', name: 'CHARLTON', description: '66 Charlton Street Lambton, NSW 2299' },
    { code: '1-1A-DAV', name: 'STAPLETON U1', description: '1/1A Davis Avenue Wallsend, NSW 2287' },
    { code: '2-1A-DAV', name: 'STAPLETON U2', description: '2/1A Davis Avenue Wallsend, NSW 2287' },
    { code: '3-A-DAV', name: 'STAPLETON U3', description: '3/1A Davis Avenue Wallsend, NSW 2287' },
    { code: '4-1A-DAV', name: 'STAPLETON U4', description: '4/1A Davis Avenue Wallsend, NSW 2287' },
    { code: '33-CUR', name: 'CURRY', description: '33 Curry Street Wallsend, NSW 2287' },
    { code: '35-CUR', name: 'CURRY', description: '35 Curry Street Wallsend, NSW 2287' },
    { code: '05-ARM', name: 'ARMSTRONG', description: '5 Armstrong Street Lambton, NSW 2299' },
    { code: '5A-ARM', name: 'ARMSTRONG', description: '5a Armstrong Street Lambton, NSW 2299' },
    { code: '113-DUR', name: 'DURHAM', description: '113 Durham Road Lambton, NSW 2299' },
    { code: '49-MOR', name: 'MORPETH', description: '49 Morpeth Road Waratah West, NSW 2298' },
    { code: '29-DIC', name: 'DICKSON', description: '29 Dickson Street Lambton, NSW 2299' },
    { code: '19-DIC', name: 'DICKSON', description: '19 Dickson Street Lambton, NSW 2299' },
    { code: '9-12-CHA', name: 'SHED', description: '9/12 Channel Road Mayfield West, NSW 2304' }
  ],

  // SUPPLIERS
  Suppliers: [
    { code: 'AGE', name: 'AGL Electricity', description: 'Utility/Power: Active portfolio electricity accounts.' },
    { code: 'AGG', name: 'AGL Gas', description: 'Utility/Gas: Residential and development gas accounts.' },
    { code: 'AMO', name: 'Amodio Services', description: 'Accountant: Tax, SMSF, and business compliance.' },
    { code: 'ARG', name: 'Argiris & Co', description: 'Legal/The Junction: Jim Argiris and solicitors.' },
    { code: 'ABB', name: 'Aussie Broadband', description: 'Internet/Comms: High-speed business and residential.' },
    { code: 'AXM', name: 'Axiom Compliance', description: 'TAE Training: SOP development and assessments.' },
    { code: 'BAC', name: 'Bacon Surveying', description: 'Survey/Coast: Richard Bacon - Technical feasibility.' },
    { code: 'BPP', name: 'Bay Pumps & Plumbing', description: 'Plumbing/Pumps: Nelson Bay specialists - Bores and pumps.' },
    { code: 'BJS', name: 'BJS Planning', description: 'Town Planning: DA strategy and council liaison.' },
    { code: 'CSP', name: 'CareSuper', description: 'Financial/Super: Standalone industry super fund.' },
    { code: 'CRI', name: 'Certify Right', description: 'Active Certifier: Fadi Habbouche - Building approvals.' },
    { code: 'CSL', name: 'Certifying Solutions', description: 'Historical Certifier: Chris Rushford - Bankruptcy filings.' },
    { code: 'COL', name: 'Colorado Homes', description: 'Custom Builder: Mitch - Duplexes and townhouses.' },
    { code: 'CBA', name: 'CommBank', description: 'Banking: Commonwealth Bank business accounts.' },
    { code: 'ELD', name: 'Elders Insurance', description: 'Insurance: Portfolio and project coverage.' },
    { code: 'ELK', name: 'ELK Architecture', description: 'Architect/Broadmeadow: Design and interior planning.' },
    { code: 'EQC', name: 'Equal Care', description: 'Corporate Leases: Bill Moshos - NDIS and agreements.' },
    { code: '4WC', name: 'Four Walls', description: 'Agent/Commercial: Bobby - Commercial Management.' },
    { code: 'GAM', name: 'GAM Solicitors', description: 'Legal/The Junction: Jim Argiris and Graeme McDonald.' },
    { code: 'GSR', name: 'Green St Realty', description: 'Agent/Residential: Green Street Property Management.' },
    { code: 'HWC', name: 'Hunter Water', description: 'Water Utility: Section 50 and separate metering.' },
    { code: 'LOV', name: 'LOVE Realty', description: 'Agent/Residential: Love Realty Property Management.' },
    { code: 'MAC', name: 'Macquarie Bank', description: 'Banking: Macquarie business and investment accounts.' },
    { code: 'MUL', name: 'Multi Point', description: 'Architect/Woodbury: Nick Woodbury - Design and documentation.' },
    { code: 'NAB', name: 'NAB', description: 'Banking: National Australia Bank business accounts.' },
    { code: 'NBT', name: 'nabtrade', description: 'Share Trading: WealthHub and portfolio investments.' },
    { code: 'NCC', name: 'Newcastle City Council', description: 'Local Government: Rates, DAs, and compliance.' },
    { code: 'NDM', name: 'Newcastle Demolition', description: 'Site Clearing: Demolition and hazardous waste removal.' },
    { code: 'OCP', name: "O'Connell Plumbing", description: 'Plumbing/Drainage: Main projects and complex drainage.' },
    { code: 'RED', name: 'RedZed', description: 'Financial/Lending: Specialized portfolio lending.' },
    { code: 'REV', name: 'Revma', description: 'Internal Maintenance: Electrical, repairs, and portfolio works.' },
    { code: 'THI', name: 'Thiaki Surveying', description: 'Surveyor: Andrew Sykiotis - Registered Surveyor.' },
    { code: 'YHD', name: 'Your Home Design', description: 'Design/Drafting: Project concepts and drafting services.' },
    { code: 'DOW', name: 'Downer-EDI', description: 'Infrastructure contractor.' },
    { code: 'ENE', name: 'Energy Australia', description: 'Utility provider.' },
    { code: 'ATO', name: 'Australian Tax Office', description: 'Government: Tax compliance and lodgements.' },
    { code: 'AUS', name: 'Aussie Buckets', description: 'Equipment hire.' },
    { code: 'ORI', name: 'Origin Energy', description: 'Utility provider.' },
    { code: 'REE', name: 'Red Energy', description: 'Utility provider.' },
    { code: 'TEL', name: 'Telstra', description: 'Telecommunications provider.' },
    { code: 'OPT', name: 'Optus', description: 'Telecommunications provider.' }
  ],

  // FINANCIAL YEARS (for Archive)
  Financial: [
    { code: 'FY24', name: '2023-2024', description: 'Financial Year July 2023 - June 2024' },
    { code: 'FY25', name: '2024-2025', description: 'Financial Year July 2024 - June 2025' },
    { code: 'FY26', name: '2025-2026', description: 'Financial Year July 2025 - June 2026' },
    { code: 'FY27', name: '2026-2027', description: 'Financial Year July 2026 - June 2027' },
    { code: 'FY28', name: '2027-2028', description: 'Financial Year July 2027 - June 2028' },
    { code: 'FY29', name: '2028-2029', description: 'Financial Year July 2028 - June 2029' },
    { code: 'FY30', name: '2029-2030', description: 'Financial Year July 2029 - June 2030' }
  ],

  // QUARTERS
  Quarters: [
    { code: 'Q1', name: 'Q1 JUL-SEP', description: 'July-September: New FY kick-off, EOFY tax docs' },
    { code: 'Q2', name: 'Q2 OCT-DEC', description: 'October-December: Mid-year invoices, project progress' },
    { code: 'Q3', name: 'Q3 JAN-MAR', description: 'January-March: Quarterly statements, DA submissions' },
    { code: 'Q4', name: 'Q4 APR-JUN', description: 'April-June: EOFY prep, final invoices' }
  ]
};

// Load into app data
function loadSpycoReference() {
  if (!window.appData) window.appData = {};
  window.appData.reference = SPYCO_REFERENCE;
  
  // Also save to localStorage for persistence
  Object.keys(SPYCO_REFERENCE).forEach(key => {
    const existing = DB.get('reference_' + key);
    if (!existing || existing.length === 0) {
      DB.set('reference_' + key, SPYCO_REFERENCE[key]);
    }
  });
}

// Expose globally
window.SPYCO_REFERENCE = SPYCO_REFERENCE;
window.loadSpycoReference = loadSpycoReference;
