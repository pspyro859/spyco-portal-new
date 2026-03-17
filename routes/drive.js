/**
 * Google Drive Routes
 * File management with Google Drive
 */

const express = require('express');
const router = express.Router();
const driveService = require('../services/driveService');
const sheetsDB = require('../services/sheetsDB');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user || !req.session.tokens) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

/**
 * Helper to get tokens from session
 */
const getTokens = (req) => req.session.tokens;

/**
 * GET /api/drive/folders
 * Get folder structure
 */
router.get('/folders', async (req, res) => {
  try {
    const structure = await driveService.getFolderStructure(getTokens(req));
    res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/drive/files
 * List files in a folder
 */
router.get('/files', async (req, res) => {
  try {
    const { folderId, pageSize } = req.query;
    const files = await driveService.listFiles(
      getTokens(req),
      folderId || null,
      parseInt(pageSize) || 50
    );
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/drive/files/:id
 * Get file details
 */
router.get('/files/:id', async (req, res) => {
  try {
    const file = await driveService.getFile(getTokens(req), req.params.id);
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/drive/files
 * Upload a file (JSON content)
 */
router.post('/files', async (req, res) => {
  try {
    const { fileName, content, folderId, mimeType } = req.body;
    
    if (!fileName || !content) {
      return res.status(400).json({
        success: false,
        message: 'fileName and content are required'
      });
    }

    const file = await driveService.uploadFile(
      getTokens(req),
      fileName,
      mimeType || 'text/plain',
      content,
      folderId
    );

    // Log activity
    await sheetsDB.logActivity(
      `File uploaded — ${fileName}`,
      '#22c55e',
      req.session.user.dbId,
      getTokens(req)
    );

    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/drive/files/:id
 * Delete a file
 */
router.delete('/files/:id', async (req, res) => {
  try {
    await driveService.deleteFile(getTokens(req), req.params.id);
    
    await sheetsDB.logActivity(
      'File deleted from Drive',
      '#e94560',
      req.session.user.dbId,
      getTokens(req)
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/drive/search
 * Search files
 */
router.get('/search', async (req, res) => {
  try {
    const { q, pageSize } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const files = await driveService.searchFiles(
      getTokens(req),
      q,
      parseInt(pageSize) || 20
    );
    
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
