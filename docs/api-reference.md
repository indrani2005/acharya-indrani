# Acharya School Management API Reference

## Base URL
```
Development: http://localhost:8000/api/v1/
Production: https://your-domain.com/api/v1/
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Authentication Endpoints

#### Login
```http
POST /users/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Logout
```http
POST /users/auth/logout/
Authorization: Bearer <token>

{
  "refresh": "refresh_token_here"
}
```

#### Get Current User
```http
GET /users/auth/me/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  },
  "profile": {
    "admission_number": "2024001",
    "course": "Computer Science",
    "semester": 3,
    "is_hostelite": true
  }
}
```

## User Management

### Students
```http
GET /users/students/
GET /users/students/{id}/
POST /users/students/
PATCH /users/students/{id}/
DELETE /users/students/{id}/
```

### Parents
```http
GET /users/parents/
GET /users/parents/{id}/
POST /users/parents/
PATCH /users/parents/{id}/
DELETE /users/parents/{id}/
```

### Staff
```http
GET /users/staff/
GET /users/staff/{id}/
POST /users/staff/
PATCH /users/staff/{id}/
DELETE /users/staff/{id}/
```

## Admissions

### Submit Application
```http
POST /admissions/applications/
Content-Type: application/json

{
  "applicant_name": "Jane Smith",
  "date_of_birth": "2005-03-15",
  "email": "jane@example.com",
  "phone_number": "+91-9876543210",
  "address": "123 Main St, City",
  "course_applied": "Computer Science",
  "previous_school": "ABC High School",
  "last_percentage": 85.5,
  "documents": {
    "marksheet": "/path/to/marksheet.pdf",
    "certificate": "/path/to/certificate.pdf"
  }
}
```

### List Applications
```http
GET /admissions/applications/
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: Filter by status (pending, under_review, approved, rejected)
- `course_applied`: Filter by course
- `page`: Page number for pagination

### Review Application
```http
PATCH /admissions/applications/{id}/review/
Authorization: Bearer <admin_token>

{
  "status": "approved",
  "review_comments": "Application meets all requirements"
}
```

## Fee Management

### List Fee Invoices
```http
GET /fees/invoices/
Authorization: Bearer <token>
```

**Query Parameters:**
- `student`: Filter by student ID
- `status`: Filter by status (pending, paid, overdue, cancelled)
- `page`: Page number

**Response:**
```json
{
  "count": 10,
  "next": "http://api/v1/fees/invoices/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "invoice_number": "INV-2024-001",
      "student": 1,
      "student_name": "John Doe",
      "amount": "5000.00",
      "due_date": "2024-03-15",
      "status": "pending",
      "created_date": "2024-02-15T10:30:00Z"
    }
  ]
}
```

### Process Payment
```http
POST /fees/invoices/{id}/pay/
Authorization: Bearer <token>

{
  "payment_method": "online",
  "transaction_id": "TXN123456789"
}
```

**Response:**
```json
{
  "message": "Payment successful",
  "payment": {
    "id": 1,
    "transaction_id": "TXN123456789",
    "amount": "5000.00",
    "payment_method": "online",
    "payment_date": "2024-03-01T14:30:00Z"
  },
  "invoice": {
    "id": 1,
    "status": "paid"
  }
}
```

### Fee Structures
```http
GET /fees/structures/
POST /fees/structures/
PATCH /fees/structures/{id}/
```

## Attendance

### Mark Attendance
```http
POST /attendance/mark/
Authorization: Bearer <faculty_token>

{
  "session_id": 1,
  "attendance_data": [
    {
      "student_id": 1,
      "status": "present"
    },
    {
      "student_id": 2, 
      "status": "absent"
    }
  ]
}
```

### Get Student Attendance
```http
GET /attendance/records/?student={student_id}
Authorization: Bearer <token>
```

**Query Parameters:**
- `student`: Student ID
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `subject`: Filter by subject

## Examinations

### List Exams
```http
GET /exams/
Authorization: Bearer <token>
```

### Get Student Results
```http
GET /exams/results/?student={student_id}
Authorization: Bearer <token>
```

### Upload Marks (Faculty)
```http
POST /exams/{exam_id}/marks/
Authorization: Bearer <faculty_token>

{
  "results": [
    {
      "student_id": 1,
      "marks_obtained": 85,
      "grade": "A"
    }
  ]
}
```

## Hostel Management

### List Rooms
```http
GET /hostel/rooms/
Authorization: Bearer <token>
```

**Query Parameters:**
- `block`: Filter by hostel block
- `is_available`: Filter by availability (true/false)
- `room_type`: Filter by room type (single, double, triple)

### Allocate Room
```http
POST /hostel/allocate/
Authorization: Bearer <warden_token>

{
  "student_id": 1,
  "room_id": 101,
  "allocation_date": "2024-03-01"
}
```

### Room Change Request
```http
POST /hostel/room-change-request/
Authorization: Bearer <student_token>

{
  "current_room_id": 101,
  "requested_room_id": 205,
  "reason": "Medical reasons"
}
```

## Library System

### List Books
```http
GET /library/books/
Authorization: Bearer <token>
```

**Query Parameters:**
- `search`: Search in title, author, ISBN
- `category`: Filter by category
- `available`: Show only available books (true/false)

### Borrow Book
```http
POST /library/borrow/
Authorization: Bearer <student_token>

{
  "book_id": 1,
  "due_date": "2024-03-15"
}
```

### Return Book
```http
PATCH /library/borrow/{record_id}/return/
Authorization: Bearer <token>

