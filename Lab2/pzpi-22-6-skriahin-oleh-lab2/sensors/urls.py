from django.urls import path
from .views import (
    SensorListCreateView,
    SensorDetailView,
    SensorLogListView,
    SensorLogDetailView,
    CreateSensorLogAPIView
)

urlpatterns = [
    # Sensor endpoints
    path('sensors/', SensorListCreateView.as_view(), name='sensor-list'),
    path('sensors/<int:pk>/', SensorDetailView.as_view(), name='sensor-detail'),

    # SensorLog endpoints
    path('sensors/<int:sensor_id>/logs/', SensorLogListView.as_view(), name='sensor-log-list'),
    path('sensors/logs/<int:pk>/', SensorLogDetailView.as_view(), name='sensor-log-detail'),
    path('sensors/logs/create/', CreateSensorLogAPIView.as_view(), name='sensor-log-create'),
]

