from django.shortcuts import render
import logging

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from schools.models import School
from .models import AdmissionApplication, EmailVerification, SchoolAdmissionDecision
from .serializers import (
    AdmissionApplicationSerializer, 
    AdmissionApplicationCreateSerializer,
    AdmissionReviewSerializer,
    AdmissionTrackingSerializer,
    EmailVerificationRequestSerializer,
    EmailVerificationSerializer,
    SchoolAdmissionDecisionSerializer,
    SchoolDecisionUpdateSerializer,
    StudentChoiceSerializer,
    AdmissionApplicationWithDecisionsSerializer
)
from .email_service import send_otp_email, send_admission_confirmation_email
from .ocr_service import OCRService

logger = logging.getLogger(__name__)


class EmailVerificationRequestAPIView(APIView):
    """API view for requesting email verification OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            applicant_name = serializer.validated_data.get('applicant_name', '')
            
            # Check if there's already a recent verification for this email
            recent_verification = EmailVerification.objects.filter(
                email=email,
                created_at__gte=timezone.now() - timezone.timedelta(minutes=2)
            ).first()
            
            if recent_verification:
                return Response({
                    'success': False,
                    'message': 'OTP already sent recently. Please wait 2 minutes before requesting again.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Create new verification
            verification = EmailVerification.objects.create(email=email)
            
            # Send OTP email
            if send_otp_email(email, verification.otp, applicant_name):
                return Response({
                    'success': True,
                    'message': 'OTP sent successfully to your email address.'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationAPIView(APIView):
    """API view for verifying email with OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            # Find the most recent unverified OTP for this email
            try:
                verification = EmailVerification.objects.filter(
                    email=email,
                    is_verified=False
                ).latest('created_at')
                
                if verification.verify(otp):
                    return Response({
                        'success': True,
                        'message': 'Email verified successfully.',
                        'verification_token': verification.otp  # Send OTP as token for application creation
                    })
                else:
                    error_message = 'Invalid OTP.'
                    if verification.is_expired():
                        error_message = 'OTP has expired. Please request a new one.'
                    elif verification.attempts >= 3:
                        error_message = 'Too many failed attempts. Please request a new OTP.'
                    
                    return Response({
                        'success': False,
                        'message': error_message
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except EmailVerification.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'No verification request found for this email.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AdmissionTrackingAPIView(APIView):
    """Public API view for tracking admission applications by reference ID"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        reference_id = request.query_params.get('reference_id')
        
        if not reference_id:
            return Response({
                'success': False,
                'message': 'Reference ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            application = AdmissionApplication.objects.get(reference_id=reference_id)
            serializer = AdmissionTrackingSerializer(application)
            
            return Response({
                'success': True,
                'data': serializer.data
            })
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No application found with this reference ID'
            }, status=status.HTTP_404_NOT_FOUND)


class AdmissionApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for AdmissionApplication"""
    queryset = AdmissionApplication.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdmissionApplicationCreateSerializer
        return AdmissionApplicationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]  # Anyone can apply
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """Create application and send confirmation email"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        
        # Send confirmation email with reference ID and tracking link
        send_admission_confirmation_email(application)
        
        return Response(
            AdmissionApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def review(self, request, pk=None):
        """Review an admission application"""
        application = self.get_object()
        serializer = AdmissionReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            application.status = serializer.validated_data['status']
            application.review_comments = serializer.validated_data.get('review_comments', '')
            application.reviewed_by = request.user
            application.review_date = timezone.now()
            application.save()
            
            return Response(AdmissionApplicationSerializer(application).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SchoolAdmissionReviewAPIView(APIView):
    """API view for school-specific admission reviews"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get applications for the current user's school"""
        try:
            # Get the user's school directly from the user model
            if not request.user.school:
                return Response({
                    'success': False,
                    'message': 'Unable to determine school for user. Please contact administrator.',
                    'timestamp': timezone.now().isoformat(),
                    'errors': ['User has no school assigned']
                }, status=status.HTTP_400_BAD_REQUEST)
                
            school_id = request.user.school.id
            
            # Get all applications where this school is a preference
            applications = AdmissionApplication.objects.filter(
                Q(first_preference_school_id=school_id) |
                Q(second_preference_school_id=school_id) |
                Q(third_preference_school_id=school_id)
            ).prefetch_related('school_decisions')
            
            serializer = AdmissionApplicationWithDecisionsSerializer(applications, many=True)
            
            return Response({
                'success': True,
                'count': len(applications),
                'results': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error fetching applications: {str(e)}',
                'timestamp': timezone.now().isoformat(),
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SchoolDecisionUpdateAPIView(APIView):
    """API view for updating school admission decisions"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, decision_id):
        """Update a school admission decision"""
        try:
            decision = SchoolAdmissionDecision.objects.get(id=decision_id)
        except SchoolAdmissionDecision.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Decision not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SchoolDecisionUpdateSerializer(decision, data=request.data, partial=True)
        
        if serializer.is_valid():
            decision = serializer.save(reviewed_by=request.user)
            
            return Response({
                'success': True,
                'data': SchoolAdmissionDecisionSerializer(decision).data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SchoolDecisionCreateAPIView(APIView):
    """API view for creating new school admission decisions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a new school admission decision"""
        application_id = request.data.get('application_id')
        school_id = request.data.get('school_id')
        decision_value = request.data.get('decision')
        notes = request.data.get('notes', '')
        
        if not application_id or not school_id or not decision_value:
            return Response({
                'success': False,
                'message': 'application_id, school_id, and decision are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            application = AdmissionApplication.objects.get(id=application_id)
            school = School.objects.get(id=school_id)
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Admission application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except School.DoesNotExist:
            return Response({
                'success': False,
                'message': 'School not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if decision already exists
        existing_decision = SchoolAdmissionDecision.objects.filter(
            application=application,
            school=school
        ).first()
        
        if existing_decision:
            return Response({
                'success': False,
                'message': 'Decision already exists for this application and school'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new decision
        # Determine preference order
        preference_order = '1st'
        if application.first_preference_school == school:
            preference_order = '1st'
        elif application.second_preference_school == school:
            preference_order = '2nd'
        elif application.third_preference_school == school:
            preference_order = '3rd'
        
        decision = SchoolAdmissionDecision.objects.create(
            application=application,
            school=school,
            preference_order=preference_order,
            decision=decision_value,
            review_comments=notes,
            reviewed_by=request.user
        )
        
        return Response({
            'success': True,
            'data': SchoolAdmissionDecisionSerializer(decision).data
        }, status=status.HTTP_201_CREATED)


class StudentChoiceAPIView(APIView):
    """API view for students to choose among accepted schools"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Student selects their preferred school among accepted ones"""
        reference_id = request.data.get('reference_id')
        school_decision_id = request.data.get('school_decision_id')
        
        if not reference_id or not school_decision_id:
            return Response({
                'success': False,
                'message': 'Reference ID and school decision ID are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            application = AdmissionApplication.objects.get(reference_id=reference_id)
            decision = SchoolAdmissionDecision.objects.get(
                id=school_decision_id, 
                application=application,
                decision='accepted'
            )
        except (AdmissionApplication.DoesNotExist, SchoolAdmissionDecision.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Invalid reference ID or school decision'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Reset all choices for this application
        SchoolAdmissionDecision.objects.filter(
            application=application,
            is_student_choice=True
        ).update(is_student_choice=False, student_choice_date=None)
        
        # Set the selected choice
        decision.is_student_choice = True
        decision.student_choice_date = timezone.now()
        decision.save()
        
        return Response({
            'success': True,
            'message': f'Successfully selected {decision.school.school_name}',
            'data': SchoolAdmissionDecisionSerializer(decision).data
        })


class AcceptedSchoolsAPIView(APIView):
    """API view to get accepted schools for an application"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get all accepted schools for an application"""
        reference_id = request.query_params.get('reference_id')
        
        if not reference_id:
            return Response({
                'success': False,
                'message': 'Reference ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            application = AdmissionApplication.objects.get(reference_id=reference_id)
            accepted_decisions = SchoolAdmissionDecision.objects.filter(
                application=application,
                decision='accepted'
            ).select_related('school')
            
            if not accepted_decisions.exists():
                return Response({
                    'success': False,
                    'message': 'No schools have accepted this application yet'
                })
            
            serializer = SchoolAdmissionDecisionSerializer(accepted_decisions, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'has_student_choice': any(d.is_student_choice for d in accepted_decisions)
            })
            
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)


class FeePaymentInitAPIView(APIView):
    """API view to initialize fee payment for accepted students"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Initialize fee payment process for a student"""
        reference_id = request.data.get('reference_id')
        school_decision_id = request.data.get('school_decision_id')
        
        if not reference_id:
            return Response({
                'success': False,
                'message': 'Reference ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from fees.models import FeeStructure
            from decimal import Decimal
            
            application = AdmissionApplication.objects.get(reference_id=reference_id)
            
            # Get the selected school decision
            if school_decision_id:
                school_decision = SchoolAdmissionDecision.objects.get(
                    id=school_decision_id,
                    application=application,
                    decision='accepted'
                )
            else:
                # If no specific school decision ID, get the student's choice
                school_decision = SchoolAdmissionDecision.objects.filter(
                    application=application,
                    decision='accepted',
                    is_student_choice=True
                ).first()
                
                if not school_decision:
                    # If no student choice yet, get any accepted school
                    school_decision = SchoolAdmissionDecision.objects.filter(
                        application=application,
                        decision='accepted'
                    ).first()
            
            if not school_decision:
                return Response({
                    'success': False,
                    'message': 'No accepted school found for this application'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get fee structure for the school and course
            try:
                fee_structure = FeeStructure.objects.get(
                    school=school_decision.school,
                    course=application.course_applied,
                    semester=1  # Default to first semester for admission
                )
            except FeeStructure.DoesNotExist:
                # Create a default fee structure if none exists
                fee_structure = FeeStructure.objects.create(
                    school=school_decision.school,
                    course=application.course_applied,
                    semester=1,
                    tuition_fee=Decimal('5000.00'),  # Default admission fee
                    library_fee=Decimal('500.00'),
                    lab_fee=Decimal('1000.00'),
                    exam_fee=Decimal('500.00'),
                    total_fee=Decimal('7000.00')
                )
            
            # Calculate any additional fees (admission fee, etc.)
            admission_fee = Decimal('1000.00')  # Standard admission fee
            total_amount = fee_structure.total_fee + admission_fee
            
            return Response({
                'success': True,
                'data': {
                    'reference_id': reference_id,
                    'school_name': school_decision.school.school_name,
                    'course': application.course_applied,
                    'fee_structure': {
                        'tuition_fee': str(fee_structure.tuition_fee),
                        'library_fee': str(fee_structure.library_fee),
                        'lab_fee': str(fee_structure.lab_fee),
                        'exam_fee': str(fee_structure.exam_fee),
                        'admission_fee': str(admission_fee),
                        'total_fee': str(total_amount)
                    },
                    'payment_methods': ['online', 'card', 'bank_transfer'],
                    'due_date': (timezone.now() + timezone.timedelta(days=30)).strftime('%Y-%m-%d')
                }
            })
            
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error initializing payment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentUploadAPIView(APIView):
    """API view for uploading documents to admission applications"""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]  # Allow anyone to upload documents during application
    
    def post(self, request, application_id=None):
        """Upload documents for an admission application"""
        try:
            application = AdmissionApplication.objects.get(id=application_id)
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        uploaded_documents = {}
        
        # Process each uploaded file
        for key, file in request.FILES.items():
            if file:
                # Create a unique filename
                filename = f"admission_{application_id}_{key}_{file.name}"
                
                # Save the file
                file_path = default_storage.save(
                    f"admissions/{application_id}/{filename}",
                    ContentFile(file.read())
                )
                
                # Store the path in the documents dict
                uploaded_documents[key] = file_path
        
        # Update the application's documents field
        if uploaded_documents:
            if not application.documents:
                application.documents = {}
            application.documents.update(uploaded_documents)
            application.save()
        
        return Response({
            'success': True,
            'message': f'Successfully uploaded {len(uploaded_documents)} documents',
            'documents': uploaded_documents
        })
        
    def get(self, request, application_id=None):
        """Get documents for an admission application"""
        try:
            application = AdmissionApplication.objects.get(id=application_id)
            return Response({
                'success': True,
                'documents': application.documents or {}
            })
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found'
            }, status=status.HTTP_404_NOT_FOUND)


class FeeCalculationAPIView(APIView):
    """API view for calculating fee based on student's course and category"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        reference_id = request.data.get('reference_id')
        
        if not reference_id:
            return Response({
                'success': False,
                'message': 'Reference ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the admission application
            application = AdmissionApplication.objects.get(reference_id=reference_id)
            
            # Import FeeStructure here to avoid circular imports
            from .models import FeeStructure
            
            # Get fee structure for the student
            fee_structure = FeeStructure.get_fee_for_student(
                application.course_applied, 
                application.category
            )
            
            if not fee_structure:
                return Response({
                    'success': False,
                    'message': 'Fee structure not found for this course and category'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Calculate total fee (use minimum fee for display)
            total_fee = fee_structure.annual_fee_min
            
            # Get school decisions for this application
            school_decisions = SchoolAdmissionDecision.objects.filter(
                application=application,
                decision='accepted'
            ).select_related('school')
            
            response_data = {
                'success': True,
                'data': {
                    'reference_id': reference_id,
                    'applicant_name': application.applicant_name,
                    'course_applied': application.course_applied,
                    'category': application.category,
                    'fee_structure': {
                        'class_range': fee_structure.class_range,
                        'category': fee_structure.category,
                        'annual_fee_min': float(fee_structure.annual_fee_min),
                        'annual_fee_max': float(fee_structure.annual_fee_max) if fee_structure.annual_fee_max else float(fee_structure.annual_fee_min),
                        'total_fee': float(total_fee)
                    },
                    'accepted_schools': [{
                        'id': decision.id,
                        'school_name': decision.school.school_name,
                        'preference_order': decision.preference_order
                    } for decision in school_decisions]
                }
            }
            
            return Response(response_data)
            
        except AdmissionApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found with this reference ID'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error calculating fee: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EnrollmentAPIView(APIView):
    """API view for enrolling students in schools"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Enroll student in a specific school"""
        try:
            decision_id = request.data.get('decision_id')
            payment_reference = request.data.get('payment_reference', '')
            
            if not decision_id:
                return Response({
                    'success': False,
                    'message': 'Decision ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the school decision
            try:
                decision = SchoolAdmissionDecision.objects.get(id=decision_id)
            except SchoolAdmissionDecision.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'School decision not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if student can enroll
            if not decision.can_enroll():
                # Check specific reasons for inability to enroll
                if decision.decision not in ['accepted', 'pending']:
                    return Response({
                        'success': False,
                        'message': f'Cannot enroll: Application {decision.decision}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif decision.enrollment_status != 'not_enrolled':
                    return Response({
                        'success': False,
                        'message': 'Cannot enroll: Already enrolled or withdrawn'
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif decision.application.has_active_enrollment():
                    active_enrollment = decision.application.get_active_enrollment()
                    return Response({
                        'success': False,
                        'message': f'Cannot enroll: Already enrolled at {active_enrollment.school.school_name}. Withdraw first to enroll elsewhere.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'success': False,
                        'message': 'Cannot enroll: Unknown restriction'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Enroll the student
            decision.enroll_student(payment_reference=payment_reference)
            
            return Response({
                'success': True,
                'message': f'Successfully enrolled at {decision.school.school_name}',
                'data': {
                    'enrollment_date': decision.enrollment_date,
                    'school_name': decision.school.school_name,
                    'enrollment_status': decision.enrollment_status,
                    'payment_reference': decision.payment_reference
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error during enrollment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WithdrawalAPIView(APIView):
    """API view for withdrawing student enrollment"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Withdraw student enrollment from a school"""
        try:
            decision_id = request.data.get('decision_id')
            withdrawal_reason = request.data.get('withdrawal_reason', '')
            
            if not decision_id:
                return Response({
                    'success': False,
                    'message': 'Decision ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the school decision
            try:
                decision = SchoolAdmissionDecision.objects.get(id=decision_id)
            except SchoolAdmissionDecision.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'School decision not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if student can withdraw
            if not decision.can_withdraw():
                return Response({
                    'success': False,
                    'message': 'Cannot withdraw: Not currently enrolled'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Withdraw the enrollment
            decision.withdraw_enrollment(reason=withdrawal_reason)
            
            return Response({
                'success': True,
                'message': f'Successfully withdrawn from {decision.school.school_name}',
                'data': {
                    'withdrawal_date': decision.withdrawal_date,
                    'school_name': decision.school.school_name,
                    'enrollment_status': decision.enrollment_status,
                    'withdrawal_reason': decision.withdrawal_reason
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error during withdrawal: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminDashboardAPIView(APIView):
    """API view for admin dashboard admissions data"""
    permission_classes = [AllowAny]  # Change to IsAuthenticated in production
    
    def get(self, request):
        """Get admission statistics and recent applications for admin dashboard"""
        try:
            # Get admission statistics
            total_applications = AdmissionApplication.objects.count()
            pending_applications = AdmissionApplication.objects.filter(status='pending').count()
            approved_applications = AdmissionApplication.objects.filter(status='approved').count()
            rejected_applications = AdmissionApplication.objects.filter(status='rejected').count()
            
            # Get enrollment statistics
            total_decisions = SchoolAdmissionDecision.objects.count()
            enrolled_students = SchoolAdmissionDecision.objects.filter(enrollment_status='enrolled').count()
            withdrawn_students = SchoolAdmissionDecision.objects.filter(enrollment_status='withdrawn').count()
            accepted_decisions = SchoolAdmissionDecision.objects.filter(decision='accepted').count()
            pending_decisions = SchoolAdmissionDecision.objects.filter(decision='pending').count()
            
            # Get recent applications (last 10)
            recent_applications = AdmissionApplication.objects.select_related(
                'first_preference_school', 'second_preference_school', 'third_preference_school'
            ).prefetch_related('school_decisions__school').order_by('-application_date')[:10]
            
            recent_applications_data = []
            for app in recent_applications:
                # Get enrollment status
                enrollment_status = "NOT_ENROLLED"
                enrolled_school = None
                
                enrolled_decision = app.school_decisions.filter(enrollment_status='enrolled').first()
                if enrolled_decision:
                    enrollment_status = "ENROLLED"
                    enrolled_school = enrolled_decision.school.school_name
                elif app.school_decisions.filter(enrollment_status='withdrawn').exists():
                    enrollment_status = "WITHDRAWN"
                
                # Get accepted schools count
                accepted_count = app.school_decisions.filter(decision='accepted').count()
                
                recent_applications_data.append({
                    'reference_id': app.reference_id,
                    'applicant_name': app.applicant_name,
                    'email': app.email,
                    'course_applied': app.course_applied,
                    'application_date': app.application_date,
                    'status': app.status,
                    'first_preference_school': app.first_preference_school.school_name if app.first_preference_school else None,
                    'enrollment_status': enrollment_status,
                    'enrolled_school': enrolled_school,
                    'accepted_schools_count': accepted_count,
                })
            
            # Get pending reviews (applications needing attention)
            pending_reviews = SchoolAdmissionDecision.objects.filter(
                decision='pending'
            ).select_related('application', 'school').order_by('-application__application_date')[:5]
            
            pending_reviews_data = []
            for decision in pending_reviews:
                pending_reviews_data.append({
                    'reference_id': decision.application.reference_id,
                    'applicant_name': decision.application.applicant_name,
                    'school_name': decision.school.school_name,
                    'preference_order': decision.preference_order,
                    'application_date': decision.application.application_date,
                    'course_applied': decision.application.course_applied,
                })
            
            return Response({
                'success': True,
                'data': {
                    'statistics': {
                        'total_applications': total_applications,
                        'pending_applications': pending_applications,
                        'approved_applications': approved_applications,
                        'rejected_applications': rejected_applications,
                        'total_decisions': total_decisions,
                        'enrolled_students': enrolled_students,
                        'withdrawn_students': withdrawn_students,
                        'accepted_decisions': accepted_decisions,
                        'pending_decisions': pending_decisions,
                    },
                    'recent_applications': recent_applications_data,
                    'pending_reviews': pending_reviews_data,
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error fetching dashboard data: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OCRFormExtractionAPIView(APIView):
    """API view for extracting text from admission form images using OCR"""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]  # Allow anyone to use OCR during application
    
    def post(self, request):
        """Extract text from uploaded admission form image"""
        try:
            # Check if file is provided
            if 'form_image' not in request.FILES:
                return Response({
                    'success': False,
                    'message': 'No form image provided. Please upload an image file.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_file = request.FILES['form_image']
            
            # Validate file type
            allowed_types = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp',
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ]
            if uploaded_file.content_type not in allowed_types:
                return Response({
                    'success': False,
                    'message': 'Invalid file type. Please upload a valid file (Images: JPG, PNG, TIFF, BMP | Documents: PDF, DOC, DOCX, TXT).'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (max 10MB)
            max_size = 10 * 1024 * 1024  # 10MB
            if uploaded_file.size > max_size:
                return Response({
                    'success': False,
                    'message': 'File size too large. Please upload a file smaller than 10MB.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize OCR service
            ocr_service = OCRService()
            
            # Extract and parse form data
            result = ocr_service.extract_and_parse_form(uploaded_file)
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': result['message'],
                    'data': {
                        'extracted_text': result['extracted_text'],
                        'form_data': result['form_data'],
                        'confidence': result['confidence'],
                        'extracted_fields_count': len(result['form_data'])
                    }
                })
            else:
                return Response({
                    'success': False,
                    'message': result['message'],
                    'data': {
                        'extracted_text': result['extracted_text'],
                        'form_data': result['form_data']
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error in OCR form extraction: {str(e)}")
            return Response({
                'success': False,
                'message': f'Error processing form image: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
