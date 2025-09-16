from rest_framework import serializers
from .models import HostelBlock, HostelRoom, HostelAllocation, HostelComplaint


class HostelBlockSerializer(serializers.ModelSerializer):
    """Serializer for hostel blocks"""
    warden_name = serializers.CharField(source='warden.user.full_name', read_only=True)
    school_name = serializers.CharField(source='school.school_name', read_only=True)
    
    class Meta:
        model = HostelBlock
        fields = ['id', 'name', 'description', 'warden', 'warden_name', 'total_rooms', 'school', 'school_name']


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for hostel rooms"""
    block_name = serializers.CharField(source='block.name', read_only=True)
    school_name = serializers.CharField(source='block.school.school_name', read_only=True)
    availability_status = serializers.SerializerMethodField()
    
    class Meta:
        model = HostelRoom
        fields = [
            'id', 'room_number', 'room_type', 'capacity', 'current_occupancy',
            'is_available', 'block', 'block_name', 'school_name', 'availability_status'
        ]
    
    def get_availability_status(self, obj):
        if obj.current_occupancy >= obj.capacity:
            return 'full'
        elif obj.current_occupancy > 0:
            return 'partial'
        else:
            return 'empty'


class HostelAllocationSerializer(serializers.ModelSerializer):
    """Serializer for hostel allocations"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_email = serializers.CharField(source='student.user.email', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    block_name = serializers.CharField(source='room.block.name', read_only=True)
    allocated_by_name = serializers.CharField(source='allocated_by.user.full_name', read_only=True)
    
    class Meta:
        model = HostelAllocation
        fields = [
            'id', 'student', 'student_name', 'student_email',
            'room', 'room_number', 'block_name',
            'allocation_date', 'vacation_date', 'status',
            'allocated_by', 'allocated_by_name'
        ]


class HostelComplaintSerializer(serializers.ModelSerializer):
    """Serializer for hostel complaints"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    block_name = serializers.CharField(source='room.block.name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.user.full_name', read_only=True)
    
    class Meta:
        model = HostelComplaint
        fields = [
            'id', 'student', 'student_name', 'room', 'room_number', 'block_name',
            'title', 'description', 'priority', 'status',
            'submitted_date', 'resolved_date', 'resolved_by', 'resolved_by_name'
        ]