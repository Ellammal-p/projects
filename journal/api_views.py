from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from .models import JournalEntry
from .views import analyze_sentiment

class JournalEntrySerializer(ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'title', 'content', 'sentiment_score', 'sentiment_label', 'created_at']
        read_only_fields = ['id', 'sentiment_score', 'sentiment_label', 'created_at']

class JournalListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JournalEntrySerializer

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        content = serializer.validated_data.get('content', '')
        score, label = analyze_sentiment(content)
        serializer.save(user=self.request.user, sentiment_score=score, sentiment_label=label)
