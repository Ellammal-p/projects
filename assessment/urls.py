from django.urls import path
from . import views

urlpatterns = [
    path('take/', views.take_assessment_view, name='take_assessment'),
    path('result/<int:pk>/', views.result_detail_view, name='assessment_result'),
    path('history/', views.history_list_view, name='assessment_history'),
    path('history/list/', views.history_list_view, name='history_list'),
]
