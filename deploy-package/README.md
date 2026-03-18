# Spyco Portal

A property management portal for Spyco Group.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Login Credentials

| Username | Password   | Role  |
|----------|------------|-------|
| jimmy    | spyco2024  | Admin |
| peter    | spyco2024  | Admin |
| admin    | admin123   | Admin |

## Features

- **Dashboard** - Overview of properties, projects, invoices
- **Properties** - Manage property portfolio with income tracking
- **Suppliers** - Track contacts, trades, agents
- **Projects** - Manage renovations, developments, maintenance
- **Invoices** - Track bills and payments
- **SPY COMMS** - Generate standardised subject lines & file names
- **Reference** - Manage lookup codes

## Configuration (Optional)

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available options:
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Set to "production" for production mode

## Data Storage

Data is stored in browser localStorage. To persist data across browsers/devices, consider adding a database integration.

## File Structure

```
spyco-portal/
├── server.js          # Express server
├── package.json       # Dependencies
├── .env.example       # Environment template
├── public/
│   ├── index.html     # Main HTML
│   ├── manifest.json  # PWA manifest
│   ├── css/
│   │   └── portal.css # Styles
│   ├── js/
│   │   ├── app.js     # Main application
│   │   ├── api.js     # API functions
│   │   └── data.js    # Data/localStorage
│   └── assets/
│       └── icons/     # App icons
```
