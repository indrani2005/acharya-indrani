# Acharya ERP Deployment Guide# Acharya ERP Deployment Guide



## Overview## Overview

Complete deployment guide for the Acharya Educational Resource Planning system, covering development setup, production deployment, and maintenance procedures.This guide covers deployment of the Acharya ERP system in various environments, from development to production.



## System Requirements## System Requirements



### Development Environment### Minimum Requirements

- **Python**: 3.11+ (recommended 3.13)- **CPU**: 2 cores

- **Node.js**: 18+ (recommended 20+)- **RAM**: 4GB

- **Package Managers**: UV for Python, Bun for Node.js- **Storage**: 20GB SSD

- **Database**: SQLite (included with Python)- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 20.04+

### Recommended Requirements (Production)

### Production Environment- **CPU**: 4 cores

- **Server**: Linux (Ubuntu 22.04 LTS recommended)- **RAM**: 8GB

- **Python**: 3.11+- **Storage**: 50GB SSD

- **Database**: PostgreSQL 15+- **OS**: Ubuntu 22.04 LTS

- **Web Server**: Nginx 1.18+

- **Process Manager**: Systemd or Supervisor## Development Environment Setup

- **SSL**: Let's Encrypt or commercial certificate

- **Memory**: Minimum 2GB RAM (4GB+ recommended)### Backend Setup (Django)

- **Storage**: Minimum 20GB (50GB+ recommended)

#### Prerequisites

## Development Setup- Python 3.11+

- UV package manager

### Prerequisites Installation- SQLite (development) / PostgreSQL (production)



#### Install UV (Python Package Manager)#### Installation

```bash```bash

# Windows (PowerShell)# Clone the repository

irm https://astral.sh/uv/install.ps1 | iexgit clone https://github.com/your-org/acharya.git

cd acharya/backend

# macOS/Linux

curl -LsSf https://astral.sh/uv/install.sh | sh# Install dependencies with UV

```uv sync



#### Install Bun (JavaScript Runtime & Package Manager)# Set up environment variables

```bashcp .env.example .env

# Windows (PowerShell)# Edit .env with your configuration

irm bun.sh/install.ps1 | iex

# Run migrations

# macOS/Linuxuv run python manage.py migrate

curl -fsSL https://bun.sh/install | bash

```# Create test admin user

uv run python manage.py create_test_admin

### Backend Setup

# Create test data

#### 1. Clone Repositoryuv run python manage.py create_test_applications --count 5

```bash

git clone https://github.com/your-repo/acharya-erp.git# Start development server

cd acharya-erp/backenduv run python manage.py runserver

``````



#### 2. Create Virtual Environment#### Environment Variables (.env)

```bash```bash

uv venv# Django Settings

# Activate virtual environmentSECRET_KEY=your-secret-key-here

# WindowsDEBUG=True

.venv\\Scripts\\activateALLOWED_HOSTS=localhost,127.0.0.1

# macOS/Linux

source .venv/bin/activate# Database (SQLite for development)

```DATABASE_URL=sqlite:///db.sqlite3



#### 3. Install Dependencies# Email Configuration (Development - Console Backend)

```bashEMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

uv syncDEFAULT_FROM_EMAIL=noreply@acharya-erp.com

```

# Frontend URL

#### 4. Environment ConfigurationFRONTEND_URL=http://localhost:3000

```bash

# Copy environment template# JWT Settings

cp .env.example .envJWT_ACCESS_TOKEN_LIFETIME=60  # minutes

JWT_REFRESH_TOKEN_LIFETIME=7  # days

# Edit .env file with your configurations```

```

### Frontend Setup (React)

**Environment Variables (.env):**

```env#### Prerequisites

# Django Settings- Node.js 18+

DEBUG=True- npm or yarn

SECRET_KEY=your-secret-key-here

ALLOWED_HOSTS=localhost,127.0.0.1#### Installation

```bash

# Database Settings (Development)# Navigate to frontend directory

DATABASE_URL=sqlite:///db.sqlite3cd acharya/frontend



# Email Settings (for OTP)# Install dependencies

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackendnpm install

EMAIL_HOST=smtp.gmail.com

EMAIL_PORT=587# Set up environment variables

EMAIL_USE_TLS=Truecp .env.example .env.local

EMAIL_HOST_USER=your-email@gmail.com# Edit .env.local with your configuration

EMAIL_HOST_PASSWORD=your-app-password

# Start development server

# JWT Settingsnpm run dev

JWT_SECRET_KEY=your-jwt-secret-key```



