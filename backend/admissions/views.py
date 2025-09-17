from django.shortcuts import render

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
