from django.shortcuts import render
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import School
from users.models import User, StudentProfile, StaffProfile

User = get_user_model()


class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for School model - read only for now"""
    queryset = School.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from .serializers import SchoolSerializer
        return SchoolSerializer


class SchoolStatsAPIView(APIView):
    """API view to get school statistics for the logged-in admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get the school for this admin user
        try:
            if user.role == 'Management' and user.school:
                school = user.school
            else:
                return Response({
                    'error': 'Access denied. Only Management users with assigned schools can access this data.'
                }, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            return Response({
                'error': 'User has no school assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get counts for this specific school
        total_students = StudentProfile.objects.filter(school=school, is_active=True).count()
        
        # For staff, we need to check the role field which might be in the User model
        # Let's get teachers, staff, and wardens based on user role
        total_teachers = User.objects.filter(school=school, role='Teacher', is_active=True).count()
        total_staff = User.objects.filter(school=school, role='Staff', is_active=True).count()
        total_wardens = User.objects.filter(school=school, role='Warden', is_active=True).count()
        
        # Count active parents (users with role 'Parent' and active students)
        active_parents = User.objects.filter(
            role='Parent',
            school=school,
            is_active=True
        ).count()
        
        # Count total classes (unique course/class combinations)
        total_classes = StudentProfile.objects.filter(
            school=school,
            is_active=True
        ).values('course').distinct().count()
        
        # Get current semester/session info
        current_semester = "Academic Session 2024-25"
        
        stats = {
            'totalStudents': total_students,
            'totalTeachers': total_teachers,
            'totalStaff': total_staff,
            'totalWardens': total_wardens,
            'activeParents': active_parents,
            'totalClasses': total_classes,
            'currentSemester': current_semester,
            'school': {
                'name': school.school_name,
                'code': school.school_code,
                'email': school.contact_email or school.get_admin_email(),
                'phone': school.contact_phone or 'Not provided',
                'address': school.address or f"{school.village}, {school.block}, {school.district}"
            }
        }
        
        return Response(stats)


class SchoolDashboardAPIView(APIView):
    """API view to get comprehensive school dashboard data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get the school for this admin user
        try:
            if user.role == 'Management' and user.school:
                school = user.school
            else:
                return Response({
                    'error': 'Access denied. Only Management users with assigned schools can access this data.'
                }, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            return Response({
                'error': 'User has no school assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all students for this school
        students = StudentProfile.objects.filter(school=school, is_active=True).select_related('user')
        students_data = []
        for student in students:
            students_data.append({
                'id': student.id,
                'admission_number': student.admission_number,
                'user': {
                    'first_name': student.user.first_name if student.user else student.first_name,
                    'last_name': student.user.last_name if student.user else student.last_name,
                    'email': student.user.email if student.user else f"student.{student.admission_number}@{student.school.school_code[-5:]}.rj",
                } if student.user or (student.first_name and student.last_name) else None,
                'course': student.course,
                'batch': getattr(student, 'batch', student.semester),
                'status': 'active' if student.is_active else 'inactive'
            })
        
        # Get all teachers for this school
        teachers = User.objects.filter(school=school, role='Teacher', is_active=True)
        teachers_data = []
        for teacher in teachers:
            # Try to get staff profile if it exists
            staff_profile = getattr(teacher, 'staff_profile', None)
            teachers_data.append({
                'id': teacher.id,
                'user': {
                    'first_name': teacher.first_name,
                    'last_name': teacher.last_name,
                    'email': teacher.email,
                },
                'department': staff_profile.department if staff_profile else 'Not specified',
                'designation': staff_profile.designation if staff_profile else 'Teacher',
                'experience_years': getattr(staff_profile, 'experience_years', 0) if staff_profile else 0,
                'status': 'active' if teacher.is_active else 'inactive'
            })
        
        # Get all staff for this school
        staff_users = User.objects.filter(school=school, role='Staff', is_active=True)
        staff_data = []
        for staff_user in staff_users:
            # Try to get staff profile if it exists
            staff_profile = getattr(staff_user, 'staff_profile', None)
            staff_data.append({
                'id': staff_user.id,
                'user': {
                    'first_name': staff_user.first_name,
                    'last_name': staff_user.last_name,
                    'email': staff_user.email,
                },
                'department': staff_profile.department if staff_profile else 'Not specified',
                'designation': staff_profile.designation if staff_profile else 'Staff',
                'status': 'active' if staff_user.is_active else 'inactive'
            })
        
        # Get all users for this school
        users = User.objects.filter(school=school, is_active=True)
        users_data = []
        for user_obj in users:
            users_data.append({
                'id': user_obj.id,
                'first_name': user_obj.first_name,
                'last_name': user_obj.last_name,
                'email': user_obj.email,
                'role': user_obj.role,
                'is_active': user_obj.is_active,
                'created_at': user_obj.date_joined.isoformat() if user_obj.date_joined else None,
            })
        
        dashboard_data = {
            'students': students_data,
            'teachers': teachers_data,
            'staff': staff_data,
            'users': users_data,
            'fees': [],  # Will be populated when fees app is connected
            'attendance': [],  # Will be populated when attendance is connected
            'exams': [],  # Will be populated when exams are connected
        }
        
        return Response(dashboard_data)
