from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model with role-based access and school association"""
    
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
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    class Meta:
        indexes = [
            models.Index(fields=['school', 'role']),
            models.Index(fields=['email', 'school']),
        ]
    
    def __str__(self):
        school_name = self.school.school_name if self.school else "No School"
        return f"{self.email} ({self.get_role_display()}) - {school_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def generate_email_from_school(self):
        """Generate email based on role and school"""
        if not self.school:
            return None
            
        if self.role == 'admin':
            return self.school.get_admin_email()
        elif self.role == 'student' and hasattr(self, 'student_profile'):
            return self.school.get_student_email(self.student_profile.admission_number)
        elif self.role in ['faculty', 'warden'] and hasattr(self, 'staff_profile'):
            return self.school.get_staff_email(self.staff_profile.designation, self.staff_profile.employee_id)
        
        # Fallback for other roles
        return f"{self.role}@{self.school.school_code[-5:]}.rj"
    
    def update_email_format(self):
        """Update user email to new format"""
        new_email = self.generate_email_from_school()
        if new_email and new_email != self.email:
            self.email = new_email
            self.save(update_fields=['email'])
            return True
        return False


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
    
    def can_login_with_credentials(self, registration_number, phone_number):
        """
        Check if parent can login with student registration number and phone number
        Parent login format: student registration number + phone number + OTP
        """
        # Check if any child has this registration number
        child_with_reg = self.children.filter(admission_number=registration_number).first()
        if not child_with_reg:
            return False
            
        # Check if phone number matches user's phone or emergency contact
        if (self.user.phone_number == phone_number or 
            any(child.emergency_contact == phone_number for child in self.children.all())):
            return True
            
        return False
    
    def generate_otp_login_id(self):
        """Generate unique login ID for parent OTP system"""
        import hashlib
        import time
        # Create unique ID based on user ID and timestamp
        unique_string = f"{self.user.id}_{int(time.time())}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:8]


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
