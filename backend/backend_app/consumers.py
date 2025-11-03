# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from backend_app.models import Chat, Message

User = get_user_model()

def user_group_name(user_id):
    return f"user_{user_id}"

def admin_group_name():
    return "admin"

class ChatConsumer(AsyncWebsocketConsumer):
    """
    For regular users. room is user_<user_id>.
    """
    async def connect(self):
        # user_id is part of URL
        self.user_id = int(self.scope["url_route"]["kwargs"]["user_id"])
        self.group_name = user_group_name(self.user_id)

        # Optionally: validate that the connecting user matches user_id or is authenticated
        # If you require auth and user must match:
        if self.scope["user"].is_anonymous or self.scope["user"].id != self.user_id:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(admin_group_name(), self.channel_name)  # optional: let admin see presence
        await self.accept()

        # optionally notify admin of user online status
        await self.channel_layer.group_send(
            admin_group_name(),
            {
                "type": "user.presence",
                "user_id": self.user_id,
                "status": "online",
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        # notify admin
        await self.channel_layer.group_send(
            admin_group_name(),
            {"type": "user.presence", "user_id": self.user_id, "status": "offline"},
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        # expected: {"message": "..."}
        message_text = data.get("message")
        if not message_text:
            return

        # Persist message
        chat = await database_sync_to_async(self.get_or_create_chat)()
        message = await database_sync_to_async(self.create_message)(chat, self.scope["user"], message_text)

        # send to admin group and to user's own group (so user's multiple tabs get it)
        payload = {
            "type": "chat.message",
            "message": message_text,
            "sender_id": self.user_id,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }
        await self.channel_layer.group_send(admin_group_name(), {"type": "forward.message", "payload": payload})
        await self.channel_layer.group_send(self.group_name, {"type": "forward.message", "payload": payload})

    # handler to forward messages to websocket
    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def user_presence(self, event):
        # maybe used by admin; users may not need to handle
        pass

    # DB helpers
    def get_or_create_chat(self):
        chat, _ = Chat.objects.get_or_create(user_id=self.user_id)
        return chat

    def create_message(self, chat, sender, text):
        return Message.objects.create(chat=chat, sender=sender, text=text)

class AdminConsumer(AsyncWebsocketConsumer):
    """
    For admin(s). Admin listens to 'admin' group and can send messages targeting specific users.
    """
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous or not user.is_staff:
            # only staff/admin allowed
            await self.close()
            return

        self.admin_id = user.id
        await self.channel_layer.group_add(admin_group_name(), self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(admin_group_name(), self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        # expected: {"message": "...", "target_user_id": 123}
        message_text = data.get("message")
        target_user_id = data.get("target_user_id")
        if not message_text or not target_user_id:
            return

        # Persist message as from admin user.
        chat = await database_sync_to_async(self.get_or_create_chat)(target_user_id)
        # create Message (admin is sender)
        message = await database_sync_to_async(self.create_message)(chat, self.scope["user"], message_text)

        payload = {
            "type": "chat.message",
            "message": message_text,
            "sender_id": self.scope["user"].id,
            "sender_is_admin": True,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }
        # send to target user's group
        await self.channel_layer.group_send(user_group_name(target_user_id), {"type": "forward.message", "payload": payload})
        # and optionally also to admin group (so admin UI receives confirmation)
        await self.send(text_data=json.dumps(payload))

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # DB helpers
    def get_or_create_chat(self, user_id):
        chat, _ = Chat.objects.get_or_create(user_id=user_id)
        return chat

    def create_message(self, chat, sender, text):
        return Message.objects.create(chat=chat, sender=sender, text=text)
