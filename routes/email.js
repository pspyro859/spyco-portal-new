/**
 * Email Routes
 * Send emails via SMTP & Scan emails via IMAP
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const sheetsDB = require('../services/sheetsDB');

// Create SMTP transporter
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

// SPY COMMS reference pattern: YYYYMMDD_SUBJECT_SYSTEM_STRUCTURE_SITE_SUPPLIER
const SPYCOMMS_PATTERN = /(\d{8})_([A-Z]+)_([A-Z]+)_([A-Z]+)_([A-Z0-9-]+)_([A-Z]+)/i;

/**
 * Parse SPY COMMS reference from email subject
 */
function parseSpyCommsRef(subject) {
  const match = subject.match(SPYCOMMS_PATTERN);
  if (match) {
    return {
      fullRef: match[0],
      date: match[1],
      subject: match[2],
      system: match[3],
      structure: match[4],
      site: match[5],
      supplier: match[6]
    };
  }
  return null;
}

/**
 * POST /api/email/scan
 * Scan IMAP mailbox for emails with SPY COMMS references
 */
router.post('/scan', async (req, res) => {
  const { imapServer, imapPort, email, password, ssl, folder, limit } = req.body;
  
  if (!imapServer || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'IMAP server, email, and password are required'
    });
  }
  
  const results = {
    scanned: 0,
    filed: 0,
    unmatched: 0,
    emails: []
  };
  
  try {
    const imap = new Imap({
      user: email,
      password: password,
      host: imapServer,
      port: parseInt(imapPort) || 993,
      tls: ssl !== 'false',
      tlsOptions: { rejectUnauthorized: false }
    });
    
    await new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox(folder || 'INBOX', true, (err, box) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Get last N messages
          const total = box.messages.total;
          const fetchCount = Math.min(parseInt(limit) || 50, total);
          const start = Math.max(1, total - fetchCount + 1);
          
          if (total === 0) {
            imap.end();
            resolve();
            return;
          }
          
          const fetch = imap.seq.fetch(`${start}:${total}`, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
            struct: true
          });
          
          fetch.on('message', (msg, seqno) => {
            let header = '';
            let emailData = { seqno };
            
            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', () => {
                if (info.which.includes('HEADER')) {
                  header = buffer;
                  // Parse header
                  const fromMatch = buffer.match(/From: (.+)/i);
                  const subjectMatch = buffer.match(/Subject: (.+)/i);
                  const dateMatch = buffer.match(/Date: (.+)/i);
                  
                  emailData.from = fromMatch ? fromMatch[1].trim() : 'Unknown';
                  emailData.subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';
                  emailData.date = dateMatch ? dateMatch[1].trim() : '';
                }
              });
            });
            
            msg.once('end', () => {
              results.scanned++;
              
              // Check for SPY COMMS reference
              const ref = parseSpyCommsRef(emailData.subject);
              if (ref) {
                emailData.spyCommsRef = ref.fullRef;
                emailData.filedTo = `/${ref.site}/${ref.subject}/`;
                emailData.parsed = ref;
                results.filed++;
              } else {
                results.unmatched++;
              }
              
              results.emails.push(emailData);
            });
          });
          
          fetch.once('error', (err) => {
            reject(err);
          });
          
          fetch.once('end', () => {
            imap.end();
            resolve();
          });
        });
      });
      
      imap.once('error', (err) => {
        reject(err);
      });
      
      imap.connect();
    });
    
    // Sort emails by date (newest first)
    results.emails.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, ...results });
    
  } catch (error) {
    console.error('IMAP scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan emails: ' + error.message
    });
  }
});

/**
 * POST /api/email/test-imap
 * Test IMAP connection
 */
router.post('/test-imap', async (req, res) => {
  const { imapServer, imapPort, email, password, ssl } = req.body;
  
  if (!imapServer || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'IMAP server, email, and password are required'
    });
  }
  
  try {
    const imap = new Imap({
      user: email,
      password: password,
      host: imapServer,
      port: parseInt(imapPort) || 993,
      tls: ssl !== 'false',
      tlsOptions: { rejectUnauthorized: false }
    });
    
    await new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.end();
        resolve();
      });
      
      imap.once('error', (err) => {
        reject(err);
      });
      
      imap.connect();
    });
    
    res.json({ success: true, message: 'IMAP connection successful!' });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'IMAP connection failed: ' + error.message
    });
  }
});

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
