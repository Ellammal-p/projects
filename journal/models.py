from django.db import models
from django.contrib.auth.models import User

class JournalEntry(models.Model):
    SENTIMENT_CHOICES = (
        ('Positive', 'Positive 😊'),
        ('Neutral', 'Neutral 😐'),
        ('Negative', 'Negative 😔'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    title = models.CharField(max_length=200, help_text="Title of your journal entry")
    content = models.TextField(help_text="Write your thoughts, feelings, or daily reflections here...")
    sentiment_score = models.FloatField(default=0.0, help_text="NLP compound sentiment score (-1.0 to 1.0)")
    sentiment_label = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='Neutral')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.sentiment_label})"
