from rest_framework import serializers
from .models import Message, Chat

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.name", read_only=True)  # adjust if field is different

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "sender",
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
