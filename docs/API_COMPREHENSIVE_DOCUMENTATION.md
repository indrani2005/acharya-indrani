# 🎓 Acharya Multi-School Management System API Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACHARYA SYSTEM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    HTTP/REST     ┌────────────────────────┐ │
│  │                 │    API calls     │                        │ │
│  │   React Frontend│ ◄──────────────► │   Django Backend       │ │
│  │   (Vite + TS)   │    JSON          │   (DRF + JWT)          │ │
│  │                 │                  │                        │ │
│  └─────────────────┘                  └────────────────────────┘ │
│           │                                        │             │
│           │                                        │             │
│  ┌─────────────────┐                  ┌────────────────────────┐ │
│  │  API Services   │                  │     PostgreSQL         │ │
│  │  - adminAPI.ts  │                  │     Database           │ │
│  │  - services.ts  │                  │                        │ │
│  │  - client.ts    │                  │  ┌──────┬──────┬─────┐ │ │
│  └─────────────────┘                  │  │Users │Schools│Apps │ │ │
│                                       │  └──────┴──────┴─────┘ │ │
│                                       └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 API Response Format

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "timestamp": "2024-09-17T10:30:00Z",
  "data": {
    "results": [...] | {...},
    "pagination": {
      "count": 100,
      "next": "http://...",
      "previous": "http://...",
      "page_size": 20,
      "total_pages": 5,
      "current_page": 1
    }
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-09-17T10:30:00Z",
  "errors": {
    "field_name": ["Error message"],
    "general": ["General error"]
  }
}
```

## 🌐 API Endpoints Reference

### 🔐 Authentication Endpoints
```
Base URL: /api/v1/users/

POST   /auth/login/           - User login (email, password)
POST   /auth/logout/          - User logout (blacklist token)
POST   /auth/refresh/         - Refresh JWT token
GET    /auth/profile/         - Get current user profile
POST   /auth/change-password/ - Change user password
POST   /auth/otp/request/     - Request OTP for verification
POST   /auth/otp/verify/      - Verify OTP
```

### 🏫 Schools Management
```
Base URL: /api/v1/schools/

GET    /                      - List schools (filtered by user)
GET    /{id}/                 - Get specific school details
POST   /                      - Create new school (admin only)
PUT    /{id}/                 - Update school (admin only)
DELETE /{id}/                 - Delete school (admin only)
GET    /stats/                - Get school statistics
GET    /dashboard/            - Get school dashboard data
```

### 👥 Users Management
```
Base URL: /api/v1/users/

GET    /students/             - List students
POST   /students/             - Create student
GET    /students/{id}/        - Get student details
PUT    /students/{id}/        - Update student
DELETE /students/{id}/        - Delete student

GET    /parents/              - List parents
POST   /parents/              - Create parent
GET    /parents/{id}/         - Get parent details
PUT    /parents/{id}/         - Update parent
DELETE /parents/{id}/         - Delete parent

GET    /staff/                - List staff members
POST   /staff/                - Create staff
GET    /staff/{id}/           - Get staff details
PUT    /staff/{id}/           - Update staff
DELETE /staff/{id}/           - Delete staff
```

### 📋 Admissions Management
```
Base URL: /api/v1/admissions/

GET    /applications/         - List all applications (admin only)
POST   /applications/         - Submit new application (public)
GET    /applications/{id}/    - Get application details
PUT    /applications/{id}/    - Update application (admin only)
PATCH  /applications/{id}/review/ - Review application (admin only)
DELETE /applications/{id}/    - Delete application (admin only)

POST   /track/                - Track application by reference ID
POST   /verify-email/request/ - Request email verification OTP
POST   /verify-email/verify/  - Verify email with OTP
POST   /student-choice/       - Submit student's school choice
POST   /fee-calculation/      - Calculate fee based on category
POST   /fee-payment/init/     - Initialize fee payment process
POST   /enroll/              - Enroll student in a school
POST   /withdraw/            - Withdraw student enrollment
```

#### 📤 Submit Application (POST /applications/)
**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "applicant_name": "John Doe",
  "date_of_birth": "2005-05-15",
  "email": "john.doe@email.com",
  "phone_number": "1234567890",
  "address": "123 Main St, City, State 12345",
  "category": "general",
  "course_applied": "class-10",
  "previous_school": "ABC School",
  "last_percentage": 85.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 123,
    "applicant_name": "John Doe",
    "category": "general",
    "status": "pending",
    "application_date": "2024-01-15T10:30:00Z",
    // ... other fields
  }
}
```