# File Upload Settings#### Environment Variables (.env.local)

MEDIA_ROOT=media/```bash

MEDIA_URL=/media/VITE_API_BASE_URL=http://localhost:8000/api/v1/

MAX_UPLOAD_SIZE=5242880  # 5MBVITE_APP_TITLE=Acharya ERP System

VITE_APP_VERSION=1.0.0

# CORS Settings```

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

```## Production Deployment



#### 5. Database Setup### 1. Server Setup (Ubuntu 22.04)

```bash

# Run migrations#### Update System

python manage.py migrate```bash

sudo apt update && sudo apt upgrade -y

# Create superusersudo apt install -y git nginx postgresql postgresql-contrib redis-server

python manage.py createsuperuser```



# Load sample data (optional)#### Install Python and UV

python manage.py loaddata sample_data.json```bash

```curl -LsSf https://astral.sh/uv/install.sh | sh

source ~/.bashrc

#### 6. Start Development Server```

```bash

python manage.py runserver 0.0.0.0:8000#### Install Node.js

``````bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

### Frontend Setupsudo apt-get install -y nodejs

```

#### 1. Navigate to Frontend Directory

```bash### 2. Database Setup (PostgreSQL)

cd ../frontend

``````bash

# Create database user

#### 2. Install Dependenciessudo -u postgres createuser --interactive

```bash# Enter username: acharya

bun install# Superuser: n

```# Create databases: y

# Create roles: n

#### 3. Environment Configuration

```bash# Create database

# Create environment filesudo -u postgres createdb acharya_db

cp .env.example .env

# Set password for user

# Edit .env filesudo -u postgres psql

```ALTER USER acharya PASSWORD 'secure_password_here';

GRANT ALL PRIVILEGES ON DATABASE acharya_db TO acharya;

**Environment Variables (.env):**\q

```env```

# API Configuration

VITE_API_URL=http://localhost:8000### 3. Backend Deployment

VITE_API_VERSION=v1

#### Clone and Setup

# App Configuration```bash

VITE_APP_NAME=Acharya ERP# Create application directory

VITE_APP_VERSION=1.0.0sudo mkdir -p /var/www/acharya

sudo chown $USER:$USER /var/www/acharya

# Upload Configuration

VITE_MAX_FILE_SIZE=5242880# Clone repository

VITE_ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.pngcd /var/www/acharya

```git clone https://github.com/your-org/acharya.git .



#### 4. Start Development Server# Setup backend

```bashcd backend

bun run devuv sync --frozen

``````



### Access Points#### Production Environment Variables

- **Frontend**: http://localhost:3000```bash

- **Backend API**: http://localhost:8000/api/v1/# Create production .env file

- **Admin Panel**: http://localhost:8000/admin/cat > .env << EOF

- **API Documentation**: http://localhost:8000/api/docs/# Django Settings

SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

## Production DeploymentDEBUG=False

ALLOWED_HOSTS=your-domain.com,www.your-domain.com

### Server Preparation

# Database

#### 1. Update SystemDATABASE_URL=postgresql://acharya:secure_password_here@localhost:5432/acharya_db

```bash

sudo apt update && sudo apt upgrade -y# Email Configuration (Gmail SMTP)

```EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

EMAIL_HOST=smtp.gmail.com

#### 2. Install System DependenciesEMAIL_PORT=587

```bashEMAIL_USE_TLS=True

# Essential packagesEMAIL_HOST_USER=your-email@gmail.com

sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contribEMAIL_HOST_PASSWORD=your-app-password

DEFAULT_FROM_EMAIL=noreply@your-domain.com

# Additional utilities

sudo apt install -y git curl wget software-properties-common# Frontend URL

```FRONTEND_URL=https://your-domain.com



#### 3. Install UV# Security

```bashSECURE_SSL_REDIRECT=True

curl -LsSf https://astral.sh/uv/install.sh | shSECURE_HSTS_SECONDS=31536000

source ~/.bashrcSECURE_HSTS_INCLUDE_SUBDOMAINS=True

```SECURE_HSTS_PRELOAD=True

SESSION_COOKIE_SECURE=True

### Database Setup (PostgreSQL)CSRF_COOKIE_SECURE=True



#### 1. Configure PostgreSQL# JWT Settings

```bashJWT_ACCESS_TOKEN_LIFETIME=60

sudo -u postgres psqlJWT_REFRESH_TOKEN_LIFETIME=7

EOF

-- Create database and user```

