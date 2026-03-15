# GitHub Setup & Deployment Guide

This guide will walk you through setting up your Spyco Portal on GitHub and configuring automated deployments.

## 📋 Prerequisites

Before you begin, ensure you have:

- A [GitHub account](https://github.com/signup)
- Git installed on your local machine
- A target server (VPS, PaaS, or shared hosting)
- SSH access to your server (for VPS deployment)

## 🚀 Step-by-Step Setup

### Step 1: Create a GitHub Repository

1. Log in to [GitHub](https://github.com)
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Fill in the repository details:
   - **Repository name**: `spyco-portal`
   - **Description**: `Secure web portal for supplier management`
   - **Visibility**: Private (recommended) or Public
   - **Initialize with**: README (you can add this later)
5. Click **Create repository**

### Step 2: Initialize Git Repository Locally

Open your terminal/command prompt and navigate to your project directory:

```bash
cd spyco-portal
```

Initialize Git:

```bash
git init
```

Add all files:

```bash
git add .
```

Commit the changes:

```bash
git commit -m "Initial commit: Spyco Portal v1.0"
```

### Step 3: Connect to GitHub Repository

Add your GitHub repository as remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/spyco-portal.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

Push to GitHub:

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or personal access token).

### Step 4: Configure GitHub Secrets (For Automated Deployment)

If you want automated deployment via GitHub Actions, configure these secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Required Secrets for SSH Deployment:

- **`DEPLOY_HOST`**: Your server hostname or IP address
- **`DEPLOY_USER`**: SSH username for your server
- **`DEPLOY_KEY`**: Your SSH private key (see below)
- **`DEPLOY_PORT`**: SSH port (default: 22)
- **`DEPLOY_PATH`**: Path to your deployment directory on the server

#### How to Generate SSH Key:

```bash
# Generate new SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server.com

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions
```

Copy the entire private key (including BEGIN and END lines) and paste it as the `DEPLOY_KEY` secret.

### Step 5: Configure Server for GitHub Actions

On your target server:

1. **Clone the repository** (if not already done):
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/spyco-portal.git
cd spyco-portal
```

2. **Set up proper permissions**:
```bash
# Create logs directory
mkdir -p logs

# Set permissions
chmod 755 .
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 755 logs
```

3. **Create .env file**:
```bash
cp .env.example .env
nano .env
```

Update with your actual database credentials.

4. **Run deployment script**:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 6: Enable GitHub Actions (Optional)

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **I understand my workflows, go ahead and enable them**
4. Your deployment workflow will now run automatically on push to main branch

## 🔄 How to Update Your Application

### Simple Git Workflow

After making changes locally:

```bash
# Add changes
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push origin main
```

If GitHub Actions is enabled, the deployment will happen automatically!

### Manual Deployment on Server

If not using automated deployment:

```bash
# SSH into your server
ssh user@your-server.com

# Navigate to project directory
cd /var/www/spyco-portal

# Pull latest changes
git pull origin main

# Run deployment script
./deploy.sh
```

## 🌐 Deployment Options

### Option A: VPS (DigitalOcean, Linode, AWS Lightsail)

**Pros:**
- Full control over server
- Cost-effective for small apps
- Easy to scale
- Complete customization

**Setup:**
1. Create a VPS (Ubuntu 20.04+ recommended)
2. Install LAMP stack:
```bash
sudo apt update
sudo apt install apache2 mysql-server php php-mysql php-json php-mbstring
```
3. Configure Apache virtual host
4. Clone repository
5. Follow the GitHub setup steps above

### Option B: PaaS (Heroku, Render, Railway)

**Pros:**
- Easy deployment
- Automatic scaling
- Built-in monitoring
- No server management

**Heroku Setup:**

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create spyco-portal`
4. Add database addon: `heroku addons:create heroku-postgresql`
5. Set config vars:
```bash
heroku config:set DB_HOST=$(heroku config:get DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)
heroku config:set DB_USER=$(heroku config:get DATABASE_URL | cut -d':' -f2 | cut -d'@' -f1)
heroku config:set DB_PASS=$(heroku config:get DATABASE_URL | cut -d':' -f3 | cut -d'@' -f1)
heroku config:set DB_NAME=$(heroku config:get DATABASE_URL | cut -d'/' -f2)
```
6. Push: `git push heroku main`

### Option C: Shared Hosting

**Pros:**
- Easy to use
- Low cost
- No technical knowledge required

**Setup:**
1. Upload files via FTP or cPanel File Manager
2. Create database via cPanel
3. Import schema via phpMyAdmin
4. Configure .env file
5. Done!

## 🔒 Security Best Practices

### 1. Protect .env File

Never commit `.env` to GitHub. The `.gitignore` file already handles this, but double-check:

```bash
git status
```

You should NOT see `.env` in the list of untracked files.

### 2. Use GitHub Secrets

For automated deployments, always use GitHub Secrets for sensitive data:
- Database passwords
- API keys
- SSH keys
- Access tokens

### 3. Enable Branch Protection

1. Go to repository **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 4. Use Two-Factor Authentication

Enable 2FA on your GitHub account for additional security.

### 5. Regular Backups

Set up automated backups of your database:

```bash
# Add to crontab
0 2 * * * mysqldump -u user -p'password' spyco_portal > /backups/spyco_portal_$(date +\%Y\%m\%d).sql
```

## 📊 Monitoring & Maintenance

### View GitHub Actions Logs

1. Go to repository **Actions** tab
2. Click on the workflow run
3. View detailed logs of deployment

### Server Logs

```bash
# Application logs
tail -f logs/error.log

# Apache logs
tail -f /var/log/apache2/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

## 🐛 Troubleshooting

### Git Push Fails with Authentication Error

Solution: Use Personal Access Token instead of password:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when pushing

### GitHub Actions Deployment Fails

Check:
1. SSH key is correctly set in secrets
2. Server is accessible from GitHub
3. Deploy path is correct
4. File permissions on server

### Database Connection Issues

1. Verify .env file exists on server
2. Check database credentials
3. Ensure MySQL is running: `sudo systemctl status mysql`
4. Check firewall rules

## 🎯 Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/spyco-portal.git

# Pull updates
git pull origin main

# Check status
git status

# Commit changes
git add .
git commit -m "Your message"
git push origin main

# View logs on server
tail -f logs/error.log

# Restart Apache
sudo systemctl restart apache2
```

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [DigitalOcean LAMP Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-20-04)

## 🎉 Congratulations!

Your Spyco Portal is now on GitHub with automated deployment configured!

**Next Steps:**
1. Make your first code change
2. Commit and push to GitHub
3. Watch it deploy automatically
4. Enjoy the streamlined workflow!

---

**Need Help?** Check the main README.md for application documentation or INSTALLATION.md for detailed setup instructions.