#### 💰 Calculate Fee (POST /fee-calculation/)
**Public endpoint** - No authentication required

**Request Body:**
```json
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
    "applicant_name": "John Doe",
    "course_applied": "class-10",
    "category": "general",
    "fee_structure": {
      "class_range": "9-10",
      "category": "general",
      "annual_fee_min": 200.00,
      "annual_fee_max": 600.00,
      "total_fee": 200.00
    },
    "accepted_schools": [
      {
        "id": 1,
        "school_name": "ABC High School",
        "preference_order": "1st"
      }
    ]
  }
}
```

**Fee Structure Categories:**
- `general` - General category students
- `sc_st_obc_sbc` - SC/ST/OBC/SBC category students (reduced fees)

**Class Ranges and Fees:**
- Classes 1-8: ₹0 (Free for all categories)
- Classes 9-10: ₹200-600 (General), ₹100 (SC/ST/OBC/SBC)
- Classes 11-12: ₹300-1200 (General), ₹150 (SC/ST/OBC/SBC)

#### 🎓 Enroll Student (POST /enroll/)
**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "decision_id": 123,
  "payment_reference": "PAY_ONLINE_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled at ABC High School",
  "data": {
    "enrollment_date": "2025-09-17T10:30:00Z",
    "school_name": "ABC High School",
    "enrollment_status": "enrolled",
    "payment_reference": "PAY_ONLINE_1234567890"
  }
}
```

**Payment Reference Examples:**
- `FREE_ENROLLMENT` - For ₹0 fee categories
- `PAY_ONLINE_1234567890` - Online payment reference
- `PAY_BANK_TRANSFER_1234567890` - Bank transfer reference

#### 🚫 Withdraw Enrollment (POST /withdraw/)
**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "decision_id": 123,
  "withdrawal_reason": "Student requested withdrawal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully withdrawn from ABC High School",
  "data": {
    "withdrawal_date": "2025-09-17T11:00:00Z",
    "school_name": "ABC High School",
    "enrollment_status": "withdrawn",
    "withdrawal_reason": "Student requested withdrawal"
  }
}
```

**Enrollment Status Values:**
- `not_enrolled` - Accepted but not enrolled
- `enrolled` - Successfully enrolled with payment
- `withdrawn` - Withdrawn from school

**Multi-Enrollment Support:**
- Students can enroll in multiple schools simultaneously
- Each school enrollment is tracked independently
- Withdrawal from one school doesn't affect others
- Cannot enroll twice in the same school

#### 🔍 Review Application (PATCH /applications/{id}/review/)
**Admin only** - Requires authentication

**Request Body:**
```json
{
  "status": "approved",
  "review_comments": "Application meets all requirements"
}
```

**Valid Status Values:**
- `pending` - Initial status
- `under_review` - Application being reviewed
- `approved` - Application approved
- `rejected` - Application rejected

### 💰 Fees Management
```
Base URL: /api/v1/fees/

GET    /invoices/             - List fee invoices
POST   /invoices/             - Create new invoice
GET    /invoices/{id}/        - Get invoice details
PUT    /invoices/{id}/        - Update invoice
DELETE /invoices/{id}/        - Delete invoice

GET    /payments/             - List payments
POST   /payments/             - Record new payment
GET    /payments/{id}/        - Get payment details
```

### 📅 Attendance Management
```
Base URL: /api/v1/attendance/

GET    /sessions/             - List class sessions
POST   /sessions/             - Create class session
GET    /sessions/{id}/        - Get session details
PUT    /sessions/{id}/        - Update session
DELETE /sessions/{id}/        - Delete session

GET    /records/              - List attendance records
POST   /records/              - Mark attendance
GET    /records/{id}/         - Get attendance record
PUT    /records/{id}/         - Update attendance
DELETE /records/{id}/         - Delete attendance record
```

### 📚 Exams Management
```
Base URL: /api/v1/exams/

GET    /                      - List exams
POST   /                      - Create exam
GET    /{id}/                 - Get exam details
PUT    /{id}/                 - Update exam
DELETE /{id}/                 - Delete exam
POST   /{id}/marks/           - Upload exam marks

GET    /results/              - List exam results
POST   /results/              - Create exam result
GET    /results/{id}/         - Get result details
PUT    /results/{id}/         - Update result
DELETE /results/{id}/         - Delete result
```

