/**
 * Authentication Routes
 * Google OAuth login/logout
 */

const express = require('express');
const router = express.Router();
const googleAuth = require('../services/googleAuth');
const sheetsDB = require('../services/sheetsDB');
const driveService = require('../services/driveService');

/**
 * GET /api/auth/login
 * Redirect to Google OAuth
 */
router.get('/login', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * OAuth callback - exchange code for tokens
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    // Get tokens from Google
    const tokens = await googleAuth.getTokens(code);
    
    // Get user info
    const userInfo = await googleAuth.getUserInfo(tokens);

    // Store tokens in session
    req.session.tokens = tokens;
    req.session.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    };

    // Check/create spreadsheet database
    if (!process.env.SPREADSHEET_ID) {
      // First time setup - create the database spreadsheet
      const spreadsheetId = await sheetsDB.createSpreadsheet(tokens);
      sheetsDB.setSpreadsheetId(spreadsheetId);
      console.log('Created new database spreadsheet:', spreadsheetId);
      // Note: You should save this ID to your .env file
    } else {
      sheetsDB.setSpreadsheetId(process.env.SPREADSHEET_ID);
    }

    // Check/create Drive folder structure
    await driveService.getOrCreateFolder(tokens);

    // Check if user exists, if not create
    let user = await sheetsDB.findUserByEmail(userInfo.email, tokens);
    if (!user) {
      // Determine role - first user is admin
      const allUsers = await sheetsDB.getAll('Users', tokens);
      const role = allUsers.length === 0 ? 'admin' : 'user';

      user = {
        id: sheetsDB.generateId(),
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      await sheetsDB.add('Users', user, tokens);
    } else {
      // Update last login
      await sheetsDB.update('Users', user.id, {
        lastLogin: new Date().toISOString()
      }, tokens);
    }

    // Log activity
    await sheetsDB.logActivity(`${userInfo.name} signed in`, '#22c55e', user.id, tokens);

    req.session.user.role = user.role;
    req.session.user.dbId = user.id;

    res.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=auth_failed');
  }
});

/**
 * GET /api/auth/check
 * Check if user is authenticated
 */
router.get('/check', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({ authenticated: false });
  }
});

/**
 * POST /api/auth/logout
 * Logout and clear session
 */
router.post('/logout', async (req, res) => {
  if (req.session.user && req.session.tokens) {
    try {
      await sheetsDB.logActivity(
        `${req.session.user.name} signed out`,
        '#9a9ab0',
        req.session.user.dbId,
        req.session.tokens
      );
    } catch (e) {
      // Ignore logging errors on logout
    }
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * GET /api/auth/url
 * Get OAuth URL (for frontend redirect)
 */
router.get('/url', (req, res) => {
  const authUrl = googleAuth.getAuthUrl();
  res.json({ url: authUrl });
});

module.exports = router;