CREATE DATABASE acharya_erp;

CREATE USER acharya_user WITH PASSWORD 'secure_password_here';#### Database Migration

ALTER ROLE acharya_user SET client_encoding TO 'utf8';```bash

ALTER ROLE acharya_user SET default_transaction_isolation TO 'read committed';uv run python manage.py migrate

ALTER ROLE acharya_user SET timezone TO 'UTC';uv run python manage.py collectstatic --noinput

GRANT ALL PRIVILEGES ON DATABASE acharya_erp TO acharya_user;uv run python manage.py create_test_admin --email admin@your-domain.com

\q```

```

#### Gunicorn Setup

#### 2. Configure PostgreSQL Access```bash

```bash# Install gunicorn

sudo nano /etc/postgresql/15/main/pg_hba.confuv add gunicorn



# Add line:# Create gunicorn configuration

local   acharya_erp     acharya_user                    md5cat > gunicorn.conf.py << EOF

bind = "127.0.0.1:8000"

sudo systemctl restart postgresqlworkers = 3

```worker_class = "sync"

worker_connections = 1000

### Application Deploymentmax_requests = 1000

max_requests_jitter = 100

#### 1. Create Application Usertimeout = 30

```bashkeepalive = 5

sudo adduser --system --group --home /opt/acharya acharyapreload_app = True

sudo mkdir -p /opt/acharyaEOF

sudo chown acharya:acharya /opt/acharya```

```

#### Systemd Service

#### 2. Deploy Application Code```bash

```bash# Create systemd service file

sudo -u acharya git clone https://github.com/your-repo/acharya-erp.git /opt/acharya/appsudo cat > /etc/systemd/system/acharya-backend.service << EOF

cd /opt/acharya/app[Unit]

```Description=Acharya Backend (Gunicorn)

After=network.target

#### 3. Backend Production Setup

```bash[Service]

cd backendUser=www-data

sudo -u acharya uv venvGroup=www-data

sudo -u acharya uv syncWorkingDirectory=/var/www/acharya/backend

Environment=PATH=/var/www/acharya/backend/.venv/bin

# Create production environment fileExecStart=/var/www/acharya/backend/.venv/bin/gunicorn config.wsgi:application -c gunicorn.conf.py

sudo -u acharya cp .env.example .env.prodExecReload=/bin/kill -s HUP \$MAINPID

sudo -u acharya nano .env.prodRestart=on-failure

```

[Install]

**Production Environment (.env.prod):**WantedBy=multi-user.target

```envEOF

DEBUG=False

SECRET_KEY=your-production-secret-key# Set permissions

ALLOWED_HOSTS=your-domain.com,www.your-domain.comsudo chown -R www-data:www-data /var/www/acharya



# Database# Enable and start service

DATABASE_URL=postgresql://acharya_user:secure_password_here@localhost/acharya_erpsudo systemctl daemon-reload

sudo systemctl enable acharya-backend

# Email (Production SMTP)sudo systemctl start acharya-backend

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackendsudo systemctl status acharya-backend

EMAIL_HOST=smtp.your-provider.com```

EMAIL_PORT=587

EMAIL_USE_TLS=True### 4. Frontend Deployment

EMAIL_HOST_USER=noreply@your-domain.com

EMAIL_HOST_PASSWORD=your-smtp-password#### Build React App

```bash

# Securitycd /var/www/acharya/frontend

SECURE_SSL_REDIRECT=True

SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO', 'https')# Create production environment file

SESSION_COOKIE_SECURE=Truecat > .env.production << EOF

CSRF_COOKIE_SECURE=TrueVITE_API_BASE_URL=https://your-domain.com/api/v1/

VITE_APP_TITLE=Acharya ERP System

# Static/Media FilesVITE_APP_VERSION=1.0.0

STATIC_ROOT=/opt/acharya/app/backend/static/EOF

MEDIA_ROOT=/opt/acharya/app/backend/media/

```# Install dependencies and build

npm ci --production

#### 4. Database Migrationnpm run build

```bash```

sudo -u acharya .venv/bin/python manage.py migrate

sudo -u acharya .venv/bin/python manage.py collectstatic --noinput### 5. Nginx Configuration

sudo -u acharya .venv/bin/python manage.py createsuperuser

```#### Main Configuration

```bash

#### 5. Frontend Production Buildsudo cat > /etc/nginx/sites-available/acharya << EOF

