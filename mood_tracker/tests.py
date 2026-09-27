from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from mood_tracker.models import MoodEntry

class MoodEntryModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="Password123!")

    def test_mood_entry_creation(self):
        entry = MoodEntry.objects.create(user=self.user, mood_score=4, note="Feeling good today")
        self.assertEqual(entry.mood_score, 4)
        self.assertEqual(entry.note, "Feeling good today")
        self.assertEqual(entry.user, self.user)
        self.assertIn("Good 🙂", str(entry))

    def test_mood_entry_validation(self):
        entry = MoodEntry(user=self.user, mood_score=6, note="Invalid score")
        with self.assertRaises(ValidationError):
            entry.full_clean()

class MoodTrackerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_a = User.objects.create_user(username="usera", password="Password123!")
        self.user_b = User.objects.create_user(username="userb", password="Password123!")

        self.list_create_url = reverse('api_mood_list_create')
        self.stats_url = reverse('api_mood_stats')

    def test_unauthenticated_access_denied(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_mood_entry_success(self):
        self.client.force_authenticate(user=self.user_a)
        payload = {'mood_score': 5, 'note': 'Awesome day!'}
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mood_score'], 5)
        self.assertEqual(response.data['note'], 'Awesome day!')
        self.assertEqual(MoodEntry.objects.filter(user=self.user_a).count(), 1)

    def test_create_mood_entry_invalid_score(self):
        self.client.force_authenticate(user=self.user_a)
        
        # Test score > 5
        response = self.client.post(self.list_create_url, {'mood_score': 6}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test score < 1
        response = self.client.post(self.list_create_url, {'mood_score': 0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_data_isolation_list(self):
        MoodEntry.objects.create(user=self.user_a, mood_score=3, note="User A entry")
        MoodEntry.objects.create(user=self.user_b, mood_score=5, note="User B entry")

        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['note'], "User A entry")

    def test_user_data_isolation_detail_and_update_and_delete(self):
        entry_b = MoodEntry.objects.create(user=self.user_b, mood_score=2, note="User B private entry")
        detail_url = reverse('api_mood_detail', kwargs={'pk': entry_b.pk})

        # User A attempts to read User B's entry
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User A attempts to update User B's entry
        response = self.client.put(detail_url, {'mood_score': 5, 'note': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User A attempts to delete User B's entry
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # User B can read, update, and delete own entry
        self.client.force_authenticate(user=self.user_b)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mood_score'], 2)

        response = self.client.patch(detail_url, {'mood_score': 4}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mood_score'], 4)

        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(MoodEntry.objects.filter(pk=entry_b.pk).count(), 0)

    def test_mood_stats_calculation(self):
        self.client.force_authenticate(user=self.user_a)

        # Create entries for User A across different days
        now = timezone.now()
        entry_today = MoodEntry.objects.create(user=self.user_a, mood_score=5, note="Today")
        entry_3d = MoodEntry.objects.create(user=self.user_a, mood_score=3, note="3 days ago")
        entry_3d.created_at = now - timedelta(days=3)
        entry_3d.save()

        entry_15d = MoodEntry.objects.create(user=self.user_a, mood_score=1, note="15 days ago")
        entry_15d.created_at = now - timedelta(days=15)
        entry_15d.save()

        entry_40d = MoodEntry.objects.create(user=self.user_a, mood_score=4, note="40 days ago")
        entry_40d.created_at = now - timedelta(days=40)
        entry_40d.save()

        response = self.client.get(self.stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertEqual(data['total_entries'], 4)
        self.assertIsNotNone(data['today_entry'])
        self.assertEqual(data['today_entry']['mood_score'], 5)

        # Overall avg: (5 + 3 + 1 + 4) / 4 = 3.25
        self.assertEqual(data['avg_overall'], 3.25)

        # 7-day avg (today + 3d): (5 + 3) / 2 = 4.0
        self.assertEqual(data['avg_7days'], 4.0)

        # 30-day avg (today + 3d + 15d): (5 + 3 + 1) / 3 = 3.0
        self.assertEqual(data['avg_30days'], 3.0)

        # Check distribution
        dist_map = {item['score']: item['count'] for item in data['mood_distribution']}
        self.assertEqual(dist_map[1], 1)
        self.assertEqual(dist_map[3], 1)
        self.assertEqual(dist_map[4], 1)
        self.assertEqual(dist_map[5], 1)
        self.assertEqual(dist_map[2], 0)
