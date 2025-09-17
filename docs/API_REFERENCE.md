# Acharya ERP API Reference

## Overview
Comprehensive API documentation for the Acharya Educational Resource Planning system. All APIs follow RESTful conventions with consistent JSON responses.

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
- Development: `http://localhost:8000/api/v1/`
- Production: `https://your-domain.com/api/v1/`

## Response Format
```json
{
  "success": true|false,
  "data": {...},
  "message": "Success/error message",
  "errors": {...}  // Only on validation errors
}
```

## Authentication APIs

### User Authentication
**Base URL:** `/api/v1/users/`

#### Login
```http
POST /api/v1/users/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "school": {
        "id": 1,
        "school_name": "Sample School"
      }
    }
  }
}
```

#### Logout
```http
POST /api/v1/users/auth/logout/
Authorization: Bearer <token>

{
  "refresh": "jwt_refresh_token"
}
```

#### Current User
```http
GET /api/v1/users/auth/me/
Authorization: Bearer <token>
```

## Admission APIs

### Base URL: `/api/v1/admissions/`

#### Email Verification

##### Request OTP
```http
POST /api/v1/admissions/verify-email/request/
Content-Type: application/json

{
  "email": "student@example.com",
  "applicant_name": "Jane Doe"
}
```

##### Verify OTP
```http
POST /api/v1/admissions/verify-email/verify/
Content-Type: application/json

{
  "email": "student@example.com",
  "otp": "123456"
}
```

#### Application Management

##### Submit Application
```http
POST /api/v1/admissions/submit/
Content-Type: application/json
Authorization: Bearer <token>

{
  "email_verification_id": 1,
  "applicant_name": "Jane Doe",
  "date_of_birth": "2005-01-15",
  "email": "student@example.com",
  "phone_number": "+91-9876543210",
  "address": "123 Main St, City",
  "category": "general",
  "course_applied": "class-12",
  "previous_school": "Previous School Name",
  "last_percentage": 85.5,
  "first_preference_school": 1,
  "second_preference_school": 2,
  "third_preference_school": 3,
  "documents": {
    "tenth_certificate": "path/to/file.pdf",
    "character_certificate": "path/to/file.pdf"
  }
}
```

##### Track Application
```http
GET /api/v1/admissions/track/?reference_id=ADM-2025-ABC123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference_id": "ADM-2025-ABC123",
    "applicant_name": "Jane Doe",
    "status": "under_review",
    "application_date": "2025-01-15T10:30:00Z",
    "school_decisions": [
      {
        "id": 1,
        "school": {
          "id": 1,
          "school_name": "Sample School"
        },
        "preference_order": "1st",
        "decision": "accepted",
        "enrollment_status": "enrolled",
        "enrollment_date": "2025-01-20T14:30:00Z"
      }
    ]
  }
}
```

#### Student Choice & Enrollment

##### Submit School Choice
```http
POST /api/v1/admissions/student-choice/
Content-Type: application/json

{
  "reference_id": "ADM-2025-ABC123",
  "chosen_school": "Sample School"
}
```

##### Enroll Student
```http
POST /api/v1/admissions/enroll/
Content-Type: application/json
Authorization: Bearer <token>

{
  "reference_id": "ADM-2025-ABC123",
  "decision_id": 1
}
```

##### Withdraw Enrollment
```http
POST /api/v1/admissions/withdraw/
Content-Type: application/json
Authorization: Bearer <token>

{
  "decision_id": 1,
  "withdrawal_reason": "Student relocated"
}
```

#### Fee Management

##### Calculate Fee
```http
POST /api/v1/admissions/fee-calculation/
Content-Type: application/json

{
  "reference_id": "ADM-2025-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference_id": "ADM-2025-ABC123",
    "applicant_name": "Jane Doe",
    "course_applied": "class-12",
    "category": "general",
    "fee_structure": {
      "class_range": "11-12",
      "category": "general",
      "annual_fee_min": 300.00,
      "annual_fee_max": 1200.00,
      "total_fee": 300.00
    }
  }
}
```

##### Initialize Payment
```http
POST /api/v1/admissions/fee-payment/init/
Content-Type: application/json

{
  "reference_id": "ADM-2025-ABC123",
  "school_decision_id": 1
}
```

#### Document Management

##### Upload Documents
```http
POST /api/v1/admissions/documents/<application_id>/
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form fields:
- tenth_certificate: file
- character_certificate: file
- income_certificate: file
```

## Admin APIs

### Dashboard Data
```http
GET /api/v1/dashboard/admin/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": {
      "total": 150,
      "pending": 25,
      "approved": 100,
      "rejected": 25
    },
    "enrollment": {
      "enrolled": 85,
      "withdrawn": 5,
      "pending_enrollment": 15
    },
    "recent_applications": [...],
    "pending_reviews": [...]
  }
}
```

### School Management

#### Get School Applications
```http
GET /api/v1/admissions/school-admissions/
Authorization: Bearer <token>
```

#### Create Admission Decision
```http
POST /api/v1/admissions/school-decision/
Content-Type: application/json
Authorization: Bearer <token>

{
  "application_id": 1,
  "school_id": 1,
  "decision": "accepted",
  "review_comments": "Good academic record"
}
```

