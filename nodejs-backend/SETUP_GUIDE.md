# Spyco Portal - Node.js Edition
## Google Drive as Database - Headache Free Deployment 🚀

This version uses **Google Drive & Google Sheets** as your database - no MySQL, no server database setup needed!

---

## ✅ What This Gives You

| Feature | How It Works |
|---------|-------------|
| 📊 Database | Google Sheets (spreadsheet = database) |
| 📁 File Storage | Google Drive |
| 🔐 Login | Google Sign-In (no passwords!) |
| ✉️ Email | SMTP via your mail server |
| 🌐 Deployment | SPanel Node.js Manager |

---

## 📋 Setup Steps (15 mins total)

### Step 1: Create Google Cloud Project (5 mins)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a Project** → **New Project**
3. Name it `Spyco Portal` → Click **Create**

### Step 2: Enable APIs (2 mins)

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - ✅ Google Drive API
   - ✅ Google Sheets API

### Step 3: Create OAuth Credentials (5 mins)

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If asked, configure consent screen first:
   - User Type: **External** (or Internal if G Suite)
   - App name: `Spyco Portal`
   - Support email: your email
   - Save and continue through all steps
4. Back to Credentials → Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Spyco Portal Web`
   - Authorized redirect URIs: `https://portal.spyco.com.au/api/auth/google/callback`
5. Click **Create** and note down:
   - 📝 **Client ID**: `xxxx.apps.googleusercontent.com`
   - 📝 **Client Secret**: `GOCSPX-xxxx`

### Step 4: Configure Your App (2 mins)

1. Copy `.env.example` to `.env`
2. Fill in your credentials:

```env
# Google OAuth - from Step 3
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://portal.spyco.com.au/api/auth/google/callback

# Email (your existing SMTP)
SMTP_HOST=mail.spyco.com.au
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=jimmy@spyco.com.au
SMTP_PASS=your-email-password

# App URL
APP_URL=https://portal.spyco.com.au

# Session (change this to any random string)
SESSION_SECRET=change-this-to-a-random-string-abc123xyz
```

### Step 5: Deploy to SPanel (3 mins)

1. **Upload files** to your SPanel:
   - Upload the entire `nodejs-backend` folder
   - Or use Git to clone

2. **Open Node.js Manager** in SPanel

3. **Create new application**:
   - Application root: `/path/to/nodejs-backend`
   - Application URL: `portal.spyco.com.au`
   - Application startup file: `server.js`
   - Node.js version: 18.x or 20.x (latest LTS)

4. **Set environment variables** in SPanel Node.js Manager:
   - Add all variables from your `.env` file

5. **Start the application**

---

## 🎉 First Run

1. Visit `https://portal.spyco.com.au`
2. Click **Sign in with Google**
3. Authorize the app
4. **First user automatically becomes Admin!**
5. The app will create:
   - A Google Sheet called "Spyco Portal Database"
   - A Google Drive folder called "Spyco Portal"

---

## 📂 Where Is Your Data?

### Google Sheets (Database)
Open your Google Drive and find "**Spyco Portal Database**"

| Sheet Tab | Data |
|-----------|------|
| Users | All logged-in users |
| Properties | Property listings |
| Contacts | Suppliers/Contacts |
| Projects | Project tracking |
| Invoices | Invoice records |
| Documents | Document log |
| Activity | Activity feed |

### Google Drive (Files)
Find the "**Spyco Portal**" folder with subfolders:
- 📁 Properties
- 📁 Invoices
- 📁 Projects
- 📁 Documents
- 📁 Suppliers

---

## 🔧 Troubleshooting

### "redirect_uri_mismatch" Error
→ Make sure the redirect URI in Google Console matches exactly:
`https://portal.spyco.com.au/api/auth/google/callback`

### "Access Denied" Error
→ Check that APIs are enabled in Google Cloud Console

### App Won't Start
→ Check SPanel Node.js logs
→ Make sure all environment variables are set

### Email Not Sending
→ Verify SMTP credentials
→ Check if your host allows outbound SMTP

---

## 📞 Support

If you need help:
1. Check the SPanel Node.js logs
2. Verify Google API credentials
3. Make sure environment variables are correct

---

## 🔒 Security Notes

- ✅ All data stored in YOUR Google account
- ✅ Google handles authentication
- ✅ No passwords stored in the app
- ✅ HTTPS required for production
- ✅ Session cookies are HTTP-only

---

**Enjoy your headache-free deployment!** 🎉
