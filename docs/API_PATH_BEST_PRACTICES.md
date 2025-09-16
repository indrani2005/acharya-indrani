# API Path Best Practices & Error Prevention

## Overview
This document outlines best practices for handling API paths in the Acharya School Management System to prevent common errors like duplicated paths and 404 issues.

## Recent Issue & Resolution

### Problem
The frontend was making API calls with duplicated paths like:
```
/api/v1/api/v1/schools/stats/
```

**AND** the backend had URL routing conflicts where custom API endpoints were being intercepted by DRF router patterns.

This occurred because:
1. The Axios client (`client.ts`) has a baseURL of `/api/v1/`
2. Service functions (`adminAPI.ts`) were also prefixing paths with `/api/v1/`
3. **NEW**: DRF router was using empty string pattern (`r''`) which captured all URLs under `/schools/`

### Solution
- **Frontend service files should use relative paths only**
- **Backend URL patterns should be ordered correctly with specific endpoints before generic router patterns**
- The base URL configuration handles the `/api/v1/` prefix automatically

## API Client Configuration

### Base URL Setup (`frontend/src/lib/api/client.ts`)
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Service Layer Best Practices (`frontend/src/services/adminAPI.ts`)

✅ **CORRECT** - Use relative paths:
```typescript
const response = await apiClient.get('/schools/stats/');
const response = await apiClient.get('/schools/dashboard/');
const response = await apiClient.post('/users/', userData);
```

❌ **INCORRECT** - Don't duplicate the base path:
```typescript
const response = await apiClient.get('/api/v1/schools/stats/');  // WRONG!
const response = await apiClient.get('/api/v1/schools/dashboard/');  // WRONG!
```

## Backend URL Routing Best Practices

### DRF Router Configuration (`backend/app/urls.py`)

✅ **CORRECT** - Specific endpoints before router patterns:
```python
router = DefaultRouter()
router.register(r'list', views.SchoolViewSet)  # Use specific prefix

urlpatterns = [
    # Custom endpoints FIRST
    path('stats/', views.SchoolStatsAPIView.as_view(), name='school-stats'),
    path('dashboard/', views.SchoolDashboardAPIView.as_view(), name='school-dashboard'),
    # Router patterns LAST
    path('', include(router.urls)),
]
```

❌ **INCORRECT** - Router with empty pattern first:
```python
router = DefaultRouter()
router.register(r'', views.SchoolViewSet)  # Captures ALL URLs!

urlpatterns = [
    path('', include(router.urls)),  # Router first - captures everything!
    path('stats/', views.SchoolStatsAPIView.as_view()),  # Never reached!
    path('dashboard/', views.SchoolDashboardAPIView.as_view()),  # Never reached!
]
```

### URL Pattern Order Rules
1. **Most specific patterns first** (exact matches)
2. **Custom API view endpoints** before router patterns
3. **Router patterns last** (they use regex and can be greedy)
4. **Never use empty string** (`r''`) in router.register() if you have custom endpoints

## Error Prevention Checklist

### Before Adding New API Endpoints:

#### Frontend Checks:
1. **Check Base URL Configuration**
   - Verify `client.ts` baseURL includes `/api/v1/`
   - Ensure environment variables are correctly set

2. **Use Relative Paths in Services**
   - Start paths with `/` (e.g., `/schools/stats/`)
   - Never include `/api/v1/` in service function calls

#### Backend Checks:
3. **URL Pattern Order**
   - Put specific custom endpoints BEFORE router patterns
   - Use specific prefixes for routers (e.g., `r'list'` not `r''`)
   - Never use empty string in `router.register()` with custom endpoints

4. **Settings Configuration**
   - Ensure `ALLOWED_HOSTS` includes development hosts
   - Add `'localhost'`, `'127.0.0.1'`, `'testserver'` for development

#### Testing:
5. **Test API Calls**
   - Check browser network tab for actual request URLs
   - Verify no path duplication occurs
   - Test endpoints with proper JWT authentication
   - Ensure custom endpoints aren't intercepted by router patterns

6. **Error Handling**
   - Always include try-catch blocks in service functions
   - Provide fallback data for failed requests
   - Add logout buttons on error pages for better UX

## School Management API Endpoints

### School Statistics
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
```http
GET /schools/dashboard/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "students": [...],
  "teachers": [...],
  "staff": [...],
  "users": [...],
  "fees": [...],
  "attendance": [...],
  "exams": [...]
}
```

## Error Handling Standards

### Service Layer Error Handling
```typescript
export const adminAPI = {
  getSchoolStats: async (): Promise<SchoolStats> => {
    try {
      const response = await apiClient.get('/schools/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching school stats:', error);
      // Return safe default values
      return {
        totalStudents: 0,
        totalTeachers: 0,
        // ... other defaults
      };
    }
  }
};
```

### Component Error Handling
```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getSchoolStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Error Page with Logout
```typescript
if (error) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">{error}</p>
      <Button onClick={logout} variant="outline">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
```

## Role-Based Access Updates

### Supported Roles
- `student`
- `teacher` 
- `staff`
- `warden`
- `admin`
- `management` ✅ **Recently Added**

### Dashboard Access Logic
```typescript
const getDashboardPath = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return '/dashboard/student';
    case 'teacher':
      return '/dashboard/teacher';
    case 'staff':
      return '/dashboard/staff';
    case 'warden':
      return '/dashboard/warden';
    case 'admin':
    case 'management':  // ✅ Added support
      return '/dashboard/admin';
    default:
      throw new Error(`Your role (${role}) is not recognized in the system.`);
  }
};
```

## Maintenance Notes

### When Adding New Endpoints:
1. Add backend URL pattern in `backend/config/urls.py`
2. Implement view in relevant app (e.g., `schools/views.py`)
3. Add service function in frontend with relative path
4. Update this documentation
5. Test the full request flow

### Common Mistakes to Avoid:
- ❌ Hardcoding base URLs in service functions
- ❌ Missing error handling in API calls
- ❌ Not providing fallback data for failed requests
- ❌ Forgetting to add logout buttons on error pages
- ❌ Not testing API paths in browser network tab

## Future Improvements

1. **API Response Standardization**
   - Consistent error response format
   - Standard pagination structure
   - Common success response pattern

2. **Enhanced Error Handling**
   - Global error interceptor in Axios
   - Automatic token refresh on 401 errors
   - Better user feedback for network issues

3. **API Documentation**
   - OpenAPI/Swagger integration
   - Automated API testing
   - Version management strategy