/**
 * Email Routes
 * Send emails via SMTP
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const sheetsDB = require('../services/sheetsDB');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.spyco.com.au',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

router.use(requireAuth);

/**
 * POST /api/email/send
 * Send an email
 */
router.post('/send', async (req, res) => {
  const { to, subject, body, cc, bcc } = req.body;

  // Validate
  if (!to || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: 'To, subject, and body are required'
    });
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'Spyco Portal'} <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: body + '\n\n--\nSent via Spyco Group Portal\nportal.spyco.com.au',
      cc: cc || undefined,
      bcc: bcc || undefined
    };

    await transporter.sendMail(mailOptions);

    // Log activity
    if (req.session.tokens) {
      await sheetsDB.logActivity(
        `Email sent to ${to} — ${subject.substring(0, 40)}`,
        '#22c55e',
        req.session.user.dbId,
        req.session.tokens
      );
    }

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email: ' + error.message
    });
  }
});

/**
 * GET /api/email/test
 * Test email configuration
 */
router.get('/test', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection verified' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SMTP connection failed: ' + error.message
    });
  }
});

module.exports = router;
