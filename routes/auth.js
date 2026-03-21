/**
 * Authentication Routes
 * Username/password login with session cookies
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool, logActivity } = require('../services/db');

/**
 * POST /api/auth/login
 * Login with username/email + password
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username.toLowerCase(), username.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Update last login
    await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role
    };

    await logActivity(`${user.name} signed in`, '#22c55e', user.id);

    res.json({
      success: true,
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
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
  if (req.session.user) {
    try {
      await logActivity(`${req.session.user.name} signed out`, '#9a9ab0', req.session.user.id);
    } catch (e) { /* ignore */ }
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * POST /api/auth/register
 * Create a new user (admin only)
 */
router.post('/register', async (req, res) => {
  // Check admin
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const { username, email, name, password, role } = req.body;

  if (!username || !name || !password) {
    return res.status(400).json({ success: false, message: 'Username, name, and password required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [username.toLowerCase(), email || null, name, hash, role || 'user']
    );

    await logActivity(`User created: ${name}`, '#22c55e', req.session.user.id);

    res.json({
      success: true,
      user: { id: result.insertId, username, email, name, role: role || 'user' }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

/**
 * PUT /api/auth/update-user/:id
 * Update a user (admin only)
 */
router.put('/update-user/:id', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const { name, email, password, role } = req.body;
  const id = req.params.id;

  try {
    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); updates.push('username = ?'); values.push(email.toLowerCase()); }
    if (role && ['admin', 'user'].includes(role)) { updates.push('role = ?'); values.push(role); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    values.push(id);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    await logActivity(`User updated: ${name || 'ID ' + id}`, '#f5a623', req.session.user.id);

    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email already in use by another user' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

/**
 * DELETE /api/auth/delete-user/:id
 * Delete a user (admin only, can't delete yourself)
 */
router.delete('/delete-user/:id', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const id = parseInt(req.params.id);

  if (id === req.session.user.id) {
    return res.status(400).json({ success: false, message: "You can't delete your own account" });
  }

  try {
    const [rows] = await pool.execute('SELECT name FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(`User deleted: ${rows[0].name}`, '#e94560', req.session.user.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email with token link
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Check if user exists
    const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    
    if (rows.length === 0) {
      // Don't reveal whether email exists — always say "sent"
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const user = rows[0];

    // Generate a simple reset token (random + timestamp)
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in DB
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`
    );

    await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expires]
    );

    // Send email
    const resetUrl = `${process.env.APP_URL || 'https://portal.spyco.com.au'}/reset-password?token=${token}`;
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.spyco.com.au',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      tls: { rejectUnauthorized: false }
    });

    try {
      await transporter.sendMail({
        from: `Spyco Portal <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@spyco.com.au'}>`,
        to: user.email,
        subject: 'Password Reset — Spyco Portal',
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#e94560;">Password Reset</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset for your Spyco Portal account.</p>
            <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#e94560;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a></p>
            <p style="color:#999;font-size:0.85em;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
            <p style="color:#999;font-size:0.85em;">Link: ${resetUrl}</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Reset email send error:', emailErr.message);
      // Still return success so we don't reveal if email exists
      // But log it so admin knows SMTP is broken
    }

    await logActivity(`Password reset requested for ${user.email}`, '#f5a623', null);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Try again.' });
  }
});

/**
 * GET /api/auth/verify-reset-token
 * Check if a reset token is valid
 */
router.get('/verify-reset-token', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.json({ valid: false });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT pr.*, u.name, u.email FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > NOW() LIMIT 1',
      [token]
    );
    
    res.json({ valid: rows.length > 0, email: rows.length > 0 ? rows[0].email : null });
  } catch (error) {
    res.json({ valid: false });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }

    const resetRecord = rows[0];
    const hash = await bcrypt.hash(password, 10);

    // Update password
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, resetRecord.user_id]);

    // Mark token as used
    await pool.execute('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

    await logActivity('Password reset completed', '#22c55e', resetRecord.user_id);

    res.json({ success: true, message: 'Password updated! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Reset failed. Try again.' });
  }
});

/**
 * GET /api/auth/url
 * Legacy endpoint
 */
router.get('/url', (req, res) => {
  res.json({ url: null, message: 'Use email/password login.' });
});

/**
 * GET /api/auth/login
 * Legacy GET endpoint
 */
router.get('/login', (req, res) => {
  res.redirect('/?error=use_password_login');
});

module.exports = router;
