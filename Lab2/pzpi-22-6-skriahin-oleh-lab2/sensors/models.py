from django.db import models

SENSOR_TYPE_CHOICES = [
    ('motion', 'Motion'),
    ('smoke', 'Smoke'),
    ('temperature', 'Temperature'),
    ('humidity', 'Humidity'),
    ('gas', 'Gas'),
]

class SensorType(models.Model):
    type = models.CharField(
        max_length=20,
        choices=SENSOR_TYPE_CHOICES,
        unique=True
    )
    threshold_value = models.FloatField()
    measurement_unit = models.CharField(max_length=100)

    class Meta:
        db_table = 'sensors_sensortype'

    def __str__(self):
        return self.get_type_display()


class Sensor(models.Model):
    sensor_type = models.ForeignKey(
        SensorType,
        on_delete=models.PROTECT,
        related_name='sensors'
    )
    location = models.CharField(max_length=255)
    status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.type} sensor at {self.location}"

class SensorLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    value = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    exceeded_threshold = models.BooleanField(default=False)
    sensor = models.ForeignKey('Sensor', on_delete=models.CASCADE)

    class Meta:
        db_table = 'sensors_sensorlog'

    def check_threshold(self):
        st = self.sensor.sensor_type
        if st.type == 'humidity':
            self.exceeded_threshold = self.value < st.threshold_value
        else:
            self.exceeded_threshold = self.value > st.threshold_value
        self.save()
