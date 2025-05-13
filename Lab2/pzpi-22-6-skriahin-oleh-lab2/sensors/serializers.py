# sensors/serializers.py

from rest_framework import serializers
from .models import Sensor, SensorLog, SensorType


class SensorTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for SensorType objects
    """
    class Meta:
        model = SensorType
        fields = ['id', 'type', 'threshold_value', 'measurement_unit']


class SensorSerializer(serializers.ModelSerializer):
    """
    Serializer for Sensor objects, including nested SensorType
    """
    sensor_type = SensorTypeSerializer(read_only=True)

    class Meta:
        model = Sensor
        fields = ['id', 'sensor_type', 'location', 'status']


class CreateSensorSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Sensor objects via sensor_type_id
    """
    sensor_type_id = serializers.PrimaryKeyRelatedField(
        queryset=SensorType.objects.all(),
        source='sensor_type',
        write_only=True,
        help_text='ID of the sensor type'
    )

    class Meta:
        model = Sensor
        fields = ['sensor_type_id', 'location', 'status']


class SensorLogSerializer(serializers.ModelSerializer):
    """
    Serializer for SensorLog objects
    """
    sensor = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = SensorLog
        fields = ['id', 'sensor', 'value', 'timestamp', 'exceeded_threshold']


class CreateSensorLogSerializer(serializers.Serializer):
    """
    Serializer for creating SensorLog entries via sensor_id and value
    """
    sensor_id = serializers.IntegerField(help_text='ID of the sensor')
    value = serializers.FloatField(help_text='Value for the new log')
