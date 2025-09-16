# 🎓 Acharya Multi-School Management System

A comprehensive multi-school management system built with Django REST Framework (Backend) and React + TypeScript (Frontend).

## 🌟 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff, Student, Parent)
- Multi-school access management
- OTP verification support

### 📋 Admissions Management
- **Online Admission Form** - Multi-step form with document upload
- **Application Tracking** - Real-time status updates
- **Review System** - Admin approval/rejection workflow
- **Document Management** - Secure file upload and storage
- **Public Access** - No authentication required for form submission

### 🏫 School Management
- Multi-school support
- School-specific dashboards
- Administrative controls
- Performance metrics

### 👥 User Management
- Student, Staff, and Parent profiles
- Role-based permissions
- Account management
- Profile customization

### 💰 Fee Management
- Invoice generation
- Payment tracking
- Fee structure management
- Financial reporting

### 📊 Dashboard & Analytics
- Real-time statistics
- Performance metrics
- Interactive charts
- Export capabilities

## � Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design, components, and data flow
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference and endpoints
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](docs/TESTING.md)** - Testing strategies and implementation

## �🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- UV package manager
- PostgreSQL (or SQLite for development)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Acharya/backend
```

2. **Install UV package manager**
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

3. **Install dependencies**
```bash
uv sync
```

4. **Environment setup**
```bash
# Copy environment file (create one if needed)
cp .env.example .env
# Edit .env with your configuration
```

5. **Database setup**
```bash
uv run python manage.py migrate
uv run python manage.py create_test_admin
uv run python manage.py create_test_applications --count 5
```

6. **Run development server**
```bash
uv run python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1/`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/`

## 🔗 API Documentation

### Base URLs
- **Backend API**: `http://localhost:8000/api/v1/`
- **Admin Panel**: `http://localhost:8000/admin/`
- **API Docs**: `http://localhost:8000/api/docs/`

### Key Endpoints

#### 🎓 Admissions
- `POST /api/v1/admissions/applications/` - Submit application (Public)
- `GET /api/v1/admissions/applications/` - List applications (Admin)
- `PATCH /api/v1/admissions/applications/{id}/review/` - Review application

#### 🔐 Authentication
- `POST /api/v1/users/auth/login/` - User login
- `POST /api/v1/users/auth/logout/` - User logout
- `POST /api/v1/users/auth/refresh/` - Refresh token

#### 🏫 Schools
- `GET /api/v1/schools/` - List schools
- `GET /api/v1/schools/{id}/dashboard/` - School dashboard

## 📁 Project Structure

```
Acharya/
├── backend/                    # Django Backend
│   ├── config/                # Django settings
│   ├── admissions/            # Admissions app
│   ├── users/                 # User management
│   ├── schools/               # School management
│   ├── fees/                  # Fee management
│   ├── attendance/            # Attendance tracking
│   ├── exams/                 # Exam management
│   ├── hostel/                # Hostel management
│   ├── library/               # Library management
│   ├── notifications/         # Notification system
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities and API
│   │   ├── hooks/            # Custom React hooks
│   │   └── integrations/     # External integrations
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
│
└── docs/                     # Documentation
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1/
VITE_APP_NAME=Acharya School Management
```

## 🎯 Admission Form Features

### Multi-Step Form Process
1. **Personal Details** - Name, DOB, contact information
2. **Document Upload** - Required certificates and photos
3. **Additional Information** - Previous school, academic records
4. **Review & Submit** - Terms acceptance and final submission

### Document Requirements
- Birth Certificate
- Previous School Report Card/Transfer Certificate
- Passport Size Photograph
- Address Proof (Aadhar/Utility Bill)
- Caste Certificate (if applicable)

### Supported File Formats
- PDF, JPG, JPEG, PNG
- Maximum 5MB per file
- Multiple file uploads supported

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **CORS Protection** for cross-origin requests
- **Input Validation** on all forms
- **File Upload Security** with type and size restrictions
- **Rate Limiting** on API endpoints
- **SQL Injection Protection** via Django ORM

## 🧪 Testing

For comprehensive testing information, see the [Testing Guide](docs/TESTING.md).

### Quick Test Commands

#### Backend Tests
```bash
cd backend
uv run pytest
```

#### Frontend Tests
```bash
cd frontend
npm run test
```

## 📊 Monitoring & Analytics

- Real-time application statistics
- User activity tracking
- Performance metrics
- Error logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [API Documentation](docs/API_DOCUMENTATION.md)
- Review the [Architecture Guide](docs/ARCHITECTURE.md)
- See the [Deployment Guide](docs/DEPLOYMENT.md)

## 🗺️ Roadmap

- [ ] Advanced reporting features
- [ ] Mobile application
- [ ] Integration with payment gateways
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS/Email notifications
- [ ] Student portal enhancements
- [ ] Parent portal features

---

Built with ❤️ using Django REST Framework and React + TypeScript
