/* ============================================================
   SPYCO PORTAL — data.js
   Local Storage Fallback & Sample Data
   ============================================================ */

'use strict';

const DB = {
  prefix: 'spyco_',

  get(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) { return false; }
  },

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
  },

  // Session management
  getSession() {
    return this.get('session');
  },

  setSession(user) {
    this.set('session', user);
  },

  clearSession() {
    this.remove('session');
  },

  // Seed sample data if empty
  seedAll() {
    if (!this.get('properties') || this.get('properties').length === 0) {
      this.set('properties', [
        { id: '1', code: '12-LLO', address: '12 Lloyd Road, Lambton', entity: 'SPY', status: 'Tenanted', tenant: 'John Smith', rent: '650', leaseEnd: '2026-06-30' },
        { id: '2', code: '66-CHA', address: '66 Charlton Street, Lambton', entity: 'SPY', status: 'Tenanted', tenant: 'ABC Corp', rent: '780', leaseEnd: '2026-12-15' },
        { id: '3', code: '49-MOR', address: '49 Morpeth Road, East Maitland', entity: 'SPY', status: 'Development', tenant: '', rent: '', leaseEnd: '' },
        { id: '4', code: '33-CUR', address: '33 Curry Street, Merewether', entity: 'KAL', status: 'Tenanted', tenant: 'Jane Doe', rent: '550', leaseEnd: '2026-08-20' },
        { id: '5', code: '113-DUR', address: '113 Durham Road, Lambton', entity: 'REV', status: 'Vacant', tenant: '', rent: '600', leaseEnd: '' }
      ]);
    }

    if (!this.get('contacts') || this.get('contacts').length === 0) {
      this.set('contacts', [
        { id: '1', code: 'BAY', name: 'Bay Pumps & Plumbing', category: 'Trade', phone: '0412 345 678', email: 'info@baypumps.com.au', person: 'Mike' },
        { id: '2', code: 'ELI', name: 'Elite Electrical', category: 'Trade', phone: '0423 456 789', email: 'jobs@elite.com.au', person: 'Steve' },
        { id: '3', code: 'NKA', name: 'Newcastle Kitchens AU', category: 'Trade', phone: '0234 567 890', email: 'quote@nkitchens.com.au', person: '' },
        { id: '4', code: 'RAY', name: 'Ray White Newcastle', category: 'Agent', phone: '02 4929 0000', email: 'newcastle@raywhite.com', person: 'Sarah' },
        { id: '5', code: 'ANZ', name: 'ANZ Bank', category: 'Accounting', phone: '13 13 14', email: '', person: '' }
      ]);
    }

    if (!this.get('projects') || this.get('projects').length === 0) {
      this.set('projects', [
        { id: '1', name: 'Bore Pump Installation', site: '12-LLO', entity: 'SPY', status: 'In Progress', type: 'Maintenance', start: '2026-01-15', due: '2026-02-28' },
        { id: '2', name: 'DA Submission - Duplex', site: '49-MOR', entity: 'SPY', status: 'DA Submitted', type: 'Development', start: '2025-11-01', due: '2026-03-01' },
        { id: '3', name: 'Kitchen Renovation', site: '66-CHA', entity: 'SPY', status: 'Planning', type: 'Renovation', start: '', due: '2026-04-15' }
      ]);
    }

    if (!this.get('invoices') || this.get('invoices').length === 0) {
      this.set('invoices', [
        { id: '1', date: '2026-01-10', supplier: 'Bay Pumps & Plumbing', site: '12-LLO', entity: 'SPY', amount: '4500', status: 'Unpaid', commsRef: 'SPY_12-LLO_BAY_INV_250110' },
        { id: '2', date: '2026-01-08', supplier: 'Elite Electrical', site: '66-CHA', entity: 'SPY', amount: '1200', status: 'Paid', commsRef: 'SPY_66-CHA_ELI_INV_250108' }
      ]);
    }

    if (!this.get('activity') || this.get('activity').length === 0) {
      this.set('activity', [
        { id: '1', text: 'Portal launched — Spyco Group', color: '#22c55e', timestamp: new Date().toISOString() }
      ]);
    }
  }
};

// Expose globally
window.DB = DB;
