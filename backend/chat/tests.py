from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Message

User = get_user_model()


class ChatHistoryViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        self.other_user = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="strong-pass-123",
        )
        self.url = "/api/chat/history/"

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_current_users_messages(self):
        self.authenticate()

        Message.objects.create(
            user=self.user,
            room_name=f"user_{self.user.id}",
            content="mine",
        )
        Message.objects.create(
            user=self.other_user,
            room_name=f"user_{self.other_user.id}",
            content="theirs",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["message"], "alice: mine")

    def test_ignores_messages_from_other_rooms(self):
        self.authenticate()

        Message.objects.create(
            user=self.user,
            room_name="general",
            content="old shared room",
        )
        Message.objects.create(
            user=self.user,
            room_name=f"user_{self.user.id}",
            content="private room",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["message"], "alice: private room")

    def test_formats_ai_messages_without_username_prefix(self):
        self.authenticate()

        Message.objects.create(
            user=self.user,
            room_name=f"user_{self.user.id}",
            content="AI: Hello from AI",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["message"], "AI: Hello from AI")
