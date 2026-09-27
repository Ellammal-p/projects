import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from assessment.views import seed_questions_if_needed
from wellness.views import seed_wellness_if_needed
from assessment.models import Assessment, Answer
from mood_tracker.models import MoodEntry
from journal.models import JournalEntry
from journal.views import analyze_sentiment

def create_demo_data():
    print("Seeding PHQ-9 questions...")
    seed_questions_if_needed()
    
    print("Seeding wellness tips and helplines...")
    seed_wellness_if_needed()
    
    # Create Superuser / Demo user
    username = 'student'
    password = 'password123'
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_superuser(
            username=username,
            email='student@example.com',
            password=password,
            first_name='Alex',
            last_name='Student'
        )
        print(f"Created demo superuser: '{username}' with password: '{password}'")
    else:
        user = User.objects.get(username=username)
        print(f"Demo superuser '{username}' already exists.")
        
    # Seed sample mood entries for Alex
    if MoodEntry.objects.filter(user=user).count() == 0:
        MoodEntry.objects.create(user=user, mood_score=4, note="Had a productive study session today!")
        MoodEntry.objects.create(user=user, mood_score=3, note="Busy day preparing project slides.")
        MoodEntry.objects.create(user=user, mood_score=5, note="Great weekend with friends and family.")
        print("Created sample mood entries.")

    # Seed sample journal entry
    if JournalEntry.objects.filter(user=user).count() == 0:
        content = "Felt slightly stressed about the upcoming project expo demo, but breaking down my tasks helped me stay calm and focused."
        score, label = analyze_sentiment(content)
        JournalEntry.objects.create(
            user=user,
            title="Project Expo Prep Reflection",
            content=content,
            sentiment_score=score,
            sentiment_label=label
        )
        print("Created sample journal entry.")

    print("\n[OK] Database seeding complete!")

if __name__ == '__main__':
    create_demo_data()
