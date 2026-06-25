import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from asgiref.sync import async_to_sync
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .consumers import (
    AI_FAILURE_RESPONSE,
    AI_RATE_LIMIT_RESPONSE,
    AI_REQUEST_TIMESTAMPS,
    AI_UNAVAILABLE_RESPONSE,
    MAX_MESSAGE_LENGTH,
)
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
    def tearDown(self):
        AI_REQUEST_TIMESTAMPS.clear()
        super().tearDown()

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

    @override_settings(CHAT_WEBSOCKET_AUTH_TIMEOUT_SECONDS=0.05)
    def test_websocket_closes_idle_unauthenticated_connection_after_auth_timeout(self):
        close_code = async_to_sync(self._connect_and_wait_for_close_code)("/ws/chat/user_1/")

        self.assertEqual(close_code, 4001)

    @override_settings(CHAT_WEBSOCKET_AUTH_TIMEOUT_SECONDS=0.05)
    def test_websocket_auth_timeout_is_cancelled_after_successful_auth(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._authenticate_wait_then_send_message)(
            user.id,
            token.key,
            {"message": "hello"},
            0.1,
        )

        self.assertEqual(response, {"message": "alice: hello"})
        message = Message.objects.get()
        self.assertEqual(message.user, user)
        self.assertEqual(message.room_name, f"user_{user.id}")
        self.assertEqual(message.content, "hello")

    def test_websocket_rejects_message_before_auth(self):
        close_code = async_to_sync(self._send_unauthenticated_message_and_get_close_code)(
            "/ws/chat/user_1/",
            {"message": "hello"},
        )

        self.assertEqual(close_code, 4001)
        self.assertEqual(Message.objects.count(), 0)

    def test_websocket_rejects_empty_message_without_saving(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._send_authenticated_message)(
            user.id,
            token.key,
            {"message": "   "},
        )

        self.assertEqual(response, {"type": "error", "error": "Message cannot be empty."})
        self.assertEqual(Message.objects.count(), 0)

    def test_websocket_rejects_non_string_message_without_saving(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._send_authenticated_message)(
            user.id,
            token.key,
            {"message": 123},
        )

        self.assertEqual(response, {"type": "error", "error": "Message must be a string."})
        self.assertEqual(Message.objects.count(), 0)

    def test_websocket_rejects_message_over_max_length_without_saving(self):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        response = async_to_sync(self._send_authenticated_message)(
            user.id,
            token.key,
            {"message": "a" * (MAX_MESSAGE_LENGTH + 1)},
        )

        self.assertEqual(response["type"], "error")
        self.assertIn("2000", response["error"])
        self.assertEqual(Message.objects.count(), 0)

    @patch("chat.consumers.AsyncOpenAI")
    @override_settings(OPENAI_API_KEY="test-key")
    def test_websocket_ai_failure_saves_fallback_message(self, mock_openai):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(side_effect=Exception("boom"))
        mock_openai.return_value = mock_client

        responses = async_to_sync(self._send_authenticated_message_and_receive_count)(
            user.id,
            token.key,
            {"message": "/ai hello"},
            2,
        )

        self.assertEqual(responses[0], {"message": "alice: /ai hello"})
        self.assertTrue(responses[1]["message"].startswith("AI: "))
        self.assertIn(AI_FAILURE_RESPONSE, responses[1]["message"])

        messages = list(Message.objects.order_by("id"))
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].content, "/ai hello")
        self.assertTrue(messages[1].content.startswith("AI: "))
        self.assertIn(AI_FAILURE_RESPONSE, messages[1].content)

    @patch("chat.consumers.AsyncOpenAI")
    @override_settings(
        OPENAI_API_KEY="test-key",
        OPENAI_CHAT_MODEL="test-model",
        OPENAI_CHAT_MAX_TOKENS=42,
        OPENAI_CHAT_TIMEOUT_SECONDS=3,
    )
    def test_websocket_ai_uses_configured_openai_settings(self, mock_openai):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)
        mock_message = MagicMock()
        mock_message.content = "configured response"
        mock_choice = MagicMock()
        mock_choice.message = mock_message
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        mock_openai.return_value = mock_client

        responses = async_to_sync(self._send_authenticated_message_and_receive_count)(
            user.id,
            token.key,
            {"message": "/ai hello"},
            2,
        )

        self.assertEqual(responses[1], {"message": "AI: configured response"})
        mock_openai.assert_called_once_with(timeout=3)
        mock_client.chat.completions.create.assert_awaited_once()
        call_kwargs = mock_client.chat.completions.create.await_args.kwargs
        self.assertEqual(call_kwargs["model"], "test-model")
        self.assertEqual(call_kwargs["max_tokens"], 42)
        self.assertEqual(call_kwargs["messages"][1]["content"], "hello")

    @patch("chat.consumers.AsyncOpenAI")
    @override_settings(OPENAI_API_KEY="")
    def test_websocket_ai_missing_api_key_skips_openai_and_saves_unavailable_message(
        self,
        mock_openai,
    ):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)

        responses = async_to_sync(self._send_authenticated_message_and_receive_count)(
            user.id,
            token.key,
            {"message": "/ai hello"},
            2,
        )

        self.assertEqual(responses[0], {"message": "alice: /ai hello"})
        self.assertEqual(responses[1], {"message": f"AI: {AI_UNAVAILABLE_RESPONSE}"})
        mock_openai.assert_not_called()

        messages = list(Message.objects.order_by("id"))
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].content, "/ai hello")
        self.assertEqual(messages[1].content, f"AI: {AI_UNAVAILABLE_RESPONSE}")

    @patch("chat.consumers.AsyncOpenAI")
    @override_settings(OPENAI_API_KEY="test-key", OPENAI_CHAT_RATE_LIMIT_PER_MINUTE=1)
    def test_websocket_ai_rate_limit_skips_openai_and_saves_rate_limit_message(
        self,
        mock_openai,
    ):
        user = User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="strong-pass-123",
        )
        token = Token.objects.create(user=user)
        mock_message = MagicMock()
        mock_message.content = "first response"
        mock_choice = MagicMock()
        mock_choice.message = mock_message
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        mock_openai.return_value = mock_client

        first_responses = async_to_sync(self._send_authenticated_message_and_receive_count)(
            user.id,
            token.key,
            {"message": "/ai first"},
            2,
        )
        second_responses = async_to_sync(self._send_authenticated_message_and_receive_count)(
            user.id,
            token.key,
            {"message": "/ai second"},
            2,
        )

        self.assertEqual(first_responses[1], {"message": "AI: first response"})
        self.assertEqual(second_responses[0], {"message": "alice: /ai second"})
        self.assertEqual(second_responses[1], {"message": f"AI: {AI_RATE_LIMIT_RESPONSE}"})
        mock_client.chat.completions.create.assert_awaited_once()

        messages = list(Message.objects.order_by("id"))
        self.assertEqual(len(messages), 4)
        self.assertEqual(messages[3].content, f"AI: {AI_RATE_LIMIT_RESPONSE}")

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

    async def _connect_and_wait_for_close_code(self, path):
        communicator = WebsocketCommunicator(self._application(), path)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            response = await communicator.receive_output()
            return response["code"]
        finally:
            await communicator.disconnect()

    async def _authenticate_wait_then_send_message(
        self,
        user_id,
        token_key,
        message,
        wait_seconds,
    ):
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

            await asyncio.sleep(wait_seconds)
            await communicator.send_json_to(message)
            return await communicator.receive_json_from()
        finally:
            await communicator.disconnect()

    async def _send_unauthenticated_message_and_get_close_code(self, path, message):
        communicator = WebsocketCommunicator(self._application(), path)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        try:
            await communicator.send_json_to(message)
            response = await communicator.receive_output()
            return response["code"]
        finally:
            await communicator.disconnect()

    async def _send_authenticated_message_and_receive_count(
        self,
        user_id,
        token_key,
        message,
        count,
    ):
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
            return [await communicator.receive_json_from() for _ in range(count)]
        finally:
            await communicator.disconnect()
