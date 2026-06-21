from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message


def format_message(message):
    if message.content.startswith("AI: "):
        return message.content

    return f"{message.user.username}: {message.content}"


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        room_name = f"user_{request.user.id}"

        messages = Message.objects.filter(
            user=request.user,
            room_name=room_name,
        ).order_by("timestamp", "id")

        return Response(
            [
                {
                    "id": message.id,
                    "message": format_message(message),
                    "timestamp": message.timestamp.isoformat(),
                }
                for message in messages
            ]
        )
