from django.urls import path
from . import views

urlpatterns = [
    path('', views.mood_list_create_view, name='mood_list'),
    path('delete/<int:pk>/', views.mood_delete_view, name='mood_delete'),
]
