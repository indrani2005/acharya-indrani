# Acharya ERP System Architecture# Acharya ERP System Architecture



## Overview## Overview

Acharya is a comprehensive Educational Resource Planning (ERP) system designed for multi-school management in Rajasthan. The system supports administrative functions across multiple educational institutions with role-based access control, dynamic admissions management, and comprehensive fee structures.Acharya is a comprehensive Educational Resource Planning (ERP) system designed for multi-school management in Rajasthan. The system supports administrative functions across multiple educational institutions with role-based access control.



## System Architecture## System Architecture



### Technology Stack### Backend Architecture (Django + DRF)

- **Backend**: Django 5.0+ with Django REST Framework- **Framework**: Django 5.0+ with Django REST Framework

- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS, shadcn/ui- **Database**: SQLite (development) / PostgreSQL (production)

- **Database**: SQLite (development) / PostgreSQL (production) - **Authentication**: Token-based authentication

- **Authentication**: JWT with token blacklisting- **API Design**: RESTful APIs with consistent response patterns

- **API Design**: RESTful APIs with consistent response patterns

- **Package Management**: UV (backend), Bun (frontend)### Frontend Architecture (React + TypeScript)

- **Framework**: React 18+ with TypeScript

### Backend Architecture- **Build Tool**: Vite

- **Styling**: Tailwind CSS + shadcn/ui components

#### Core Applications- **State Management**: React Context + useState/useEffect

- **API Client**: Axios with custom error handling

1. **Users App** (`users/`)

   - Custom user model with role-based authentication## Core Modules

   - User roles: Student, Parent, Faculty, Warden, Admin

   - Profile management for different user types### 1. User Management (`users/`)

   - JWT authentication with token blacklisting- User authentication and authorization

- Role-based access control (Student, Parent, Faculty, Warden, Admin)

2. **Schools App** (`schools/`)- Profile management for different user types

   - Multi-school management system

   - School-specific configurations and data### 2. School Management (`config/`)

   - School user associations and permissions- Multi-school support

- School-specific configurations

3. **Admissions App** (`admissions/`)- Centralized settings management

   - **Email Verification System**: OTP-based email verification before application submission

   - **Multi-School Application**: Students can apply to up to 3 schools in preference order### 3. Admissions (`admissions/`)

   - **School Decision System**: Each school independently reviews and decides on applications- Online admission application system

   - **Student Choice Workflow**: Students can choose from multiple accepted schools- Email verification with OTP

   - **Enrollment Management**: Track enrollment status, enrollment/withdrawal dates- Multi-school preference system

   - **Fee Integration**: Category-based fee calculation system- School-specific admission review

   - **Document Upload**: Support for application documents- Student choice workflow for multiple acceptances



   **Key Models:**#### Admission Workflow

   - `EmailVerification`: OTP management for email verification1. **Application Submission**

   - `AdmissionApplication`: Main application with school preferences   - Email verification required

   - `SchoolAdmissionDecision`: School-specific decisions and enrollment tracking   - Support for 3 school preferences

   - `FeeStructure`: Class and category-based fee structures   - Document upload capability

   

4. **Students App** (`students/`)2. **School Review Process**

   - Student profile management   - Each school reviews applications independently

   - Academic records and course enrollment   - School-specific admission decisions

   - Integration with admissions for enrolled students   - Status tracking per school

   

5. **Staff/Faculty Apps** (`staff/`, `parents/`)3. **Multi-School Acceptance**

   - Role-specific profile management   - Students can be accepted by multiple schools

   - Extended user information and relationships   - Choice interface for final school selection

   - Automatic notification system

6. **Academic Management** (`fees/`, `attendance/`, `exams/`, `library/`, `hostel/`)

   - Comprehensive academic and administrative modules### 4. Student Management (`students/`)

   - Each with REST APIs and admin interfaces- Student profiles and academic records

- Course and batch management

7. **System Apps** (`notifications/`, `reports/`, `analytics/`, `dashboard/`)- Academic progress tracking

   - System-wide utilities and reporting

   - Dashboard endpoints for role-specific views### 5. Staff Management (`staff/`)

- Faculty profiles and qualifications

#### Database Schema- Department management

- Teaching assignments

**Core Tables:**

- `users_user`: Custom user model with role field### 6. Fee Management (`fees/`)

