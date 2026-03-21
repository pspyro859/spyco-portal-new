/**
 * File Management Routes
 * Local file storage (replaced Google Drive)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

/**
 * GET /api/drive/folders
 * List folder structure in uploads directory
 */
router.get('/folders', async (req, res) => {
  try {
    const subfolders = [];
    const items = fs.readdirSync(UPLOADS_DIR, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        subfolders.push({ id: item.name, name: item.name });
      }
    }
    res.json({
      success: true,
      data: {
        root: { id: 'uploads', name: 'Uploads' },
        subfolders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/drive/files
 * List files in uploads or a subfolder
 */
router.get('/files', async (req, res) => {
  try {
    const { folderId } = req.query;
    const dir = folderId ? path.join(UPLOADS_DIR, folderId) : UPLOADS_DIR;

    if (!fs.existsSync(dir)) {
      return res.json({ success: true, data: [] });
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });
    const files = items
      .filter(i => i.isFile())
      .map(i => {
        const filePath = path.join(dir, i.name);
        const stats = fs.statSync(filePath);
        return {
          id: i.name,
          name: i.name,
          mimeType: 'application/octet-stream',
          modifiedTime: stats.mtime.toISOString(),
          size: stats.size.toString()
        };
      });

    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/drive/search
 * Search files by name
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const results = [];
    const searchDir = (dir) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          searchDir(fullPath);
        } else if (item.name.toLowerCase().includes(q.toLowerCase())) {
          const stats = fs.statSync(fullPath);
          results.push({
            id: item.name,
            name: item.name,
            modifiedTime: stats.mtime.toISOString(),
            size: stats.size.toString()
          });
        }
      }
    };

    searchDir(UPLOADS_DIR);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
