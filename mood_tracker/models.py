from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class MoodEntry(models.Model):
    MOOD_CHOICES = (
        (1, 'Very Low 😫'),
        (2, 'Low 😔'),
        (3, 'Neutral 😐'),
        (4, 'Good 🙂'),
        (5, 'Very Good 😊'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_entries')
    mood_score = models.IntegerField(
        choices=MOOD_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    note = models.TextField(blank=True, help_text="Optional note or reflection on how you felt today.")
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        date_str = self.created_at.strftime('%b %d, %Y') if self.created_at else ''
        return f"{self.user.username} - {self.get_mood_score_display()} on {date_str}"

