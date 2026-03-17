/**
 * Google Sheets Database Service
 * Uses Google Sheets as a simple database
 */

const { google } = require('googleapis');
const googleAuth = require('./googleAuth');

class SheetsDBService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.SPREADSHEET_ID || null;
    
    // Sheet names (tabs in the spreadsheet)
    this.SHEETS = {
      USERS: 'Users',
      PROPERTIES: 'Properties',
      CONTACTS: 'Contacts',
      PROJECTS: 'Projects',
      INVOICES: 'Invoices',
      DOCUMENTS: 'Documents',
      ACTIVITY: 'Activity'
    };
  }

  /**
   * Initialize sheets API with user's tokens
   */
  init(tokens) {
    googleAuth.setCredentials(tokens);
    this.sheets = google.sheets({ version: 'v4', auth: googleAuth.getClient() });
  }

  /**
   * Create initial spreadsheet with all required sheets
   */
  async createSpreadsheet(tokens) {
    this.init(tokens);
    const drive = google.drive({ version: 'v3', auth: googleAuth.getClient() });

    // Create spreadsheet
    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'Spyco Portal Database' },
        sheets: Object.values(this.SHEETS).map(name => ({
          properties: { title: name }
        }))
      }
    });

    this.spreadsheetId = response.data.spreadsheetId;

    // Add headers to each sheet
    await this.initializeHeaders();

    return this.spreadsheetId;
  }

  /**
   * Initialize headers for all sheets
   */
  async initializeHeaders() {
    const headers = {
      [this.SHEETS.USERS]: ['id', 'email', 'name', 'picture', 'role', 'createdAt', 'lastLogin'],
      [this.SHEETS.PROPERTIES]: ['id', 'code', 'address', 'entity', 'status', 'tenant', 'rent', 'leaseStart', 'leaseEnd', 'notes', 'createdAt', 'updatedAt'],
      [this.SHEETS.CONTACTS]: ['id', 'code', 'name', 'category', 'phone', 'email', 'person', 'notes', 'createdAt', 'updatedAt'],
      [this.SHEETS.PROJECTS]: ['id', 'name', 'site', 'entity', 'status', 'type', 'start', 'due', 'budget', 'notes', 'createdAt', 'updatedAt'],
      [this.SHEETS.INVOICES]: ['id', 'date', 'supplier', 'site', 'entity', 'amount', 'status', 'desc', 'notes', 'commsRef', 'createdAt', 'updatedAt'],
      [this.SHEETS.DOCUMENTS]: ['id', 'name', 'date', 'site', 'system', 'driveFileId', 'createdAt'],
      [this.SHEETS.ACTIVITY]: ['id', 'text', 'color', 'userId', 'timestamp']
    };

    for (const [sheet, headerRow] of Object.entries(headers)) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheet}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headerRow] }
      });
    }
  }

  /**
   * Get all rows from a sheet
   */
  async getAll(sheetName, tokens) {
    this.init(tokens);
    
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return []; // Only headers or empty

      const headers = rows[0];
      return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error(`Error getting ${sheetName}:`, error.message);
      return [];
    }
  }

  /**
   * Add a row to a sheet
   */
  async add(sheetName, data, tokens) {
    this.init(tokens);

    // Get headers
    const headerResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!1:1`
    });
    const headers = headerResponse.data.values[0];

    // Create row in correct order
    const row = headers.map(header => data[header] || '');

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    return data;
  }

  /**
   * Update a row by ID
   */
  async update(sheetName, id, data, tokens) {
    this.init(tokens);

    // Get all data to find row index
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const idIndex = headers.indexOf('id');
    
    // Find row with matching ID
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Record not found');
    }

    // Merge existing data with updates
    const existingData = {};
    headers.forEach((header, i) => {
      existingData[header] = rows[rowIndex - 1][i] || '';
    });
    const updatedData = { ...existingData, ...data, updatedAt: new Date().toISOString() };

    // Create row in correct order
    const row = headers.map(header => updatedData[header] || '');

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] }
    });

    return updatedData;
  }

  /**
   * Delete a row by ID
   */
  async delete(sheetName, id, tokens) {
    this.init(tokens);

    // Get all data to find row index
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const idIndex = headers.indexOf('id');

    // Find row with matching ID
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i; // 0-indexed for delete request
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Record not found');
    }

    // Get sheet ID
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId
    });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    const sheetId = sheet.properties.sheetId;

    // Delete the row
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    return { success: true };
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email, tokens) {
    const users = await this.getAll(this.SHEETS.USERS, tokens);
    return users.find(u => u.email === email) || null;
  }

  /**
   * Log activity
   */
  async logActivity(text, color, userId, tokens) {
    await this.add(this.SHEETS.ACTIVITY, {
      id: this.generateId(),
      text,
      color: color || '#e94560',
      userId,
      timestamp: new Date().toISOString()
    }, tokens);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Set spreadsheet ID
   */
  setSpreadsheetId(id) {
    this.spreadsheetId = id;
  }
}

module.exports = new SheetsDBService();
