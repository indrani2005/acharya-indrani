from django.contrib import admin

from django.contrib import admin
from .models import AdmissionApplication, EmailVerification

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """Admin configuration for EmailVerification"""
    
    list_display = [
        'email', 'otp', 'is_verified', 'created_at', 'verified_at', 'expires_at', 'attempts'
    ]
    list_filter = ['is_verified', 'created_at', 'expires_at']
    search_fields = ['email']
    readonly_fields = ['created_at', 'verified_at', 'otp', 'attempts']
    
    fieldsets = (
        ('Email Verification', {
            'fields': ('email', 'otp', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'verified_at', 'expires_at')
        }),
        ('Security', {
            'fields': ('attempts',)
        }),
    )


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for AdmissionApplication"""
    
    list_display = [
        'reference_id', 'applicant_name', 'course_applied', 'first_preference_school', 
        'email', 'status', 'application_date', 'reviewed_by'
    ]
    list_filter = ['status', 'course_applied', 'first_preference_school', 'application_date']
    search_fields = [
        'reference_id', 'applicant_name', 'email', 'phone_number', 
        'first_preference_school__school_name', 'second_preference_school__school_name', 
        'third_preference_school__school_name'
    ]
    readonly_fields = ['application_date', 'email_verification']
    
    fieldsets = (
        ('Application Reference', {
            'fields': ('reference_id',)
        }),
        ('Email Verification', {
            'fields': ('email_verification',)
        }),
        ('Personal Information', {
            'fields': ('applicant_name', 'date_of_birth', 'email', 'phone_number', 'address')
        }),
        ('Academic Information', {
            'fields': ('course_applied', 'previous_school', 'last_percentage')
        }),
        ('School Preferences', {
            'fields': ('first_preference_school', 'second_preference_school', 'third_preference_school')
        }),
        ('Application Status', {
            'fields': ('status', 'review_comments', 'reviewed_by', 'review_date')
        }),
        ('Documents', {
            'fields': ('documents',)
        }),
    )
