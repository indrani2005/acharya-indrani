# Acharya School Management System - Project Context

## 📋 Project Overview

The **Acharya School Management System** is a comprehensive web application designed to manage all aspects of school operations, from student admissions to fee management, attendance tracking, and academic reporting. The system provides role-based dashboards for Students, Parents, Teachers, and Administrators.

## 🏗️ System Architecture

### Full-Stack Architecture
```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   React Frontend │ ◄─────────────────► │  Django Backend │
│   (TypeScript)   │                     │    (Python)     │
└─────────────────┘                     └─────────────────┘
│                                                          │
│ Port: 8080                                    Port: 8000 │
│ Vite Dev Server                           Django Server  │
└─────────────────                     ┌─────────────────┘
                                        │
                                        ▼
                                ┌─────────────────┐
                                │   PostgreSQL    │
                                │    Database     │
                                │ (SQLite in dev) │
                                └─────────────────┘
```

## 📁 Project Structure

```
Acharya/
├── backend/                    # Django REST API Backend
│   ├── admissions/            # Admission management app
│   ├── analytics/             # Analytics and reporting app
│   ├── attendance/            # Attendance tracking app
│   ├── config/                # Django project configuration
│   │   ├── settings.py       # Django settings
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI configuration
│   ├── exams/                 # Examination management app
│   ├── fees/                  # Fee collection and management app
│   ├── hostel/                # Hostel accommodation management app
│   ├── library/               # Library management app
│   ├── notifications/         # Notification system app
│   ├── parents/               # Parent-specific functionality app
│   ├── reports/               # Report generation app
│   ├── staff/                 # Staff management app
│   ├── students/              # Student management app
│   ├── users/                 # Custom user model and authentication app
│   ├── manage.py              # Django management script
│   ├── pyproject.toml         # Python dependencies (UV format)
│   ├── uv.lock                # UV lockfile for reproducible builds
│   ├── requirements.txt       # Legacy pip requirements
│   └── db.sqlite3             # Development database
│
├── frontend/                   # React TypeScript Frontend
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── EnhancedDashboardLayout.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx # JWT authentication context
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   │   └── api/          # API integration layer
│   │   │       ├── types.ts  # TypeScript interfaces
│   │   │       ├── client.ts # Axios configuration
│   │   │       ├── auth.ts   # Authentication services
│   │   │       ├── services.ts # Business logic APIs
│   │   │       └── index.ts  # API exports
│   │   ├── pages/             # Application pages
│   │   │   ├── dashboards/   # Role-based dashboards
│   │   │   ├── Auth.tsx      # Login/Register page
│   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   └── Admission.tsx # Admission form
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite build configuration
│   └── tailwind.config.ts     # Tailwind CSS configuration
│
├── docs/                       # Documentation
│   ├── integration-summary.md # Complete integration overview
│   ├── deployment-guide.md    # Production deployment guide
│   ├── migration-troubleshooting-guide.md # Django migration help
│   ├── issue-resolution-summary.md # Recent fixes documentation
│   └── frontend-backend-integration.md # Technical integration details
│
├── infra/                      # Infrastructure configuration
└── context.md                  # This file - Project context and structure
```

## 🛠️ Technology Stack