- `schools_school`: School information and configuration- Fee structure configuration

- `admissions_emailverification`: Email OTP verification- Payment processing

- `admissions_admissionapplication`: Student applications- Invoice generation and tracking

- `admissions_schooladmissiondecision`: School-specific decisions and enrollment

- `admissions_feestructure`: Class and category-based fees### 7. Attendance System (`attendance/`)

- `students_student`: Student profiles and academic data- Daily attendance tracking

- Attendance reports

**Key Relationships:**- Integration with academic calendar

- User → Profile (Student/Staff/Parent) - One-to-One

- School → Applications - One-to-Many (via preferences)### 8. Examination System (`exams/`)

- Application → School Decisions - One-to-Many- Exam scheduling

- Application → Email Verification - Foreign Key- Result management

- Grade calculation

#### API Architecture

### 9. Hostel Management (`hostel/`)

**Authentication:**- Room allocation

- JWT tokens with access/refresh pattern- Hostel fee management

- Token blacklisting for secure logout- Warden oversight

- Role-based permissions per endpoint

### 10. Library Management (`library/`)

**Admission API Endpoints:**- Book catalog

```- Issue/return tracking

POST /api/admissions/verify-email/request/    # Request OTP- Fine management

POST /api/admissions/verify-email/verify/     # Verify OTP

POST /api/admissions/submit/                  # Submit application### 11. Notifications (`notifications/`)

GET /api/admissions/track/{ref_id}/           # Track application- System-wide notification system

POST /api/admissions/student-choice/          # Submit school choice- Email and in-app notifications

POST /api/admissions/enroll/                  # Enroll student- Role-based message targeting

POST /api/admissions/withdraw/                # Withdraw enrollment

POST /api/admissions/fee-calculation/         # Calculate fees### 12. Analytics & Reports (`analytics/`, `reports/`)

```- Dashboard analytics

- Custom report generation

**Admin API Endpoints:**- Data visualization

```

GET /api/dashboard/admin/                     # Admin dashboard data## Database Schema

GET /api/admissions/school-admissions/        # School's applications

POST /api/admissions/decisions/               # Create admission decision### Key Models

PUT /api/admissions/decisions/{id}/           # Update admission decision

```#### User & Authentication

