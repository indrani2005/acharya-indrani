# Acharya School Management System - Backend

A comprehensive school management system built with Django and Django REST Framework, supporting multi-school operations, student admissions, attendance tracking, fee management, and more.

## Features

### Core Modules
- **Multi-School Support**: Manage multiple schools from a single platform
- **User Management**: Role-based access control (Admin, Faculty, Staff, Students, Parents)
- **Student Admissions**: Complete admission workflow with email verification
- **Attendance Management**: Track student attendance across classes
- **Fee Management**: Handle fee invoices, payments, and financial records
- **Examination System**: Manage exams, results, and grading
- **Hostel Management**: Room allocation and hostel administration
- **Library Management**: Book inventory and borrowing system
- **Notification System**: Real-time notifications and announcements

## Admission System

### Features
- **Multi-Step Application Form**: User-friendly form with progress tracking
- **Email Verification**: Secure OTP-based email verification before submission
- **School Preferences**: Support for up to 3 school choices (first, second, third preference)
- **Reference ID System**: Unique tracking IDs for all applications (format: ADM-YYYY-XXXXXX)
- **Document Upload**: Support for application documents
- **Application Tracking**: Public tracking system using reference IDs
- **Admin Review System**: Admin interface for reviewing and managing applications
- **Email Notifications**: Automatic confirmation emails with tracking links

### Email Verification Workflow

#### 1. Request Email Verification
**Endpoint**: `POST /api/v1/admissions/verify-email/request/`

```json
{
  "email": "student@example.com",
  "applicant_name": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully to your email address."
}
```

#### 2. Verify Email with OTP
**Endpoint**: `POST /api/v1/admissions/verify-email/verify/`

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully.",
  "verification_token": "123456"
}
```

#### 3. Submit Application
**Endpoint**: `POST /api/v1/admissions/applications/`

```json
{
  "applicant_name": "John Doe",
  "date_of_birth": "2005-06-15",
  "email": "student@example.com",
  "phone_number": "1234567890",
  "address": "123 Main St, City, State 12345",
  "course_applied": "Grade 10 - Science",
  "first_preference_school": 1,
  "second_preference_school": 2,
  "third_preference_school": null,
  "previous_school": "Previous School Name",
  "last_percentage": 85.5,
  "email_verification_token": "123456"
}
```

**Response**:
```json
{
  "id": 1,
  "reference_id": "ADM-2025-A1B2C3",
  "applicant_name": "John Doe",
  "status": "pending",
  "application_date": "2025-01-17T10:30:00Z",
  // ... other fields
}
```

### Application Tracking
**Endpoint**: `GET /api/v1/admissions/track/?reference_id=ADM-2025-A1B2C3`

**Response**:
```json
{
  "success": true,
  "data": {
    "reference_id": "ADM-2025-A1B2C3",
    "applicant_name": "John Doe",
    "course_applied": "Grade 10 - Science",
    "status": "under_review",
    "first_preference_school": {
      "id": 1,
      "school_name": "Acharya Primary School",
      "school_code": "APS001"
    },
    "application_date": "2025-01-17T10:30:00Z",
    "review_comments": ""
  }
}
```

## Email Configuration

### Development Setup
For development, emails are printed to the console:

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

### Production Setup
Update the following settings in `config/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'admissions@yourschool.edu'
FRONTEND_URL = 'https://yourschool.edu'  # For email links
```

### Email Templates

#### OTP Verification Email
- **Subject**: "Verify Your Email - Acharya School Admission"
- **Content**: HTML email with OTP code and instructions
- **Expiry**: 10 minutes
- **Security**: 6-digit numeric OTP with attempt limits

#### Application Confirmation Email
- **Subject**: "Application Submitted Successfully - Reference #ADM-YYYY-XXXXXX"
- **Content**: Application details, reference ID, and tracking link
- **Features**: Direct link to tracking page, formatted school preferences

## API Documentation

### Base URL
- Development: `http://localhost:8000/api/v1/`
- Production: Update according to your deployment

### Authentication
- **Admin endpoints**: Require JWT token authentication
- **Public endpoints**: No authentication required (admissions, tracking, school list)

### Key Endpoints

#### Schools
- `GET /schools/public/` - Get list of active schools (public)

#### Admissions
- `POST /admissions/verify-email/request/` - Request email verification OTP
- `POST /admissions/verify-email/verify/` - Verify email with OTP
- `POST /admissions/applications/` - Submit admission application
- `GET /admissions/track/` - Track application by reference ID
- `GET /admissions/applications/` - List applications (admin)
- `PATCH /admissions/applications/{id}/review/` - Review application (admin)

## Database Models

### EmailVerification
- Email OTP verification for admissions
- Fields: email, otp, is_verified, created_at, expires_at, attempts
- Security: 10-minute expiry, 3-attempt limit

### AdmissionApplication
- Core admission application data
- Fields: reference_id, personal info, school preferences, academic details
- Relationships: Linked to EmailVerification, School models
- Features: Auto-generated reference IDs, preference ranking

## Security Features

### Email Verification
- **OTP Generation**: Secure 6-digit random codes
- **Rate Limiting**: 2-minute cooldown between OTP requests
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Time-based Expiry**: 10-minute OTP validity
- **Token Validation**: Verification tokens expire after 1 hour

### Data Protection
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Django ORM protection
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Django middleware enabled

## Installation & Setup

### Prerequisites
- Python 3.8+
- Django 5.2+
- SQLite (development) / PostgreSQL (production)

### Installation
1. Clone the repository
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create superuser: `python manage.py createsuperuser`
7. Run server: `python manage.py runserver`

### Environment Variables
Create a `.env` file for production:

```env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
FRONTEND_URL=https://yourschool.edu
```

## Admin Interface

Access the Django admin at `/admin/` to:
- Review admission applications
- Manage schools and users
- Monitor email verifications
- Update application statuses
- Generate reports

### Admin Features
- **Admission Applications**: List view with filters, search, and bulk actions
- **Email Verifications**: Monitor OTP status and attempts
- **School Management**: Add/edit school information
- **User Management**: Role-based user administration

## Testing

### Running Tests
```bash
python manage.py test
```

### Test Coverage
- Model validation and constraints
- API endpoint responses
- Email verification workflow
- Application submission process
- Admin interface functionality

## Deployment

### Production Checklist
- [ ] Update `DEBUG = False`
- [ ] Configure production database
- [ ] Set up proper email backend
- [ ] Configure static file serving
- [ ] Set up SSL/HTTPS
- [ ] Configure environment variables
- [ ] Set up monitoring and logging

### Recommended Deployment
- **Platform**: Railway, Heroku, or DigitalOcean
- **Database**: PostgreSQL
- **Static Files**: AWS S3 or similar
- **Email Service**: SendGrid, AWS SES, or Google Workspace

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Framework**: Django 5.2 + Django REST Framework