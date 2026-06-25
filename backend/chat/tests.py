from asgiref.sync import async_to_sync
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Message
from .routing import websocket_urlpatterns

User = get_user_model()

TEST_CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}


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


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class ChatWebSocketConsumerTests(APITestCase):
    def _application(self):
        return URLRouter(websocket_urlpatterns)

    def test_websocket_auth_success_for_own_room(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._authenticate)(user.id, token.key)

        self.assertEqual(response, {"type": "auth.success"})

    def test_websocket_rejects_invalid_token(self):
        close_code = async_to_sync(self._send_auth_and_get_close_code)(
            "/ws/chat/user_1/",
            "bad-token",
        )

        self.assertEqual(close_code, 4001)

    def test_websocket_rejects_wrong_user_room(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        close_code = async_to_sync(self._send_auth_and_get_close_code)(
            "/ws/chat/user_999999/",
            token.key,
        )

        self.assertEqual(close_code, 4003)

    def test_websocket_saves_and_broadcasts_authenticated_message(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._send_authenticated_message)(
            user.id,
            token.key,
            {"message": " hello "},
        )

        self.assertEqual(response, {"message": "alice: hello"})
        message = Message.objects.get()
        self.assertEqual(message.user, user)
        self.assertEqual(message.room_name, f"user_{user.id}")
        self.assertEqual(message.content, "hello")

    async def _authenticate(self, user_id, token_key):
        communicator = WebsocketCommunicator(
            self._application(),
            f"/ws/chat/user_{user_id}/",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            await communicator.send_json_to({"type": "auth", "token": token_key})
            return await communicator.receive_json_from()
        finally:
            await communicator.disconnect()

    async def _send_auth_and_get_close_code(self, path, token_key):
        communicator = WebsocketCommunicator(self._application(), path)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        await communicator.send_json_to({"type": "auth", "token": token_key})
        response = await communicator.receive_output()
        return response["code"]

    async def _send_authenticated_message(self, user_id, token_key, message):
        communicator = WebsocketCommunicator(
            self._application(),
            f"/ws/chat/user_{user_id}/",
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            await communicator.send_json_to({"type": "auth", "token": token_key})
            auth_response = await communicator.receive_json_from()
            self.assertEqual(auth_response, {"type": "auth.success"})

            await communicator.send_json_to(message)
            return await communicator.receive_json_from()
        finally:
            await communicator.disconnect()