#### Update Admission Decision
```http
PUT /api/v1/admissions/school-decision/<decision_id>/
Content-Type: application/json
Authorization: Bearer <token>

{
  "decision": "rejected",
  "review_comments": "Does not meet requirements"
}
```

## School APIs

### Base URL: `/api/v1/schools/`

#### Public School List
```http
GET /api/v1/schools/public/
```

#### School Statistics
```http
GET /api/v1/schools/stats/
Authorization: Bearer <token>
```

#### School Dashboard
```http
GET /api/v1/schools/dashboard/
Authorization: Bearer <token>
```

## Student Management APIs

### Base URL: `/api/v1/students/` (ViewSets)

#### List Students
```http
GET /api/v1/students/
Authorization: Bearer <token>
```

#### Get Student Detail
```http
GET /api/v1/students/<student_id>/
Authorization: Bearer <token>
```

#### Create Student
```http
POST /api/v1/students/
Content-Type: application/json
Authorization: Bearer <token>

{
  "user": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "admission_number": "2025001",
  "course": "class-12",
  "batch": "2024-25"
}
```

## Fee Management APIs

### Base URL: `/api/v1/fees/`

#### Fee Structures
```http
GET /api/v1/fees/fee-structures/
Authorization: Bearer <token>
```

#### Student Invoices
```http
GET /api/v1/fees/invoices/
Authorization: Bearer <token>
```

#### Payment Records
```http
GET /api/v1/fees/payments/
Authorization: Bearer <token>
```

## Attendance APIs

### Base URL: `/api/v1/attendance/`

#### Mark Attendance
```http
POST /api/v1/attendance/records/
Content-Type: application/json
Authorization: Bearer <token>

{
  "student": 1,
  "date": "2025-01-15",
  "status": "present",
  "period": "morning"
}
```

#### Get Attendance Records
```http
GET /api/v1/attendance/records/?student=1&date=2025-01-15
Authorization: Bearer <token>
```

## Exam APIs

### Base URL: `/api/v1/exams/`

#### Exam Schedules
```http
GET /api/v1/exams/schedules/
Authorization: Bearer <token>
```

#### Student Results
```http
GET /api/v1/exams/results/?student=1
Authorization: Bearer <token>
```

#### Grade Reports
```http
GET /api/v1/exams/grade-reports/
Authorization: Bearer <token>
```

## Hostel Management APIs

### Base URL: `/api/v1/hostel/`

#### Room Allocation
```http
POST /api/v1/hostel/allocate/
Content-Type: application/json
Authorization: Bearer <token>

{
  "student": 1,
  "room": 101,
  "allocation_date": "2025-01-15"
}
```

#### Room Change Request
```http
POST /api/v1/hostel/room-change-request/
Content-Type: application/json
Authorization: Bearer <token>

{
  "current_room": 101,
  "requested_room": 102,
  "reason": "Medical reasons"
}
```

## Library APIs

### Base URL: `/api/v1/library/`

#### Book Catalog
```http
GET /api/v1/library/books/
Authorization: Bearer <token>
```

#### Borrow Book
```http
POST /api/v1/library/borrow/
Content-Type: application/json
Authorization: Bearer <token>

{
  "book": 1,
  "student": 1,
  "due_date": "2025-02-15"
}
```

#### Return Book
```http
POST /api/v1/library/borrow/<record_id>/return/
Authorization: Bearer <token>
```

## Notification APIs

### Base URL: `/api/v1/notifications/`

#### User Notifications
```http
GET /api/v1/notifications/
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /api/v1/notifications/<notification_id>/
Content-Type: application/json
Authorization: Bearer <token>

{
  "is_read": true
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

## Rate Limiting
- General endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- File upload endpoints: 5 requests per minute

## Pagination
List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

**Example:**
```http
GET /api/v1/students/?page=2&page_size=50
```

## Schools API

### School Statistics
Get comprehensive statistics for the logged-in admin's school.

```http
GET /api/v1/schools/stats/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalStudents": 5,
  "totalTeachers": 3,
  "totalStaff": 2,
  "totalWardens": 0,
  "activeParents": 0,
  "totalClasses": 3,
  "currentSemester": "Academic Session 2024-25",
  "school": {
    "name": "Test School 02402",
    "code": "RJ02402",
    "email": "admin@02402.rj.gov.in",
    "phone": "+91-9876543210",
    "address": "Test School Address, Test Village"
  }
}
```

### School Dashboard Data
Get all dashboard data for the logged-in admin's school.

```http
GET /api/v1/schools/dashboard/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "students": [...],
  "teachers": [...],
  "staff": [...],
  "users": [...],
  "fees": [],
  "attendance": [],
  "exams": []
}
```

## Authentication Fixes

### JWT Token Blacklisting
- **Issue**: RefreshToken blacklist error on logout
- **Solution**: Added `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
- **Result**: Proper token blacklisting for security

## File Upload Guidelines
- Supported formats: PDF, JPG, PNG
- Maximum file size: 5MB per file
- Documents are virus-scanned before storage
- Files are served with proper security headers