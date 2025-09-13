from rest_framework import serializers
from .models import AdmissionApplication

class AdmissionApplicationSerializer(serializers.ModelSerializer):
    """Serializer for AdmissionApplication"""
    
    class Meta:
        model = AdmissionApplication
        fields = '__all__'
        read_only_fields = ['application_date', 'reviewed_by', 'review_date']


class AdmissionApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admission applications"""
    
    class Meta:
        model = AdmissionApplication
        fields = [
            'applicant_name', 'date_of_birth', 'email', 'phone_number',
            'address', 'course_applied', 'previous_school', 'last_percentage',
            'documents'
        ]


class AdmissionReviewSerializer(serializers.Serializer):
    """Serializer for reviewing admission applications"""
    status = serializers.ChoiceField(choices=AdmissionApplication.STATUS_CHOICES)
    review_comments = serializers.CharField(required=False, allow_blank=True)