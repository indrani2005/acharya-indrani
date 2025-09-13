from django.contrib import admin

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, ParentProfile, StaffProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone_number')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'role', 'phone_number')
        }),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    """Admin configuration for StudentProfile"""
    
    list_display = ['admission_number', 'user', 'course', 'semester', 'is_hostelite']
    list_filter = ['course', 'semester', 'is_hostelite']
    search_fields = ['admission_number', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['admission_number']


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ParentProfile"""
    
    list_display = ['user', 'occupation', 'children_count']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    filter_horizontal = ['children']
    
    def children_count(self, obj):
        return obj.children.count()
    children_count.short_description = 'Number of Children'


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    """Admin configuration for StaffProfile"""
    
    list_display = ['employee_id', 'user', 'department', 'designation', 'experience_years']
    list_filter = ['department', 'designation']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['employee_id']
