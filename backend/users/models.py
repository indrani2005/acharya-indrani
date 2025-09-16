from django.db import models

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model with role-based access and school association"""
    
    ROLE_CHOICES = [
        ('student', 'Student'),
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    first_name = models.CharField(max_length=30, null=True, blank=True)
    last_name = models.CharField(max_length=30, null=True, blank=True)
    admission_number = models.CharField(max_length=20, blank=True)
    roll_number = models.CharField(max_length=20)
    course = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    semester = models.IntegerField()
    date_of_birth = models.DateField()
    address = models.TextField()
    emergency_contact = models.CharField(max_length=15)
    is_hostelite = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False, help_text="When activated, a user account will be created")
    
    class Meta:
        indexes = [
            models.Index(fields=['school', 'admission_number']),
            models.Index(fields=['school', 'is_active']),
        ]
    
    def save(self, *args, **kwargs):
        """Auto-generate admission number if not provided"""
        if not self.admission_number:
            from django.db import transaction
            with transaction.atomic():
                self.admission_number = self.generate_admission_number()
                super().save(*args, **kwargs)
        else:
            super().save(*args, **kwargs)
    
    def generate_admission_number(self):
        """Generate a 5-digit admission number starting from 10001"""
        from django.db import transaction
        
        with transaction.atomic():
            # Get all existing 5-digit numeric admission numbers
            if self.school:
                existing_numbers = StudentProfile.objects.select_for_update().filter(
                    school=self.school,
                    admission_number__regex=r'^\d{5}$'
                ).values_list('admission_number', flat=True)
            else:
                existing_numbers = StudentProfile.objects.select_for_update().filter(
                    admission_number__regex=r'^\d{5}$'
                ).values_list('admission_number', flat=True)
            
            # Convert to integers and find the maximum
            if existing_numbers:
                numeric_numbers = [int(num) for num in existing_numbers if num.isdigit() and len(num) == 5]
                if numeric_numbers:
                    # Filter out numbers >= 90000 (manual entries) and focus on auto-generated ones
                    auto_numbers = [num for num in numeric_numbers if 10001 <= num < 90000]
                    if auto_numbers:
                        next_number = max(auto_numbers) + 1
                    else:
                        next_number = 10001
                else:
                    next_number = 10001
            else:
                next_number = 10001
            
            # Ensure we stay in the auto-generated range
            if next_number >= 90000:
                next_number = 10001  # Reset if we reach manual range
                
            return str(next_number).zfill(5)
    
    def __str__(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip() or f"Student {self.admission_number}"
        school_name = self.school.school_name if self.school else "No School"
        return f"{name} - {self.admission_number} ({school_name})"
    
    @property
    def full_name(self):
        """Get student's full name"""
        return f"{self.first_name or ''} {self.last_name or ''}".strip() or f"Student {self.admission_number}"
    
    def generate_student_credentials(self):
        """Generate email and password for student activation"""
        if not self.school:
            raise ValueError("Student must be linked to a school before activation")
        
        # Get last 5 digits of school code
        school_code_last5 = self.school.school_code[-5:] if len(self.school.school_code) >= 5 else self.school.school_code
        
        # Generate email using format: student.admission_number@last5digits.rj.gov.in
        email = f"student.{self.admission_number}@{school_code_last5}.rj.gov.in"
        
        # Generate password using format: admission_number#last5digits
        password = f"{self.admission_number}#{school_code_last5}"
        
        return email, password


class ParentProfile(models.Model):
    """Parent profile linked to students - no separate user account needed"""
    first_name = models.CharField(max_length=30, null=True, blank=True)
    last_name = models.CharField(max_length=30, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    relationship = models.CharField(max_length=20, choices=[
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('guardian', 'Guardian'),
    ], null=True, blank=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='parents', null=True, blank=True)
    is_primary_contact = models.BooleanField(default=False, help_text="Primary contact for school communications")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['student', 'is_primary_contact']),
            models.Index(fields=['phone_number']),
        ]
    
    def __str__(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip() or "Unknown Parent"
        student_name = self.student.full_name if self.student else "No Student"
        relationship = self.get_relationship_display() if self.relationship else "Unknown Relation"
        return f"{name} ({relationship}) - {student_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip() or "Unknown Parent"
    
    def can_access_student_data(self, student_profile):
        """Check if this parent can access data for the given student"""
        return self.student == student_profile
    
    def generate_otp_for_login(self):
        """Generate OTP for parent login using student admission number + parent phone"""
        import random
        otp = str(random.randint(100000, 999999))
        # In a real implementation, you'd send this OTP via SMS/email
        return otp


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
