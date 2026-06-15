from django.contrib import admin
from django.urls import path
from quiz_app import views

urlpatterns = [
    path('page/', views.quiz_page),
    path('save-result/', views.save_result, name='save_result'),
    path('results/', views.result_list, name='results'),
    path('reset-quiz/', views.reset_quiz, name='reset_quiz'),
]