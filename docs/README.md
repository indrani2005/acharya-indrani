# Acharya Education Portal - Documentation

Welcome to the comprehensive documentation for the Acharya Education Portal, a multi-school management system built for the Government of Rajasthan.

## 📚 Documentation Index

### 🏗️ Architecture & Design
- **[Backend Architecture](./backend-architecture.md)** - Overall backend structure and design patterns
- **[Multi-School Architecture](./multi-school-architecture.md)** - Multi-tenancy implementation and school isolation
- **[Backend Implementation](./backend-implementation.md)** - Detailed backend implementation guide

### 🚀 Quick Start & Setup
- **[Quick Start Integration](./quick-start-integration.md)** - Fast setup guide for development
- **[Deployment Guide](./deployment-guide.md)** - Production deployment instructions
- **[Migration Troubleshooting](./migration-troubleshooting-guide.md)** - Common migration issues and solutions

### 🔗 Integration & API
- **[Frontend-Backend Integration](./frontend-backend-integration.md)** - How frontend connects to backend
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Integration Summary](./integration-summary.md)** - Overview of system integrations

### 🛠️ Development & Maintenance
- **[Issue Resolution Summary](./issue-resolution-summary.md)** - Common problems and their solutions
- **[Context](./context.md)** - Project context and background information
- **[TODO](./TODO.md)** - Current development tasks and future enhancements

## 🎯 Project Overview

The Acharya Education Portal is a comprehensive school management system designed specifically for the Government of Rajasthan. It provides:

### 🏫 Multi-School Support
- **School Isolation**: Each school operates independently with its own data
- **Centralized Management**: Government oversight and control
- **Scalable Architecture**: Supports unlimited schools

### 👥 User Roles & Access
- **Students**: Access to personal dashboard, marks, attendance, fees
- **Parents**: OTP-based access to student data (no separate login required)
- **Faculty**: Class management, attendance marking, grade entry
- **Wardens**: Hostel management and student supervision
- **Admins**: School-level administration and management

### 🔧 Key Features
- **Admission Management**: Online applications and processing
- **Fee Management**: Invoice generation and payment tracking
- **Attendance Tracking**: Real-time attendance marking and monitoring
- **Examination System**: Result management and grade tracking
- **Hostel Management**: Room allocation and student accommodation
- **Library System**: Book borrowing and return tracking
- **Notification System**: Announcements and alerts

### 💻 Technology Stack

#### Backend
- **Framework**: Django 5.2.6 with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens with role-based access
- **Package Management**: UV for dependency management

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Query for API calls
- **Routing**: React Router

#### Additional Tools
- **UI Components**: Shadcn/ui for consistent design
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form with validation

## 🔐 Authentication & Security

### Student Authentication
- **Format**: `student.{admission_number}@{school_code_last5}.rj.gov.in`
- **Password**: `{admission_number}#{school_code_last5}`
- **Auto-generation**: Credentials created upon student activation

### Parent Authentication
- **No User Account**: Parents don't have traditional login accounts
- **OTP System**: Login using student admission number + parent phone + OTP
- **Restricted Access**: Can only view their child's data (marks, attendance, etc.)

### Staff Authentication
- **School-based**: Email format based on school and role
- **Role-based Access**: Different permissions for faculty, wardens, admins

## 📊 Data Architecture

### School Isolation
- All data models include `school` foreign key
- CASCADE deletion ensures data integrity
- Index optimization for multi-tenant queries

### User Management
- Deferred user creation for students (created only when activated)
- Auto-generation of admission numbers (5-digit format)
- Email format standardization across all roles

## 🚧 Development Workflow

1. **Local Setup**: Follow the Quick Start Integration guide
2. **Backend Development**: Use UV for package management
3. **Frontend Development**: Vite dev server with hot reload
4. **Testing**: Management commands for testing features
5. **Migration**: Always test migrations in development first

## 📞 Support & Contributing

For development questions or issues:
1. Check the Issue Resolution Summary
2. Review the API Reference for endpoint details
3. Consult the Migration Troubleshooting guide for database issues

## 📄 License

This project is developed for the Government of Rajasthan and follows government software development guidelines.

---

*Last Updated: September 2025*
*Version: 1.0.0*