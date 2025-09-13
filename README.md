# 🏫 Acharya School Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.x-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

A comprehensive, modern school management system built with Django REST Framework and React TypeScript. Manage students, staff, admissions, fees, attendance, examinations, hostel accommodations, and library operations with role-based access control.

## 📋 Table of Contents

- [🏫 Acharya School Management System](#-acharya-school-management-system)
  - [📋 Table of Contents](#-table-of-contents)
  - [🌟 Features](#-features)
    - [👥 User Roles \& Dashboards](#-user-roles--dashboards)
    - [🎯 Core Modules](#-core-modules)
    - [🔐 Security Features](#-security-features)
    - [📊 Analytics \& Reporting](#-analytics--reporting)
  - [🏗️ System Architecture](#️-system-architecture)
    - [Technology Stack](#technology-stack)
    - [Architecture Diagram](#architecture-diagram)
  - [📁 Project Structure](#-project-structure)
  - [🚀 Quick Start](#-quick-start)
    - [Prerequisites](#prerequisites)
    - [Backend Setup (Django)](#backend-setup-django)
    - [Frontend Setup (React)](#frontend-setup-react)
    - [Accessing the Application](#accessing-the-application)
  - [🛠️ Development Setup](#️-development-setup)
    - [Environment Variables](#environment-variables)
    - [Database Setup](#database-setup)
    - [Package Management](#package-management)
  - [📡 API Documentation](#-api-documentation)
    - [Authentication Endpoints](#authentication-endpoints)
    - [Core Module Endpoints](#core-module-endpoints)
    - [API Features](#api-features)
  - [🎨 Frontend Details](#-frontend-details)
    - [Component Architecture](#component-architecture)
    - [State Management](#state-management)
    - [UI/UX Features](#uiux-features)
  - [⚙️ Backend Details](#️-backend-details)
    - [Django Apps Structure](#django-apps-structure)
    - [Database Models](#database-models)
    - [Security Implementation](#security-implementation)
  - [🔐 Authentication \& Authorization](#-authentication--authorization)
    - [JWT Authentication Flow](#jwt-authentication-flow)
    - [Role-Based Access Control](#role-based-access-control)
    - [Permission Matrix](#permission-matrix)
  - [📚 Documentation](#-documentation)
    - [Available Documentation](#available-documentation)
    - [API Reference](#api-reference)
    - [Integration Guides](#integration-guides)
  - [🚀 Deployment](#-deployment)
    - [Production Deployment Options](#production-deployment-options)
    - [Docker Deployment](#docker-deployment)
    - [Cloud Deployment](#cloud-deployment)
  - [🧪 Testing](#-testing)
    - [Backend Testing](#backend-testing)
    - [Frontend Testing](#frontend-testing)
    - [Integration Testing](#integration-testing)
  - [📊 Performance \& Monitoring](#-performance--monitoring)
    - [Performance Features](#performance-features)
    - [Monitoring Setup](#monitoring-setup)
  - [🔧 Configuration](#-configuration)
    - [Environment Settings](#environment-settings)
    - [Feature Flags](#feature-flags)
  - [🚨 Troubleshooting](#-troubleshooting)
    - [Common Issues](#common-issues)
    - [Migration Issues](#migration-issues)
  - [🤝 Contributing](#-contributing)
    - [Development Workflow](#development-workflow)
    - [Code Style](#code-style)
    - [Commit Guidelines](#commit-guidelines)
  - [📝 License](#-license)
  - [👥 Support \& Community](#-support--community)
  - [🎯 Roadmap](#-roadmap)

## 🌟 Features

### 👥 User Roles & Dashboards

- **👨‍🎓 Student Dashboard**
  - Personal academic dashboard with grade tracking
  - Attendance monitoring and reports
  - Fee payment status and online payment
  - Exam schedules and result viewing
  - Library book management
  - Assignment submissions and downloads

- **👨‍👩‍👧‍👦 Parent Dashboard**
  - Multi-child monitoring capability
  - Real-time academic progress tracking
  - Direct communication with teachers
  - Fee payment and receipt management
  - Attendance notifications and alerts

- **👨‍🏫 Teacher Dashboard**
  - Class management and student lists
  - Attendance marking and reporting
  - Grade entry and assignment management
  - Study material uploads
  - Parent-teacher communication portal

- **👨‍💼 Admin Dashboard**
  - Complete system administration
  - User management (students, parents, staff)
  - Academic year and class management
  - Fee structure configuration
  - Comprehensive reporting and analytics

- **🏠 Warden Dashboard**
  - Hostel management and room allocation
  - Student accommodation tracking
  - Room change request management
  - Hostel fee management

### 🎯 Core Modules

- **📚 Academic Management**
  - Student admissions and enrollment
  - Class and section management
  - Semester/year progression tracking
  - Academic calendar management

- **💰 Financial Management**
  - Dynamic fee structure configuration
  - Online payment integration
  - Automated receipt generation
  - Financial reporting and analytics

- **📊 Attendance System**
  - Real-time attendance marking
  - Automated attendance reports
  - Attendance analytics and alerts
  - Bulk attendance operations

- **📝 Examination System**
  - Exam scheduling and management
  - Online grade entry
  - Report card generation
  - Performance analytics

- **🏠 Hostel Management**
  - Room allocation and management
  - Hostel fee tracking
  - Maintenance request system
  - Visitor management

- **📖 Library Management**
  - Book catalog and inventory
  - Issue/return tracking
  - Fine calculation and management
  - Digital resource management

- **🔔 Notification System**
  - Real-time notifications
  - Email and SMS integration
  - Custom notification rules
  - Announcement management

### 🔐 Security Features

- **JWT-based Authentication** with automatic token refresh
- **Role-based Access Control (RBAC)** with granular permissions
- **Data Encryption** for sensitive information
- **CORS Protection** for secure cross-origin requests
- **Rate Limiting** to prevent abuse
- **Audit Logging** for compliance and tracking
- **Session Management** with secure logout
- **File Upload Security** with content validation

### 📊 Analytics & Reporting

- **Real-time Dashboards** for all user roles
- **Attendance Analytics** with trend analysis
- **Academic Performance Tracking** and insights
- **Financial Reports** and revenue analytics
- **Custom Report Generation** (PDF/Excel)
- **Data Export** capabilities
- **Predictive Analytics** for student performance

## 🏗️ System Architecture

### Technology Stack

**Backend - Django REST Framework**
- **Framework:** Django 5.x with Django REST Framework
- **Language:** Python 3.11+
- **Package Manager:** [UV](https://docs.astral.sh/uv/) - Modern Python package manager
- **Database:** PostgreSQL (production), SQLite (development)
- **Authentication:** JWT with SimpleJWT
- **API Documentation:** drf-spectacular (Swagger/OpenAPI)
- **Cache:** Redis (production)
- **Task Queue:** Celery for background jobs
- **File Storage:** S3-compatible storage

**Frontend - React TypeScript**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (Development server on port 8080)
- **Styling:** Tailwind CSS with shadcn/ui components
- **HTTP Client:** Axios with interceptors
- **Routing:** React Router v6
- **State Management:** React Context + hooks
- **Package Manager:** npm
- **Form Management:** React Hook Form with Zod validation

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Web Browser   │   Mobile App    │      Admin Portal           │
│   (React/TS)    │   (Future)      │      (Django Admin)         │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                 │                         │
         │                 │                         │
         ▼                 ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                 │
│                         (Nginx)                                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DJANGO REST FRAMEWORK                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Auth Service  │  Core Services  │    Background Services      │
│   (JWT/RBAC)    │   (CRUD APIs)   │      (Celery Tasks)         │
└─────────────────┴─────────────────┴─────────────────────────────┘
         │                 │                         │
         ▼                 ▼                         ▼
┌─────────────────┬─────────────────┬─────────────────────────────┐
│   PostgreSQL    │      Redis      │      File Storage           │
│   (Primary DB)  │  (Cache/Queue)  │       (S3/MinIO)            │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 📁 Project Structure

```
Acharya/
├── backend/                    # Django REST API Backend
│   ├── admissions/            # Student admission management
│   ├── analytics/             # Analytics and reporting
│   ├── attendance/            # Attendance tracking system
│   ├── config/                # Django project configuration
│   │   ├── settings/         # Environment-specific settings
│   │   ├── urls.py           # Main URL routing
│   │   └── wsgi.py           # WSGI configuration
│   ├── exams/                 # Examination management
│   ├── fees/                  # Fee collection and management
│   ├── hostel/                # Hostel accommodation system
│   ├── library/               # Library management
│   ├── notifications/         # Notification system
│   ├── parents/               # Parent-specific functionality
│   ├── reports/               # Report generation
│   ├── staff/                 # Staff management
│   ├── students/              # Student management
│   ├── users/                 # User authentication and profiles
│   ├── manage.py              # Django management commands
│   ├── pyproject.toml         # UV package configuration
│   ├── uv.lock                # UV lockfile
│   └── requirements.txt       # Legacy pip requirements
│
├── frontend/                   # React TypeScript Frontend
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   └── custom/       # Custom business components
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx # Authentication context
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   │   └── api/          # API integration layer
│   │   ├── pages/             # Application pages
│   │   │   ├── dashboards/   # Role-specific dashboards
│   │   │   ├── Auth.tsx      # Authentication page
│   │   │   ├── Dashboard.tsx # Main dashboard
│   │   │   └── Admission.tsx # Admission form
│   │   ├── styles/            # Global styles and themes
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main application component
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite build configuration
│   └── tailwind.config.ts     # Tailwind CSS configuration
│
├── docs/                       # Comprehensive Documentation
│   ├── api-reference.md       # Complete API documentation
│   ├── backend-implementation.md # Backend technical details
│   ├── deployment-guide.md    # Production deployment guide
│   ├── frontend-backend-integration.md # Integration guide
│   ├── integration-summary.md # Project integration overview
│   ├── issue-resolution-summary.md # Troubleshooting guide
│   ├── migration-troubleshooting-guide.md # Database migrations
│   └── quick-start-integration.md # Quick setup guide
│
├── infra/                      # Infrastructure configuration
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   └── terraform/             # Infrastructure as code
│
├── context.md                  # Project context and overview
├── TODO.md                     # Development roadmap
├── ARCHITECTURE.md             # Technical architecture details
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **UV Package Manager** - [Install UV](https://docs.astral.sh/uv/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)

```bash
# Install UV (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installations
python --version
uv --version
node --version
npm --version
```

### Backend Setup (Django)

```bash
# Clone the repository
git clone https://github.com/frankmathewsajan/acharya.git
cd acharya

# Navigate to backend directory
cd backend/

# Create virtual environment and install dependencies
uv venv
uv sync

# Run database migrations
uv run manage.py migrate

# Create a superuser account
uv run manage.py createsuperuser

# Load sample data (optional)
uv run manage.py loaddata fixtures/sample_data.json

# Start the development server
uv run manage.py runserver
```

**Backend will be available at:** http://127.0.0.1:8000/

### Frontend Setup (React)

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend/

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Frontend will be available at:** http://localhost:8080/

### Accessing the Application

1. **Frontend Application:** http://localhost:8080/
2. **Backend API:** http://127.0.0.1:8000/
3. **API Documentation:** http://127.0.0.1:8000/api/docs/
4. **Django Admin:** http://127.0.0.1:8000/admin/

## 🛠️ Development Setup

### Environment Variables

**Backend (.env)**
```bash
# Development settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Redis (for production)
REDIS_URL=redis://localhost:6379

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:8080

# JWT settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# File storage (AWS S3 - optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

**Frontend (.env)**
```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1/

# Optional: Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Database Setup

The project supports both SQLite (development) and PostgreSQL (production):

**SQLite (Default Development)**
```bash
# Already configured - no additional setup needed
uv run manage.py migrate
```

**PostgreSQL (Production)**
```bash
# Install PostgreSQL
# Create database and user
createdb acharya_db
createuser acharya_user

# Update .env file
DATABASE_URL=postgresql://acharya_user:password@localhost:5432/acharya_db

# Run migrations
uv run manage.py migrate
```

### Package Management

**Backend - UV Package Manager**

UV is a modern, fast Python package manager that's 10-100x faster than pip:

```bash
# Install dependencies
uv sync

# Add a new dependency
uv add requests

# Add development dependency
uv add --dev pytest

# Update dependencies
uv lock --upgrade

# Run Python commands
uv run python manage.py shell
uv run manage.py test

# Create requirements.txt (for compatibility)
uv export --format requirements-txt --output-file requirements.txt
```

**Learn more about UV:** https://docs.astral.sh/uv/

**Frontend - npm**

```bash
# Install dependencies
npm install

# Add new dependency
npm install axios

# Add development dependency
npm install -D @types/node

# Update dependencies
npm update

# Run scripts
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
```

## 📡 API Documentation

The system provides a comprehensive REST API with full OpenAPI/Swagger documentation.

### Authentication Endpoints

```bash
# User authentication
POST /api/v1/users/auth/login/      # Login with username/password
POST /api/v1/users/auth/logout/     # Logout and blacklist token
POST /api/v1/users/auth/refresh/    # Refresh JWT token
POST /api/v1/users/auth/register/   # User registration

# Profile management
GET  /api/v1/users/me/              # Get current user profile
PATCH /api/v1/users/me/             # Update user profile
POST /api/v1/users/change-password/ # Change password
```

### Core Module Endpoints

**Student Management**
```bash
GET    /api/v1/students/                    # List students
POST   /api/v1/students/                    # Create student
GET    /api/v1/students/{id}/               # Student details
PATCH  /api/v1/students/{id}/               # Update student
GET    /api/v1/students/{id}/dashboard/     # Student dashboard data
GET    /api/v1/students/{id}/attendance/    # Student attendance
GET    /api/v1/students/{id}/grades/        # Student grades
```

**Admission Management**
```bash
GET    /api/v1/admissions/                  # List applications
POST   /api/v1/admissions/                  # Submit application
GET    /api/v1/admissions/{id}/             # Application details
PATCH  /api/v1/admissions/{id}/status/      # Update status (admin)
```

**Fee Management**
```bash
GET    /api/v1/fees/invoices/               # List invoices
POST   /api/v1/fees/invoices/               # Create invoice
GET    /api/v1/fees/invoices/{id}/          # Invoice details
POST   /api/v1/fees/invoices/{id}/pay/      # Process payment
GET    /api/v1/fees/invoices/{id}/receipt/  # Download receipt
```

**Attendance System**
```bash
GET    /api/v1/attendance/sessions/         # List class sessions
POST   /api/v1/attendance/sessions/         # Create session
POST   /api/v1/attendance/mark/             # Mark attendance
GET    /api/v1/attendance/reports/          # Attendance reports
```

**Examination System**
```bash
GET    /api/v1/exams/                       # List exams
POST   /api/v1/exams/                       # Create exam
GET    /api/v1/exams/{id}/results/          # Exam results
POST   /api/v1/exams/{id}/grades/           # Upload grades
```

**Hostel Management**
```bash
GET    /api/v1/hostel/rooms/                # List rooms
POST   /api/v1/hostel/allocate/             # Allocate room
GET    /api/v1/hostel/allocations/          # List allocations
POST   /api/v1/hostel/requests/             # Room change request
```

**Library System**
```bash
GET    /api/v1/library/books/               # List books
POST   /api/v1/library/books/               # Add book
POST   /api/v1/library/borrow/              # Borrow book
POST   /api/v1/library/return/              # Return book
GET    /api/v1/library/borrowed/            # Borrowed books
```

### API Features

- **Comprehensive Filtering:** All list endpoints support filtering, searching, and sorting
- **Pagination:** Cursor-based pagination for optimal performance
- **Field Selection:** Choose specific fields to reduce response size
- **Bulk Operations:** Bulk create, update, and delete operations
- **File Uploads:** Support for document and image uploads
- **Rate Limiting:** Automatic rate limiting to prevent abuse
- **API Versioning:** Versioned APIs for backward compatibility

**Example API Usage:**
```bash
# Get students with filtering and pagination
GET /api/v1/students/?class=10&section=A&page=1&page_size=20

# Search functionality
GET /api/v1/students/?search=john&ordering=admission_number

# Field selection
GET /api/v1/students/?fields=id,name,admission_number

# Date range filtering
GET /api/v1/attendance/?date_from=2024-01-01&date_to=2024-01-31
```

## 🎨 Frontend Details

### Component Architecture

The frontend follows a modular, component-based architecture:

**UI Components**
- **Base Components:** Built on shadcn/ui with Tailwind CSS
- **Business Components:** Custom components for specific business logic
- **Layout Components:** Responsive layouts and navigation
- **Form Components:** Reusable form elements with validation

**Component Hierarchy**
```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoutes
│   │   └── Auth (Login/Register)
│   └── ProtectedRoutes
│       ├── Dashboard (Role-based routing)
│       ├── StudentDashboard
│       ├── ParentDashboard
│       ├── TeacherDashboard
│       ├── AdminDashboard
│       └── WardenDashboard
└── GlobalComponents
    ├── Notifications
    ├── LoadingSpinner
    └── ErrorBoundary
```

### State Management

**Authentication State**
- JWT token management with automatic refresh
- User profile and permissions caching
- Persistent login state across browser sessions

**Application State**
- React Context for global state
- Local component state for UI interactions
- API state management with proper caching

**Form State**
- React Hook Form for form management
- Zod schema validation
- Optimistic updates for better UX

### UI/UX Features

**Design System**
- **Consistent Styling:** Tailwind CSS with custom design tokens
- **Responsive Design:** Mobile-first approach with breakpoint system
- **Dark/Light Mode:** Theme switching capability
- **Accessibility:** WCAG 2.1 AA compliance
- **Loading States:** Skeleton loaders and progress indicators
- **Error Handling:** User-friendly error messages and recovery options

**Interactive Features**
- **Real-time Updates:** Live data updates without page refresh
- **Infinite Scrolling:** For large data sets
- **Advanced Filtering:** Multi-criteria filtering and search
- **Data Export:** CSV/PDF export functionality
- **Drag & Drop:** File uploads and table reordering
- **Keyboard Shortcuts:** Power user keyboard navigation

## ⚙️ Backend Details

### Django Apps Structure

**Core Apps**

1. **users** - Authentication and user management
   - Custom user model with role-based fields
   - JWT authentication with SimpleJWT
   - Profile management for different user types
   - Permission and group management

2. **students** - Student lifecycle management
   - Student profiles and academic records
   - Enrollment and class management
   - Academic progress tracking
   - Document management

3. **admissions** - Admission process automation
   - Application form management
   - Document upload and verification
   - Admission workflow and approvals
   - Seat allocation system

4. **fees** - Financial management
   - Fee structure configuration
   - Invoice generation and management
   - Payment processing and tracking
   - Financial reporting

5. **attendance** - Attendance tracking system
   - Class session management
   - Attendance marking and reporting
   - Attendance analytics and alerts
   - Bulk operations support

6. **exams** - Examination management
   - Exam scheduling and management
   - Grade entry and calculation
   - Report card generation
   - Performance analytics

7. **hostel** - Hostel management
   - Room allocation and management
   - Hostel fee tracking
   - Maintenance requests
   - Visitor management

8. **library** - Library management system
   - Book catalog and inventory
   - Issue/return tracking
   - Fine calculation
   - Digital resource management

9. **notifications** - Communication system
   - Notification templates and rules
   - Email and SMS integration
   - In-app notifications
   - Announcement management

10. **reports** - Reporting and analytics
    - Custom report generation
    - Data export capabilities
    - Scheduled reports
    - Dashboard analytics

### Database Models

**Key Model Relationships**

```python
# User and Profile Models
User (AbstractUser)
├── StudentProfile (OneToOne)
├── ParentProfile (OneToOne)
└── StaffProfile (OneToOne)

# Academic Models
StudentProfile
├── AdmissionApplication (ForeignKey)
├── FeeInvoice (ForeignKey)
├── AttendanceRecord (ForeignKey)
├── ExamResult (ForeignKey)
├── HostelAllocation (ForeignKey)
└── BookBorrowRecord (ForeignKey)

# Administrative Models
ClassSession
├── AttendanceRecord (ForeignKey)
└── Exam (ForeignKey)

Exam
├── ExamResult (ForeignKey)
└── Grade (ForeignKey)
```

**Database Design Principles**
- **Normalization:** Proper database normalization to reduce redundancy
- **Indexing:** Strategic indexing for optimal query performance
- **Constraints:** Database-level constraints for data integrity
- **Audit Trails:** Comprehensive audit logging for compliance
- **Soft Deletes:** Soft deletion for important records
- **Versioning:** Model versioning for historical data

### Security Implementation

**Authentication Security**
- **JWT Tokens:** Secure token-based authentication
- **Token Rotation:** Automatic token refresh and blacklisting
- **Password Policies:** Strong password requirements
- **Account Lockout:** Brute force protection
- **Two-Factor Authentication:** TOTP-based 2FA (optional)

**API Security**
- **Rate Limiting:** Request rate limiting per user/IP
- **CORS Protection:** Configured cross-origin resource sharing
- **Input Validation:** Comprehensive input sanitization
- **SQL Injection Prevention:** ORM-based query protection
- **XSS Protection:** Content Security Policy headers

**Data Security**
- **Encryption at Rest:** Sensitive data encryption
- **Secure File Uploads:** File type and content validation
- **Audit Logging:** Comprehensive activity logging
- **Data Anonymization:** PII protection and anonymization
- **Backup Security:** Encrypted database backups

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: POST /auth/login (credentials)
    API->>Database: Validate user
    Database-->>API: User data
    API-->>Client: JWT tokens (access + refresh)
    
    Note over Client: Store tokens securely
    
    Client->>API: API request + Bearer token
    API->>API: Validate JWT token
    API-->>Client: API response
    
    Note over Client,API: Token expires
    
    Client->>API: POST /auth/refresh (refresh token)
    API-->>Client: New access token
```

### Role-Based Access Control

**User Roles and Capabilities**

| Role | Students | Parents | Fees | Exams | Hostel | Library | Admin |
|------|----------|---------|------|--------|--------|---------|-------|
| **Student** | Read Own | - | Read Own | Read Own | Read Own | Read Own | - |
| **Parent** | Read Children | Read Own | Read Children | Read Children | Read Children | Read Children | - |
| **Teacher** | Read Class | - | - | Read/Write Class | - | Read All | - |
| **Admin** | Full Access | Full Access | Full Access | Full Access | Read All | Full Access | Full Access |
| **Warden** | Read Hostel | - | Read Hostel | - | Full Access | Read All | - |

### Permission Matrix

**Detailed Permission Breakdown**

```python
# Example permission classes
class IsStudentOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'student'

class IsParentOfStudent(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'parent':
            return obj.student in request.user.parent_profile.children.all()
        return False
```

**API Endpoint Permissions**
- **Public Endpoints:** Authentication endpoints, public announcements
- **Authenticated Endpoints:** Profile management, dashboard data
- **Role-Specific Endpoints:** Administrative functions, grade entry
- **Object-Level Permissions:** Access to specific student/parent data

## 📚 Documentation

### Available Documentation

The project includes comprehensive documentation in the `/docs/` directory:

1. **[API Reference](docs/api-reference.md)** - Complete API endpoint documentation
2. **[Backend Implementation](docs/backend-implementation.md)** - Detailed backend architecture
3. **[Deployment Guide](docs/deployment-guide.md)** - Production deployment instructions
4. **[Frontend-Backend Integration](docs/frontend-backend-integration.md)** - Integration guide
5. **[Integration Summary](docs/integration-summary.md)** - Project integration overview
6. **[Issue Resolution](docs/issue-resolution-summary.md)** - Troubleshooting guide
7. **[Migration Guide](docs/migration-troubleshooting-guide.md)** - Database migration help
8. **[Quick Start](docs/quick-start-integration.md)** - Fast setup guide

### API Reference

**Interactive API Documentation**
- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **ReDoc:** http://127.0.0.1:8000/api/redoc/
- **OpenAPI Schema:** http://127.0.0.1:8000/api/schema/

**Authentication Examples**
```bash
# Login and get tokens
curl -X POST http://127.0.0.1:8000/api/v1/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use access token for API calls
curl -X GET http://127.0.0.1:8000/api/v1/students/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh token when expired
curl -X POST http://127.0.0.1:8000/api/v1/users/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

### Integration Guides

**Frontend Integration**
- Component integration with API services
- Error handling and loading states
- Authentication context implementation
- Form validation and submission

**Backend Integration**
- Model relationships and serializers
- Custom permission classes
- Background task implementation
- File upload and storage

## 🚀 Deployment

### Production Deployment Options

**1. Docker Deployment (Recommended)**
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

**2. Traditional VPS Deployment**
```bash
# Install dependencies
sudo apt update && sudo apt install python3.11 postgresql nginx redis-server

# Deploy application
git clone https://github.com/frankmathewsajan/acharya.git
cd acharya/backend
uv sync
uv run manage.py collectstatic
uv run manage.py migrate

# Configure services
sudo systemctl enable acharya
sudo systemctl start acharya
```

### Docker Deployment

**Multi-stage Docker Build**
```dockerfile
# Backend Dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY . .
EXPOSE 8000
CMD ["uv", "run", "gunicorn", "config.wsgi:application"]
```

**Production Docker Compose**
```yaml
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

  redis:
    image: redis:alpine

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://acharya_user:${DB_PASSWORD}@db:5432/acharya_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Cloud Deployment

**AWS Deployment**
- **Backend:** ECS with Application Load Balancer
- **Database:** RDS PostgreSQL with read replicas
- **Cache:** ElastiCache Redis
- **Storage:** S3 for file storage
- **Frontend:** S3 + CloudFront distribution

**Google Cloud Deployment**
- **Backend:** Cloud Run with Cloud SQL
- **Database:** Cloud SQL PostgreSQL
- **Cache:** Memorystore Redis
- **Storage:** Cloud Storage
- **Frontend:** Firebase Hosting

**Digital Ocean Deployment**
- **Backend:** App Platform with managed database
- **Database:** Managed PostgreSQL
- **Cache:** Managed Redis
- **Storage:** Spaces object storage
- **Frontend:** Static site hosting

## 🧪 Testing

### Backend Testing

**Test Coverage**
```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=. --cov-report=html

# Run specific test categories
uv run pytest tests/unit/
uv run pytest tests/integration/
uv run pytest tests/api/
```

**Test Types**
- **Unit Tests:** Model methods, utility functions, business logic
- **Integration Tests:** API endpoints, database operations
- **Performance Tests:** Load testing with locust
- **Security Tests:** Authentication, authorization, input validation

### Frontend Testing

**Test Suite**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test types
npm run test:unit
npm run test:integration
```

**Testing Tools**
- **Unit Testing:** Vitest with React Testing Library
- **E2E Testing:** Playwright for end-to-end scenarios
- **Component Testing:** Storybook for component development
- **Visual Testing:** Chromatic for visual regression testing

### Integration Testing

**API Integration Tests**
```python
# Example API test
def test_student_dashboard_api(authenticated_client, student):
    response = authenticated_client.get(f'/api/v1/students/{student.id}/dashboard/')
    assert response.status_code == 200
    assert 'attendance_percentage' in response.data
    assert 'grade_average' in response.data
```

**Frontend Integration Tests**
```typescript
// Example frontend integration test
describe('Student Dashboard', () => {
  it('should load student data and display correctly', async () => {
    const { getByTestId } = render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(getByTestId('attendance-percentage')).toBeInTheDocument();
      expect(getByTestId('grade-average')).toBeInTheDocument();
    });
  });
});
```

## 📊 Performance & Monitoring

### Performance Features

**Backend Performance**
- **Database Optimization:** Query optimization with select_related/prefetch_related
- **Caching Strategy:** Redis caching for frequently accessed data
- **API Response Optimization:** Pagination, field selection, and compression
- **Background Processing:** Celery for heavy computational tasks
- **Connection Pooling:** Database connection pooling for scalability

**Frontend Performance**
- **Code Splitting:** Route-based code splitting for optimal loading
- **Lazy Loading:** Component and image lazy loading
- **Caching Strategy:** API response caching with React Query
- **Bundle Optimization:** Tree shaking and minification
- **Performance Monitoring:** Core Web Vitals tracking

### Monitoring Setup

**Application Monitoring**
```python
# Prometheus metrics example
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')
```

**Monitoring Stack**
- **Metrics:** Prometheus + Grafana dashboards
- **Logging:** ELK stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking:** Sentry for error monitoring and alerting
- **APM:** Application Performance Monitoring with detailed traces
- **Uptime Monitoring:** Health check endpoints with alerting

**Key Metrics Tracked**
- Request response times and throughput
- Database query performance
- Error rates and types
- User authentication and session metrics
- Business metrics (admissions, fees, attendance)

## 🔧 Configuration

### Environment Settings

**Development Configuration**
```python
# settings/development.py
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Production Configuration**
```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

### Feature Flags

**Backend Feature Flags**
```python
# settings/base.py
FEATURE_FLAGS = {
    'ENABLE_EMAIL_NOTIFICATIONS': env.bool('ENABLE_EMAIL_NOTIFICATIONS', True),
    'ENABLE_SMS_NOTIFICATIONS': env.bool('ENABLE_SMS_NOTIFICATIONS', False),
    'ENABLE_ANALYTICS': env.bool('ENABLE_ANALYTICS', True),
    'ENABLE_FILE_UPLOAD': env.bool('ENABLE_FILE_UPLOAD', True),
}
```

**Frontend Feature Flags**
```typescript
// config/features.ts
export const FEATURES = {
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};
```

## 🚨 Troubleshooting

### Common Issues

**Backend Issues**

1. **Migration Errors**
   ```bash
   # Reset migrations (development only)
   find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
   uv run manage.py makemigrations
   uv run manage.py migrate
   ```

2. **Package Installation Issues**
   ```bash
   # Clear UV cache and reinstall
   uv cache clean
   uv sync --reinstall
   ```

3. **Database Connection Issues**
   ```bash
   # Check database connection
   uv run manage.py dbshell
   
   # Reset database (development only)
   rm db.sqlite3
   uv run manage.py migrate
   ```

**Frontend Issues**

1. **Node Module Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Update type definitions
   npm install -D @types/node @types/react
   ```

3. **Build Issues**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run build
   ```

### Migration Issues

For detailed migration troubleshooting, see [Migration Troubleshooting Guide](docs/migration-troubleshooting-guide.md).

**Quick Migration Fixes**
```bash
# Check migration status
uv run manage.py showmigrations

# Create specific migration
uv run manage.py makemigrations app_name

# Apply specific migration
uv run manage.py migrate app_name 0001

# Rollback migration
uv run manage.py migrate app_name 0001 --fake
```

## 🤝 Contributing

We welcome contributions to the Acharya School Management System! Please read our contributing guidelines below.

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/acharya.git
   cd acharya
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend && uv run pytest
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **Submit Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure all tests pass

### Code Style

**Backend (Python)**
- Follow PEP 8 guidelines
- Use Black for code formatting
- Use isort for import sorting
- Add type hints where appropriate

```bash
# Format code
uv run black .
uv run isort .
uv run flake8
```

**Frontend (TypeScript)**
- Follow Prettier configuration
- Use ESLint for code quality
- Add JSDoc comments for functions
- Follow React best practices

```bash
# Format and lint
npm run lint
npm run format
npm run type-check
```

### Commit Guidelines

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication support
fix(fees): correct invoice calculation for discounts
docs(api): update authentication endpoint documentation
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Acharya School Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Support & Community

### Getting Help

- **Documentation:** Check the `/docs/` directory for comprehensive guides
- **GitHub Issues:** Report bugs and request features
- **GitHub Discussions:** Ask questions and share ideas
- **Email Support:** contact@acharya-sms.com (for enterprise support)

### Community Resources

- **GitHub Repository:** https://github.com/frankmathewsajan/acharya
- **Issue Tracker:** https://github.com/frankmathewsajan/acharya/issues
- **Discussions:** https://github.com/frankmathewsajan/acharya/discussions
- **Wiki:** https://github.com/frankmathewsajan/acharya/wiki

### Contributing

We welcome contributions from the community! See our [Contributing Guidelines](#-contributing) for details on how to get started.

## 🎯 Roadmap

### Current Version (v1.0)
- ✅ Complete authentication and authorization system
- ✅ Student, parent, teacher, and admin dashboards
- ✅ Core academic management features
- ✅ Fee management and payment processing
- ✅ Attendance tracking and reporting
- ✅ Examination and grading system
- ✅ Hostel management
- ✅ Library management
- ✅ Notification system
- ✅ Comprehensive API documentation

### Upcoming Features (v1.1)
- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Real-time notifications (WebSocket)
- [ ] Bulk operations and data import
- [ ] Advanced search and filtering
- [ ] Multi-language support (i18n)
- [ ] White-label customization
- [ ] API rate limiting and quotas

### Future Enhancements (v2.0)
- [ ] Machine learning for predictive analytics
- [ ] Advanced security features (SSO, SAML)
- [ ] Microservices architecture
- [ ] Blockchain for certificate verification
- [ ] AI-powered chatbot for support
- [ ] Advanced workflow automation
- [ ] Integration with external learning management systems
- [ ] Video conferencing integration

### Performance & Scalability
- [ ] Horizontal scaling support
- [ ] Advanced caching strategies
- [ ] Database sharding
- [ ] CDN integration
- [ ] Performance monitoring and optimization
- [ ] Auto-scaling infrastructure

---

## 🚀 Get Started Today!

Ready to transform your school management? Follow our [Quick Start Guide](#-quick-start) to get the Acharya School Management System running in minutes.

```bash
# Quick setup commands
git clone https://github.com/frankmathewsajan/acharya.git
cd acharya

# Backend setup
cd backend && uv sync && uv run manage.py migrate && uv run manage.py runserver &

# Frontend setup
cd ../frontend && npm install && npm run dev

# Visit http://localhost:8080 to start using the system!
```

**Questions or need help?** Open an issue on GitHub or check our comprehensive documentation in the `/docs/` directory.

---

<div align="center">

**Built with ❤️ by the Acharya Development Team**

[![GitHub stars](https://img.shields.io/github/stars/frankmathewsajan/acharya?style=social)](https://github.com/frankmathewsajan/acharya/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/frankmathewsajan/acharya?style=social)](https://github.com/frankmathewsajan/acharya/network/members)
[![GitHub issues](https://img.shields.io/github/issues/frankmathewsajan/acharya)](https://github.com/frankmathewsajan/acharya/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/frankmathewsajan/acharya)](https://github.com/frankmathewsajan/acharya/pulls)

</div>