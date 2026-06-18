from django.contrib import admin
from django.urls import path
from quiz_app import views

urlpatterns = [
    path('', views.login_page, name='student_login'),
    path('main-dashboard/', views.main_dashboard, name='main_dashboard'),
    path('login/', views.login_page, name='student_login_page'),
    path('do-login-student/', views.do_login_student, name='do_login_student'),
    path('admin-login/', views.admin_login_page, name='admin_login_page'),
    path('do-login-admin/', views.do_login_admin, name='do_login_admin'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('create-student-profile/', views.create_student_profile, name='create_student_profile'),
    path('student-list/', views.student_list_page, name='student_list_page'),
    path('page/', views.quiz_page, name='quiz_page'),
    path('logout/', views.logout_user, name='logout_user'),
    path('save-result/', views.save_result, name='save_result'),
    path('results/', views.result_list, name='results'),
    path('reset-quiz/', views.reset_quiz, name='reset_quiz'),
    path('admin-reset-student/<str:student_id>/', views.admin_reset_student, name='admin_reset_student'),
]