### Backend - Django REST Framework
- **Framework:** Django 5.x with Django REST Framework
- **Language:** Python 3.11+
- **Package Manager:** [UV](https://docs.astral.sh/uv/) - Modern Python package manager
- **Database:** PostgreSQL (production), SQLite (development)
- **Authentication:** JWT with SimpleJWT
- **API Documentation:** drf-spectacular (Swagger/OpenAPI)
- **Cache:** Redis (production)

### Frontend - React with TypeScript
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (Development server on port 8080)
- **Styling:** Tailwind CSS with shadcn/ui components
- **HTTP Client:** Axios with interceptors
- **Routing:** React Router v6
- **State Management:** React Context + hooks
- **Package Manager:** npm

### Development Tools
- **Python Package Manager:** UV (https://docs.astral.sh/uv/)
- **Code Quality:** ESLint, Prettier (frontend), Black, isort (backend)
- **Version Control:** Git
- **API Testing:** Django REST Framework browsable API + Swagger UI

## 🚀 Development Setup

### Prerequisites
```bash
# Python 3.11+ with UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Node.js 18+ with npm
# Download from https://nodejs.org/
```

### Backend Setup (Django)
```bash
# Navigate to backend directory
cd backend/

# Create virtual environment and install dependencies
uv venv
uv sync

# Run database migrations
uv run manage.py migrate

# Create superuser
uv run manage.py createsuperuser

# Start development server
uv run manage.py runserver
# Backend runs on: http://127.0.0.1:8000/
# API Docs: http://127.0.0.1:8000/api/docs/
```

### Frontend Setup (React)
```bash
# Navigate to frontend directory
cd frontend/

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on: http://localhost:8080/
```

## 🔧 Package Management

### Backend - UV Package Manager

**UV** is a modern, fast Python package manager and project manager. We use UV instead of pip for better dependency resolution and faster installations.

**Key UV Commands:**
```bash
# Install dependencies from pyproject.toml
uv sync

# Add a new dependency
uv add django-cors-headers

# Add development dependency
uv add --dev pytest

# Run Python scripts with UV
uv run manage.py runserver
uv run python manage.py migrate

# Update dependencies
uv lock --upgrade

# Create virtual environment
uv venv
```

**Benefits of UV:**
- ⚡ **Faster:** 10-100x faster than pip
- 🔒 **Reliable:** Better dependency resolution
- 📦 **Modern:** Uses pyproject.toml standard
- 🔄 **Reproducible:** Lockfile ensures consistent installs

**Learn more:** https://docs.astral.sh/uv/

### Frontend - npm Package Manager

```bash
# Install dependencies
npm install

# Add new dependency
npm install axios

# Add development dependency
npm install -D @types/node

# Start development server (port 8080)
npm run dev

# Build for production
npm run build
```

## 🌐 Development Servers

### Port Configuration
- **Frontend (React/Vite):** http://localhost:8080/
- **Backend (Django):** http://127.0.0.1:8000/
- **API Documentation:** http://127.0.0.1:8000/api/docs/

**Note:** The frontend runs on port 8080 (not the default Vite port 5173) as configured in vite.config.ts.

## 🔗 API Integration

### Authentication Flow
1. **Frontend** sends login credentials to **Backend**
2. **Backend** validates and returns JWT tokens (access + refresh)
3. **Frontend** stores tokens and includes in all subsequent requests
4. **Backend** validates JWT tokens for protected endpoints

### API Structure
```
/api/v1/
├── users/
│   ├── auth/login/          # POST - User login
│   ├── auth/logout/         # POST - User logout
│   ├── auth/refresh/        # POST - Refresh tokens
│   └── auth/register/       # POST - User registration
├── students/                # Student management endpoints
├── admissions/              # Admission process endpoints
├── fees/                    # Fee management endpoints
├── attendance/              # Attendance tracking endpoints
├── exams/                   # Examination system endpoints
├── library/                 # Library management endpoints
├── hostel/                  # Hostel management endpoints
└── reports/                 # Analytics and reporting endpoints
```

## 👥 User Roles & Permissions

### Role-Based Access Control
- **Admin:** Full system access, user management, system configuration
- **Teacher:** Class management, attendance, grading, student communication
- **Student:** Personal dashboard, grades, attendance, assignments
- **Parent:** Child monitoring, fee payments, teacher communication

### Dashboard Features by Role
- **Student Dashboard:** Academic progress, attendance, assignments, notifications
- **Parent Dashboard:** Child monitoring, fee status, teacher communication
- **Teacher Dashboard:** Class management, attendance marking, grade entry
- **Admin Dashboard:** System overview, user management, analytics

## 🗄️ Database Schema

### Key Models
- **User:** Custom user model with role-based permissions
- **StudentProfile:** Student-specific information and academic records
- **ParentProfile:** Parent information linked to students
- **StaffProfile:** Teacher and staff information
- **AdmissionApplication:** Student admission workflow
- **FeeInvoice & Payment:** Fee management and payment tracking
- **AttendanceRecord:** Daily attendance tracking
- **Exam & ExamResult:** Examination and grading system
- **Book & BookBorrowRecord:** Library management
- **Notice & UserNotification:** Communication system

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based authentication** with automatic token refresh
- **Role-based access control** (RBAC)
- **CORS configuration** for secure cross-origin requests
- **CSRF protection** for form submissions
- **Secure password handling** with Django's built-in hashing

### Data Protection
- **Input validation** on both frontend and backend
- **SQL injection prevention** through Django ORM
- **XSS protection** with proper data sanitization
- **Secure headers** configuration

## 📊 Monitoring & Logging

### Development Monitoring
- **Django Debug Toolbar** for development insights
- **Console logging** for frontend debugging
- **API response time monitoring**
- **Error boundary** for graceful error handling

### Production Considerations
- **Structured logging** with rotation
- **Performance monitoring** with metrics
- **Error tracking** with Sentry (configurable)
- **Health check endpoints**

## 🚀 Deployment

### Development Environment
- **Backend:** Django development server (port 8000)
- **Frontend:** Vite development server (port 8080)
- **Database:** SQLite for simplicity
- **Hot reload:** Both frontend and backend support file watching

### Production Environment
- **Backend:** Gunicorn + Nginx
- **Frontend:** Static files served by Nginx
- **Database:** PostgreSQL
- **Cache:** Redis
- **SSL:** Let's Encrypt certificates

## 📝 Documentation

### Available Documentation
- **Integration Summary:** Complete overview of frontend-backend integration
- **Deployment Guide:** Production deployment instructions with Docker
- **Migration Guide:** Django migration best practices and troubleshooting
- **API Reference:** Swagger/OpenAPI documentation at /api/docs/
- **Quick Start:** Getting started guide for developers

### Code Documentation
- **Backend:** Django docstrings and inline comments
- **Frontend:** TypeScript interfaces and JSDoc comments
- **API:** OpenAPI specification with detailed endpoint documentation

## 🔄 Development Workflow

### Daily Development
```bash
# Start backend
cd backend/
uv run manage.py runserver

# Start frontend (in new terminal)
cd frontend/
npm run dev

# Access application
# Frontend: http://localhost:8080/
# Backend API: http://127.0.0.1:8000/api/docs/
```

### Making Changes
1. **Backend changes:** Modify Django models, views, or serializers
2. **Database changes:** Create and apply migrations with `uv run manage.py makemigrations && uv run manage.py migrate`
3. **Frontend changes:** Modify React components, pages, or API services
4. **Integration testing:** Test API endpoints and frontend integration

### Version Control
- **Feature branches:** Create branches for new features
- **Commit messages:** Use conventional commit format
- **Pull requests:** Review code before merging to main
- **Documentation:** Update docs with significant changes

---

## 🎯 Quick Start Commands

```bash
# Backend setup and start
cd backend/
uv sync
uv run manage.py migrate
uv run manage.py runserver

# Frontend setup and start (new terminal)
cd frontend/
npm install
npm run dev

# Access the application
# Frontend: http://localhost:8080/
# Backend: http://127.0.0.1:8000/api/docs/
```

**Project Status:** ✅ Fully integrated and operational  
**Last Updated:** September 13, 2025  
**Documentation:** Comprehensive guides available in `/docs/` directory