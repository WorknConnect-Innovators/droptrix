from rest_framework import serializers
from .models import Message, Chat

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "sender",
            "sender_username",
            "sender_name",
            "text",
            "timestamp",
            "read",
        ]


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "user", "created_at", "messages"]
