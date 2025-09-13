# Deployment Guide - Acharya School Management System

## 🚀 Production Deployment

This guide covers deploying both the Django backend and React frontend to production environments.

## 📋 Pre-deployment Checklist

### Backend Requirements
- [x] Django settings configured for production
- [x] Database migrations applied
- [x] Static files configured
- [x] Environment variables set
- [x] SSL certificates ready
- [x] CORS settings configured

### Frontend Requirements
- [x] Build process tested
- [x] Environment variables set
- [x] API endpoints verified
- [x] Error handling implemented
- [x] Performance optimized

## 🐳 Docker Deployment (Recommended)

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Collect static files
RUN uv run manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: acharya_db
      POSTGRES_USER: acharya_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - acharya_network

  redis:
    image: redis:alpine
    networks:
      - acharya_network

  backend:
    build: ./backend
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://acharya_user:${DB_PASSWORD}@db:5432/acharya_db
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    depends_on:
      - db
      - redis
    networks:
      - acharya_network

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: ${API_BASE_URL}
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - acharya_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    networks:
      - acharya_network

volumes:
  postgres_data:

networks:
  acharya_network:
    driver: bridge
```

## ☁️ Cloud Deployment Options

### AWS Deployment

#### Backend (AWS ECS + RDS)
```bash
# 1. Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier acharya-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username acharyauser \
  --master-user-password your-password \
  --allocated-storage 20

# 2. Create ECS cluster
aws ecs create-cluster --cluster-name acharya-cluster

# 3. Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# 4. Create service
aws ecs create-service \
  --cluster acharya-cluster \
  --service-name acharya-backend \
  --task-definition acharya-backend \
  --desired-count 2
```

#### Frontend (AWS S3 + CloudFront)
```bash
# 1. Create S3 bucket
aws s3 mb s3://acharya-frontend

# 2. Enable static website hosting
aws s3 website s3://acharya-frontend \
  --index-document index.html \
  --error-document index.html

# 3. Upload built files
npm run build
aws s3 sync dist/ s3://acharya-frontend

# 4. Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Google Cloud Platform

#### Backend (Cloud Run + Cloud SQL)
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/acharya-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/acharya-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'acharya-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/acharya-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

#### Frontend (Firebase Hosting)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Digital Ocean

#### App Platform Deployment
```yaml
# .do/app.yaml
name: acharya-school-system
services:
  - name: backend
    source_dir: backend
    github:
      repo: your-username/acharya
      branch: main
    run_command: gunicorn config.wsgi:application
    environment_slug: python
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: DEBUG
        value: "False"
      - key: DATABASE_URL
        value: "${db.DATABASE_URL}"
    
  - name: frontend
    source_dir: frontend
    github:
      repo: your-username/acharya
      branch: main
    build_command: npm run build
    run_command: npx serve dist
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: db
    engine: PG
    version: "13"
```

## 🔧 Production Configuration

### Backend Settings (production.py)
```python
import os
from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files (S3)
STATICFILES_STORAGE = 'storages.backends.s3boto3.StaticS3Boto3Storage'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.MediaS3Boto3Storage'

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME')

# Security
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-domain.com',
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django.log',
        },
    },
    'root': {
        'handlers': ['file'],
    },
}
```

