import json

from django.contrib import messages
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from functools import wraps

from .models import QuizResult, StudentProfile

# ─── Pass threshold ────────────────────────────────────────────
PASS_PERCENTAGE = 50   # student passes if score% >= 50 (5/10)


# ─── Session-based decorators ──────────────────────────────────

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


# ─── Context helpers ───────────────────────────────────────────

def get_admin_context(request):
    return {
        'session_admin_id':   request.session.get('admin_id', 'Admin'),
        'session_admin_role': request.session.get('admin_role', 'Administrator'),
    }


def get_student_context(request):
    return {
        'session_student_id':   request.session.get('student_id', ''),
        'session_student_name': request.session.get('student_name', 'Student'),
    }


# ─── Admin views ───────────────────────────────────────────────

@admin_required
def main_dashboard(request):
    students = StudentProfile.objects.all()
    attendees = []

    for student in students:
        results = QuizResult.objects.filter(student=student)
        if results.exists():
            total_marks = results.aggregate(Sum('marks_scored'))['marks_scored__sum'] or 0
            percentage  = round((total_marks / 10.0) * 100, 1)
            if float(percentage).is_integer():
                percentage = int(percentage)
            attendees.append({
                'name':           student.name,
                'percentage':     f"{percentage}%",
                'percentage_val': percentage,
            })

    attendees       = sorted(attendees, key=lambda x: x['percentage_val'], reverse=True)
    total_students  = students.count()
    quiz_attended   = len(attendees)
    top_score       = f"{attendees[0]['percentage']}" if attendees else "0%"

    context = {
        'attendees':          attendees,
        'total_students':     total_students,
        'quiz_attended_count':quiz_attended,
        'top_score':          top_score,
        **get_admin_context(request),
    }
    return render(request, 'main_dashboard.html', context)


def admin_login_page(request):
    if request.session.get('admin_logged_in'):
        return redirect('main_dashboard')
    return render(request, 'admin_login.html')


def do_login_admin(request):
    if request.method == 'POST':
        admin_id       = request.POST.get('admin_id', '').strip()
        admin_password = request.POST.get('admin_password', '').strip()

        if admin_id == 'admin' and admin_password == 'admin123':
            request.session['admin_logged_in'] = True
            request.session['admin_id']        = admin_id
            request.session['admin_role']      = 'Administrator'
            messages.success(request, f'Welcome back, {admin_id}!')
            return redirect('main_dashboard')

        messages.error(request, 'Invalid admin credentials. Please try again.')
    return redirect('admin_login_page')


@admin_required
def admin_dashboard(request):
    return render(request, 'admin_dashboard.html', get_admin_context(request))


@admin_required
def create_student_profile(request):
    if request.method == 'POST':
        name  = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()

        student_id = str(StudentProfile.objects.count() + 1)
        password   = '123456'
        StudentProfile.objects.create(
            name=name, email=email,
            student_id=student_id, password=password
        )
        messages.success(
            request,
            f'Student profile created! — ID: {student_id} | Password: 123456'
        )
    return redirect('admin_dashboard')


@admin_required
def student_list_page(request):
    """
    Lists every student with their exam status, score, and a
    Reset button (visible only for failed students).
    """
    students = StudentProfile.objects.order_by('id')
    student_data = []

    for student in students:
        results    = QuizResult.objects.filter(student=student)
        has_taken  = results.exists()
        total_marks = 0
        percentage  = 0
        status      = 'not_taken'

        if has_taken:
            total_marks = results.aggregate(Sum('marks_scored'))['marks_scored__sum'] or 0
            percentage  = round((total_marks / 10.0) * 100, 1)
            if float(percentage).is_integer():
                percentage = int(percentage)
            status = 'passed' if percentage >= PASS_PERCENTAGE else 'failed'

        student_data.append({
            'obj':        student,
            'has_taken':  has_taken,
            'total_marks':total_marks,
            'percentage': percentage,
            'status':     status,
        })

    context = {
        'student_data': student_data,
        **get_admin_context(request),
    }
    return render(request, 'student_list.html', context)


@admin_required
def admin_reset_student(request, student_id):
    """
    Admin resets a specific student's quiz results so they can retake the exam.
    Only works via POST for safety.
    """
    if request.method == 'POST':
        student = get_object_or_404(StudentProfile, student_id=student_id)
        deleted_count, _ = QuizResult.objects.filter(student=student).delete()
        if deleted_count:
            messages.success(
                request,
                f"✅ {student.name}'s quiz results have been cleared. They can now retake the exam."
            )
        else:
            messages.info(request, f"{student.name} has no results to reset.")
    return redirect('student_list_page')


# ─── Student views ─────────────────────────────────────────────

def login_page(request):
    if request.session.get('student_id'):
        return redirect('quiz_page')
    return render(request, 'login.html')


def do_login_student(request):
    if request.method == 'POST':
        student_id = request.POST.get('student_id', '').strip()
        password   = request.POST.get('student_password', '').strip()

        student = StudentProfile.objects.filter(
            student_id=student_id, password=password
        ).first()

        if student:
            request.session['student_id']    = student_id
            request.session['student_name']  = student.name
            request.session['student_email'] = student.email
            messages.success(request, f'Welcome, {student.name}!')
            return redirect('quiz_page')

        messages.error(request, 'Invalid student ID or password.')
    return redirect('student_login_page')


@student_required
def quiz_page(request):
    """
    A student can only take the quiz once.
    If they already have results in the DB, redirect them to their results.
    """
    student_id = request.session.get('student_id')
    student    = StudentProfile.objects.filter(student_id=student_id).first()

    if student and QuizResult.objects.filter(student=student).exists():
        messages.info(
            request,
            'You have already completed the quiz. Here are your results.'
        )
        return redirect('results')

    context = get_student_context(request)
    return render(request, 'page.html', context)


@student_required
def save_result(request):
    if request.method == 'POST':
        data       = json.loads(request.body)
        student_id = request.session.get('student_id')
        student    = StudentProfile.objects.filter(student_id=student_id).first()

        QuizResult.objects.create(
            student=student,
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
    student_id  = request.session.get('student_id')
    student     = StudentProfile.objects.filter(student_id=student_id).first()
    results     = QuizResult.objects.filter(student=student).order_by('question_no')
    total_score = results.aggregate(Sum('marks_scored'))['marks_scored__sum'] or 0
    percentage  = round((total_score / 10.0) * 100, 1)
    if float(percentage).is_integer():
        percentage = int(percentage)
    passed = percentage >= PASS_PERCENTAGE

    context = {
        'results':     results,
        'total_score': total_score,
        'percentage':  percentage,
        'passed':      passed,
        **get_student_context(request),
    }
    return render(request, 'result_list.html', context)


@student_required
def reset_quiz(request):
    """Called by JS at the start of quiz page to clear old results."""
    student_id = request.session.get('student_id')
    student    = StudentProfile.objects.filter(student_id=student_id).first()
    if student:
        QuizResult.objects.filter(student=student).delete()
    return JsonResponse({'status': 'success'})


# ─── Logout ────────────────────────────────────────────────────

def logout_user(request):
    is_admin     = request.session.get('admin_logged_in', False)
    admin_id     = request.session.get('admin_id', '')
    student_name = request.session.get('student_name', '')

    request.session.flush()

    if is_admin:
        messages.success(request, f'Logout successful! Goodbye, {admin_id}.')
        return redirect('admin_login_page')
    else:
        messages.success(request, f'Logout successful! See you soon, {student_name}.')
        return redirect('student_login_page')