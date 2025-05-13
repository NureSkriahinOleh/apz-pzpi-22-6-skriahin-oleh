from django.db import models
from sensors.models import Sensor, SensorLog

class IncidentReport(models.Model):
    INCIDENT_TYPE_CHOICES = [
        ('fire', 'Fire'),
        ('gas_leak', 'Gas Leak'),
        ('intrusion', 'Intrusion'),
    ]
    type = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES)
    details = models.TextField()
    location = models.CharField(max_length=100)
    FDI = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    sensor_logs = models.ManyToManyField(
        SensorLog,
        through='IncidentSensorLog',
        related_name='incidents'
    )

    def __str__(self):
        return f"Incident: {self.type} at {self.created_at}"

class IncidentSensorLog(models.Model):
    incident = models.ForeignKey(
        IncidentReport,
        on_delete=models.CASCADE
    )
    sensor_log = models.ForeignKey(
        SensorLog,
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'incidents_incidentsensorlog'
        unique_together = ('incident', 'sensor_log')