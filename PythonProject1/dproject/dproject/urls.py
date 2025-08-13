from django.contrib import admin
from django.urls import path
from dapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage),
    path('save/', views.save),
    path('show/', views.show, name='show'),
    path('edit/<int:a>/', views.edit),
    path('update/', views.update, name='update'),
    path('delete/<int:a>/', views.delete),
    path('login/', views.login_page, name='login'),
    path('login_aut/', views.login_aut, name='login_aut'),
    path('logout/', views.logout_page)
]
