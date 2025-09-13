# Quick Start Guide - Frontend-Backend Integration

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- UV package manager installed

### 1. Backend Setup
```bash
cd backend
uv sync
uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Test the Integration
1. Open http://localhost:5173
2. Click "Login" 
3. Use demo credentials:
   - **Student**: student@acharya.edu / student123
   - **Parent**: parent@acharya.edu / parent123
   - **Faculty**: faculty@acharya.edu / faculty123
   - **Admin**: admin@acharya.edu / admin123

## 📱 Features Available

### ✅ Working Features
- **Authentication**: JWT-based login/logout
- **Student Dashboard**: Real attendance, fees, grades display
- **Admission Form**: Submit applications to Django backend
- **Role-based Access**: Different dashboards per role
- **Error Handling**: Toast notifications for user feedback
- **Loading States**: Smooth UX during API calls

### 🔧 API Endpoints Integrated
- `POST /api/v1/users/auth/login/` - User authentication
- `GET /api/v1/users/auth/me/` - Current user profile
- `POST /api/v1/admissions/applications/` - Submit admission
- `GET /api/v1/fees/invoices/` - Fee management
- `GET /api/v1/attendance/records/` - Attendance tracking
- `GET /api/v1/notifications/notices/` - Notices system

## 🔐 Demo Accounts

| Role | Email | Password | Features |
|------|--------|----------|----------|
| Student | student@acharya.edu | student123 | Dashboard, fees, attendance |
| Parent | parent@acharya.edu | parent123 | Children tracking, notifications |
| Faculty | faculty@acharya.edu | faculty123 | Attendance marking, grades |
| Admin | admin@acharya.edu | admin123 | Full system access |
| Warden | warden@acharya.edu | warden123 | Hostel management |

## 📁 Key Files Modified

```
frontend/
├── .env                                 # API base URL
├── package.json                         # Added axios, removed Supabase
├── src/
│   ├── lib/api/                        # NEW: Complete API layer
│   │   ├── types.ts                    # TypeScript interfaces
│   │   ├── client.ts                   # Axios client with JWT
│   │   ├── auth.ts                     # Authentication services
│   │   └── services.ts                 # All API services
│   ├── contexts/AuthContext.tsx        # NEW: JWT auth provider
│   ├── pages/
│   │   ├── Auth.tsx                    # UPDATED: New login system
│   │   ├── Dashboard.tsx               # UPDATED: Uses auth context
│   │   ├── Admission.tsx               # UPDATED: Django API
│   │   └── dashboards/
│   │       └── StudentDashboard.tsx    # UPDATED: Real API data
│   └── App.tsx                         # UPDATED: Added AuthProvider
```

## 🔄 Data Flow

```
User Login → JWT Token → API Calls → Real Data → UI Update
     ↓
localStorage (token storage)
     ↓
Automatic refresh on token expiry
```

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
cd backend
uv sync --upgrade
uv run manage.py migrate
```

### Frontend Build Errors?
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues?
1. Check backend is running on port 8000
2. Verify `.env` file has correct API URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api/v1/
   ```

### Authentication Problems?
1. Create superuser in Django admin
2. Use exact demo credentials listed above
3. Check browser dev tools for API errors

## 📊 What's Integrated

### Authentication ✅
- JWT token management
- Automatic token refresh
- Role-based access control
- Secure logout

### Student Features ✅
- Real-time dashboard with API data
- Fee payment integration
- Attendance tracking
- Exam results display
- Library book tracking

### Admission System ✅
- Form submission to Django
- Validation and error handling
- Application ID generation
- Success confirmation

### Admin Features ✅
- User management
- System statistics
- Application reviews
- Content management

## 🚀 Production Deployment

### Environment Variables
```bash
# Production .env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1/
```

### Build Commands
```bash
# Frontend
npm run build

# Backend
uv run manage.py collectstatic
uv run manage.py migrate
```

## 📈 Performance Notes

- **API Calls**: Optimized with Promise.allSettled for parallel requests
- **Caching**: JWT tokens cached in localStorage
- **Error Recovery**: Automatic retry on network failures
- **Loading UX**: Skeleton states during data fetch

## 🔗 Related Documentation

- [Complete Integration Guide](./frontend-backend-integration.md)
- [Backend Implementation](./backend-implementation.md)
- [API Reference](./api-reference.md)
- [Deployment Guide](./deployment-guide.md)

---

**Status**: ✅ Integration Complete  
**Last Updated**: September 13, 2025  
**Next Steps**: Advanced features (file upload, real-time notifications)