from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from users.models import StudentProfile, StaffProfile, ParentProfile
from admissions.models import AdmissionApplication
from fees.models import FeeInvoice
from attendance.models import AttendanceRecord
from exams.models import Exam, ExamResult
from hostel.models import HostelAllocation
from library.models import BookBorrowRecord
from notifications.models import Notice


class DashboardStatsAPIView(APIView):
    """Get general dashboard statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get current user's school
        user_school = getattr(request.user, 'school', None)
        
        # Base filters for school-specific data
        school_filter = {'school': user_school} if user_school else {}
        
        # Get counts
        total_students = StudentProfile.objects.filter(**school_filter).count()
        total_staff = StaffProfile.objects.filter(**school_filter).count()
        total_parents = ParentProfile.objects.filter(**school_filter).count()
        
        # Applications this month
        current_month = timezone.now().replace(day=1)
        applications_this_month = AdmissionApplication.objects.filter(
            **school_filter,
            application_date__gte=current_month
        ).count()
        
        # Pending fees
        pending_fees = FeeInvoice.objects.filter(
            **school_filter,
            status='pending'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Recent notices
        recent_notices = Notice.objects.filter(
            **school_filter,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()

        return Response({
            'total_students': total_students,
            'total_staff': total_staff,
            'total_parents': total_parents,
            'applications_this_month': applications_this_month,
            'pending_fees': pending_fees,
            'recent_notices': recent_notices,
            'timestamp': timezone.now()
        })


class AdminDashboardAPIView(APIView):
    """Get admin-specific dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_school = getattr(request.user, 'school', None)
        school_filter = {'school': user_school} if user_school else {}
        
        # Student statistics
        students_data = {
            'total': StudentProfile.objects.filter(**school_filter).count(),
            'active': StudentProfile.objects.filter(**school_filter, user__is_active=True).count(),
            'new_this_month': StudentProfile.objects.filter(
                **school_filter,
                user__date_joined__gte=timezone.now().replace(day=1)
            ).count()
        }
        
        # Financial data
        fees_data = {
            'total_pending': FeeInvoice.objects.filter(**school_filter, status='pending').aggregate(
                total=Sum('amount'))['total'] or 0,
            'collected_this_month': FeeInvoice.objects.filter(
                **school_filter,
                status='paid',
                paid_date__gte=timezone.now().replace(day=1)
            ).aggregate(total=Sum('amount'))['total'] or 0
        }
        
        # Application data
        applications_data = {
            'pending': AdmissionApplication.objects.filter(**school_filter, status='pending').count(),
            'approved': AdmissionApplication.objects.filter(**school_filter, status='approved').count(),
            'rejected': AdmissionApplication.objects.filter(**school_filter, status='rejected').count()
        }
        
        # Recent activity
        recent_applications = AdmissionApplication.objects.filter(
            **school_filter,
            application_date__gte=timezone.now() - timedelta(days=7)
        ).count()

        return Response({
            'students': students_data,
            'fees': fees_data,
            'applications': applications_data,
            'recent_applications': recent_applications,
            'timestamp': timezone.now()
        })


class StudentDashboardAPIView(APIView):
    """Get student-specific dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        try:
            student = StudentProfile.objects.get(id=student_id)
            
            # Attendance summary
            attendance_data = {
                'total_present': AttendanceRecord.objects.filter(
                    student=student, status='present'
                ).count(),
                'total_absent': AttendanceRecord.objects.filter(
                    student=student, status='absent'
                ).count(),
                'this_month': AttendanceRecord.objects.filter(
                    student=student,
                    date__gte=timezone.now().replace(day=1)
                ).count()
            }
            
            # Fee status
            fee_data = {
                'pending_fees': FeeInvoice.objects.filter(
                    student=student, status='pending'
                ).aggregate(total=Sum('amount'))['total'] or 0,
                'paid_fees': FeeInvoice.objects.filter(
                    student=student, status='paid'
                ).aggregate(total=Sum('amount'))['total'] or 0
            }
            
            # Library books
            library_data = {
                'borrowed_books': BookBorrowRecord.objects.filter(
                    student=student, status='borrowed'
                ).count(),
                'overdue_books': BookBorrowRecord.objects.filter(
                    student=student, 
                    status='borrowed',
                    due_date__lt=timezone.now().date()
                ).count()
            }
            
            # Exam results
            recent_results = ExamResult.objects.filter(
                student=student
            ).order_by('-exam__exam_date')[:5]

            return Response({
                'student_info': {
                    'name': student.user.full_name,
                    'email': student.user.email,
                    'roll_number': student.roll_number,
                    'class': student.current_class
                },
                'attendance': attendance_data,
                'fees': fee_data,
                'library': library_data,
                'recent_results': [
                    {
                        'exam_name': result.exam.name,
                        'subject': result.subject.name if hasattr(result, 'subject') else 'N/A',
                        'marks': result.marks_obtained,
                        'total_marks': result.total_marks,
                        'grade': result.grade
                    } for result in recent_results
                ]
            })
            
        except StudentProfile.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)


class ParentDashboardAPIView(APIView):
    """Get parent-specific dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request, parent_id):
        try:
            parent = ParentProfile.objects.get(id=parent_id)
            children = parent.children.all()
            
            children_data = []
            for child in children:
                # Get latest attendance
                recent_attendance = AttendanceRecord.objects.filter(
                    student=child
                ).order_by('-date')[:10]
                
                # Get pending fees
                pending_fees = FeeInvoice.objects.filter(
                    student=child, status='pending'
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                children_data.append({
                    'id': child.id,
                    'name': child.user.full_name,
                    'class': child.current_class,
                    'recent_attendance': [
                        {
                            'date': record.date,
                            'status': record.status
                        } for record in recent_attendance
                    ],
                    'pending_fees': pending_fees
                })

            return Response({
                'parent_info': {
                    'name': parent.user.full_name,
                    'email': parent.user.email
                },
                'children': children_data
            })
            
        except ParentProfile.DoesNotExist:
            return Response({'error': 'Parent not found'}, status=404)


class FacultyDashboardAPIView(APIView):
    """Get faculty-specific dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request, faculty_id):
        try:
            faculty = StaffProfile.objects.get(id=faculty_id)
            
            # Get classes taught (this would depend on your class/subject assignment model)
            # For now, returning basic faculty info
            
            return Response({
                'faculty_info': {
                    'name': faculty.user.full_name,
                    'email': faculty.user.email,
                    'department': faculty.department,
                    'position': faculty.position
                },
                'classes_today': [],  # To be implemented based on timetable model
                'upcoming_exams': [],  # To be implemented
                'pending_tasks': []   # To be implemented
            })
            
        except StaffProfile.objects.DoesNotExist:
            return Response({'error': 'Faculty not found'}, status=404)


class WardenDashboardAPIView(APIView):
    """Get warden-specific dashboard data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_school = getattr(request.user, 'school', None)
        school_filter = {'room__block__school': user_school} if user_school else {}
        
        # Hostel statistics
        hostel_data = {
            'total_allocations': HostelAllocation.objects.filter(
                **school_filter, status='active'
            ).count(),
            'total_rooms': HostelAllocation.objects.filter(
                **school_filter
            ).values('room').distinct().count(),
            'pending_requests': 0  # To be implemented with room change request model
        }

        return Response({
            'warden_info': {
                'name': request.user.full_name,
                'email': request.user.email
            },
            'hostel': hostel_data
        })