{
  "return_date": "2024-03-10",
  "condition": "good"
}
```

## Notifications

### List Notices
```http
GET /notifications/notices/
Authorization: Bearer <token>
```

**Query Parameters:**
- `priority`: Filter by priority (low, medium, high, urgent)
- `target_role`: Filter by target role
- `is_active`: Filter by active status

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Mid-term Exam Schedule",
      "content": "Mid-term examinations will begin from March 15, 2024...",
      "priority": "high",
      "target_roles": ["student", "parent"],
      "is_sticky": true,
      "publish_date": "2024-03-01T09:00:00Z",
      "created_by": "Admin"
    }
  ]
}
```

### Create Notice (Admin)
```http
POST /notifications/notices/
Authorization: Bearer <admin_token>

{
  "title": "Holiday Notice",
  "content": "The school will remain closed on March 25, 2024",
  "priority": "medium",
  "target_roles": ["all"],
  "publish_date": "2024-03-20T09:00:00Z",
  "expire_date": "2024-03-26T23:59:59Z"
}
```

## Error Responses

### HTTP Status Codes
- `200 OK`: Successful GET, PATCH requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid data/parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Format
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["This field is required."],
    "password": ["This field is required."]
  }
}
```

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /users/students/?page=2&page_size=10
```

**Response:**
```json
{
  "count": 100,
  "next": "http://api/v1/users/students/?page=3",
  "previous": "http://api/v1/users/students/?page=1",
  "results": [...]
}
```

## Filtering & Search

### Common Filters
- `search`: Text search across relevant fields
- `ordering`: Sort by field (prefix with `-` for descending)
- Date ranges: `created_after`, `created_before`

**Example:**
```http
GET /fees/invoices/?status=pending&created_after=2024-01-01&ordering=-created_date
```

## Rate Limiting

- **Authenticated users**: 100 requests/minute
- **Anonymous users**: 20 requests/minute
- **File uploads**: 10 requests/minute

## File Uploads

### Document Upload (Admission)
```http
POST /admissions/upload-document/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
document_type: "marksheet"
```

**Response:**
```json
{
  "url": "https://storage.googleapis.com/bucket/documents/marksheet_123.pdf",
  "document_type": "marksheet",
  "uploaded_at": "2024-03-01T14:30:00Z"
}
```

## Webhooks (Future)

Webhook endpoints for real-time notifications:
- Payment confirmations
- Application status changes
- Attendance alerts

---

## Interactive API Documentation

Visit `/api/docs/` for interactive Swagger UI documentation where you can test all endpoints directly in your browser.

## SDK & Libraries

### JavaScript/TypeScript
```javascript
// Install the API client
npm install @acharya/api-client

// Usage
import { AcharyaAPI } from '@acharya/api-client';

const api = new AcharyaAPI({
  baseURL: 'http://localhost:8000/api/v1/',
  token: 'your-jwt-token'
});

// Login
const { data } = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get student data
const students = await api.users.students.list();
```

### Python
```python
# Install the Python client
pip install acharya-api-client

# Usage
from acharya_api import AcharyaClient

client = AcharyaClient(
    base_url='http://localhost:8000/api/v1/',
    token='your-jwt-token'
)

# Login
response = client.auth.login(
    email='user@example.com',
    password='password123'
)

# Get student data
students = client.users.students.list()
```

## Schools API

### School Statistics
Get comprehensive statistics for the authenticated user's school.

```http
GET /schools/stats/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalStudents": 150,
  "totalTeachers": 25,
  "totalStaff": 10,
  "totalWardens": 3,
  "activeParents": 120,
  "totalClasses": 12,
  "currentSemester": "Fall 2024",
  "school": {
    "name": "ABC International School",
    "code": "ABC001",
    "email": "admin@abcschool.edu",
    "phone": "+1234567890",
    "address": "123 Education Street, City, State"
  }
}
```

### Dashboard Data
Get comprehensive dashboard data including all entities for the school.

```http
GET /schools/dashboard/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "students": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@school.edu",
      "phone": "+1234567890",
      "enrollment_date": "2024-01-15",
      "class_name": "Grade 10-A",
      "status": "active"
    }
  ],
  "teachers": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@school.edu",
      "phone": "+1234567891",
      "department": "Mathematics",
      "subjects": ["Algebra", "Geometry"],
      "experience_years": 8
    }
  ],
  "staff": [
    {
      "id": 1,
      "first_name": "Bob",
      "last_name": "Johnson",
      "email": "bob.johnson@school.edu",
      "phone": "+1234567892",
      "department": "Administration",
      "position": "Office Manager",
      "hire_date": "2023-06-01"
    }
  ],
  "users": [
    {
      "id": 1,
      "email": "user@school.edu",
      "first_name": "User",
      "last_name": "Name",
      "role": "student",
      "is_active": true,
      "last_login": "2024-01-20T10:30:00Z"
    }
  ],
  "fees": [],
  "attendance": [],
  "exams": []
}
```

**Error Response:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## Error Handling

All endpoints follow consistent error response patterns:

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 400 Bad Request
```json
{
  "field_name": ["This field is required."],
  "email": ["Enter a valid email address."]
}
```

## Frontend Integration Notes

**Important:** When using the frontend API client, always use relative paths without the `/api/v1/` prefix:

✅ **Correct:**
```typescript
const response = await apiClient.get('/schools/stats/');
```

❌ **Incorrect:**
```typescript
const response = await apiClient.get('/api/v1/schools/stats/'); // Causes 404!
```

See [API Path Best Practices](./API_PATH_BEST_PRACTICES.md) for detailed guidelines.