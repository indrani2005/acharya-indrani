from rest_framework import serializers
from .models import FeeStructure, FeeInvoice, Payment

class FeeStructureSerializer(serializers.ModelSerializer):
    """Serializer for FeeStructure"""
    
    class Meta:
        model = FeeStructure
        fields = '__all__'


class FeeInvoiceSerializer(serializers.ModelSerializer):
    """Serializer for FeeInvoice"""
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    
    class Meta:
        model = FeeInvoice
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment"""
    
    class Meta:
        model = Payment
        fields = '__all__'


class PaymentCreateSerializer(serializers.Serializer):
    """Serializer for creating payments"""
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    transaction_id = serializers.CharField(max_length=100)