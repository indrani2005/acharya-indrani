from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from .models import HostelRoom, HostelAllocation
from .serializers import RoomSerializer, HostelAllocationSerializer


class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for hostel rooms"""
    queryset = HostelRoom.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by room type
        room_type = self.request.query_params.get('type')
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        
        # Filter by availability
        available = self.request.query_params.get('available')
        if available:
            if available.lower() == 'true':
                queryset = queryset.filter(current_occupancy__lt=queryset.first().capacity if queryset.first() else 0)
        
        return queryset.order_by('room_number')


class HostelAllocationViewSet(viewsets.ModelViewSet):
    """ViewSet for hostel allocations"""
    queryset = HostelAllocation.objects.all()
    serializer_class = HostelAllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by student role
        if self.request.user.role == 'student':
            student_profile = getattr(self.request.user, 'student_profile', None)
            if student_profile:
                queryset = queryset.filter(student=student_profile)
        elif self.request.user.role == 'parent':
            parent_profile = getattr(self.request.user, 'parent_profile', None)
            if parent_profile:
                children_ids = parent_profile.children.values_list('id', flat=True)
                queryset = queryset.filter(student__id__in=children_ids)
        
        return queryset.select_related('student__user', 'room').order_by('-allocation_date')


class AllocateRoomAPIView(APIView):
    """Allocate a room to a student"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            student_id = request.data.get('student_id')
            room_id = request.data.get('room_id')
            allocation_date = request.data.get('allocation_date', timezone.now().date())

            from users.models import StudentProfile
            student = StudentProfile.objects.get(id=student_id)
            room = HostelRoom.objects.get(id=room_id)

            # Check if room has capacity
            if room.current_occupancy >= room.capacity:
                return Response({'error': 'Room is at full capacity'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if student already has allocation
            existing_allocation = HostelAllocation.objects.filter(
                student=student, 
                status='active'
            ).first()
            
            if existing_allocation:
                return Response({'error': 'Student already has an active room allocation'}, status=status.HTTP_400_BAD_REQUEST)

            # Create allocation
            allocation = HostelAllocation.objects.create(
                student=student,
                room=room,
                allocation_date=allocation_date,
                allocated_by=request.user.staff_profile if hasattr(request.user, 'staff_profile') else None
            )

            # Update room occupancy
            room.current_occupancy += 1
            room.save()

            serializer = HostelAllocationSerializer(allocation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RoomChangeRequestAPIView(APIView):
    """Handle room change requests"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            current_room_id = request.data.get('current_room_id')
            requested_room_id = request.data.get('requested_room_id')
            reason = request.data.get('reason', '')

            current_room = HostelRoom.objects.get(id=current_room_id)
            requested_room = HostelRoom.objects.get(id=requested_room_id)

            # Create room change request logic here
            # For now, return success message
            return Response({
                'message': f'Room change request submitted from {current_room.room_number} to {requested_room.room_number}',
                'status': 'pending'
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
