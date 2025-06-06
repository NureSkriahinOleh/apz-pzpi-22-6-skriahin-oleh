from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/sensors/logs/$', consumers.SensorLogsConsumer.as_asgi()),
]