### 🏠 Hostel Management
```
Base URL: /api/v1/hostel/

GET    /rooms/                - List hostel rooms
POST   /rooms/                - Create room
GET    /rooms/{id}/           - Get room details
PUT    /rooms/{id}/           - Update room
DELETE /rooms/{id}/           - Delete room

GET    /allocations/          - List room allocations
POST   /allocations/          - Create allocation
GET    /allocations/{id}/     - Get allocation details
PUT    /allocations/{id}/     - Update allocation
DELETE /allocations/{id}/     - Delete allocation

POST   /allocate/             - Allocate room to student
POST   /room-change-request/  - Request room change
```

### 📖 Library Management
```
Base URL: /api/v1/library/

GET    /books/                - List books
POST   /books/                - Add new book
GET    /books/{id}/           - Get book details
PUT    /books/{id}/           - Update book
DELETE /books/{id}/           - Delete book

GET    /borrow/               - List borrow records
POST   /borrow/               - Borrow book
GET    /borrow/{id}/          - Get borrow record
PATCH  /borrow/{id}/return/   - Return book

GET    /borrow-records/       - List all borrow records (alternate)
POST   /borrow-records/       - Create borrow record (alternate)
```

### 📢 Notifications Management
```
Base URL: /api/v1/notifications/

GET    /notices/              - List notices
POST   /notices/              - Create notice
GET    /notices/{id}/         - Get notice details
PUT    /notices/{id}/         - Update notice
DELETE /notices/{id}/         - Delete notice

GET    /user-notifications/   - List user notifications
POST   /user-notifications/   - Create user notification
GET    /user-notifications/{id}/ - Get notification details
PATCH  /user-notifications/{id}/ - Mark as read
```

### 📊 Dashboard Analytics
```
Base URL: /api/v1/dashboard/

GET    /stats/                - Get general dashboard statistics
GET    /admin/                - Get admin dashboard data
GET    /student/{id}/         - Get student dashboard data
GET    /parent/{id}/          - Get parent dashboard data
GET    /faculty/{id}/         - Get faculty dashboard data
GET    /warden/               - Get warden dashboard data
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend Request                                               │
│  ┌─────────────┐    1    ┌─────────────┐    2    ┌────────────┐ │
│  │ Component   │ ──────► │ API Service │ ──────► │ HTTP       │ │
│  │ (React)     │         │ Function    │         │ Client     │ │
│  └─────────────┘         └─────────────┘         └────────────┘ │
│                                                        │        │
│                                                        │ 3      │
│                                                        ▼        │
│  ┌─────────────┐    6    ┌─────────────┐    5    ┌────────────┐ │
│  │ UI Update   │ ◄────── │ State       │ ◄────── │ Response   │ │
│  │ (Re-render) │         │ Management  │         │ Handler    │ │
│  └─────────────┘         └─────────────┘         └────────────┘ │
│                                                        ▲        │
│                                                        │ 4      │
│  Backend Processing                                    │        │
│  ┌─────────────┐    7    ┌─────────────┐    8    ┌────────────┐ │
│  │ URL Router  │ ──────► │ View/       │ ──────► │ Serializer │ │
│  │ (Django)    │         │ ViewSet     │         │ (DRF)      │ │
│  └─────────────┘         └─────────────┘         └────────────┘ │
│                                                        │        │
│                                                        │ 9      │
│                                                        ▼        │
│  ┌─────────────┐   12    ┌─────────────┐   10    ┌────────────┐ │
│  │ JSON        │ ◄────── │ Response    │ ◄────── │ Database   │ │
│  │ Response    │         │ Builder     │         │ Query      │ │
│  └─────────────┘         └─────────────┘         └────────────┘ │
│                                                        │        │
│                                                   11   │        │
│                          ┌─────────────┐              │        │
│                          │ PostgreSQL  │ ◄────────────┘        │
│                          │ Database    │                       │
│                          └─────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Frontend Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND SERVICE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Components Layer                                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ AdminDashboard │ StudentView │ ParentView │ StaffView       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  Service Layer                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ adminAPI.ts │  │ services.ts │  │ client.ts           │ │ │
│  │  │             │  │             │  │                     │ │ │
│  │  │ School      │  │ Admissions  │  │ - Base URL config   │ │ │
│  │  │ Stats       │  │ Fees        │  │ - Auth interceptor  │ │ │
│  │  │ Dashboard   │  │ Attendance  │  │ - Error handling    │ │ │
│  │  │ Users       │  │ Exams       │  │ - Request/Response  │ │ │
│  │  │             │  │ Hostel      │  │   transformation    │ │ │
│  │  │             │  │ Library     │  │                     │ │ │
│  │  │             │  │ Notifications│  │                     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  Type Safety Layer                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                        types.ts                             │ │
│  │                                                             │ │
│  │ User, Student, Staff, Parent, AdmissionApplication,         │ │
│  │ FeeInvoice, AttendanceRecord, Exam, HostelRoom,             │ │
│  │ Book, Notice, ApiResponse, ApiError                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🛡️ Security & Authentication

### JWT Token Flow
```
1. User Login
   ├── POST /api/v1/users/auth/login/
   ├── Validate credentials
   ├── Generate access + refresh tokens
   └── Return tokens + user data