```bashserver {

cd ../frontend    listen 80;

    server_name your-domain.com www.your-domain.com;

# Install Bun    return 301 https://\$server_name\$request_uri;

curl -fsSL https://bun.sh/install | bash}

source ~/.bashrc

server {

# Install dependencies and build    listen 443 ssl http2;

bun install    server_name your-domain.com www.your-domain.com;

bun run build

```    # SSL Configuration (Let's Encrypt)

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;

### Web Server Configuration (Nginx)    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;

#### 1. Create Nginx Configuration    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;

```bash    ssl_prefer_server_ciphers on;

sudo nano /etc/nginx/sites-available/acharya-erp    ssl_session_cache shared:SSL:10m;

```

    # Security Headers

**Nginx Configuration:**    add_header X-Content-Type-Options nosniff;

```nginx    add_header X-Frame-Options DENY;

server {    add_header X-XSS-Protection "1; mode=block";

    listen 80;    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    server_name your-domain.com www.your-domain.com;

    return 301 https://$server_name$request_uri;    # Frontend (React)

}    location / {

        root /var/www/acharya/frontend/dist;

server {        try_files \$uri \$uri/ /index.html;

    listen 443 ssl http2;        

    server_name your-domain.com www.your-domain.com;        # Browser caching for static assets

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {

    # SSL Configuration            expires 1y;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;            add_header Cache-Control "public, immutable";

    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;        }

    ssl_protocols TLSv1.2 TLSv1.3;    }

    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

    ssl_prefer_server_ciphers off;    # Backend API

    ssl_session_cache shared:SSL:10m;    location /api/ {

        proxy_pass http://127.0.0.1:8000;

    # Security Headers        proxy_set_header Host \$host;

    add_header X-Frame-Options "SAMEORIGIN" always;        proxy_set_header X-Real-IP \$remote_addr;

    add_header X-XSS-Protection "1; mode=block" always;        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    add_header X-Content-Type-Options "nosniff" always;        proxy_set_header X-Forwarded-Proto \$scheme;

    add_header Referrer-Policy "no-referrer-when-downgrade" always;        proxy_connect_timeout 60s;

    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;        proxy_send_timeout 60s;

        proxy_read_timeout 60s;

    # Frontend (React App)    }

    location / {

        root /opt/acharya/app/frontend/dist;    # Admin interface

        try_files $uri $uri/ /index.html;    location /admin/ {

                proxy_pass http://127.0.0.1:8000;

        # Cache static assets        proxy_set_header Host \$host;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {        proxy_set_header X-Real-IP \$remote_addr;

            expires 1y;        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

            add_header Cache-Control "public, immutable";        proxy_set_header X-Forwarded-Proto \$scheme;

        }    }

    }

    # Static files (Django)

    # Backend API    location /static/ {

    location /api/ {        alias /var/www/acharya/backend/staticfiles/;

        proxy_pass http://127.0.0.1:8000;        expires 1y;

        proxy_set_header Host $host;        add_header Cache-Control "public, immutable";

        proxy_set_header X-Real-IP $remote_addr;    }

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_set_header X-Forwarded-Proto $scheme;    # Media files (Django)

            location /media/ {

        # Handle file uploads        alias /var/www/acharya/backend/media/;

        client_max_body_size 10M;        expires 1y;

    }        add_header Cache-Control "public, immutable";

    }

    # Django Admin

    location /admin/ {    # Gzip compression

        proxy_pass http://127.0.0.1:8000;    gzip on;

        proxy_set_header Host $host;    gzip_vary on;

        proxy_set_header X-Real-IP $remote_addr;    gzip_min_length 1024;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        proxy_set_header X-Forwarded-Proto $scheme;

    }    # Client max body size (for file uploads)

    client_max_body_size 50M;

    # Static files}

    location /static/ {EOF

        alias /opt/acharya/app/backend/static/;

        expires 1y;# Enable site

        add_header Cache-Control "public, immutable";sudo ln -s /etc/nginx/sites-available/acharya /etc/nginx/sites-enabled/

    }sudo nginx -t

sudo systemctl reload nginx

    # Media files```

    location /media/ {

        alias /opt/acharya/app/backend/media/;### 6. SSL Certificate (Let's Encrypt)

        expires 1m;

        add_header Cache-Control "public";```bash

    }# Install Certbot

}sudo apt install -y certbot python3-certbot-nginx

```

# Get SSL certificate

#### 2. Enable Sitesudo certbot --nginx -d your-domain.com -d www.your-domain.com

```bash

sudo ln -s /etc/nginx/sites-available/acharya-erp /etc/nginx/sites-enabled/# Test auto-renewal

sudo nginx -tsudo certbot renew --dry-run

sudo systemctl restart nginx```

```

### 7. Redis Setup (Optional - for caching)

### SSL Certificate (Let's Encrypt)

```bash

#### 1. Install Certbot# Configure Redis

```bashsudo systemctl enable redis-server

sudo apt install snapdsudo systemctl start redis-server

sudo snap install core; sudo snap refresh core

sudo snap install --classic certbot# Add to Django settings

sudo ln -s /snap/bin/certbot /usr/bin/certbotecho "CACHES = {

```    'default': {

        'BACKEND': 'django_redis.cache.RedisCache',

#### 2. Obtain Certificate        'LOCATION': 'redis://127.0.0.1:6379/1',

```bash        'OPTIONS': {

sudo certbot --nginx -d your-domain.com -d www.your-domain.com            'CLIENT_CLASS': 'django_redis.client.DefaultClient',

```        }

    }