- `User` (Django's built-in user model extended)

### Frontend Architecture- `StudentProfile`, `ParentProfile`, `StaffProfile`, etc.



#### Component Structure#### Admissions

```- `AdmissionApplication` - Main application data

src/- `SchoolAdmissionDecision` - School-specific admission decisions

├── components/          # Reusable UI components- Relationship: One application can have multiple school decisions

│   ├── ui/             # shadcn/ui components

│   └── ...             # Custom components#### Academic Management

├── pages/              # Route components- `School` - Multi-school support

│   ├── dashboards/     # Role-specific dashboards- `Course`, `Department`, `Batch`

│   ├── Admission.tsx   # Admission form- `FeeStructure`, `FeeInvoice`, `Payment`

│   └── TrackingPage.tsx # Application tracking

├── services/           # API service layers## API Endpoints

├── contexts/           # React contexts (Auth)

├── lib/               # Utilities and helpers### Authentication

└── styles/            # Global styles- `POST /api/auth/login/` - User login

```- `POST /api/auth/logout/` - User logout

- `GET /api/auth/user/` - Get current user

#### Key Features

### Admissions

1. **Multi-Role Dashboard System**- `POST /api/v1/admissions/verify-email/request/` - Request email OTP

   - `AdminDashboard.tsx`: Comprehensive school management- `POST /api/v1/admissions/verify-email/verify/` - Verify email OTP

   - `StudentDashboard.tsx`: Student portal- `POST /api/v1/admissions/applications/` - Submit application

   - `ParentDashboard.tsx`: Parent portal- `GET /api/v1/admissions/track/` - Track application status

   - Role-based sidebar and content- `GET /api/v1/admissions/school-review/` - Get applications for school review

- `PATCH /api/v1/admissions/school-decision/<id>/` - Update school decision

2. **Admission System**- `GET /api/v1/admissions/accepted-schools/` - Get accepted schools for student

   - `Admission.tsx`: Multi-step application form with email verification- `POST /api/v1/admissions/student-choice/` - Submit student's final choice

   - `TrackingPage.tsx`: Real-time application status tracking

   - Document upload and validation### School Management

   - Dynamic fee calculation display- `GET /api/schools/public/` - Get active schools (public)

- `GET /api/schools/stats/` - Get school statistics

3. **Admin Management**- `GET /api/schools/dashboard/` - Get dashboard data

   - Application review and decision making

   - Bulk operations for admissions## Security Features

   - Real-time status updates

   - Enrollment management### Authentication & Authorization

- Token-based authentication

#### State Management- Role-based access control (RBAC)

- React Context for authentication state- Permission-based endpoint protection

- Local state with hooks for component data

- API service layer for backend communication### Data Protection

- Email verification for admissions

### Key Features Implementation- Secure file upload handling

- SQL injection prevention

#### 1. Multi-School Admission Workflow- XSS protection



**Phase 1: Application Submission**### API Security

1. Email verification with OTP (10-minute expiry)- CORS configuration

2. Multi-step form with document upload- Rate limiting (configurable)

3. School preference selection (1st, 2nd, 3rd choice)- Input validation and sanitization

4. Automatic reference ID generation (ADM-YYYY-XXXXXX)

## Deployment Architecture

**Phase 2: School Review**

1. Each school independently reviews applications### Development Environment

2. School-specific admission decisions (Pending/Accepted/Rejected)- Django development server

3. Admin dashboard for bulk review operations- Vite development server

4. Notification system for decision updates- SQLite database

- Local file storage

**Phase 3: Student Choice & Enrollment**

1. Students track application status in real-time### Production Environment (Recommended)

2. Choice submission for accepted schools- **Backend**: Gunicorn + Nginx

3. Fee calculation based on class and category- **Frontend**: Static files served by Nginx

4. Enrollment confirmation with payment integration- **Database**: PostgreSQL

5. Withdrawal system with date tracking- **File Storage**: AWS S3 or local with backup

- **Monitoring**: Django logging + error tracking

#### 2. Category-Based Fee System

## Configuration Management

**Fee Structure:**

- Class ranges: 1-8, 9-10, 11-12### Environment Variables

- Categories: General, SC/ST/OBC/SBC```bash

- Flexible fee ranges (min-max) or fixed amounts# Database

- Dynamic calculation based on course and categoryDATABASE_URL=postgresql://user:pass@localhost/dbname



**Implementation:**# Email Configuration

- `FeeStructure.get_fee_for_student()` method with regex-based course parsingEMAIL_HOST=smtp.gmail.com

- API endpoint for real-time fee calculationEMAIL_PORT=587

- Frontend integration with enrollment workflowEMAIL_HOST_USER=your-email@gmail.com

EMAIL_HOST_PASSWORD=your-app-password

#### 3. Real-Time Status DisplayEMAIL_USE_TLS=True

DEFAULT_FROM_EMAIL=noreply@acharya-erp.com

**Status Types:**

- Application status: Pending, Under Review, Approved, Rejected# Django Settings

- Decision status per school: Pending, Accepted, RejectedSECRET_KEY=your-secret-key

- Enrollment status: Not Enrolled, Enrolled, WithdrawnDEBUG=False

- Overall status: Dynamically calculated from all school decisionsALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

```

**Frontend Implementation:**

- Dynamic badge components with color coding### Settings Structure

- Status aggregation logic for multiple school decisions- `settings.py` - Base settings

- Real-time updates without page refresh- Environment-specific overrides via `.env`

- Separate settings for development/production

### Security Model

## Development Guidelines

1. **Authentication**: JWT tokens with short-lived access tokens

2. **Authorization**: Role-based permissions at API level### Code Organization

3. **Data Protection**: Input validation and sanitization- Model-View-Serializer pattern for API endpoints

4. **File Upload Security**: Restricted file types and size limits- Service layer for complex business logic

5. **CORS Configuration**: Frontend-backend communication security- Consistent error handling and response formats



### Performance Considerations### API Design Principles

- RESTful resource naming

1. **Database Optimization**: Proper indexing on reference IDs and foreign keys- Consistent response structure

2. **API Pagination**: Default 20 items per page for large datasets- Proper HTTP status codes

3. **File Management**: Efficient document storage and retrieval- Comprehensive error messages

4. **Frontend Optimization**: Code splitting and lazy loading

5. **Caching Strategy**: Token caching and API response optimization### Frontend Architecture

- Component-based architecture

### Deployment Architecture- Custom hooks for API integration

- Centralized error handling

**Development:**- TypeScript for type safety

- SQLite database for local development

- Django development server## Testing Strategy

- Vite dev server for frontend

### Backend Testing

**Production:**- Unit tests for models and business logic

- PostgreSQL database with proper indexing- API endpoint testing

- Nginx reverse proxy with SSL- Integration tests for complex workflows

- Static file serving

- Environment-based configuration### Frontend Testing

- Component unit tests

### Monitoring & Maintenance- Integration tests for user workflows

- E2E testing for critical paths

1. **Logging**: Comprehensive logging for admissions and user actions

2. **Error Handling**: Consistent error response format## Performance Considerations

3. **Backup Strategy**: Database and document backup procedures

4. **Health Checks**: API endpoint monitoring### Database Optimization

5. **Performance Monitoring**: Database query optimization- Proper indexing on frequently queried fields

- Query optimization for dashboard views

### Recent Enhancements- Connection pooling for production



1. **Fixed Fee Calculation**: Improved regex-based course parsing for accurate fee mapping### Frontend Optimization

2. **Enhanced Status Display**: Comprehensive status aggregation across multiple schools- Code splitting for large applications

3. **Enrollment Management**: Complete enrollment/withdrawal workflow- Lazy loading of non-critical components

4. **Admin Dashboard**: Dynamic admissions management with real-time updates- Efficient state management

5. **Document Handling**: Secure file upload and viewing system

6. **Email Integration**: OTP verification and notification system### Caching Strategy

- Redis for session and API caching (production)

This architecture supports the complete lifecycle of multi-school admissions with robust state management, security, and scalability considerations.- Browser caching for static assets
- Database query caching

## Monitoring & Maintenance

### Logging
- Structured logging for API requests
- Error tracking and reporting
- User activity logging for security

### Backup Strategy
- Regular database backups
- File storage backups
- Configuration backup

### Maintenance Tasks
- Regular dependency updates
- Security patch management
- Performance monitoring and optimization

## Future Enhancements

### Planned Features
- Mobile application support
- Advanced analytics dashboard
- Integration with external systems
- Multi-language support

### Scalability Considerations
- Microservices architecture migration
- Database sharding for large datasets
- CDN integration for global access
- Load balancing for high availability

## Support & Documentation

### Developer Resources
- API documentation (auto-generated)
- Component library documentation
- Development setup guides
- Deployment instructions

### User Documentation
- User manuals by role
- Feature guides
- FAQ and troubleshooting
- Video tutorials

## System Fixes & Improvements

### Enrollment System Fixes

#### Admin Panel Status Display
- **Issue**: Admin panel showing "Pending" instead of actual database status
- **Solution**: Enhanced `SchoolAdmissionDecisionAdmin` with proper status display methods
- **Implementation**:
  - Added `get_decision_status()` with emoji indicators
  - Improved `get_enrollment_display()` with clear status messages
  - Added custom `save_model()` with validation and error handling

#### Enrollment Logic Improvements
- **Single Enrollment Enforcement**: Students can only be enrolled in one school at a time
- **Withdrawal Support**: Students can withdraw and re-enroll elsewhere
- **Re-enrollment Logic**: Enhanced `can_enroll()` logic to allow re-enrollment after withdrawal
- **Admin Validation**: Prevents invalid state changes (e.g., rejecting enrolled students)

#### Admin Detail View Fixes
- **Issue**: Static "School Decisions" section showing incorrect status
- **Solution**: Removed static display methods, kept dynamic inline display
- **Result**: Admin shows real-time database status via `SchoolAdmissionDecisionInline`

### Data Consistency & Validation
- **Enrollment Status Tracking**: Proper date tracking for enrollment and withdrawal
- **Multiple Enrollment Prevention**: Backend validation ensures single active enrollment
- **Status Synchronization**: Real-time updates between frontend and backend
- **Error Handling**: Clear validation messages for invalid operations

### Test Infrastructure
- **Test Organization**: All test files moved to `backend/test/` folder
- **Test Coverage**: Enrollment logic, data consistency, application status validation
- **Debug Tools**: Scripts for data cleanup and status verification