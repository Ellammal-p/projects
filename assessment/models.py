from django.db import models
from django.contrib.auth.models import User

def calculate_phq9_severity(total_score: int) -> tuple:
    """
    Calculates PHQ-9 severity category and description from total score (0-27).
    Standard PHQ-9 Cutoffs:
      0-4: Minimal
      5-9: Mild
      10-14: Moderate
      15-19: Moderately Severe
      20-27: Severe
    """
    if total_score <= 4:
        return ('Minimal', 'Minimal Symptom Severity')
    elif total_score <= 9:
        return ('Mild', 'Mild Symptom Severity')
    elif total_score <= 14:
        return ('Moderate', 'Moderate Symptom Severity')
    elif total_score <= 19:
        return ('Moderately Severe', 'Moderately Severe Symptom Severity')
    else:
        return ('Severe', 'Severe Symptom Severity')

class Question(models.Model):
    order = models.IntegerField(unique=True, help_text="Question number (1 to 9)")
    text = models.CharField(max_length=255, help_text="Educational screening question text")
    objects = models.Manager()
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {str(self.text)[:50]}"

class Assessment(models.Model):
    RISK_LEVELS = (
        ('Minimal', 'Minimal Symptoms'),
        ('Mild', 'Mild Symptom Risk'),
        ('Moderate', 'Moderate Symptom Risk'),
        ('Moderately Severe', 'Moderately Severe Risk'),
        ('Severe', 'Severe Symptom Risk'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    total_score = models.IntegerField(help_text="Calculated PHQ-9 score (0-27)")
    risk_category = models.CharField(max_length=50, choices=RISK_LEVELS)
    ml_prediction = models.CharField(max_length=100, help_text="Saved ML model classification output")
    ml_confidence = models.FloatField(default=85.0, help_text="ML Prediction confidence percentage")
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Assessment #{self.pk} for {self.user.username} - Score: {self.total_score} ({self.risk_category})"

class Answer(models.Model):
    RESPONSE_CHOICES = (
        (0, '0 - Not at all'),
        (1, '1 - Several days'),
        (2, '2 - More than half the days'),
        (3, '3 - Nearly every day'),
    )

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='answers')
    question_number = models.IntegerField()
    question_text = models.CharField(max_length=255)
    selected_option = models.IntegerField(choices=RESPONSE_CHOICES)
    objects = models.Manager()

    def __str__(self):
        return f"Assessment #{self.assessment.pk} - Q{self.question_number}: {self.selected_option}"

class PredictionResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    phq9_score = models.IntegerField(default=0)
    mood_avg = models.FloatField(default=3.0)
    journal_sentiment = models.FloatField(default=0.0)
    risk_label = models.CharField(max_length=100, default='Minimal')
    confidence = models.FloatField(default=85.0)
    model_used = models.CharField(max_length=100, default='Multimodal Fusion (PyTorch)')
    signal_breakdown = models.JSONField(default=dict, blank=True)
    disclaimer = models.TextField(
        default="This tool provides screening-oriented information and is not a clinical diagnosis. For concerns about your mental health, consult a qualified healthcare professional."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"PredictionResult #{self.pk} for {self.user.username} - {self.risk_label} ({self.confidence}%)"

class ModelVersion(models.Model):
    model_name = models.CharField(max_length=100)
    version = models.CharField(max_length=20, default='1.0.0')
    accuracy = models.FloatField(default=0.0)
    f1_score = models.FloatField(default=0.0)
    metrics_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def __str__(self):
        return f"{self.model_name} v{self.version} (Acc: {self.accuracy})"

