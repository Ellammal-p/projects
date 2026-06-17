import json

from django.contrib import messages
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import redirect, render
from functools import wraps

from .models import QuizResult, StudentProfile


def student_required(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.session.get('student_id'):
            messages.error(request, 'Please login as a student first.')
            return redirect('student_login_page')
        return view_func(request, *args, **kwargs)
    return _wrapped


def admin_required(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.session.get('admin_logged_in'):
            messages.error(request, 'Please login as admin first.')
            return redirect('admin_login_page')
        return view_func(request, *args, **kwargs)
    return _wrapped


def main_dashboard(request):
    return render(request, 'main_dashboard.html')


def login_page(request):
    return render(request, 'login.html')


def do_login_student(request):
    if request.method == 'POST':
        student_id = request.POST.get('student_id', '').strip()
        password = request.POST.get('student_password', '').strip()

        student = StudentProfile.objects.filter(student_id=student_id, password=password).first()
        if student or (student_id == '1' and password == '123456'):
            request.session['student_id'] = student_id
            messages.success(request, 'Student login successful.')
            return redirect('quiz_page')

        messages.error(request, 'Invalid student ID or password.')
    return redirect('student_login_page')


def admin_login_page(request):
    return render(request, 'admin_login.html')


def do_login_admin(request):
    if request.method == 'POST':
        admin_id = request.POST.get('admin_id', '').strip()
        admin_password = request.POST.get('admin_password', '').strip()

        if admin_id == 'admin' and admin_password == 'admin123':
            request.session['admin_logged_in'] = True
            messages.success(request, 'Admin login successful.')
            return redirect('admin_dashboard')

        messages.error(request, 'Invalid admin credentials.')
    return redirect('admin_login_page')


@admin_required
def admin_dashboard(request):
    return render(request, 'admin_dashboard.html')


@admin_required
def create_student_profile(request):

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()

        student_id = str(StudentProfile.objects.count() + 1)
        password = '123456'

        StudentProfile.objects.create(name=name, email=email, student_id=student_id, password=password)
        messages.success(request, f'Student profile created. ID: {student_id}, Password: 123456')

    return redirect('admin_dashboard')


@admin_required
def student_list_page(request):
    students = StudentProfile.objects.order_by('-id')
    return render(request, 'student_list.html', {'students': students})


@student_required
def quiz_page(request):
    return render(request, 'page.html')


@student_required
def save_result(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        QuizResult.objects.create(
            question_no=data['question_no'],
            attempts_used=data['attempts_used'],
            marks_scored=data['marks_scored'],
            correct_answer=data['correct_answer'],
            user_answer=data['user_answer'],
        )

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'}, status=400)


@student_required
def result_list(request):
    results = QuizResult.objects.all()
    total_score = results.aggregate(Sum('marks_scored'))['marks_scored__sum'] or 0
    return render(request, 'result_list.html', {'results': results, 'total_score': total_score})


@student_required
def reset_quiz(request):
    return JsonResponse({'status': 'success'})


def logout_user(request):
    request.session.flush()
    messages.info(request, 'You have been logged out successfully.')
    return redirect('student_login_page')