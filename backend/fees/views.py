from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FeeStructure, FeeInvoice, Payment
from .serializers import (
    FeeStructureSerializer, FeeInvoiceSerializer, 
    PaymentSerializer, PaymentCreateSerializer
)

class FeeStructureViewSet(viewsets.ModelViewSet):
    """ViewSet for FeeStructure"""
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


class FeeInvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for FeeInvoice"""
    queryset = FeeInvoice.objects.all()
    serializer_class = FeeInvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'status']
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pay(self, request, pk=None):
        """Process payment for an invoice"""
        invoice = self.get_object()
        
        if invoice.status == 'paid':
            return Response(
                {'error': 'Invoice already paid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PaymentCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create payment record
            payment = Payment.objects.create(
                invoice=invoice,
                transaction_id=serializer.validated_data['transaction_id'],
                amount=invoice.amount,
                payment_method=serializer.validated_data['payment_method']
            )
            
            # Update invoice status
            invoice.status = 'paid'
            invoice.save()
            
            return Response({
                'message': 'Payment successful',
                'payment': PaymentSerializer(payment).data,
                'invoice': FeeInvoiceSerializer(invoice).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Payment (read-only)"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
