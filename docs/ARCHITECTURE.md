# Acharya ERP System Architecture

## Overview
Acharya is a comprehensive Educational Resource Planning (ERP) system designed for multi-school management in Rajasthan. The system supports administrative functions across multiple educational institutions with role-based access control.

## System Architecture

### Backend Architecture (Django + DRF)
- **Framework**: Django 5.0+ with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Token-based authentication
- **API Design**: RESTful APIs with consistent response patterns

### Frontend Architecture (React + TypeScript)
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + useState/useEffect
- **API Client**: Axios with custom error handling

## Core Modules

### 1. User Management (`users/`)
- User authentication and authorization
- Role-based access control (Student, Parent, Faculty, Warden, Admin)
- Profile management for different user types

### 2. School Management (`config/`)
- Multi-school support
- School-specific configurations
- Centralized settings management

### 3. Admissions (`admissions/`)
- Online admission application system
- Email verification with OTP
- Multi-school preference system
- School-specific admission review
- Student choice workflow for multiple acceptances

#### Admission Workflow
1. **Application Submission**
   - Email verification required
   - Support for 3 school preferences
   - Document upload capability
   
2. **School Review Process**
   - Each school reviews applications independently
   - School-specific admission decisions
   - Status tracking per school
   
3. **Multi-School Acceptance**
   - Students can be accepted by multiple schools
   - Choice interface for final school selection
   - Automatic notification system

### 4. Student Management (`students/`)
- Student profiles and academic records
- Course and batch management
- Academic progress tracking

### 5. Staff Management (`staff/`)
- Faculty profiles and qualifications
- Department management
- Teaching assignments

### 6. Fee Management (`fees/`)
- Fee structure configuration
- Payment processing
- Invoice generation and tracking

### 7. Attendance System (`attendance/`)
- Daily attendance tracking
- Attendance reports
- Integration with academic calendar

### 8. Examination System (`exams/`)
- Exam scheduling
- Result management
- Grade calculation

### 9. Hostel Management (`hostel/`)
- Room allocation
- Hostel fee management
- Warden oversight

### 10. Library Management (`library/`)
- Book catalog
- Issue/return tracking
- Fine management

### 11. Notifications (`notifications/`)
- System-wide notification system
- Email and in-app notifications
- Role-based message targeting

### 12. Analytics & Reports (`analytics/`, `reports/`)
- Dashboard analytics
- Custom report generation
- Data visualization

## Database Schema

### Key Models

#### User & Authentication
- `User` (Django's built-in user model extended)
- `StudentProfile`, `ParentProfile`, `StaffProfile`, etc.

#### Admissions
- `AdmissionApplication` - Main application data
- `SchoolAdmissionDecision` - School-specific admission decisions
- Relationship: One application can have multiple school decisions

#### Academic Management
- `School` - Multi-school support
- `Course`, `Department`, `Batch`
- `FeeStructure`, `FeeInvoice`, `Payment`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user

### Admissions
- `POST /api/v1/admissions/verify-email/request/` - Request email OTP
- `POST /api/v1/admissions/verify-email/verify/` - Verify email OTP
- `POST /api/v1/admissions/applications/` - Submit application
- `GET /api/v1/admissions/track/` - Track application status
- `GET /api/v1/admissions/school-review/` - Get applications for school review
- `PATCH /api/v1/admissions/school-decision/<id>/` - Update school decision
- `GET /api/v1/admissions/accepted-schools/` - Get accepted schools for student
- `POST /api/v1/admissions/student-choice/` - Submit student's final choice

### School Management
- `GET /api/schools/public/` - Get active schools (public)
- `GET /api/schools/stats/` - Get school statistics
- `GET /api/schools/dashboard/` - Get dashboard data

## Security Features

### Authentication & Authorization
- Token-based authentication
- Role-based access control (RBAC)
- Permission-based endpoint protection

### Data Protection
- Email verification for admissions
- Secure file upload handling
- SQL injection prevention
- XSS protection

### API Security
- CORS configuration
- Rate limiting (configurable)
- Input validation and sanitization

## Deployment Architecture

### Development Environment
- Django development server
- Vite development server
- SQLite database
- Local file storage

### Production Environment (Recommended)
- **Backend**: Gunicorn + Nginx
- **Frontend**: Static files served by Nginx
- **Database**: PostgreSQL
- **File Storage**: AWS S3 or local with backup
- **Monitoring**: Django logging + error tracking

## Configuration Management

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@acharya-erp.com

# Django Settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Settings Structure
- `settings.py` - Base settings
- Environment-specific overrides via `.env`
- Separate settings for development/production

## Development Guidelines

### Code Organization
- Model-View-Serializer pattern for API endpoints
- Service layer for complex business logic
- Consistent error handling and response formats

### API Design Principles
- RESTful resource naming
- Consistent response structure
- Proper HTTP status codes
- Comprehensive error messages

### Frontend Architecture
- Component-based architecture
- Custom hooks for API integration
- Centralized error handling
- TypeScript for type safety

## Testing Strategy

### Backend Testing
- Unit tests for models and business logic
- API endpoint testing
- Integration tests for complex workflows

### Frontend Testing
- Component unit tests
- Integration tests for user workflows
- E2E testing for critical paths

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Query optimization for dashboard views
- Connection pooling for production

### Frontend Optimization
- Code splitting for large applications
- Lazy loading of non-critical components
- Efficient state management

### Caching Strategy
- Redis for session and API caching (production)
- Browser caching for static assets
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