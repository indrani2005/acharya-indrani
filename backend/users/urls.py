from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentProfileViewSet)
router.register(r'parents', views.ParentProfileViewSet)
router.register(r'staff', views.StaffProfileViewSet)

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/me/', views.current_user_view, name='current_user'),
    path('', include(router.urls)),
]