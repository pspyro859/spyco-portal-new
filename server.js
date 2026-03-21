/**
 * SPYCO GROUP PORTAL - Node.js Backend
 * MySQL Database + Local File Storage
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const emailRoutes = require('./routes/email');
const driveRoutes = require('./routes/drive');
const exportRoutes = require('./routes/export');
const referenceRoutes = require('./routes/reference');

const app = express();
const PORT = process.env.PORT || 3017;

// Middleware
app.use(cors({
  origin: process.env.APP_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy (behind Apache)
app.set('trust proxy', 1);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'spyco-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Serve static files from same directory (root)
app.use(express.static(__dirname));

// File upload middleware
const multer = require('multer');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Document upload endpoint
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { fileName, folderPath } = req.body;
    const originalPath = req.file.path;

    // Create subfolder if specified
    let targetDir = uploadDir;
    if (folderPath) {
      targetDir = path.join(uploadDir, folderPath);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    }

    // Rename file to SPY COMMS name
    const finalName = fileName || req.file.filename;
    const newPath = path.join(targetDir, finalName);
    fs.renameSync(originalPath, newPath);

    // Save to DB
    const { pool } = require('./services/db');
    try {
      await pool.execute(
        'INSERT INTO documents (name, file_name, folder_path, file_path) VALUES (?, ?, ?, ?)',
        [finalName, finalName, folderPath || '/', newPath]
      );
    } catch (dbErr) {
      console.log('DB log failed:', dbErr.message);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileName: finalName,
      folderPath: folderPath,
      localPath: newPath
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/reference', referenceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Spyco Portal running on port ${PORT}`);
});
