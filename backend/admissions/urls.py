from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.AdmissionApplicationViewSet)

urlpatterns = [
    path('track/', views.AdmissionTrackingAPIView.as_view(), name='track-application'),
    path('verify-email/request/', views.EmailVerificationRequestAPIView.as_view(), name='request-email-verification'),
    path('verify-email/verify/', views.EmailVerificationAPIView.as_view(), name='verify-email'),
    path('', include(router.urls)),
]

app_name = 'admissions'