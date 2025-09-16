from django.shortcuts import render

from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import StudentProfile, ParentProfile, StaffProfile
from .serializers import (
    UserSerializer, LoginSerializer, StudentProfileSerializer,
    ParentProfileSerializer, StaffProfileSerializer, DashboardDataSerializer
)

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout successful"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def parent_request_otp(request):
    """Request OTP for parent login using student admission number and parent phone"""
    admission_number = request.data.get('admission_number')
    phone_number = request.data.get('phone_number')
    
    if not admission_number or not phone_number:
        return Response({
            'error': 'Both admission number and phone number are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find student by admission number
        student = StudentProfile.objects.get(admission_number=admission_number)
        
        # Find parent with matching phone number
        parent = ParentProfile.objects.filter(
            student=student,
            phone_number=phone_number
        ).first()
        
        if not parent:
            return Response({
                'error': 'No parent found with this phone number for the given student'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Generate and store OTP (in production, send via SMS)
        otp = parent.generate_otp_for_login()
        
        # In production, you would send the OTP via SMS service
        # For now, we'll store it temporarily (use Redis/cache in production)
        from django.core.cache import cache
        cache_key = f"parent_otp_{admission_number}_{phone_number}"
        cache.set(cache_key, otp, timeout=300)  # 5 minutes
        
        return Response({
            'message': 'OTP sent successfully',
            'admission_number': admission_number,
            'phone_number': phone_number,
            'otp': otp,  # Remove this in production!
        })
        
    except StudentProfile.DoesNotExist:
        return Response({
            'error': 'Student not found with this admission number'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def parent_verify_otp(request):
    """Verify OTP and provide parent access to student data"""
    admission_number = request.data.get('admission_number')
    phone_number = request.data.get('phone_number')
    otp = request.data.get('otp')
    
    if not all([admission_number, phone_number, otp]):
        return Response({
            'error': 'Admission number, phone number, and OTP are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP from cache
    from django.core.cache import cache
    cache_key = f"parent_otp_{admission_number}_{phone_number}"
    stored_otp = cache.get(cache_key)
    
    if not stored_otp or stored_otp != otp:
        return Response({
            'error': 'Invalid or expired OTP'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find student and parent
        student = StudentProfile.objects.get(admission_number=admission_number)
        parent = ParentProfile.objects.get(
            student=student,
            phone_number=phone_number
        )
        
        # Clear OTP from cache
        cache.delete(cache_key)
        
        # Create a temporary session token for parent (valid for limited time)
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode
        import json
        import time
        
        # Create parent session data
        parent_session_data = {
            'parent_id': parent.id,
            'student_id': student.id,
            'phone_number': phone_number,
            'timestamp': int(time.time()),
            'expires_at': int(time.time()) + (4 * 60 * 60),  # 4 hours
        }
        
        # Store in cache with expiry
        session_key = f"parent_session_{parent.id}_{student.id}"
        cache.set(session_key, parent_session_data, timeout=4*60*60)  # 4 hours
        
        return Response({
            'message': 'OTP verified successfully',
            'parent_session_token': session_key,
            'parent': {
                'id': parent.id,
                'name': parent.full_name,
                'relationship': parent.get_relationship_display(),
                'phone_number': parent.phone_number,
            },
            'student': {
                'id': student.id,
                'name': student.full_name,
                'admission_number': student.admission_number,
                'course': student.course,
                'semester': student.semester,
            },
            'expires_at': parent_session_data['expires_at'],
        })
        
    except (StudentProfile.DoesNotExist, ParentProfile.DoesNotExist):
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current user profile"""
    user = request.user
    profile_data = None
    
    if user.role == 'student' and hasattr(user, 'student_profile'):
        profile_data = StudentProfileSerializer(user.student_profile).data
    elif user.role in ['faculty', 'warden', 'admin'] and hasattr(user, 'staff_profile'):
        profile_data = StaffProfileSerializer(user.staff_profile).data
    
    return Response({
        'user': UserSerializer(user).data,
        'profile': profile_data
    })


class StudentProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for StudentProfile"""
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]


class ParentProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for ParentProfile"""
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsAuthenticated]


class StaffProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for StaffProfile"""
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated]
