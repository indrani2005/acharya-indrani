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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current user profile"""
    user = request.user
    profile_data = None
    
    if user.role == 'student' and hasattr(user, 'student_profile'):
        profile_data = StudentProfileSerializer(user.student_profile).data
    elif user.role == 'parent' and hasattr(user, 'parent_profile'):
        profile_data = ParentProfileSerializer(user.parent_profile).data
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
