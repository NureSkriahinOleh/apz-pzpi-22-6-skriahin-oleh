from django.db import models
from users.models import User
from incidents.models import IncidentReport

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    incident = models.ForeignKey(
        IncidentReport,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    reason = models.CharField(max_length=255)
    title = models.CharField(max_length=100)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
