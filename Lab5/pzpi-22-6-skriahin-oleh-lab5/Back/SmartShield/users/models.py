from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('admindb', 'AdminDB'),
        ('guard', 'Guard'),
        ('visitor', 'Visitor'),
    ]
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='visitor',
    )
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username
    
class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)