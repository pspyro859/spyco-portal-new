/**
 * MySQL Database Service
 * Connection pool for MariaDB/MySQL
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'spycocomau_portal',
  password: process.env.DB_PASSWORD || 'Sp0rtal_2026!xQ',
  database: process.env.DB_NAME || 'spycocomau_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected to', process.env.DB_NAME || 'spycocomau_portal');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err.message);
  });

/**
 * Log activity helper
 */
async function logActivity(text, color = '#e94560', userId = null) {
  try {
    await pool.execute(
      'INSERT INTO activity (text, color, user_id) VALUES (?, ?, ?)',
      [text, color, userId]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
}

module.exports = { pool, logActivity };
