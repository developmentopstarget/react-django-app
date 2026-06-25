import asyncio
import json
import logging
import time
from collections import defaultdict, deque

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from openai import AsyncOpenAI
from rest_framework.authtoken.models import Token

from .models import Message


logger = logging.getLogger(__name__)
MAX_MESSAGE_LENGTH = 2000
AI_FAILURE_RESPONSE = "Sorry, I couldn't process that AI request right now."
AI_UNAVAILABLE_RESPONSE = "Sorry, AI is unavailable right now. Please try again later."
AI_RATE_LIMIT_RESPONSE = (
    "Sorry, you are sending AI requests too quickly. Please try again soon."
)
AI_RATE_LIMIT_WINDOW_SECONDS = 60
AI_REQUEST_TIMESTAMPS = defaultdict(deque)


@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


@database_sync_to_async
def save_message(user, room, content):
    Message.objects.create(user=user, room_name=room, content=content)


def validate_message(data):
    message = data.get("message")
    if not isinstance(message, str):
        return None, "Message must be a string."

    message = message.strip()
    if not message:
        return None, "Message cannot be empty."

    if len(message) > MAX_MESSAGE_LENGTH:
        return None, f"Message cannot exceed {MAX_MESSAGE_LENGTH} characters."

    return message, None


def is_ai_rate_limited(user_id):
    now = time.monotonic()
    timestamps = AI_REQUEST_TIMESTAMPS[user_id]
    while timestamps and now - timestamps[0] >= AI_RATE_LIMIT_WINDOW_SECONDS:
        timestamps.popleft()

    if len(timestamps) >= settings.OPENAI_CHAT_RATE_LIMIT_PER_MINUTE:
        return True

    timestamps.append(now)
    return False


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        self.authenticated = False
        self.auth_timeout_task = None
        await self.accept()
        self.auth_timeout_task = asyncio.create_task(self._close_if_auth_times_out())

    async def disconnect(self, close_code):
        self._cancel_auth_timeout()
        if self.authenticated:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, ValueError):
            await self.close(code=4001)
            return

        if not self.authenticated:
            if data.get("type") != "auth":
                await self.close(code=4001)
                return
            token_key = data.get("token")
            if not token_key:
                await self.close(code=4001)
                return
            user = await get_user(token_key)
            if user.is_anonymous:
                await self.close(code=4001)
                return
            expected_room = f"user_{user.id}"
            if self.room_name != expected_room:
                await self.close(code=4003)
                return
            self.scope["user"] = user
            self.authenticated = True
            self._cancel_auth_timeout()
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.send(text_data=json.dumps({"type": "auth.success"}))
            return

        message, error = validate_message(data)
        if error:
            await self.send(text_data=json.dumps({"type": "error", "error": error}))
            return
        user = self.scope["user"]

        await save_message(user, self.room_name, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": f"{user.username}: {message}"},
        )

        if message.lower().startswith("/ai "):
            user_query = message[4:].strip()

            if is_ai_rate_limited(user.id):
                ai_response = AI_RATE_LIMIT_RESPONSE
            elif not settings.OPENAI_API_KEY:
                ai_response = AI_UNAVAILABLE_RESPONSE
            else:
                try:
                    client = AsyncOpenAI(timeout=settings.OPENAI_CHAT_TIMEOUT_SECONDS)
                    response = await client.chat.completions.create(
                        model=settings.OPENAI_CHAT_MODEL,
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant."},
                            {"role": "user", "content": user_query},
                        ],
                        max_tokens=settings.OPENAI_CHAT_MAX_TOKENS,
                    )
                    ai_response = response.choices[0].message.content.strip()
                except Exception:
                    logger.exception("OpenAI chat completion failed")
                    ai_response = AI_FAILURE_RESPONSE

            ai_message = f"AI: {ai_response}"
            await save_message(user, self.room_name, ai_message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "chat_message", "message": ai_message},
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))

    async def _close_if_auth_times_out(self):
        try:
            await asyncio.sleep(settings.CHAT_WEBSOCKET_AUTH_TIMEOUT_SECONDS)
            if not self.authenticated:
                await self.close(code=4001)
        except asyncio.CancelledError:
            pass

    def _cancel_auth_timeout(self):
        auth_timeout_task = getattr(self, "auth_timeout_task", None)
        if auth_timeout_task and not auth_timeout_task.done():
            auth_timeout_task.cancel()
