from django.db import models
from django.utils import timezone
import uuid
import random
import string
from datetime import timedelta

from django.db import models
from django.conf import settings

def generate_reference_id():
    """Generate a unique reference ID for admission applications"""
    # Format: ADM-YYYY-XXXXXX (e.g., ADM-2025-A1B2C3)
    year = str(timezone.now().year)
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ADM-{year}-{random_part}"

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

class EmailVerification(models.Model):
    """Model for email OTP verification before admission submission"""
    
    email = models.EmailField(db_index=True)
    otp = models.CharField(max_length=6, default=generate_otp)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveIntegerField(default=0)
    
    class Meta:
        indexes = [
            models.Index(fields=['email', 'is_verified']),
            models.Index(fields=['email', 'expires_at']),
        ]
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        """Set expiration time if not set"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)  # OTP expires in 10 minutes
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if OTP has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self, otp_input):
        """Check if provided OTP is valid"""
        return (
            self.otp == otp_input and 
            not self.is_expired() and 
            not self.is_verified and
            self.attempts < 3  # Max 3 attempts
        )
    
    def verify(self, otp_input):
        """Verify the OTP and mark as verified if correct"""
        self.attempts += 1
        
        if self.is_valid(otp_input):
            self.is_verified = True
            self.verified_at = timezone.now()
            self.save()
            return True
        else:
            self.save()  # Save the incremented attempts
            return False
    
    def __str__(self):
        status = "Verified" if self.is_verified else "Pending"
        return f"OTP for {self.email} - {status} ({self.otp})"

class AdmissionApplication(models.Model):
    """Model for admission applications"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    # Reference ID for tracking
    reference_id = models.CharField(max_length=20, unique=True, blank=True, db_index=True)
    
    # Email verification (required before submission)
    email_verification = models.ForeignKey(EmailVerification, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    
    # School Preferences (First, Second, Third choice)
    first_preference_school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='first_preference_applications', null=True, blank=True)
    second_preference_school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='second_preference_applications', null=True, blank=True)
    third_preference_school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='third_preference_applications', null=True, blank=True)
    
    # Personal Information
    applicant_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    
    # Academic Information
    course_applied = models.CharField(max_length=100)
    previous_school = models.CharField(max_length=200, blank=True)
    last_percentage = models.FloatField(blank=True, null=True)
    
    # Application Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    application_date = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_applications'
    )
    review_date = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True)
    
    # Documents (JSON field to store document paths)
    documents = models.JSONField(default=dict, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['reference_id']),
            models.Index(fields=['first_preference_school', 'status']),
            models.Index(fields=['first_preference_school', 'application_date']),
            models.Index(fields=['course_applied', 'status']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to generate reference ID if not present"""
        if not self.reference_id:
            self.reference_id = generate_reference_id()
            # Ensure uniqueness
            while AdmissionApplication.objects.filter(reference_id=self.reference_id).exists():
                self.reference_id = generate_reference_id()
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create school decisions for new applications
        if is_new:
            self.create_school_decisions()
    
    def create_school_decisions(self):
        """Create SchoolAdmissionDecision entries for each school preference"""
        decisions_to_create = []
        
        if self.first_preference_school:
            decisions_to_create.append(
                SchoolAdmissionDecision(
                    application=self,
                    school=self.first_preference_school,
                    preference_order='1st'
                )
            )
        
        if self.second_preference_school:
            decisions_to_create.append(
                SchoolAdmissionDecision(
                    application=self,
                    school=self.second_preference_school,
                    preference_order='2nd'
                )
            )
        
        if self.third_preference_school:
            decisions_to_create.append(
                SchoolAdmissionDecision(
                    application=self,
                    school=self.third_preference_school,
                    preference_order='3rd'
                )
            )
        
        SchoolAdmissionDecision.objects.bulk_create(decisions_to_create, ignore_conflicts=True)
    
    def __str__(self):
        first_school = self.first_preference_school.school_name if self.first_preference_school else "No School"
        return f"{self.applicant_name} - {self.course_applied} ({self.status}) [{first_school}] - {self.reference_id}"
    
    def get_school_preferences(self):
        """Get list of school preferences in order"""
        preferences = []
        if self.first_preference_school:
            preferences.append(('1st', self.first_preference_school))
        if self.second_preference_school:
            preferences.append(('2nd', self.second_preference_school))
        if self.third_preference_school:
            preferences.append(('3rd', self.third_preference_school))
        return preferences


class SchoolAdmissionDecision(models.Model):
    """Model to track individual school decisions for each application"""
    
    DECISION_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    ]
    
    application = models.ForeignKey(AdmissionApplication, on_delete=models.CASCADE, related_name='school_decisions')
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='admission_decisions')
    preference_order = models.CharField(max_length=10, choices=[('1st', 'First'), ('2nd', 'Second'), ('3rd', 'Third')])
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES, default='pending')
    decision_date = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='school_admission_decisions'
    )
    review_comments = models.TextField(blank=True)
    is_student_choice = models.BooleanField(default=False)  # True if student chose this school among accepted ones
    student_choice_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['application', 'school']
        indexes = [
            models.Index(fields=['school', 'decision']),
            models.Index(fields=['application', 'decision']),
            models.Index(fields=['decision', 'decision_date']),
        ]
        ordering = ['preference_order', '-decision_date']
    
    def save(self, *args, **kwargs):
        """Set decision date when decision is made"""
        if self.decision != 'pending' and not self.decision_date:
            self.decision_date = timezone.now()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.application.applicant_name} - {self.school.school_name} ({self.decision})"
