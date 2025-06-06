from django.db.models.signals import post_save
from django.dispatch import receiver
from firebase_admin import messaging
from users.models import Device
from .models import IncidentReport

@receiver(post_save, sender=IncidentReport)
def notify_new_incident(sender, instance: IncidentReport, created, **kwargs):
    if not created:
        return

    tokens = list(Device.objects.values_list('token', flat=True))
    if not tokens:
        return

    notification = messaging.Notification(
        title=f"Новий інцідент: {instance.get_type_display()}",
        body=f"Локація: {instance.location}, FDI: {instance.FDI}"
    )

    sent = 0
    errors = []
    for token in tokens:
        msg = messaging.Message(
            notification=notification,
            token=token
        )
        try:
            messaging.send(msg)
            sent += 1
        except Exception as e:
            errors.append((token, str(e)))

    print(f"FCM: sent {sent}/{len(tokens)} messages.")
    if errors:
        print("FCM errors:", errors)
