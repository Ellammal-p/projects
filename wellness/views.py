from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import MentalWellnessTip, SupportHelpline

DEFAULT_HELPLINES = [
    {
        'name': 'Tele-MANAS (Tele Mental Health Assistance and Networking Across States)',
        'organization': 'Ministry of Health & Family Welfare, Govt. of India',
        'contact_number': '14416 / 1800-891-4416',
        'operating_hours': '24/7 Toll-Free Multi-lingual Support',
        'country': 'India',
        'website': 'https://telemanas.mohfw.gov.in/',
        'description': 'Official 24/7 national tele-mental health service providing comprehensive counseling and crisis care.'
    },
    {
        'name': 'KIRAN Mental Health Rehabilitation Helpline',
        'organization': 'Dept. of Empowerment of Persons with Disabilities, Govt. of India',
        'contact_number': '1800-599-0019',
        'operating_hours': '24/7 Toll-Free Helpline',
        'country': 'India',
        'website': 'https://depwd.gov.in/',
        'description': 'Free mental health support, crisis intervention, screening, and psychological first aid.'
    },
    {
        'name': 'AASRA Crisis Helpline',
        'organization': 'AASRA Trust',
        'contact_number': '+91-9820466726',
        'operating_hours': '24/7 Helpline',
        'country': 'India',
        'website': 'http://www.aasra.info/',
        'description': 'Professional & confidential support for individuals facing emotional crisis or distress.'
    },
    {
        'name': '988 Suicide & Crisis Lifeline',
        'organization': 'Substance Abuse and Mental Health Services Administration (SAMHSA)',
        'contact_number': '988',
        'operating_hours': '24/7 Free & Confidential',
        'country': 'USA / International Partner Networks',
        'website': 'https://988lifeline.org/',
        'description': '24/7 crisis support available by call or text.'
    }
]

DEFAULT_TIPS = [
    {
        'title': 'Prioritize Restorative Sleep',
        'category': 'sleep',
        'icon_class': 'bi-moon-stars-fill',
        'content': 'Maintain a consistent sleep routine by sleeping and waking at the same time every day. Limit screen time 1 hour before bed.'
    },
    {
        'title': 'Engage in Moderate Daily Physical Exercise',
        'category': 'activity',
        'icon_class': 'bi-activity',
        'content': 'Even 20 minutes of daily walking, yoga, or stretching boosts endorphin release and elevates overall energy and mood balance.'
    },
    {
        'title': 'Nurture Supportive Relationships',
        'category': 'social',
        'icon_class': 'bi-people-fill',
        'content': 'Reach out to trusted friends, family members, or peer support groups. Sharing feelings with trusted individuals reduces emotional isolation.'
    },
    {
        'title': 'Practice Deep Breathing & Grounding',
        'category': 'mindfulness',
        'icon_class': 'bi-wind',
        'content': 'Use the 4-7-8 breathing technique or 5-4-3-2-1 sensory grounding exercise during times of elevated anxiety or emotional strain.'
    },
    {
        'title': 'Establish Micro-Routines & Structured Goals',
        'category': 'routine',
        'icon_class': 'bi-journal-check',
        'content': 'Break down overwhelming daily tasks into manageable micro-goals. Celebrate small accomplishments throughout the day.'
    }
]

def seed_wellness_if_needed():
    if SupportHelpline.objects.count() == 0:
        for item in DEFAULT_HELPLINES:
            SupportHelpline.objects.create(**item)
            
    if MentalWellnessTip.objects.count() == 0:
        for item in DEFAULT_TIPS:
            MentalWellnessTip.objects.create(**item)

def tips_view(request):
    seed_wellness_if_needed()
    tips = MentalWellnessTip.objects.all().order_by('category')
    return render(request, 'wellness/tips.html', {'tips': tips})

def support_view(request):
    seed_wellness_if_needed()
    helplines = SupportHelpline.objects.all()
    return render(request, 'wellness/support.html', {'helplines': helplines})

@login_required
def chatbot_view(request):
    return render(request, 'wellness/chatbot.html')

@login_required
def breathing_view(request):
    return render(request, 'wellness/breathing.html')

@login_required
@csrf_exempt
def chatbot_api_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        user_msg = data.get('message', '').strip().lower()
    except Exception:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not user_msg:
        return JsonResponse({'reply': 'I am here to listen. How are you feeling today?'})

    # Crisis / Immediate Danger Keywords
    crisis_words = ['suicide', 'kill myself', 'die', 'end my life', 'self-harm', 'harm myself', 'hurt myself', 'hopeless']
    if any(w in user_msg for w in crisis_words):
        return JsonResponse({
            'reply': "I hear that you're going through immense pain right now, but please know you don't have to carry this alone. Please reach out immediately to a trusted helpline: Tele-MANAS at 14416 (India) or 988 (USA/Intl). You are valuable, and help is available 24/7.",
            'is_crisis': True
        })

    # Intent Matching for Mental Health Coaching
    if any(w in user_msg for w in ['anxious', 'anxiety', 'panic', 'scared', 'worry', 'worried', 'overwhelmed']):
        reply = "Anxiety can feel truly overwhelming. Let's try grounding together: Take a deep breath in for 4 seconds, hold for 4, and exhale slowly for 4. Have you tried our Guided Breathing tool under the Breathing tab?"
    elif any(w in user_msg for w in ['sad', 'depressed', 'crying', 'down', 'lonely', 'empty', 'miserable']):
        reply = "I'm really sorry you're feeling down today. Remember that it's okay to feel this way. Small steps matter: try drinking a glass of water, going for a short 5-minute walk, or jotting down your thoughts in your private Journal."
    elif any(w in user_msg for w in ['sleep', 'insomnia', 'tired', 'exhausted', 'can\'t sleep', 'nightmare']):
        reply = "Sleep is crucial for emotional resilience. Try setting a relaxing 30-minute pre-bed routine: dim the lights, put away screens, and focus on slow abdominal breathing."
    elif any(w in user_msg for w in ['study', 'exam', 'work', 'stress', 'pressure', 'deadline']):
        reply = "Academic and work pressure can build up quickly. Try the Pomodoro technique: work focused for 25 minutes, then take a full 5-minute rest break to stretch and breathe."
    elif any(w in user_msg for w in ['reframe', 'thought', 'negative', 'mind', 'overthinking']):
        reply = "When negative thoughts spiral, ask yourself: 'Is this thought 100% factual, or is my stress talking?' Cognitive reframing helps replace extreme thoughts with balanced, realistic ones."
    else:
        reply = f"Thank you for sharing. Navigating emotional wellness takes practice. How has your mood been over the past few days, or would you like to take a PHQ-9 assessment to track your progress?"

    return JsonResponse({'reply': reply, 'is_crisis': False})

@login_required
def export_report_view(request):
    from assessment.models import Assessment
    from mood_tracker.models import MoodEntry
    from journal.models import JournalEntry

    user = request.user
    assessments = Assessment.objects.filter(user=user).order_by('-created_at')
    latest_assessment = assessments.first()
    moods = MoodEntry.objects.filter(user=user).order_by('-created_at')[:10]
    journals = JournalEntry.objects.filter(user=user).order_by('-created_at')[:10]

    context = {
        'user': user,
        'profile': user.profile,
        'assessments': assessments[:5],
        'latest_assessment': latest_assessment,
        'moods': moods,
        'journals': journals,
    }
    return render(request, 'wellness/report.html', context)

def pets_view(request):
    return render(request, 'wellness/pets.html')
