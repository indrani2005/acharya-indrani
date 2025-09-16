from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'allocations', views.HostelAllocationViewSet, basename='allocation')

urlpatterns = [
    path('', include(router.urls)),
    path('allocate/', views.AllocateRoomAPIView.as_view(), name='allocate-room'),
    path('room-change-request/', views.RoomChangeRequestAPIView.as_view(), name='room-change-request'),
]