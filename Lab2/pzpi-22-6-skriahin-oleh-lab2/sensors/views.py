from django.shortcuts import get_object_or_404
from django.core.mail import send_mail

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Sensor, SensorLog
from .serializers import (
    SensorSerializer,
    CreateSensorSerializer,
    SensorLogSerializer,
    CreateSensorLogSerializer
)
from users.models import User
from incidents.models import IncidentReport, IncidentSensorLog
from notifications.models import Notification


class SensorListCreateView(generics.ListCreateAPIView):
    """
    GET: List all sensors
    POST: Create a new sensor
    """
    queryset = Sensor.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateSensorSerializer
        return SensorSerializer

    @swagger_auto_schema(
        responses={200: SensorSerializer(many=True)},
        operation_description="Retrieve list of sensors"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=CreateSensorSerializer,
        responses={201: SensorSerializer, 400: 'Validation error'},
        operation_description="Create a new sensor"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class SensorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve sensor details
    PUT: Update sensor
    DELETE: Delete sensor
    """
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: SensorSerializer, 404: 'Sensor not found'},
        operation_description="Retrieve sensor details"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=CreateSensorSerializer,
        responses={200: SensorSerializer, 400: 'Validation error', 404: 'Sensor not found'},
        operation_description="Update an existing sensor"
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        responses={204: 'Sensor deleted', 404: 'Sensor not found'},
        operation_description="Delete a sensor"
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class SensorLogListView(generics.ListAPIView):
    """
    GET: List logs for a specific sensor
    """
    serializer_class = SensorLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SensorLog.objects.filter(sensor_id=self.kwargs['sensor_id'])

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('sensor_id', openapi.IN_PATH, type=openapi.TYPE_INTEGER, description='Sensor ID')
        ],
        responses={200: SensorLogSerializer(many=True)},
        operation_description="Retrieve logs for a sensor"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class SensorLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a sensor log
    PUT: Update a sensor log
    DELETE: Delete a sensor log
    """
    queryset = SensorLog.objects.all()
    serializer_class = SensorLogSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: SensorLogSerializer, 404: 'Log not found'},
        operation_description="Retrieve sensor log details"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        request_body=SensorLogSerializer,
        responses={200: SensorLogSerializer, 400: 'Validation error', 404: 'Log not found'},
        operation_description="Update a sensor log"
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        responses={204: 'Log deleted', 404: 'Log not found'},
        operation_description="Delete a sensor log"
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)



TEMP_RANGE = (20.0, 100.0)
GAS_RANGE = (0.0, 300.0)
HUM_RANGE = (0.0, 100.0)
WEIGHTS = {
    'temp': 0.4,
    'gas': 0.3,
    'hum': 0.3,
}


def normalize(value, min_val, max_val):
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


class CreateSensorLogAPIView(APIView):
    """
    POST: Create log and trigger incident if needed
    """
    permission_classes = [AllowAny]
    serializer_class = CreateSensorLogSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        sensor = get_object_or_404(Sensor, pk=serializer.validated_data['sensor_id'])
        log = SensorLog.objects.create(sensor=sensor, value=serializer.validated_data['value'])
        log.check_threshold()

        latest_temp = SensorLog.objects.filter(
            sensor__sensor_type__type='temperature',
            sensor__location=sensor.location
        ).order_by('-timestamp').first()
        latest_humidity = SensorLog.objects.filter(
            sensor__sensor_type__type='humidity',
            sensor__location=sensor.location
        ).order_by('-timestamp').first()
        latest_gas = SensorLog.objects.filter(
            sensor__sensor_type__type='gas',
            sensor__location=sensor.location
        ).order_by('-timestamp').first()

        if latest_temp and latest_humidity and latest_gas:

            Tn = normalize(latest_temp.value, *TEMP_RANGE)
            Gn = normalize(latest_gas.value, *GAS_RANGE)
            Hn = normalize(latest_humidity.value, *HUM_RANGE)

            fdi = (
                WEIGHTS['temp'] * Tn
                + WEIGHTS['gas'] * Gn
                + WEIGHTS['hum'] * (1 - Hn)
            )
            
            FDI_THRESHOLD = 0.7
            if fdi > FDI_THRESHOLD:
                incident = IncidentReport.objects.create(
                    type='fire',
                    details=f"Temp={latest_temp.value}, Humidity={latest_humidity.value}, Gas={latest_gas.value}",
                    location=sensor.location,
                    FDI=fdi
                )

                unique_logs = {entry.id: entry for entry in [log, latest_temp, latest_humidity, latest_gas]}.values()
                IncidentSensorLog.objects.bulk_create([
                    IncidentSensorLog(incident=incident, sensor_log=entry)
                    for entry in unique_logs
                ])

                admins = User.objects.filter(role='admin')
                emails = list(admins.values_list('email', flat=True))
                notifications = [
                    Notification(
                        user=admin,
                        incident=incident,
                        reason="Fire danger threshold exceeded",
                        title="Fire Danger Alert",
                        message=f"Fire danger in {sensor.location}. Details: {incident.details}",
                        is_read=False
                    ) for admin in admins
                ]
                Notification.objects.bulk_create(notifications)

                if emails:
                    send_mail(
                        subject="Fire Danger Alert",
                        message=(
                            f"Fire danger detected in {sensor.location}.\n"
                            f"Temp: {latest_temp.value}\n"
                            f"Humidity: {latest_humidity.value}\n"
                            f"Gas: {latest_gas.value}\n"
                            f"FDI: {fdi:.2f}"
                        ),
                        from_email="smartshield1@zohomail.eu",
                        recipient_list=emails,
                        fail_silently=True,
                    )
                return Response({"incident_id": incident.id, "fdi": fdi}, status=status.HTTP_201_CREATED)

        return Response({"message": "Log created, FDI not triggered", "fdi": None}, status=status.HTTP_201_CREATED)
