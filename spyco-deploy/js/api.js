/* ============================================================
   SPYCO GROUP PORTAL — api.js
   API Client for Node.js Backend with Google Drive Database
   ============================================================ */

'use strict';

const API = {
  baseUrl: '/api',

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // ── Auth ────────────────────────────────────────────────────

  async checkAuth() {
    return this.request('/auth/check');
  },

  async getAuthUrl() {
    return this.request('/auth/url');
  },

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  },

  // ── Properties ──────────────────────────────────────────────

  async getProperties() {
    return this.request('/data/properties');
  },

  async addProperty(data) {
    return this.request('/data/properties', { method: 'POST', body: data });
  },

  async updateProperty(id, data) {
    return this.request(`/data/properties/${id}`, { method: 'PUT', body: data });
  },

  async deleteProperty(id) {
    return this.request(`/data/properties/${id}`, { method: 'DELETE' });
  },

  // ── Contacts ────────────────────────────────────────────────

  async getContacts() {
    return this.request('/data/contacts');
  },

  async addContact(data) {
    return this.request('/data/contacts', { method: 'POST', body: data });
  },

  async updateContact(id, data) {
    return this.request(`/data/contacts/${id}`, { method: 'PUT', body: data });
  },

  async deleteContact(id) {
    return this.request(`/data/contacts/${id}`, { method: 'DELETE' });
  },

  // ── Projects ────────────────────────────────────────────────

  async getProjects() {
    return this.request('/data/projects');
  },

  async addProject(data) {
    return this.request('/data/projects', { method: 'POST', body: data });
  },

  async updateProject(id, data) {
    return this.request(`/data/projects/${id}`, { method: 'PUT', body: data });
  },

  async deleteProject(id) {
    return this.request(`/data/projects/${id}`, { method: 'DELETE' });
  },

  // ── Invoices ────────────────────────────────────────────────

  async getInvoices() {
    return this.request('/data/invoices');
  },

  async addInvoice(data) {
    return this.request('/data/invoices', { method: 'POST', body: data });
  },

  async updateInvoice(id, data) {
    return this.request(`/data/invoices/${id}`, { method: 'PUT', body: data });
  },

  async deleteInvoice(id) {
    return this.request(`/data/invoices/${id}`, { method: 'DELETE' });
  },

  // ── Documents ───────────────────────────────────────────────

  async getDocuments() {
    return this.request('/data/documents');
  },

  async addDocument(data) {
    return this.request('/data/documents', { method: 'POST', body: data });
  },

  async deleteDocument(id) {
    return this.request(`/data/documents/${id}`, { method: 'DELETE' });
  },

  // ── Activity ────────────────────────────────────────────────

  async getActivity() {
    return this.request('/data/activity');
  },

  // ── Users ───────────────────────────────────────────────────

  async getUsers() {
    return this.request('/data/users');
  },

  async updateUserRole(id, role) {
    return this.request(`/data/users/${id}/role`, { method: 'PUT', body: { role } });
  },

  // ── Drive ───────────────────────────────────────────────────

  async getDriveFolders() {
    return this.request('/drive/folders');
  },

  async getDriveFiles(folderId = null) {
    const query = folderId ? `?folderId=${folderId}` : '';
    return this.request(`/drive/files${query}`);
  },

  async searchDriveFiles(query) {
    return this.request(`/drive/search?q=${encodeURIComponent(query)}`);
  },

  async uploadFile(fileName, content, folderId = null) {
    return this.request('/drive/files', {
      method: 'POST',
      body: { fileName, content, folderId }
    });
  },

  async deleteDriveFile(id) {
    return this.request(`/drive/files/${id}`, { method: 'DELETE' });
  },

  // ── Email ───────────────────────────────────────────────────

  async sendEmail(to, subject, body, cc = '', bcc = '') {
    return this.request('/email/send', {
      method: 'POST',
      body: { to, subject, body, cc, bcc }
    });
  },

  async testEmail() {
    return this.request('/email/test');
  }
};

// ── Expose globally ─────────────────────────────────────────────
window.API = API;
