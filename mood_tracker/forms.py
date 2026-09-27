from django import forms
from .models import MoodEntry

class MoodForm(forms.ModelForm):
    class Meta:
        model = MoodEntry
        fields = ['mood_score', 'note']
        widgets = {
            'mood_score': forms.Select(attrs={'class': 'form-select'}),
            'note': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Optional reflection or note about your day...'}),
        }