#### 3. Auto-renewal Setup}" >> /var/www/acharya/backend/.env

```bash```

sudo systemctl enable snap.certbot.renew.timer

sudo systemctl start snap.certbot.renew.timer## Monitoring and Maintenance

```

### Log Files

### Process Management (Systemd)- **Nginx Access**: `/var/log/nginx/access.log`

- **Nginx Error**: `/var/log/nginx/error.log`

#### 1. Create Systemd Service- **Django**: Configure logging in `settings.py`

```bash- **Gunicorn**: Logs to systemd journal (`sudo journalctl -u acharya-backend`)

sudo nano /etc/systemd/system/acharya-backend.service

```### Backup Strategy



**Service Configuration:**#### Database Backup

```ini```bash

[Unit]# Create backup script

Description=Acharya ERP Backendcat > /home/ubuntu/backup-db.sh << EOF

After=network.target postgresql.service#!/bin/bash

Requires=postgresql.serviceDATE=\$(date +%Y%m%d_%H%M%S)

pg_dump -h localhost -U acharya acharya_db > /home/ubuntu/backups/acharya_db_\$DATE.sql

[Service]find /home/ubuntu/backups -name "*.sql" -mtime +7 -delete

Type=execEOF

User=acharya

Group=acharyachmod +x /home/ubuntu/backup-db.sh

WorkingDirectory=/opt/acharya/app/backend

Environment=DJANGO_SETTINGS_MODULE=config.settings# Add to crontab (daily at 2 AM)

EnvironmentFile=/opt/acharya/app/backend/.env.prod(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/backup-db.sh") | crontab -

ExecStart=/opt/acharya/app/backend/.venv/bin/python manage.py runserver 127.0.0.1:8000```

ExecReload=/bin/kill -HUP $MAINPID

KillMode=mixed#### File Backup

TimeoutStopSec=5```bash

PrivateTmp=true# Create file backup script

Restart=alwayscat > /home/ubuntu/backup-files.sh << EOF

RestartSec=10#!/bin/bash

DATE=\$(date +%Y%m%d_%H%M%S)

[Install]tar -czf /home/ubuntu/backups/acharya_files_\$DATE.tar.gz /var/www/acharya/backend/media

WantedBy=multi-user.targetfind /home/ubuntu/backups -name "acharya_files_*.tar.gz" -mtime +7 -delete

```EOF



#### 2. Enable and Start Servicechmod +x /home/ubuntu/backup-files.sh

```bash

sudo systemctl daemon-reload# Add to crontab (daily at 3 AM)

sudo systemctl enable acharya-backend.service(crontab -l 2>/dev/null; echo "0 3 * * * /home/ubuntu/backup-files.sh") | crontab -

sudo systemctl start acharya-backend.service```

sudo systemctl status acharya-backend.service

```### Health Checks



### Security Hardening#### System Status Script

```bash

#### 1. Firewall Configurationcat > /home/ubuntu/check-system.sh << EOF

```bash#!/bin/bash

sudo ufw allow OpenSSHecho "=== Acharya ERP System Status ==="

sudo ufw allow 'Nginx Full'echo "Date: \$(date)"

sudo ufw enableecho

```

echo "Backend Service:"

#### 2. Fail2Ban Setupsudo systemctl is-active acharya-backend

```bashecho

sudo apt install fail2ban

echo "Nginx Service:"

sudo nano /etc/fail2ban/jail.localsudo systemctl is-active nginx

```echo



