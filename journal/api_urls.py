from django.urls import path
from .api_views import JournalListCreateAPIView

urlpatterns = [
    path('', JournalListCreateAPIView.as_view(), name='api_journal_list_create'),
]
