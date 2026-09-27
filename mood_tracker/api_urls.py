from django.urls import path
from .api_views import (
    MoodEntryListCreateAPIView,
    MoodEntryDetailAPIView,
    MoodStatsAPIView,
)

urlpatterns = [
    path('', MoodEntryListCreateAPIView.as_view(), name='api_mood_list_create'),
    path('stats/', MoodStatsAPIView.as_view(), name='api_mood_stats'),
    path('<int:pk>/', MoodEntryDetailAPIView.as_view(), name='api_mood_detail'),
]
