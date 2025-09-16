# Acharya ERP Testing Guide

## Overview
This guide covers comprehensive testing strategies for the Acharya ERP system, including unit tests, integration tests, API tests, and end-to-end testing.

## Testing Framework Overview

### Backend Testing (Django)
- **Framework**: Django TestCase, pytest
- **Database**: SQLite (test database)
- **Coverage**: pytest-cov
- **Mocking**: unittest.mock, pytest-mock

### Frontend Testing (React)
- **Framework**: Vitest, React Testing Library
- **Coverage**: Built-in with Vitest
- **Mocking**: MSW (Mock Service Worker)
- **E2E**: Playwright

## Backend Testing

### Setup and Configuration

#### Test Dependencies
```toml
# pyproject.toml
[tool.uv.dev-dependencies]
pytest = ">=7.0.0"
pytest-django = ">=4.5.0"
pytest-cov = ">=4.0.0"
pytest-mock = ">=3.10.0"
factory-boy = ">=3.2.0"
faker = ">=18.0.0"
```

#### Test Settings
```python
# config/test_settings.py
from .settings import *

# Test database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Test email backend
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable logging in tests
LOGGING_CONFIG = None

# Fast password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
```

#### Pytest Configuration
```ini
# pytest.ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = config.test_settings
python_files = tests.py test_*.py *_tests.py
addopts = --tb=short --strict-markers --disable-warnings
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

### Model Testing

#### Test Factories
```python
# tests/factories.py
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from admissions.models import Admission, School
from students.models import Student

User = get_user_model()

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

class SchoolFactory(DjangoModelFactory):
    class Meta:
        model = School
    
    name = factory.Faker('company')
    code = factory.Sequence(lambda n: f"SCH{n:03d}")
    address = factory.Faker('address')
    phone = factory.Faker('phone_number')
    email = factory.Faker('email')

class StudentFactory(DjangoModelFactory):
    class Meta:
        model = Student
    
    user = factory.SubFactory(UserFactory)
    student_id = factory.Sequence(lambda n: f"STU{n:06d}")
    date_of_birth = factory.Faker('date_of_birth', minimum_age=15, maximum_age=25)
    phone = factory.Faker('phone_number')
    address = factory.Faker('address')

class AdmissionFactory(DjangoModelFactory):
    class Meta:
        model = Admission
    
    student = factory.SubFactory(StudentFactory)
    school = factory.SubFactory(SchoolFactory)
    application_date = factory.Faker('date_this_year')
    status = 'pending'
    academic_year = factory.Faker('year')
    grade_level = factory.Faker('random_element', elements=['9', '10', '11', '12'])
```

#### Model Tests Example
```python
# admissions/tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from admissions.models import Admission
from tests.factories import AdmissionFactory, StudentFactory, SchoolFactory

@pytest.mark.django_db
class TestAdmissionModel:
    
    def test_admission_creation(self):
        """Test basic admission creation"""
        admission = AdmissionFactory()
        assert admission.id is not None
        assert admission.status == 'pending'
        assert admission.reference_id is not None
    
    def test_admission_reference_id_unique(self):
        """Test that reference IDs are unique"""
        admission1 = AdmissionFactory()
        admission2 = AdmissionFactory()
        assert admission1.reference_id != admission2.reference_id
    
    def test_admission_status_choices(self):
        """Test admission status validation"""
        admission = AdmissionFactory()
        admission.status = 'invalid_status'
        with pytest.raises(ValidationError):
            admission.full_clean()
    
    def test_admission_str_representation(self):
        """Test string representation"""
        admission = AdmissionFactory()
        expected = f"{admission.student.user.get_full_name()} - {admission.school.name}"
        assert str(admission) == expected
    
    def test_duplicate_admission_same_student_school(self):
        """Test that a student cannot apply twice to the same school"""
        student = StudentFactory()
        school = SchoolFactory()
        
        AdmissionFactory(student=student, school=school)
        
        with pytest.raises(IntegrityError):
            AdmissionFactory(student=student, school=school)
    
    def test_admission_ordering(self):
        """Test admission ordering by application date"""
        admission1 = AdmissionFactory()
        admission2 = AdmissionFactory()
        
        admissions = Admission.objects.all()
        assert admissions[0].application_date <= admissions[1].application_date
