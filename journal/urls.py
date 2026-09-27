from django.urls import path
from . import views

urlpatterns = [
    path('', views.journal_list_create_view, name='journal_list'),
    path('edit/<int:pk>/', views.journal_edit_view, name='journal_edit'),
    path('delete/<int:pk>/', views.journal_delete_view, name='journal_delete'),
]
