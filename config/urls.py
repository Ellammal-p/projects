from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

def home_view(request):
    return render(request, 'home.html')

from assessment.api_views import MultimodalAnalyzeAPIView, DashboardSummaryAPIView, SupportAPIView, ModelMetricsAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('api/auth/', include('accounts.api_urls')),
    path('api/phq9/', include('assessment.api_urls')),
    path('api/mood/', include('mood_tracker.api_urls')),
    path('api/journal/', include('journal.api_urls')),
    path('api/analyze/', MultimodalAnalyzeAPIView.as_view(), name='api_analyze_top'),
    path('api/dashboard/', DashboardSummaryAPIView.as_view(), name='api_dashboard_top'),
    path('api/support/', SupportAPIView.as_view(), name='api_support_top'),
    path('api/models/benchmarks/', ModelMetricsAPIView.as_view(), name='api_models_top'),
    path('accounts/', include('accounts.urls')),
    path('assessment/', include('assessment.urls')),
    path('mood/', include('mood_tracker.urls')),
    path('journal/', include('journal.urls')),
    path('wellness/', include('wellness.urls')),
]


handler404 = 'accounts.views.custom_404_view'
handler500 = 'accounts.views.custom_500_view'
