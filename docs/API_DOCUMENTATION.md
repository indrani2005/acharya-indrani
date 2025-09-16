# Acharya ERP API Documentation

## Overview
This document provides comprehensive API documentation for the Acharya ERP system, including authentication, endpoints, request/response formats, and examples.

## Base URL
- **Development**: `http://localhost:8000/api/v1/`
- **Production**: Update according to your deployment

## Authentication

### JWT Token Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Login
**Endpoint**: `POST /users/auth/login/`

**Request**:
```json
{
  "email": "admin@acharya.edu",
  "password": "admin123"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@acharya.edu",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User",
    "school": {
      "id": 1,
      "school_name": "Acharya Test School",
      "school_code": "ATS001"
    }
  }
}
```

### Token Refresh
**Endpoint**: `POST /users/auth/refresh/`

**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Schools API

### Get Public Schools (No Auth Required)
**Endpoint**: `GET /schools/public/`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "school_name": "Acharya Test School",
      "school_code": "ATS001",
      "district": "Jaipur",
      "block": "Central",
      "village": "Jaipur City"
    }
  ]
}
```

### Get School Statistics (Auth Required)
**Endpoint**: `GET /schools/stats/`

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "totalStudents": 150,
  "totalTeachers": 20,
  "totalStaff": 5,
  "totalWardens": 2,
  "activeParents": 120,
  "totalClasses": 12,
  "currentSemester": "Academic Session 2024-25",
  "school": {
    "name": "Acharya Test School",
    "code": "ATS001",
    "email": "admin@acharya.edu",
    "phone": "9876543210",
    "address": "123 Test Street, Jaipur, Rajasthan"
  }
}
```

### Get School Dashboard Data (Auth Required)
**Endpoint**: `GET /schools/dashboard/`

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "students": [
    {
      "id": 1,
      "admission_number": "ATS001001",
      "user": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@student.com"
      },
      "course": "Class 10 - Science",
      "batch": "2024-25",
      "status": "active"
    }
  ],
  "teachers": [
    {
      "id": 1,
      "user": {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@teacher.com"
      },
      "department": "Science",
      "designation": "Senior Teacher",
      "experience_years": 5,
      "status": "active"
    }
  ],
  "staff": [],
  "fees": [],
  "attendance": [],
  "exams": []
}
```

## Admissions API

### Email Verification (No Auth Required)

#### Request Email OTP
**Endpoint**: `POST /admissions/verify-email/request/`

**Request**:
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

#### Verify Email OTP
**Endpoint**: `POST /admissions/verify-email/verify/`

**Request**:
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

### Submit Application (No Auth Required)
**Endpoint**: `POST /admissions/applications/`

**Request**:
```json
{
  "applicant_name": "John Doe",
  "date_of_birth": "2005-06-15",
  "email": "student@example.com",
  "phone_number": "1234567890",
  "address": "123 Main St, City, State 12345",
  "course_applied": "Class 10 - Science",
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
  "application_date": "2025-01-17T10:30:00Z"
}
```

### Track Application (No Auth Required)
**Endpoint**: `GET /admissions/track/?reference_id=ADM-2025-A1B2C3`

**Response**:
```json
{
  "success": true,
  "data": {
    "reference_id": "ADM-2025-A1B2C3",
    "applicant_name": "John Doe",
    "course_applied": "Class 10 - Science",
    "status": "under_review",
    "first_preference_school": {
      "id": 1,
      "school_name": "Acharya Test School",
      "school_code": "ATS001"
    },
    "application_date": "2025-01-17T10:30:00Z",
    "school_decisions": [
      {
        "id": 1,
        "school": "Acharya Test School",
        "status": "accepted",
        "review_date": "2025-01-18T14:30:00Z",
        "notes": "Excellent academic record"
      }
    ]
  }
}
```

### School Review (Auth Required)

#### Get Applications for Review
**Endpoint**: `GET /admissions/school-review/`

**Headers**: `Authorization: Bearer <token>`

**Note**: Returns applications where the authenticated user's school is in the preference list.

**Response**:
```json
[
  {
    "id": 1,
    "reference_id": "ADM-2025-A1B2C3",
    "applicant_name": "John Doe",
    "email": "student@example.com",
    "phone_number": "1234567890",
    "date_of_birth": "2005-06-15",
    "course_applied": "Class 10 - Science",
    "first_preference_school": "Acharya Test School",
    "status": "pending",
    "application_date": "2025-01-17T10:30:00Z",
    "school_decisions": [
      {
        "id": 1,
        "school": "Acharya Test School",
        "status": "pending"
      }
    ]
  }
]
```

#### Update School Decision
**Endpoint**: `PATCH /admissions/school-decision/<decision_id>/`

**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "status": "accepted",
  "notes": "Excellent academic record and good interview performance"
}
```

