import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from openai import AsyncOpenAI
from rest_framework.authtoken.models import Token

from .models import Message


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


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        qs = parse_qs(self.scope.get("query_string", b"").decode())
        token_key = qs.get("token", [None])[0]

        if not token_key:
            await self.close(code=4001)
            return

        self.scope["user"] = await get_user(token_key)

        if self.scope["user"].is_anonymous:
            await self.close(code=4001)
            return

        expected_room = f"user_{self.scope['user'].id}"
        if self.room_name != expected_room:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        user = self.scope["user"]

        await save_message(user, self.room_name, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat_message", "message": f"{user.username}: {message}"},
        )

        if message.lower().startswith("/ai "):
            user_query = message[4:].strip()

            try:
                client = AsyncOpenAI()
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": user_query},
                    ],
                    max_tokens=150,
                )
                ai_response = response.choices[0].message.content.strip()
            except Exception as e:
                ai_response = f"Error: {e}"

            ai_message = f"AI: {ai_response}"
            await save_message(user, self.room_name, ai_message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "chat_message", "message": ai_message},
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))
