from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('api_register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('api_user_profile')

    def test_register_user_success(self):
        data = {
            "username": "testresearcher",
            "email": "test@academic.edu",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "age": 25,
            "gender": 1
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testresearcher").exists())

    def test_login_jwt_issuance(self):
        user = User.objects.create_user(username="testuser", password="Password123!")
        data = {
            "username": "testuser",
            "password": "Password123!"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_protected_profile_access(self):
        user = User.objects.create_user(username="protecteduser", password="Password123!")
        login_res = self.client.post(self.login_url, {"username": "protecteduser", "password": "Password123!"}, format='json')
        access_token = login_res.data["access"]

        # Request profile with bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["age"], 22)
