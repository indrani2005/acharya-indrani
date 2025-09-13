from rest_framework import serializers
from .models import ClassSession, AttendanceRecord

class ClassSessionSerializer(serializers.ModelSerializer):
    """Serializer for ClassSession"""
    faculty_name = serializers.CharField(source='faculty.user.full_name', read_only=True)
    
    class Meta:
        model = ClassSession
        fields = '__all__'


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceRecord"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_roll = serializers.CharField(source='student.roll_number', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'


class AttendanceMarkSerializer(serializers.Serializer):
    """Serializer for marking attendance"""
    session_id = serializers.IntegerField()
    attendance_data = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )