# SPYCO PORTAL - PRD

## Original Problem Statement
Property management portal for Spyco Group with SPY COMMS file naming system, email integration, and Google Drive storage.

## Architecture
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Node.js/Express
- **Storage:** localStorage (local) / Google Drive (cloud)
- **Email:** IMAP integration for email scanning

## User Personas
- **Jimmy (Admin):** Managing Director - Full access
- **Peter (Admin):** Director - Full access
- **Admin:** General admin access

## Core Requirements (Static)
1. Dashboard with property stats
2. Properties management with income tracking
3. Suppliers (contacts) management
4. Projects tracking
5. Invoices with paid/unpaid tallying
6. SPY COMMS - standardized file naming
7. Documents upload to Google Drive
8. Email sync with IMAP

## What's Been Implemented
### March 18, 2026 (Update 2)
- ✅ **Responsive Design:** Full mobile and tablet support
  - Hamburger menu for mobile navigation
  - Single-column layout on mobile
  - Full-screen modals on mobile
  - Touch-friendly buttons (44px min height)
  - Scrollable tables
  - Landscape mode support
  - Print styles

### March 18, 2026
- ✅ Fixed layout alignment issues
- ✅ Invoices: Total Unpaid/Overdue/Paid tallying
- ✅ Invoice modal: Due date, GST, partial payments, mark as paid
- ✅ SPY COMMS: Updated with spreadsheet codes (Subject, Systems, Structure, Sites, Suppliers)
- ✅ SPY COMMS: Added Financial Year (FY24-FY30) and Quarters (Q1-Q4) for Archive
- ✅ Email Sync: IMAP connection, scan, preview, filter
- ✅ Documents: Upload with SPY COMMS naming
- ✅ Settings: Email configuration, storage options, filing rules

## Reference Data (from SPY COMMS Master Sheet)
- **Subject:** ACTION REQ, ADVICE, DATA, INFO, INVOICE, LEGAL, PHOTO, PLAN, STATEMENT
- **Systems:** 1-FIN, 2-PRO, 3-SUP, 4-AGR, 5-INT, 6-ARC
- **Structure:** VS, JS, PS, KAL, REV, SPY, CONSULTING, GR
- **Sites:** 12-LLO, 66-CHA, 1-1A-DAV, 2-1A-DAV, etc.
- **Suppliers:** 40+ suppliers (AGE, AGG, AMO, ARG, etc.)
- **Financial Years:** FY24-FY30
- **Quarters:** Q1, Q2, Q3, Q4

## Prioritized Backlog
### P0 (Critical)
- [ ] Google Drive OAuth integration for production
- [ ] Actual file upload to Drive (currently local only)

### P1 (Important)
- [ ] Automatic overdue detection (check due dates)
- [ ] Email auto-filing to Drive folders
- [ ] Dashboard charts/graphs

### P2 (Nice to Have)
- [ ] Mobile responsive improvements
- [ ] Export to PDF/Excel
- [ ] Notifications/reminders

## Next Tasks
1. Configure Google Drive OAuth for production
2. Implement actual Drive file upload
3. Add automatic invoice overdue checking
4. Add email auto-filing workflow
