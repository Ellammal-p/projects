from rest_framework import serializers
from .models import MoodEntry

class MoodEntrySerializer(serializers.ModelSerializer):
    mood_display = serializers.CharField(source='get_mood_score_display', read_only=True)

    class Meta:
        model = MoodEntry
        fields = ['id', 'user', 'mood_score', 'mood_display', 'note', 'created_at']
        read_only_fields = ['id', 'user', 'mood_display', 'created_at']

    def validate_mood_score(self, value):
        if not isinstance(value, int) or value < 1 or value > 5:
            raise serializers.ValidationError("Mood score must be an integer between 1 and 5.")
        return value
