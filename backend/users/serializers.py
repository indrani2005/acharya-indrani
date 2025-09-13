from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, StudentProfile, ParentProfile, StaffProfile

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for StudentProfile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = '__all__'


class ParentProfileSerializer(serializers.ModelSerializer):
    """Serializer for ParentProfile"""
    user = UserSerializer(read_only=True)
    children = StudentProfileSerializer(many=True, read_only=True)
    
    class Meta:
        model = ParentProfile
        fields = '__all__'


class StaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for StaffProfile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StaffProfile
        fields = '__all__'


class DashboardDataSerializer(serializers.Serializer):
    """Serializer for dashboard data"""
    user = UserSerializer()
    profile = serializers.JSONField()
    stats = serializers.JSONField()
    recent_activities = serializers.JSONField()