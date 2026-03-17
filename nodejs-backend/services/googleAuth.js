/**
 * Google OAuth Service
 * Handles authentication with Google
 */

const { google } = require('googleapis');

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generate OAuth URL for user login
   */
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Set credentials on the OAuth client
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(tokens) {
    this.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
  }

  /**
   * Refresh access token if expired
   */
  async refreshTokenIfNeeded(tokens) {
    this.setCredentials(tokens);
    
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    }
    return tokens;
  }

  /**
   * Get authenticated OAuth client
   */
  getClient() {
    return this.oauth2Client;
  }
}

module.exports = new GoogleAuthService();
