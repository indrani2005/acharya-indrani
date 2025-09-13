from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import AdmissionApplication
from .serializers import (
    AdmissionApplicationSerializer, 
    AdmissionApplicationCreateSerializer,
    AdmissionReviewSerializer
)

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
