import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend_app.models import Chat, Message, Signup
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs


User = get_user_model()


def user_group(user_id):
    return f"user_{user_id}"


def admin_group():
    return "admin"


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.username = self.scope["url_route"]["kwargs"]["username"]

        # Fetch Signup user using username
        self.signup_user = await database_sync_to_async(self.get_signup_user)(self.username)

        if not self.signup_user:
            await self.close()
            return

        self.user_id = self.signup_user.id
        self.group_name = user_group(self.user_id)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(admin_group(), self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        # Notify admin user is offline
        await self.channel_layer.group_send(
            admin_group(),
            {
                "type": "user.presence",
                "user_id": self.user_id,
                "status": "offline",
            },
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message_text = data.get("message")

        if not message_text:
            return

        # Create or get chat
        chat = await database_sync_to_async(self.get_or_create_chat)()

        # Create message (using Signup user, NOT Django user)
        message = await database_sync_to_async(self.create_message)(
            chat, self.signup_user, message_text
        )

        payload = {
            "type": "chat.message",
            "message": message_text,
            "sender_id": self.user_id,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }

        # Send to user group + admin group
        await self.channel_layer.group_send(
            self.group_name, {"type": "forward.message", "payload": payload}
        )
        await self.channel_layer.group_send(
            admin_group(), {"type": "forward.message", "payload": payload}
        )

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # ----------------- DB HELPERS -----------------

    def get_signup_user(self, username):
        try:
            return Signup.objects.get(username=username)
        except Signup.DoesNotExist:
            return None

    def get_or_create_chat(self):
        chat, _ = Chat.objects.get_or_create(user=self.signup_user)
        return chat

    def create_message(self, chat, sender, text):
        return Message.objects.create(chat=chat, sender=sender, text=text)


# ------------------------ ADMIN CONSUMER ---------------------------------

class AdminConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Admin username comes from query OR fixed route
        query = parse_qs(self.scope["query_string"].decode())
        username = query.get("username", [None])[0]

        if not username:
            await self.close()
            return

        # Get admin from Signup table
        self.admin_user = await database_sync_to_async(self.get_admin_user)(username)

        if not self.admin_user:
            await self.close()
            return

        self.admin_id = self.admin_user.id

        await self.channel_layer.group_add(admin_group(), self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(admin_group(), self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        message_text = data.get("message")
        target_username = data.get("target_username")

        if not message_text or not target_username:
            return

        # Get target Signup user
        try:
            signup_user = await database_sync_to_async(Signup.objects.get)(
                username=target_username
            )
        except Signup.DoesNotExist:
            return

        # Get or create chat
        chat = await database_sync_to_async(Chat.objects.get_or_create)(
            user=signup_user
        )
        chat = chat[0]

        # Create message (sender = ADMIN Signup)
        message = await database_sync_to_async(Message.objects.create)(
            chat=chat,
            sender=self.admin_user,
            text=message_text
        )

        payload = {
            "type": "chat.message",
            "message": message_text,
            "sender_id": self.admin_id,
            "sender_is_admin": True,
            "target_username": target_username,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }

        # Send to user
        await self.channel_layer.group_send(
            user_group(signup_user.id),
            {"type": "forward.message", "payload": payload}
        )

        # Echo back to admin
        await self.send(text_data=json.dumps(payload))

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # -------- DB HELPER --------

    def get_admin_user(self, username):
        try:
            return Signup.objects.get(username=username, user_type="admin")
        except Signup.DoesNotExist:
            return None