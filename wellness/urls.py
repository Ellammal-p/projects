from django.urls import path
from . import views

urlpatterns = [
    path('tips/', views.tips_view, name='wellness_tips'),
    path('support/', views.support_view, name='support_resources'),
    path('helplines/', views.support_view, name='helplines'),
    path('chatbot/', views.chatbot_view, name='chatbot'),
    path('chatbot/api/', views.chatbot_api_view, name='chatbot_api'),
    path('breathing/', views.breathing_view, name='breathing'),
    path('pets/', views.pets_view, name='pet_therapy'),
    path('report/', views.export_report_view, name='export_report'),
]
