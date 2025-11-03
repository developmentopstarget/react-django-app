import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser, User
from rest_framework.authtoken.models import Token
import openai
from django.conf import settings
from .models import Message

@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()

@database_sync_to_async
def get_user_by_username(username):
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None

@database_sync_to_async
def save_message(user, room, content):
    Message.objects.create(user=user, room_name=room, content=content)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Get token from query string
        token_key = self.scope['query_string'].decode().split('=')[1]
        self.scope['user'] = await get_user(token_key)

        if self.scope['user'].is_anonymous:
            await self.close()
        else:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        user = self.scope['user']

        # Save message to database
        await save_message(user, self.room_name, message)

        # Send user message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat_message", "message": f"{user.username}: {message}"}
        )

        # Check if message is for AI
        if message.lower().startswith("/ai "):
            user_query = message[4:].strip()
            try:
                openai.api_key = settings.OPENAI_API_KEY
                response = await openai.ChatCompletion.acreate(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": user_query}
                    ],
                    max_tokens=150
                )
                ai_response = response.choices[0].message.content.strip()
                
                # Save AI response to database
                ai_user = await get_user_by_username("AI")
                if ai_user:
                    await save_message(ai_user, self.room_name, ai_response)

            except Exception as e:
                ai_response = f"Error: {e}"

            # Send AI response to room group
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "chat_message", "message": f"AI: {ai_response}"}
            )

    async def chat_message(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))