2. Authenticated Requests
   ├── Include Authorization: Bearer <access_token>
   ├── Backend validates token
   ├── Extract user + school context
   └── Filter data by user permissions

3. Token Refresh
   ├── POST /api/v1/users/auth/refresh/
   ├── Validate refresh token
   ├── Generate new access token
   └── Return new access token

4. Logout
   ├── POST /api/v1/users/auth/logout/
   ├── Blacklist current tokens
   └── Clear frontend storage
```

### Role-Based Access Control
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ROLES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Management (Admin)                                             │
│  ├── Full school data access                                    │
│  ├── User management                                            │
│  ├── System configuration                                       │
│  └── All CRUD operations                                        │
│                                                                 │
│  Teacher/Faculty                                                │
│  ├── Class-specific data                                        │
│  ├── Student attendance                                         │
│  ├── Exam management                                            │
│  └── Grade submission                                           │
│                                                                 │
│  Student                                                        │
│  ├── Personal data only                                         │
│  ├── Attendance view                                            │
│  ├── Fee status                                                 │
│  └── Exam results                                               │
│                                                                 │
│  Parent                                                         │
│  ├── Children's data only                                       │
│  ├── Fee payments                                               │
│  ├── Attendance monitoring                                      │
│  └── Communication with school                                  │
│                                                                 │
│  Warden                                                         │
│  ├── Hostel management                                          │
│  ├── Room allocations                                           │
│  ├── Student accommodation                                      │
│  └── Hostel maintenance                                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📈 Performance & Optimization

### Backend Optimizations
- Database indexing on frequently queried fields
- Query optimization with select_related/prefetch_related
- Pagination for large datasets (20 items per page)
- Caching for repeated dashboard queries
- Connection pooling for database

### Frontend Optimizations
- Lazy loading of components
- API response caching
- Debounced search inputs
- Pagination for large lists
- Error boundary components

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Development                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Frontend (Vite)  │  Backend (Django)  │  Database (SQLite) │ │
│  │ localhost:5173   │  localhost:8000    │  db.sqlite3        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  Production                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Frontend (CDN)   │  Backend (Server)  │  Database (Postgres)│ │
│  │ Static hosting   │  Gunicorn + Nginx  │  Cloud Database     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Error Handling Strategy

### Backend Error Handling
```python
# Standard error responses for all endpoints
try:
    # Business logic
    return success_response(data, "Operation successful")
except ValidationError as e:
    return validation_error_response(e.errors)
except PermissionDenied:
    return permission_denied_response()
except NotFound:
    return not_found_response()
except Exception as e:
    return error_response("Internal server error", str(e))
```

### Frontend Error Handling
```typescript
// Consistent error handling in API client
try {
  const response = await apiClient.get('/endpoint');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle authentication errors
    redirectToLogin();
  } else if (error.response?.status === 403) {
    // Handle permission errors
    showAccessDeniedModal();
  } else {
    // Handle other errors
    showErrorNotification(error.message);
  }
  throw error;
}
```

## 📋 API Usage Examples

### Login Example
```typescript
// Frontend
const response = await authService.login({
  email: "admin@school.edu",
  password: "password123"
});

// Response
{
  "success": true,
  "message": "Login successful",
  "timestamp": "2024-09-17T10:30:00Z",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "email": "admin@school.edu",
      "role": "Management",
      "full_name": "John Doe"
    }
  }
}
```

### Get School Stats Example
```typescript
// Frontend
const stats = await adminAPI.getSchoolStats();

// Response
{
  "success": true,
  "message": "School statistics retrieved successfully",
  "timestamp": "2024-09-17T10:30:00Z",
  "data": {
    "total_students": 250,
    "total_staff": 25,
    "total_parents": 180,
    "applications_this_month": 15,
    "pending_fees": 45000.00,
    "school_name": "ABC International School",
    "school_id": 1
  }
}
```

## 🎯 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Mobile app API integration
- [ ] Advanced analytics and reporting
- [ ] File upload/download management
- [ ] Integration with external systems (SMS, Email)
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced caching strategies
- [ ] Microservices architecture migration

---

*Generated on September 17, 2024*
*Acharya Multi-School Management System v1.0*