### Frontend Production Build
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
```

### Nginx Configuration
```nginx
# nginx/nginx.conf
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (if not using S3)
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files (if not using S3)
    location /media/ {
        alias /app/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔐 Environment Variables

### Backend (.env)
```bash
# Production environment variables
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DB_NAME=acharya_db
DB_USER=acharya_user
DB_PASSWORD=secure-password
DB_HOST=db-host.amazonaws.com
DB_PORT=5432

# Redis
REDIS_URL=redis://redis-host:6379

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=acharya-static
AWS_S3_REGION_NAME=us-east-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@your-domain.com
EMAIL_HOST_PASSWORD=email-password
EMAIL_USE_TLS=True

# JWT
JWT_SECRET_KEY=jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440
```

### Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://api.your-domain.com/api/v1/
```

## 📊 Monitoring & Logging

### Application Monitoring
```python
# Add to settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

### Performance Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install uv
          cd backend
          uv sync
      
      - name: Run tests
        run: |
          cd backend
          uv run pytest
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build frontend
        run: |
          cd frontend
          npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Your deployment script here
## 🔒 Security Checklist

### SSL/TLS
- [x] SSL certificate installed
- [x] HTTPS redirect configured
- [x] HSTS headers enabled
- [x] Strong cipher suites

### Database Security
- [x] Database credentials secured
- [x] Connection encryption enabled
- [x] Regular backups scheduled
- [x] Access controls implemented

### Application Security
- [x] Environment variables secured
- [x] CORS properly configured
- [x] CSP headers implemented
- [x] Regular security updates

## 📈 Performance Optimization

### Backend Optimizations
```python
# settings.py optimizations
DATABASES = {
    'default': {
        # ... database config
        'CONN_MAX_AGE': 600,  # Connection pooling
        'OPTIONS': {
            'MAX_CONNS': 20,
        }
    }
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### Frontend Optimizations
```typescript
// Lazy loading components
const StudentDashboard = lazy(() => import('./pages/dashboards/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));

// Code splitting by route
const router = createBrowserRouter([
  {
    path: "/dashboard",
    element: <Suspense fallback={<Loading />}><StudentDashboard /></Suspense>
  }
]);
```

## 🔧 Maintenance & Backup

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://acharya-backups/
rm backup_$DATE.sql
```

### Migration Management
For detailed migration troubleshooting and best practices, see [Migration Troubleshooting Guide](./migration-troubleshooting-guide.md).

**Quick Migration Recovery:**
```bash
# Production migration rollback (with backup!)
pg_dump database_name > backup_before_rollback.sql
uv run manage.py migrate app_name 0001  # Rollback to specific migration

# Development reset (destroys data!)
rm db.sqlite3
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
uv run manage.py makemigrations
uv run manage.py migrate
```

### Log Rotation
```bash
# /etc/logrotate.d/acharya
/var/log/django.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    copytruncate
}
```

## 📞 Production Support

### Health Checks
```python
# views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "healthy"})
    except Exception as e:
        return JsonResponse({"status": "unhealthy", "error": str(e)}, status=500)
```

### Monitoring Endpoints
- `/health/` - Application health
- `/api/docs/` - API documentation
- `/admin/` - Django admin interface

---

**Deployment Status**: ✅ Production Ready  
**Last Updated**: September 13, 2025  
**Support**: See monitoring dashboard for system status

### 2. Install API Client Dependencies
```bash
# Add Axios for API calls
npm install axios

# Add JWT decode utility
npm install jwt-decode
```

### 3. Create API Service
Create `src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4. Create Auth Service
Create `src/services/auth.ts`:
```typescript
import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/users/auth/login/', data);
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token: access };
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/users/auth/logout/', { refresh: refreshToken });
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/users/auth/me/');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
```

### 5. Update Auth Component
Update `src/pages/Auth.tsx` to use Django API:
```typescript
// Replace Supabase login with:
const handleLogin = async (email: string, password: string) => {
  try {
    setIsLoading(true);
    const { user } = await authService.login({ email, password });
    navigate('/dashboard');
  } catch (error) {
    toast({
      title: "Login Failed",
      description: "Invalid credentials",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 6. Update Dashboard Data Fetching
Update dashboard components to use real API:
```typescript
// In StudentDashboard.tsx
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [student, fees, attendance] = await Promise.all([
        api.get('/users/auth/me/'),
        api.get('/fees/invoices/', { params: { student: user.id } }),
        api.get('/attendance/records/', { params: { student: user.id } })
      ]);
      
      setStudentData(student.data);
      setFeesData(fees.data.results);
      setAttendanceData(attendance.data.results);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  fetchDashboardData();
}, []);
```

## Environment Configuration

### 1. Backend Environment (.env)
Create `backend/.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/acharya_db

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080

# File Storage (for production)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=acharya-documents
```

### 2. Frontend Environment (.env)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Acharya School Management
```

## Production Deployment

### 1. Backend Deployment (Django)

#### Docker Setup
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

#### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: acharya_db
      POSTGRES_USER: acharya_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://acharya_user:secure_password@db:5432/acharya_db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Frontend Deployment (React)

#### Build Configuration
Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

#### Nginx Configuration
Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Database Migration in Production
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## Testing Setup

### 1. Backend Tests
```bash
# Run Django tests
uv run manage.py test

# Run with coverage
uv run coverage run --source='.' manage.py test
uv run coverage report
```

### 2. Frontend Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

## Monitoring & Logging

### 1. Backend Logging
Add to `settings.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. API Monitoring
```python
# Add to requirements.txt
django-debug-toolbar==4.2.0
sentry-sdk==1.40.0

# Add to settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

## Performance Optimization

### 1. Database Optimization
```python
# Add database indexes
class StudentProfile(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['admission_number']),
            models.Index(fields=['course', 'semester']),
        ]
```

### 2. API Optimization
```python
# Use select_related and prefetch_related
queryset = StudentProfile.objects.select_related('user').prefetch_related('parents')

# Add caching
from django.core.cache import cache

def get_student_data(student_id):
    cache_key = f'student_data_{student_id}'
    data = cache.get(cache_key)
    if not data:
        data = StudentProfile.objects.get(id=student_id)
        cache.set(cache_key, data, 300)  # 5 minutes
    return data
```

### 3. Frontend Optimization
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['student', studentId],
  queryFn: () => api.get(`/users/students/${studentId}/`),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Security Checklist

### Backend Security
- [ ] HTTPS enabled in production
- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY
- [ ] CORS properly configured
- [ ] SQL injection protection (using ORM)
- [ ] XSS protection headers
- [ ] CSRF protection enabled
- [ ] File upload validation
- [ ] Rate limiting configured

### Frontend Security
- [ ] API keys not exposed
- [ ] Input validation
- [ ] XSS protection
- [ ] Secure token storage
- [ ] HTTPS enforcement
- [ ] Content Security Policy

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U acharya_user acharya_db > backup.sql

# Restore backup
docker-compose exec -T db psql -U acharya_user acharya_db < backup.sql
```

### File Backup
```bash
# Backup media files
tar -czf media_backup.tar.gz media/

# Backup to S3
aws s3 sync media/ s3://your-backup-bucket/media/
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ALLOWED_ORIGINS in settings
   - Verify frontend URL is included

2. **JWT Token Issues**
   - Check token expiration
   - Verify token storage/retrieval

3. **Database Connection**
   - Check DATABASE_URL format
   - Verify database is running

4. **Migration Errors**
   - Run `makemigrations` before `migrate`
   - Check for model conflicts

5. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check environment variables

---

**Deployment Complete**: Your Acharya School Management System is now ready for production use!