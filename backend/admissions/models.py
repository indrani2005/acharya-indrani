from django.db import models

from django.db import models
from django.conf import settings

class AdmissionApplication(models.Model):
    """Model for admission applications"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
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
    
    def __str__(self):
        return f"{self.applicant_name} - {self.course_applied} ({self.status})"