**Response**:
```json
{
  "id": 1,
  "school": "Acharya Test School",
  "status": "accepted",
  "review_date": "2025-01-18T14:30:00Z",
  "notes": "Excellent academic record and good interview performance"
}
```

### Student Choice (No Auth Required)

#### Get Accepted Schools
**Endpoint**: `GET /admissions/accepted-schools/?reference_id=ADM-2025-A1B2C3`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "school": "Acharya Test School",
      "school_name": "Acharya Test School",
      "status": "accepted",
      "review_date": "2025-01-18T14:30:00Z",
      "notes": "Excellent academic record"
    },
    {
      "id": 2,
      "school": "Another School",
      "school_name": "Another School",
      "status": "accepted",
      "review_date": "2025-01-19T10:15:00Z",
      "notes": "Good performance"
    }
  ]
}
```

#### Submit Student Choice
**Endpoint**: `POST /admissions/student-choice/`

**Request**:
```json
{
  "reference_id": "ADM-2025-A1B2C3",
  "chosen_school": "Acharya Test School"
}
```

**Response**:
```json
{
  "success": true,
  "message": "School choice submitted successfully",
  "data": {
    "reference_id": "ADM-2025-A1B2C3",
    "chosen_school": "Acharya Test School",
    "choice_date": "2025-01-20T09:30:00Z"
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-01-17T10:30:00Z",
  "errors": ["Detailed error message"],
  "status": 400
}
```

### Common HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Authentication Errors

### 401 Unauthorized
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Only Admin/Management users with assigned schools can access this data. Your role: student"
}
```

## Rate Limiting
- Email OTP requests: 1 request per 2 minutes per email
- OTP verification: 3 attempts per OTP
- OTP expiry: 10 minutes

## Data Models

### User Roles
- `student`: Student user
- `parent`: Parent/Guardian user
- `faculty`: Teaching staff
- `staff`: Non-teaching staff
- `warden`: Hostel warden
- `admin`: School administrator
- `management`: Management user

### Application Status
- `pending`: Initial state after submission
- `under_review`: Being reviewed by schools
- `approved`: Accepted and student choice made
- `rejected`: No schools accepted

### School Decision Status
- `pending`: Not yet reviewed
- `accepted`: School approved application
- `rejected`: School declined application

## Testing

### Test Admin User
Use the management command to create a test admin user:

```bash
python manage.py create_test_admin
```

Default credentials:
- Email: `admin@acharya.edu`
- Password: `admin123`

### Test Applications
Create test admission applications:

```bash
python manage.py create_test_applications --count 5
```

## Frontend Integration

### API Client Setup
The frontend uses axios with automatic token handling:

```typescript
// API client automatically adds Authorization header
const response = await apiClient.get('/schools/stats/');
```

### Error Handling
API errors are automatically transformed to a standard format:

```typescript
try {
  const response = await apiClient.get('/endpoint/');
} catch (error) {
  // error.message contains user-friendly message
  // error.status contains HTTP status code
  console.error('API Error:', error.message);
}
```

### Authentication Flow
1. User logs in via `/users/auth/login/`
2. Access and refresh tokens stored in localStorage
3. Access token automatically added to requests
4. Token refresh handled automatically on 401 errors
5. Redirect to login on refresh failure

## Development Guidelines

### API Design Principles
- RESTful resource naming
- Consistent response structure
- Proper HTTP status codes
- Comprehensive error messages
- Authentication where appropriate

### Adding New Endpoints
1. Create view in appropriate app
2. Add URL pattern to app's urls.py
3. Update this documentation
4. Add frontend API function
5. Add TypeScript types
6. Test thoroughly

### Security Considerations
- All admin endpoints require authentication
- Role-based access control implemented
- Email verification for admissions
- SQL injection prevention
- XSS protection via Django defaults