# Spyco Portal - Product Requirements Document

## Project Overview
Internal portal for Spyco Group to manage properties, contacts, projects, invoices, and communications.

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: Google Sheets (via Google Sheets API)
- **File Storage**: Google Drive (via Google Drive API)
- **Authentication**: Google OAuth 2.0
- **Email**: Nodemailer with SMTP
- **Frontend**: Vanilla HTML/CSS/JS (existing)

## User Personas
1. **Admin** (Jimmy) - Full access, user management
2. **User** - Standard team member access

## Core Features Implemented ✅
- [x] Google OAuth authentication
- [x] Google Sheets as database (Properties, Contacts, Projects, Invoices, Documents, Activity)
- [x] Google Drive folder structure auto-creation
- [x] Full CRUD for all entities
- [x] SPY COMMS subject line builder
- [x] Document naming tool
- [x] Email composer via SMTP
- [x] **DATA EXPORT FEATURE** (Jan 2026)
  - CSV export for each entity
  - Full JSON backup
  - Summary report generation
- [x] PWA support (installable)
- [x] Activity logging

## What's Been Implemented (Jan 2026)
1. Converted PHP backend to Node.js for SPanel compatibility
2. Integrated Google Sheets API as database
3. Integrated Google Drive API for file storage
4. Implemented Google OAuth for authentication
5. Added data export functionality (CSV, JSON backup, reports)
6. Updated frontend to work with new API

## Deployment
- **Target**: SPanel Node.js Manager
- **Files**: `/app/spyco-portal-nodejs.zip`
- **Setup Guide**: `/app/nodejs-backend/SETUP_GUIDE.md`

## Backlog / Future Features (P1)
- [ ] Bug fixes mentioned by user (to be specified)
- [ ] Data import from CSV
- [ ] Scheduled automatic backups to Drive
- [ ] Dashboard charts/visualizations
- [ ] Mobile app (React Native)

## P2 Features
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Webhook integrations

## Next Tasks
1. Deploy to SPanel
2. Configure Google Cloud credentials
3. Address bug fixes user mentioned
