from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'applications', views.AdmissionApplicationViewSet)

urlpatterns = [
    path('track/', views.AdmissionTrackingAPIView.as_view(), name='track-application'),
    path('verify-email/request/', views.EmailVerificationRequestAPIView.as_view(), name='request-email-verification'),
    path('verify-email/verify/', views.EmailVerificationAPIView.as_view(), name='verify-email'),
    path('school-review/', views.SchoolAdmissionReviewAPIView.as_view(), name='school-admission-review'),
    path('school-decision/<int:decision_id>/', views.SchoolDecisionUpdateAPIView.as_view(), name='update-school-decision'),
    path('student-choice/', views.StudentChoiceAPIView.as_view(), name='student-choice'),
    path('accepted-schools/', views.AcceptedSchoolsAPIView.as_view(), name='accepted-schools'),
    path('', include(router.urls)),
]

app_name = 'admissions'