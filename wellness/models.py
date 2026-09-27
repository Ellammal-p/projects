from django.db import models

class MentalWellnessTip(models.Model):
    CATEGORY_CHOICES = (
        ('sleep', 'Sleep Hygiene & Rest'),
        ('activity', 'Physical Activity & Movement'),
        ('social', 'Social Connection & Support'),
        ('mindfulness', 'Mindfulness & Relaxation'),
        ('routine', 'Healthy Daily Routine'),
    )

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    content = models.TextField()
    icon_class = models.CharField(max_length=50, default='bi-heart-pulse', help_text="Bootstrap icons name (e.g. bi-moon-stars)")
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

class SupportHelpline(models.Model):
    name = models.CharField(max_length=200)
    organization = models.CharField(max_length=200)
    contact_number = models.CharField(max_length=100)
    operating_hours = models.CharField(max_length=100, default='24/7 Toll-Free')
    country = models.CharField(max_length=100, default='India / Global')
    website = models.URLField(blank=True, null=True)
    description = models.TextField()
    objects = models.Manager()

    def __str__(self):
        return f"{self.name} - {self.contact_number}"
