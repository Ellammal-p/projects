from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    GENDER_CHOICES = (
        (0, 'Female'),
        (1, 'Male'),
        (2, 'Other / Prefer not to say'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.IntegerField(default=22)
    gender = models.IntegerField(choices=GENDER_CHOICES, default=0)
    emergency_contact = models.CharField(max_length=15, blank=True, null=True, help_text="Optional trusted emergency contact phone")
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def __str__(self):
        return f"Profile for {self.user.username}"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()
