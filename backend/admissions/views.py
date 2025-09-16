from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import AdmissionApplication, EmailVerification
from .serializers import (
    AdmissionApplicationSerializer, 
    AdmissionApplicationCreateSerializer,
    AdmissionReviewSerializer,
    AdmissionTrackingSerializer,
    EmailVerificationRequestSerializer,
    EmailVerificationSerializer
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
