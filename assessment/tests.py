from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from assessment.models import Question, Assessment, Answer, calculate_phq9_severity

class PHQ9ScoringLogicTests(TestCase):
    def test_phq9_severity_cutoffs(self):
        # 0 - 4: Minimal
        self.assertEqual(calculate_phq9_severity(0)[0], 'Minimal')
        self.assertEqual(calculate_phq9_severity(4)[0], 'Minimal')
        
        # 5 - 9: Mild
        self.assertEqual(calculate_phq9_severity(5)[0], 'Mild')
        self.assertEqual(calculate_phq9_severity(9)[0], 'Mild')
        
        # 10 - 14: Moderate
        self.assertEqual(calculate_phq9_severity(10)[0], 'Moderate')
        self.assertEqual(calculate_phq9_severity(14)[0], 'Moderate')
        
        # 15 - 19: Moderately Severe
        self.assertEqual(calculate_phq9_severity(15)[0], 'Moderately Severe')
        self.assertEqual(calculate_phq9_severity(19)[0], 'Moderately Severe')
        
        # 20 - 27: Severe
        self.assertEqual(calculate_phq9_severity(20)[0], 'Severe')
        self.assertEqual(calculate_phq9_severity(27)[0], 'Severe')

class PHQ9APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="screeninguser", password="Password123!")
        self.other_user = User.objects.create_user(username="otheruser", password="Password123!")
        
        self.questions_url = reverse('api_phq9_questions')
        self.submit_url = reverse('api_phq9_submit')
        self.history_url = reverse('api_phq9_history')

    def test_get_questions_list(self):
        response = self.client.get(self.questions_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 9)

    def test_submit_phq9_valid(self):
        self.client.force_authenticate(user=self.user)
        # 9 answers, each selected_option = 1 -> Total score = 9 (Mild)
        answers = [{"question_number": i, "selected_option": 1} for i in range(1, 10)]
        
        response = self.client.post(self.submit_url, {"answers": answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total_score'], 9)
        self.assertEqual(response.data['risk_category'], 'Mild')
        self.assertEqual(len(response.data['answers']), 9)
        self.assertEqual(Assessment.objects.filter(user=self.user).count(), 1)

    def test_submit_phq9_invalid_count(self):
        self.client.force_authenticate(user=self.user)
        # Only 8 answers provided
        answers = [{"question_number": i, "selected_option": 1} for i in range(1, 9)]
        
        response = self.client.post(self.submit_url, {"answers": answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_phq9_invalid_range(self):
        self.client.force_authenticate(user=self.user)
        # Question 1 has selected_option = 5 (valid range is 0-3)
        answers = [{"question_number": i, "selected_option": 1} for i in range(1, 10)]
        answers[0]["selected_option"] = 5
        
        response = self.client.post(self.submit_url, {"answers": answers}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_history_isolation(self):
        # Create assessment for self.user
        Assessment.objects.create(user=self.user, total_score=12, risk_category='Moderate', ml_prediction='Test')
        # Create assessment for self.other_user
        Assessment.objects.create(user=self.other_user, total_score=18, risk_category='Moderately Severe', ml_prediction='Test')

        # Authenticate as self.user
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_score'], 12)
