/**
 * Google Drive Service
 * Handles file operations with Google Drive
 */

const { google } = require('googleapis');
const googleAuth = require('./googleAuth');

class DriveService {
  constructor() {
    this.drive = null;
    this.folderId = null; // Spyco Portal folder ID
  }

  /**
   * Initialize drive API with user's tokens
   */
  init(tokens) {
    googleAuth.setCredentials(tokens);
    this.drive = google.drive({ version: 'v3', auth: googleAuth.getClient() });
  }

  /**
   * Get or create Spyco Portal folder
   */
  async getOrCreateFolder(tokens) {
    this.init(tokens);

    // Search for existing folder
    const response = await this.drive.files.list({
      q: "name='Spyco Portal' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)'
    });

    if (response.data.files.length > 0) {
      this.folderId = response.data.files[0].id;
      return this.folderId;
    }

    // Create new folder
    const folder = await this.drive.files.create({
      requestBody: {
        name: 'Spyco Portal',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });

    this.folderId = folder.data.id;

    // Create subfolders
    const subfolders = ['Properties', 'Invoices', 'Projects', 'Documents', 'Suppliers'];
    for (const name of subfolders) {
      await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.folderId]
        }
      });
    }

    return this.folderId;
  }

  /**
   * List files in a folder
   */
  async listFiles(tokens, folderId = null, pageSize = 50) {
    this.init(tokens);

    const query = folderId 
      ? `'${folderId}' in parents and trashed=false`
      : `'${this.folderId}' in parents and trashed=false`;

    const response = await this.drive.files.list({
      q: query,
      pageSize,
      fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink)',
      orderBy: 'modifiedTime desc'
    });

    return response.data.files;
  }

  /**
   * Upload a file
   */
  async uploadFile(tokens, fileName, mimeType, content, folderId = null) {
    this.init(tokens);

    const response = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId || this.folderId]
      },
      media: {
        mimeType,
        body: content
      },
      fields: 'id, name, webViewLink'
    });

    return response.data;
  }

  /**
   * Get file by ID
   */
  async getFile(tokens, fileId) {
    this.init(tokens);

    const response = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, modifiedTime, size, webViewLink, thumbnailLink'
    });

    return response.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(tokens, fileId) {
    this.init(tokens);
    await this.drive.files.delete({ fileId });
    return { success: true };
  }

  /**
   * Search files
   */
  async searchFiles(tokens, query, pageSize = 20) {
    this.init(tokens);

    const response = await this.drive.files.list({
      q: `name contains '${query}' and trashed=false`,
      pageSize,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc'
    });

    return response.data.files;
  }

  /**
   * Get folder structure
   */
  async getFolderStructure(tokens) {
    this.init(tokens);
    
    if (!this.folderId) {
      await this.getOrCreateFolder(tokens);
    }

    const folders = await this.drive.files.list({
      q: `'${this.folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    return {
      root: { id: this.folderId, name: 'Spyco Portal' },
      subfolders: folders.data.files
    };
  }
}

module.exports = new DriveService();
