# Acharya ERP Deployment Guide

## Overview
This guide covers deployment of the Acharya ERP system in various environments, from development to production.

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

### Recommended Requirements (Production)
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

## Development Environment Setup

### Backend Setup (Django)

#### Prerequisites
- Python 3.11+
- UV package manager
- SQLite (development) / PostgreSQL (production)

#### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/acharya.git
cd acharya/backend

# Install dependencies with UV
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
uv run python manage.py migrate

# Create test admin user
uv run python manage.py create_test_admin

# Create test data
uv run python manage.py create_test_applications --count 5

# Start development server
uv run python manage.py runserver
```

#### Environment Variables (.env)
```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# Email Configuration (Development - Console Backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@acharya-erp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days
```

### Frontend Setup (React)

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Installation
```bash
# Navigate to frontend directory
cd acharya/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

#### Environment Variables (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1/
VITE_APP_TITLE=Acharya ERP System
VITE_APP_VERSION=1.0.0
```

## Production Deployment

### 1. Server Setup (Ubuntu 22.04)

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx postgresql postgresql-contrib redis-server
```

#### Install Python and UV
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Database Setup (PostgreSQL)

```bash
# Create database user
sudo -u postgres createuser --interactive
# Enter username: acharya
# Superuser: n
# Create databases: y
# Create roles: n

# Create database
sudo -u postgres createdb acharya_db

# Set password for user
sudo -u postgres psql
ALTER USER acharya PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE acharya_db TO acharya;
\q
```

### 3. Backend Deployment

#### Clone and Setup
```bash
# Create application directory
sudo mkdir -p /var/www/acharya
sudo chown $USER:$USER /var/www/acharya

# Clone repository
cd /var/www/acharya
git clone https://github.com/your-org/acharya.git .

# Setup backend
cd backend
uv sync --frozen
```

#### Production Environment Variables
```bash
# Create production .env file
cat > .env << EOF
# Django Settings
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://acharya:secure_password_here@localhost:5432/acharya_db

# Email Configuration (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=7
EOF
```

#### Database Migration
```bash
uv run python manage.py migrate
uv run python manage.py collectstatic --noinput
uv run python manage.py create_test_admin --email admin@your-domain.com
```

#### Gunicorn Setup
```bash
# Install gunicorn
uv add gunicorn

# Create gunicorn configuration
cat > gunicorn.conf.py << EOF
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 5
preload_app = True
EOF
```

#### Systemd Service
```bash
# Create systemd service file
sudo cat > /etc/systemd/system/acharya-backend.service << EOF
[Unit]
Description=Acharya Backend (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/acharya/backend
Environment=PATH=/var/www/acharya/backend/.venv/bin
ExecStart=/var/www/acharya/backend/.venv/bin/gunicorn config.wsgi:application -c gunicorn.conf.py
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
sudo chown -R www-data:www-data /var/www/acharya

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable acharya-backend
sudo systemctl start acharya-backend
sudo systemctl status acharya-backend
```

### 4. Frontend Deployment

#### Build React App
```bash
cd /var/www/acharya/frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=https://your-domain.com/api/v1/
VITE_APP_TITLE=Acharya ERP System
VITE_APP_VERSION=1.0.0
EOF

# Install dependencies and build
npm ci --production
npm run build
```

### 5. Nginx Configuration

#### Main Configuration
```bash
sudo cat > /etc/nginx/sites-available/acharya << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Frontend (React)
    location / {
        root /var/www/acharya/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Browser caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin interface
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files (Django)
    location /static/ {
        alias /var/www/acharya/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files (Django)
    location /media/ {
        alias /var/www/acharya/backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client max body size (for file uploads)
    client_max_body_size 50M;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/acharya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Redis Setup (Optional - for caching)

```bash
# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Add to Django settings
echo "CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}" >> /var/www/acharya/backend/.env
```

## Monitoring and Maintenance

### Log Files
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **Django**: Configure logging in `settings.py`
- **Gunicorn**: Logs to systemd journal (`sudo journalctl -u acharya-backend`)

### Backup Strategy

#### Database Backup
```bash
# Create backup script
cat > /home/ubuntu/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U acharya acharya_db > /home/ubuntu/backups/acharya_db_\$DATE.sql
find /home/ubuntu/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh") | crontab -
```

#### File Backup
```bash
# Create file backup script
cat > /home/ubuntu/backup-files.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
tar -czf /home/ubuntu/backups/acharya_files_\$DATE.tar.gz /var/www/acharya/backend/media
find /home/ubuntu/backups -name "acharya_files_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/ubuntu/backup-files.sh

# Add to crontab (daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/backup-files.sh") | crontab -
```

### Health Checks

#### System Status Script
```bash
cat > /home/ubuntu/check-system.sh << EOF
#!/bin/bash
echo "=== Acharya ERP System Status ==="
echo "Date: \$(date)"
echo

echo "Backend Service:"
sudo systemctl is-active acharya-backend
echo

echo "Nginx Service:"
sudo systemctl is-active nginx
echo

echo "PostgreSQL Service:"
sudo systemctl is-active postgresql
echo

echo "Redis Service:"
sudo systemctl is-active redis-server
echo

echo "Disk Usage:"
df -h /var/www/acharya
echo

echo "Memory Usage:"
free -h
echo

echo "Load Average:"
uptime
EOF

chmod +x /home/ubuntu/check-system.sh
```

## Troubleshooting

### Common Issues

#### 502 Bad Gateway
```bash
# Check backend service
sudo systemctl status acharya-backend

# Check logs
sudo journalctl -u acharya-backend -f

# Restart service
sudo systemctl restart acharya-backend
```

#### Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U acharya -d acharya_db -c "SELECT 1;"

# Check Django database connection
cd /var/www/acharya/backend
uv run python manage.py dbshell
```

#### Static Files Not Loading
```bash
# Recollect static files
cd /var/www/acharya/backend
uv run python manage.py collectstatic --clear --noinput

# Check permissions
sudo chown -R www-data:www-data /var/www/acharya/backend/staticfiles
```

### Performance Optimization

#### Database
- Regular VACUUM and ANALYZE
- Proper indexing on frequently queried fields
- Connection pooling with pgbouncer

#### Caching
- Redis for session and API caching
- CDN for static assets
- Browser caching headers

#### Monitoring
- Use tools like Prometheus + Grafana
- Monitor database performance
- Set up alerting for critical issues

## Security Checklist

### Django Security
- [x] SECRET_KEY is random and secure
- [x] DEBUG=False in production
- [x] ALLOWED_HOSTS properly configured
- [x] SSL/HTTPS enabled
- [x] Security headers configured
- [x] Database credentials secured

### Server Security
- [x] Firewall configured (only 80, 443, 22 open)
- [x] Regular security updates
- [x] Non-root user for application
- [x] Fail2ban for brute force protection
- [x] Regular backups
- [x] Log monitoring

## Updates and Deployment

### Deployment Script
```bash
cat > /home/ubuntu/deploy.sh << EOF
#!/bin/bash
set -e

echo "Starting deployment..."

# Navigate to project directory
cd /var/www/acharya

# Pull latest code
git pull origin main

# Backend updates
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py collectstatic --noinput

# Frontend updates
cd ../frontend
npm ci --production
npm run build

# Restart services
sudo systemctl restart acharya-backend
sudo systemctl reload nginx

echo "Deployment completed successfully!"
EOF

chmod +x /home/ubuntu/deploy.sh
```

This deployment guide provides a comprehensive approach to deploying the Acharya ERP system in production with proper security, monitoring, and maintenance procedures.