```

### API Testing

#### API Test Example
```python
# admissions/tests/test_api.py
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from tests.factories import UserFactory, AdmissionFactory, SchoolFactory

@pytest.mark.django_db
class TestAdmissionAPI:
    
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory(role='school_admin')
        self.school = SchoolFactory()
        self.user.schools.add(self.school)
        self.client.force_authenticate(user=self.user)
    
    def test_get_school_admissions(self):
        """Test retrieving admissions for a school"""
        # Create admissions for this school
        admission1 = AdmissionFactory(school=self.school)
        admission2 = AdmissionFactory(school=self.school)
        
        # Create admission for different school
        other_school = SchoolFactory()
        AdmissionFactory(school=other_school)
        
        url = reverse('school-admission-review')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
        
        # Verify only this school's admissions are returned
        admission_ids = [item['id'] for item in response.data['results']]
        assert admission1.id in admission_ids
        assert admission2.id in admission_ids
    
    def test_update_admission_status(self):
        """Test updating admission status"""
        admission = AdmissionFactory(school=self.school, status='pending')
        
        url = reverse('admission-detail', kwargs={'pk': admission.id})
        data = {'status': 'accepted'}
        response = self.client.patch(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == 'accepted'
    
    def test_unauthorized_access(self):
        """Test unauthorized access to school admissions"""
        self.client.force_authenticate(user=None)
        
        url = reverse('school-admission-review')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_access_different_school_admissions(self):
        """Test that admin cannot access other school's admissions"""
        other_school = SchoolFactory()
        AdmissionFactory(school=other_school)
        
        url = reverse('school-admission-review')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0
    
    @pytest.mark.parametrize('status_value', ['accepted', 'rejected', 'waitlisted'])
    def test_valid_status_updates(self, status_value):
        """Test all valid status updates"""
        admission = AdmissionFactory(school=self.school, status='pending')
        
        url = reverse('admission-detail', kwargs={'pk': admission.id})
        data = {'status': status_value}
        response = self.client.patch(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        admission.refresh_from_db()
        assert admission.status == status_value
```

### Service Layer Testing

```python
# admissions/tests/test_services.py
import pytest
from unittest.mock import patch, Mock
from admissions.services import AdmissionService, EmailService
from tests.factories import AdmissionFactory

@pytest.mark.django_db
class TestAdmissionService:
    
    def setup_method(self):
        self.service = AdmissionService()
    
    def test_create_admission_success(self):
        """Test successful admission creation"""
        data = {
            'student_id': 1,
            'school_id': 1,
            'grade_level': '10',
            'academic_year': '2024'
        }
        
        with patch.object(self.service, '_validate_admission_data') as mock_validate:
            mock_validate.return_value = True
            admission = self.service.create_admission(data)
            
            assert admission.id is not None
            assert admission.status == 'pending'
            mock_validate.assert_called_once_with(data)
    
    @patch('admissions.services.send_mail')
    def test_send_admission_confirmation(self, mock_send_mail):
        """Test admission confirmation email"""
        admission = AdmissionFactory()
        email_service = EmailService()
        
        email_service.send_admission_confirmation(admission)
        
        mock_send_mail.assert_called_once()
        args, kwargs = mock_send_mail.call_args
        assert admission.student.user.email in args
        assert 'Admission Application Received' in args[1]
```

## Frontend Testing

### Setup and Configuration

#### Test Dependencies
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "@types/jest": "^29.5.0",
    "jsdom": "^21.1.1",
    "msw": "^1.2.1",
    "vitest": "^0.30.1"
  }
}
```

#### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

#### Test Setup
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Enable API mocking
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Mock Service Worker Setup

```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // Auth handlers
  rest.post('/api/v1/auth/login/', (req, res, ctx) => {
    return res(
      ctx.json({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          email: 'admin@test.com',
          role: 'school_admin'
        }
      })
    )
  }),

  // Admissions handlers
  rest.get('/api/v1/admissions/school-review/', (req, res, ctx) => {
    return res(
      ctx.json({
        count: 2,
        results: [
          {
            id: 1,
            student: {
              user: { first_name: 'John', last_name: 'Doe' },
              student_id: 'STU001'
            },
            school: { name: 'Test School' },
            status: 'pending',
            application_date: '2024-01-15',
            reference_id: 'REF001'
          },
          {
            id: 2,
            student: {
              user: { first_name: 'Jane', last_name: 'Smith' },
              student_id: 'STU002'
            },
            school: { name: 'Test School' },
            status: 'pending',
            application_date: '2024-01-16',
            reference_id: 'REF002'
          }
        ]
      })
    )
  }),

  rest.patch('/api/v1/admissions/:id/', (req, res, ctx) => {
    return res(ctx.json({ id: 1, status: 'accepted' }))
  })
]
```

```typescript
// src/tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### Component Testing

```typescript
// src/components/Admission/Admission.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Admission from './Admission'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Admission Component', () => {
  it('renders admission form correctly', () => {
    render(<Admission />, { wrapper: createWrapper() })
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<Admission />, { wrapper: createWrapper() })
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<Admission />, { wrapper: createWrapper() })
    
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@test.com')
    
    const submitButton = screen.getByRole('button', { name: /submit application/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/application submitted successfully/i)).toBeInTheDocument()
    })
  })
})
```

### Hook Testing

```typescript
// src/hooks/useAdmissions.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdmissions } from './useAdmissions'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAdmissions Hook', () => {
  it('fetches admissions successfully', async () => {
    const { result } = renderHook(() => useAdmissions(), {
      wrapper: createWrapper()
    })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toHaveLength(2)
      expect(result.current.data[0]).toHaveProperty('reference_id', 'REF001')
    })
  })

  it('handles loading state', () => {
    const { result } = renderHook(() => useAdmissions(), {
      wrapper: createWrapper()
    })
    
    expect(result.current.isLoading).toBe(true)
  })
})
```

### Utils Testing

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, validateEmail, cn } from './utils'

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('Jan 15, 2024')
    })

    it('handles string dates', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('cn (className utility)', () => {
    it('combines classes correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })
  })
})
```

