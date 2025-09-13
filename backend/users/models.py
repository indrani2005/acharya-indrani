from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model with role-based access"""
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('parent', 'Parent'),
        ('faculty', 'Faculty'),
        ('warden', 'Warden'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class StudentProfile(models.Model):
    """Extended profile for students"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    admission_number = models.CharField(max_length=20, unique=True)
    roll_number = models.CharField(max_length=20)
    course = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    semester = models.IntegerField()
    date_of_birth = models.DateField()
    address = models.TextField()
    emergency_contact = models.CharField(max_length=15)
    is_hostelite = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.full_name} - {self.admission_number}"


class ParentProfile(models.Model):
    """Extended profile for parents"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    children = models.ManyToManyField(StudentProfile, related_name='parents')
    occupation = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    
    def __str__(self):
        return f"{self.user.full_name} - Parent"


class StaffProfile(models.Model):
    """Extended profile for staff (Faculty, Warden, Admin)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    qualification = models.TextField(blank=True)
    experience_years = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.full_name} - {self.employee_id}"
