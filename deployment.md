# GodViewActivation - Ubuntu Deployment Guide

Complete guide for deploying the GodViewActivation web application on Ubuntu server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Project Deployment](#project-deployment)
- [Web Server Configuration](#web-server-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- Ubuntu 20.04 LTS or newer
- At least 1GB RAM
- 2GB free disk space
- Root or sudo access

### Required Software
- Node.js 18.x or newer
- npm 9.x or newer
- nginx (recommended) or Apache
- Git

---

## Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js and npm

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or newer
npm --version   # Should show 9.x.x or newer
```

### 3. Install nginx

```bash
sudo apt install -y nginx

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify nginx is running
sudo systemctl status nginx
```

### 4. Install Git (if not already installed)

```bash
sudo apt install -y git
```

### 5. Configure Firewall

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Check status
sudo ufw status
```

---

## Project Deployment

### 1. Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/godview
sudo chown -R $USER:$USER /var/www/godview
cd /var/www/godview
```

### 2. Clone or Upload Project

**Option A: Clone from Git repository**
```bash
git clone <your-repository-url> .
```

**Option B: Upload files via SCP**
```bash
# On your local machine, run:
scp -r /path/to/GodViewActivation/* user@your-server-ip:/var/www/godview/
```

**Option C: Upload via SFTP**
Use an SFTP client (FileZilla, WinSCP) to upload files to `/var/www/godview/`

### 3. Install Dependencies

```bash
cd /var/www/godview
npm install
```

### 4. Build Production Bundle

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

**Verify build:**
```bash
ls -la dist/
# Should show: index.html, assets/, and other static files
```

---

## Web Server Configuration

### nginx Configuration (Recommended)

#### 1. Create nginx Configuration File

```bash
sudo nano /etc/nginx/sites-available/godview
```

#### 2. Add Configuration

**Basic HTTP Configuration:**
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name your-domain.com www.your-domain.com;

    root /var/www/godview/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. Enable Configuration

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/godview /etc/nginx/sites-enabled/

# Remove default nginx page (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Apache Configuration (Alternative)

If you prefer Apache:

```bash
sudo apt install -y apache2

# Create configuration
sudo nano /etc/apache2/sites-available/godview.conf
```

Add:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    DocumentRoot /var/www/godview/dist

    <Directory /var/www/godview/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Enable URL rewriting for SPA
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/godview_error.log
    CustomLog ${APACHE_LOG_DIR}/godview_access.log combined
</VirtualHost>
```

Enable:
```bash
sudo a2ensite godview
sudo a2enmod rewrite
sudo systemctl reload apache2
```

---

## SSL/HTTPS Setup

**IMPORTANT: HTTPS is required for WebXR functionality!**

### Using Let's Encrypt (Free SSL Certificate)

#### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter email address
- Agree to Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

#### 3. Verify Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
```

### Manual HTTPS Configuration (If using your own certificate)

Edit nginx configuration:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/godview/dist;
    index index.html;

    # ... rest of configuration ...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Testing

### 1. Test HTTP Access

```bash
# From server
curl http://localhost

# From local machine
curl http://your-server-ip
```

### 2. Test HTTPS Access

```bash
# Should return HTML
curl https://your-domain.com
```

### 3. Browser Testing

Open in browser:
- `https://your-domain.com`
- Check browser console for errors (F12)
- Verify Earth texture loads
- Test journey functionality

### 4. WebXR Testing

- Connect VR headset
- Access via headset browser
- Verify WebXR mode activates

---

## Updating the Application

### Manual Update

```bash
cd /var/www/godview

# Pull latest changes (if using git)
git pull

# Or upload new files via SCP/SFTP

# Reinstall dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Clear nginx cache (optional)
sudo systemctl reload nginx
```

### Automated Update Script

Create `/var/www/godview/update.sh`:

```bash
#!/bin/bash
cd /var/www/godview
git pull
npm install
npm run build
sudo systemctl reload nginx
echo "✅ GodView updated successfully!"
```

Make executable:
```bash
chmod +x /var/www/godview/update.sh
```

Run updates:
```bash
./update.sh
```

---

## Troubleshooting

### Issue: White/Blank Screen

**Check:**
```bash
# Verify build exists
ls -la /var/www/godview/dist/

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check permissions
sudo chown -R www-data:www-data /var/www/godview/dist/
```

### Issue: 404 on Page Refresh

**Solution:** Ensure SPA routing is configured correctly in nginx:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: Textures Not Loading

**Check browser console:**
- CORS errors → Check nginx CORS headers
- HTTPS mixed content → Ensure all resources use HTTPS

**Add CORS headers to nginx:**
```nginx
location / {
    add_header Access-Control-Allow-Origin *;
    try_files $uri $uri/ /index.html;
}
```

### Issue: SSL Certificate Errors

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check nginx configuration
sudo nginx -t
```

### Issue: High Memory Usage

**Optimize nginx:**
```nginx
# In /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 100000;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}
```

### Issue: Slow Load Times

**Enable caching:**
```nginx
# Add to server block
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Enable Brotli compression:**
```bash
sudo apt install -y nginx-module-brotli

# Add to nginx.conf
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml;
```

### View Logs

```bash
# nginx access logs
sudo tail -f /var/log/nginx/access.log

# nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## Performance Optimization

### 1. Enable HTTP/2

Already enabled in SSL configuration above (`http2` flag).

### 2. Setup CDN (Optional)

Use Cloudflare or similar CDN to:
- Cache static assets
- Provide DDoS protection
- Improve global performance

### 3. Monitor Resources

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Check resource usage
htop
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check disk space: `df -h`
- Review error logs: `sudo tail -100 /var/log/nginx/error.log`

**Monthly:**
- Update system packages: `sudo apt update && sudo apt upgrade`
- Verify SSL certificate validity: `sudo certbot certificates`
- Check application updates

**As Needed:**
- Rotate logs: `sudo logrotate -f /etc/logrotate.conf`
- Backup configuration: `sudo tar -czf nginx-backup.tar.gz /etc/nginx/`

---

## Security Checklist

- ✅ HTTPS enabled with valid SSL certificate
- ✅ Firewall configured (ufw)
- ✅ Regular security updates applied
- ✅ Unnecessary ports closed
- ✅ Strong SSH key authentication
- ✅ Security headers configured in nginx
- ✅ File permissions set correctly (755 for directories, 644 for files)

---

## Support

### Useful Commands

```bash
# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# View running processes
ps aux | grep nginx

# Check open ports
sudo netstat -tulpn | grep nginx
```

### Additional Resources

- [nginx documentation](https://nginx.org/en/docs/)
- [Let's Encrypt documentation](https://letsencrypt.org/docs/)
- [Vite deployment guide](https://vitejs.dev/guide/static-deploy.html)

---

## Quick Reference

### File Locations
- Application files: `/var/www/godview/`
- Built files: `/var/www/godview/dist/`
- nginx config: `/etc/nginx/sites-available/godview`
- nginx logs: `/var/log/nginx/`
- SSL certificates: `/etc/letsencrypt/live/your-domain.com/`

### Important URLs
- Production site: `https://your-domain.com`
- nginx status: `http://your-server-ip/nginx_status` (if configured)

---

**Deployment Date:** 2026-01-03
**Application Version:** 1.0.0 (MVP)
**Maintained By:** [Your Name/Team]
