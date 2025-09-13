from django.contrib import admin

from django.contrib import admin
from .models import AdmissionApplication

@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for AdmissionApplication"""
    
    list_display = [
        'applicant_name', 'course_applied', 'email', 'status', 
        'application_date', 'reviewed_by'
    ]
    list_filter = ['status', 'course_applied', 'application_date']
    search_fields = ['applicant_name', 'email', 'phone_number']
    readonly_fields = ['application_date']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('applicant_name', 'date_of_birth', 'email', 'phone_number', 'address')
        }),
        ('Academic Information', {
            'fields': ('course_applied', 'previous_school', 'last_percentage')
        }),
        ('Application Status', {
            'fields': ('status', 'review_comments', 'reviewed_by', 'review_date')
        }),
        ('Documents', {
            'fields': ('documents',)
        }),
    )