## Integration Testing

### Database Integration Tests

```python
# tests/integration/test_admission_workflow.py
import pytest
from django.test import TransactionTestCase
from django.core import mail
from admissions.models import Admission
from tests.factories import StudentFactory, SchoolFactory

@pytest.mark.integration
class TestAdmissionWorkflow(TransactionTestCase):
    
    def setUp(self):
        self.student = StudentFactory()
        self.school = SchoolFactory()
    
    def test_complete_admission_workflow(self):
        """Test complete admission workflow from application to acceptance"""
        # Step 1: Student applies
        admission = Admission.objects.create(
            student=self.student,
            school=self.school,
            grade_level='10',
            academic_year='2024'
        )
        
        assert admission.status == 'pending'
        assert admission.reference_id is not None
        
        # Step 2: Email confirmation sent
        assert len(mail.outbox) == 1
        assert self.student.user.email in mail.outbox[0].to
        
        # Step 3: School admin reviews and accepts
        admission.status = 'accepted'
        admission.save()
        
        # Step 4: Acceptance email sent
        assert len(mail.outbox) == 2
        assert 'accepted' in mail.outbox[1].subject.lower()
        
        # Step 5: Verify final state
        admission.refresh_from_db()
        assert admission.status == 'accepted'
```

## End-to-End Testing

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/admission-workflow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('student can submit admission application', async ({ page }) => {
    // Navigate to admission form
    await page.click('text=Apply for Admission')
    
    // Fill out form
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@test.com')
    await page.fill('[name="phone"]', '1234567890')
    await page.fill('[name="dateOfBirth"]', '2005-06-15')
    
    // Select school preferences
    await page.selectOption('[name="firstChoice"]', 'School A')
    await page.selectOption('[name="secondChoice"]', 'School B')
    await page.selectOption('[name="thirdChoice"]', 'School C')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('text=Application submitted successfully')).toBeVisible()
    await expect(page.locator('text=Reference ID:')).toBeVisible()
  })

  test('admin can review and approve admission', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'testpass123')
    await page.click('button[type="submit"]')
    
    // Navigate to review admissions
    await page.click('text=Review Admissions')
    
    // Verify admissions list
    await expect(page.locator('.admission-card')).toHaveCount.greaterThan(0)
    
    // Approve first admission
    await page.click('.admission-card:first-child .approve-button')
    
    // Verify status update
    await expect(page.locator('.admission-card:first-child .status')).toContainText('Accepted')
  })
})
```

## Performance Testing

### Load Testing with Locust

```python
# locustfile.py
from locust import HttpUser, task, between

class AdmissionUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/v1/auth/login/", {
            "email": "admin@test.com",
            "password": "testpass123"
        })
        self.token = response.json()["access"]
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    @task(3)
    def view_admissions(self):
        self.client.get("/api/v1/admissions/school-review/")
    
    @task(2)
    def view_dashboard(self):
        self.client.get("/api/v1/schools/dashboard/")
    
    @task(1)
    def update_admission(self):
        self.client.patch("/api/v1/admissions/1/", {
            "status": "accepted"
        })
```

## Test Automation and CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install UV
      run: curl -LsSf https://astral.sh/uv/install.sh | sh
    
    - name: Install dependencies
      run: |
        cd backend
        uv sync
    
    - name: Run tests
      run: |
        cd backend
        uv run pytest --cov=. --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run tests
      run: |
        cd frontend
        npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./frontend/coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        npx playwright install
    
    - name: Start backend
      run: |
        cd backend
        uv sync
        uv run python manage.py migrate
        uv run python manage.py runserver &
    
    - name: Run E2E tests
      run: |
        cd frontend
        npm run build
        npm run preview &
        npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: frontend/playwright-report/
```

## Test Coverage and Quality

### Coverage Configuration

```python
# .coveragerc
[run]
source = .
omit = 
    */migrations/*
    */venv/*
    */env/*
    manage.py
    */settings/*
    */tests/*
    */test_*.py
    */__pycache__/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 22.12.0
    hooks:
      - id: black
        files: ^backend/

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        files: ^backend/

  - repo: local
    hooks:
      - id: backend-tests
        name: Backend Tests
        entry: bash -c 'cd backend && uv run pytest'
        language: system
        files: ^backend/
        pass_filenames: false

      - id: frontend-tests
        name: Frontend Tests
        entry: bash -c 'cd frontend && npm run test:ci'
        language: system
        files: ^frontend/
        pass_filenames: false
```

## Test Data Management

### Test Data Fixtures

```python
# tests/fixtures/sample_data.py
import pytest
from tests.factories import (
    UserFactory, SchoolFactory, StudentFactory, 
    AdmissionFactory
)

@pytest.fixture
def sample_users():
    return {
        'admin': UserFactory(role='admin'),
        'school_admin': UserFactory(role='school_admin'),
        'student': UserFactory(role='student'),
        'parent': UserFactory(role='parent')
    }

@pytest.fixture
def sample_schools():
    return [
        SchoolFactory(name='Acharya School A'),
        SchoolFactory(name='Acharya School B'),
        SchoolFactory(name='Acharya School C')
    ]

@pytest.fixture
def sample_admissions(sample_schools):
    admissions = []
    for school in sample_schools:
        for _ in range(3):
            admissions.append(AdmissionFactory(school=school))
    return admissions
```

### Database Cleanup

```python
# conftest.py
import pytest
from django.core.management import call_command

@pytest.fixture(scope='session')
def django_db_setup():
    from django.conf import settings
    from django.test.utils import setup_test_environment, teardown_test_environment
    
    setup_test_environment()
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:'
    }
    call_command('migrate', '--run-syncdb')
    yield
    teardown_test_environment()

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Give all tests access to the database."""
    pass
```

This comprehensive testing guide provides a solid foundation for ensuring the quality and reliability of the Acharya ERP system across all layers of the application.