```iniecho "PostgreSQL Service:"

[DEFAULT]sudo systemctl is-active postgresql

bantime = 3600echo

findtime = 600

maxretry = 5echo "Redis Service:"

sudo systemctl is-active redis-server

[sshd]echo

enabled = true

echo "Disk Usage:"

[nginx-http-auth]df -h /var/www/acharya

enabled = trueecho



[nginx-noscript]echo "Memory Usage:"

enabled = truefree -h

echo

[nginx-badbots]

enabled = trueecho "Load Average:"

```uptime

EOF

### Maintenance Procedures

chmod +x /home/ubuntu/check-system.sh

#### Application Updates```

```bash

# Update code## Troubleshooting

cd /opt/acharya/app

sudo -u acharya git pull origin main### Common Issues



# Update backend dependencies#### 502 Bad Gateway

cd backend```bash

sudo -u acharya uv sync# Check backend service

sudo systemctl status acharya-backend

# Run migrations

sudo -u acharya .venv/bin/python manage.py migrate# Check logs

sudo journalctl -u acharya-backend -f

# Collect static files

sudo -u acharya .venv/bin/python manage.py collectstatic --noinput# Restart service

sudo systemctl restart acharya-backend

# Restart services```

sudo systemctl restart acharya-backend

sudo systemctl reload nginx#### Database Connection Issues

``````bash

# Check PostgreSQL service

### Backup Strategysudo systemctl status postgresql



#### Database Backup Script# Check database connectivity

```bashpsql -h localhost -U acharya -d acharya_db -c "SELECT 1;"

#!/bin/bash

BACKUP_DIR="/opt/acharya/backups"# Check Django database connection

DATE=$(date +%Y%m%d_%H%M%S)cd /var/www/acharya/backend

DB_NAME="acharya_erp"uv run python manage.py dbshell

DB_USER="acharya_user"```



# Create backup directory#### Static Files Not Loading

mkdir -p $BACKUP_DIR```bash

# Recollect static files

# Database backupcd /var/www/acharya/backend

pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sqluv run python manage.py collectstatic --clear --noinput



# Media files backup# Check permissions

tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /opt/acharya/app/backend/media/sudo chown -R www-data:www-data /var/www/acharya/backend/staticfiles

```

# Keep only last 7 days of backups

find $BACKUP_DIR -name "*.sql" -mtime +7 -delete### Performance Optimization

find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

#### Database

echo "Backup completed: $DATE"- Regular VACUUM and ANALYZE

```- Proper indexing on frequently queried fields

- Connection pooling with pgbouncer

### Troubleshooting

#### Caching

#### Common Issues- Redis for session and API caching

- CDN for static assets

1. **502 Bad Gateway**- Browser caching headers

   - Check if backend service is running: `sudo systemctl status acharya-backend`

   - Check nginx configuration: `sudo nginx -t`#### Monitoring

   - Review logs: `sudo journalctl -u acharya-backend -f`- Use tools like Prometheus + Grafana

- Monitor database performance

2. **Database Connection Issues**- Set up alerting for critical issues

   - Check PostgreSQL status: `sudo systemctl status postgresql`

   - Verify database credentials in .env.prod## Security Checklist

   - Check pg_hba.conf configuration

### Django Security

3. **SSL Certificate Issues**- [x] SECRET_KEY is random and secure

   - Renew certificate: `sudo certbot renew`- [x] DEBUG=False in production

   - Check certificate validity: `sudo certbot certificates`- [x] ALLOWED_HOSTS properly configured

- [x] SSL/HTTPS enabled

4. **File Upload Issues**- [x] Security headers configured

   - Check file permissions: `ls -la /opt/acharya/app/backend/media/`- [x] Database credentials secured

   - Verify nginx client_max_body_size setting

   - Check Django MEDIA_ROOT setting### Server Security

- [x] Firewall configured (only 80, 443, 22 open)

#### Log Locations- [x] Regular security updates

- **Application logs**: `/var/log/acharya/django.log`- [x] Non-root user for application

- **System service logs**: `sudo journalctl -u acharya-backend -f`- [x] Fail2ban for brute force protection

- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`- [x] Regular backups

- **PostgreSQL logs**: `/var/log/postgresql/postgresql-15-main.log`- [x] Log monitoring



This deployment guide provides a comprehensive setup for both development and production environments, ensuring security, performance, and maintainability of the Acharya ERP system.## Updates and Deployment

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