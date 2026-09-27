from django.urls import path
from .api_views import (
    QuestionListAPIView,
    PHQ9SubmitAPIView,
    AssessmentHistoryAPIView,
    AssessmentDetailAPIView,
    ModelMetricsAPIView,
    MultimodalAnalyzeAPIView,
    DashboardSummaryAPIView,
    SupportAPIView,
)

urlpatterns = [
    path('questions/', QuestionListAPIView.as_view(), name='api_phq9_questions'),
    path('submit/', PHQ9SubmitAPIView.as_view(), name='api_phq9_submit'),
    path('history/', AssessmentHistoryAPIView.as_view(), name='api_phq9_history'),
    path('metrics/', ModelMetricsAPIView.as_view(), name='api_phq9_metrics'),
    path('benchmarks/', ModelMetricsAPIView.as_view(), name='api_models_benchmarks'),
    path('analyze/', MultimodalAnalyzeAPIView.as_view(), name='api_multimodal_analyze'),
    path('dashboard/', DashboardSummaryAPIView.as_view(), name='api_dashboard_summary'),
    path('support/', SupportAPIView.as_view(), name='api_support_resources'),
    path('<int:pk>/', AssessmentDetailAPIView.as_view(), name='api_phq9_detail'),
]

