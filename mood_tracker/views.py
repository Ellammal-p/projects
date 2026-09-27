import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import MoodEntry
from .forms import MoodForm

@login_required
def mood_list_create_view(request):
    user = request.user
    mood_entries = MoodEntry.objects.filter(user=user).order_by('-created_at')
    
    if request.method == 'POST':
        form = MoodForm(request.POST)
        if form.is_valid():
            mood = form.save(commit=False)
            mood.user = user
            mood.save()
            messages.success(request, "Mood entry logged successfully!")
            return redirect('mood_list')
    else:
        form = MoodForm()
        
    # Chart.js data
    chart_entries = list(mood_entries[:15])[::-1]
    chart_dates = [m.created_at.strftime('%b %d') for m in chart_entries]
    chart_moods = [m.mood_score for m in chart_entries]
    
    # Counts for doughnut breakdown
    mood_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for m in mood_entries:
        mood_counts[m.mood_score] += 1
        
    context = {
        'form': form,
        'mood_entries': mood_entries,
        'chart_dates': json.dumps(chart_dates),
        'chart_moods': json.dumps(chart_moods),
        'mood_distribution': json.dumps(list(mood_counts.values())),
    }
    return render(request, 'mood/mood_list.html', context)

@login_required
def mood_delete_view(request, pk):
    mood = get_object_or_404(MoodEntry, pk=pk)
    if mood.user != request.user:
        messages.error(request, "Unauthorized action.")
        return redirect('mood_list')
        
    if request.method == 'POST':
        mood.delete()
        messages.success(request, "Mood entry deleted.")
    return redirect('mood_list')
