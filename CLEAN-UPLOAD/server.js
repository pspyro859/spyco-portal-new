/**
 * SPYCO GROUP PORTAL - Node.js Backend
 * Google Drive as Database
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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.APP_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'spyco-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from same directory (root)
app.use(express.static(__dirname));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/export', exportRoutes);

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
