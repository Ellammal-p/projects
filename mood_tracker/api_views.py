from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Count
from .models import MoodEntry
from .serializers import MoodEntrySerializer

class MoodEntryListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MoodEntryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)

class MoodStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        all_entries = MoodEntry.objects.filter(user=user).order_by('-created_at')
        total_entries = all_entries.count()

        # Today's entry check
        today_date = now.date()
        today_entry = all_entries.filter(created_at__date=today_date).first()
        today_serialized = MoodEntrySerializer(today_entry).data if today_entry else None

        # Overall average
        avg_overall = all_entries.aggregate(Avg('mood_score'))['mood_score__avg']
        avg_overall = round(avg_overall, 2) if avg_overall is not None else None

        # 7-Day entries & average
        entries_7days = all_entries.filter(created_at__gte=seven_days_ago).order_by('created_at')
        avg_7days = entries_7days.aggregate(Avg('mood_score'))['mood_score__avg']
        avg_7days = round(avg_7days, 2) if avg_7days is not None else None

        # 30-Day entries & average
        entries_30days = all_entries.filter(created_at__gte=thirty_days_ago).order_by('created_at')
        avg_30days = entries_30days.aggregate(Avg('mood_score'))['mood_score__avg']
        avg_30days = round(avg_30days, 2) if avg_30days is not None else None

        # Distribution breakdown (counts 1 through 5)
        dist_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for entry in all_entries:
            if entry.mood_score in dist_counts:
                dist_counts[entry.mood_score] += 1

        mood_distribution = [
            {'score': 1, 'label': 'Very Low 😫', 'count': dist_counts[1]},
            {'score': 2, 'label': 'Low 😔', 'count': dist_counts[2]},
            {'score': 3, 'label': 'Neutral 😐', 'count': dist_counts[3]},
            {'score': 4, 'label': 'Good 🙂', 'count': dist_counts[4]},
            {'score': 5, 'label': 'Very Good 😊', 'count': dist_counts[5]},
        ]

        return Response({
            'total_entries': total_entries,
            'today_entry': today_serialized,
            'avg_overall': avg_overall,
            'avg_7days': avg_7days,
            'avg_30days': avg_30days,
            'history_7days': MoodEntrySerializer(entries_7days, many=True).data,
            'history_30days': MoodEntrySerializer(entries_30days, many=True).data,
            'mood_distribution': mood_distribution,
        })
