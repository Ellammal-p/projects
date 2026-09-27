import json
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegisterForm, ProfileUpdateForm

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            
            # Update user profile
            profile = user.profile
            profile.age = form.cleaned_data['age']
            profile.gender = int(form.cleaned_data['gender'])
            profile.save()
            
            login(request, user)
            messages.success(request, f"Account created successfully. Welcome, {user.username}!")
            return redirect('dashboard')
        else:
            messages.error(request, "Please correct the registration errors below.")
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect('dashboard')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, "You have successfully logged out.")
    return redirect('home')

@login_required
def profile_view(request):
    user = request.user
    profile = user.profile
    
    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            profile.age = form.cleaned_data['age']
            profile.gender = int(form.cleaned_data['gender'])
            profile.emergency_contact = form.cleaned_data['emergency_contact']
            profile.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('profile')
    else:
        form = ProfileUpdateForm(
            instance=user,
            initial={
                'age': profile.age,
                'gender': profile.gender,
                'emergency_contact': profile.emergency_contact
            }
        )
    return render(request, 'accounts/profile.html', {'form': form, 'profile': profile})

@login_required
def dashboard_view(request):
    user = request.user
    
    # Import inside function to prevent circular imports
    from assessment.models import Assessment
    from mood_tracker.models import MoodEntry
    from journal.models import JournalEntry
    
    assessments = Assessment.objects.filter(user=user).order_by('-created_at')
    latest_assessment = assessments.first()
    total_assessments = assessments.count()
    
    moods = MoodEntry.objects.filter(user=user).order_by('-created_at')
    latest_mood = moods.first()
    
    journals = JournalEntry.objects.filter(user=user).order_by('-created_at')
    total_journals = journals.count()
    
    # Prepare data for Chart.js
    assessment_history = list(assessments[:10])[::-1]
    chart_dates = [a.created_at.strftime('%b %d') for a in assessment_history]
    chart_scores = [a.total_score for a in assessment_history]
    
    # Sentiment distribution for chart
    pos_count = journals.filter(sentiment_label='Positive').count()
    neu_count = journals.filter(sentiment_label='Neutral').count()
    neg_count = journals.filter(sentiment_label='Negative').count()
    
    # Simple streak counter
    streak = moods.count() + total_assessments
    
    is_high_risk = latest_assessment and (latest_assessment.total_score >= 15 or latest_assessment.risk_category in ['Moderately Severe Risk', 'Severe Symptom Risk'])
    
    context = {
        'latest_assessment': latest_assessment,
        'total_assessments': total_assessments,
        'latest_mood': latest_mood,
        'total_journals': total_journals,
        'chart_dates': json.dumps(chart_dates),
        'chart_scores': json.dumps(chart_scores),
        'sent_counts': {'Positive': pos_count, 'Neutral': neu_count, 'Negative': neg_count},
        'streak': streak,
        'is_high_risk': is_high_risk,
    }
    return render(request, 'dashboard/index.html', context)

def custom_404_view(request, exception):
    return render(request, 'errors/404.html', status=404)

def custom_500_view(request):
    return render(request, 'errors/500.html', status=500)
