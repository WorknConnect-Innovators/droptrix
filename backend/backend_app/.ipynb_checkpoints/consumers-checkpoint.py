import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend_app.models import Chat, Message, Signup
from urllib.parse import parse_qs


# ---------------- GROUP HELPERS ----------------

def user_group(user_id):
    return f"user_{user_id}"


def admin_group(admin_id):
    return f"admin_{admin_id}"


# ================= USER SOCKET =================

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.username = self.scope["url_route"]["kwargs"]["username"]

        # Get user
        self.signup_user = await database_sync_to_async(self.get_user)(self.username)
        if not self.signup_user:
            await self.close()
            return

        self.user_id = self.signup_user.id
        self.user_group_name = user_group(self.user_id)

        # Get first admin (simple setup)
        self.admin_user = await database_sync_to_async(self.get_admin)()
        if not self.admin_user:
            await self.close()
            return

        self.admin_group_name = admin_group(self.admin_user.id)

        # Join groups
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.channel_layer.group_add(self.admin_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "user_group_name"):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

        if hasattr(self, "admin_group_name"):
            await self.channel_layer.group_discard(self.admin_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message_text = data.get("message")

        if not message_text:
            return

        # Get or create chat
        chat = await database_sync_to_async(self.get_or_create_chat)(self.signup_user)

        # Save message
        message = await database_sync_to_async(self.create_message)(
            chat=chat,
            sender=self.signup_user,
            receiver=self.admin_user,
            text=message_text
        )

        payload = {
            "message": message.text,
            "sender": self.signup_user.username,
            "sender_id": self.signup_user.id,
            "receiver_id": self.admin_user.id,
            "sender_is_admin": False,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }

        # Send to admin + user
        await self.channel_layer.group_send(
            self.admin_group_name,
            {"type": "forward.message", "payload": payload}
        )

        await self.channel_layer.group_send(
            self.user_group_name,
            {"type": "forward.message", "payload": payload}
        )

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # -------- DB HELPERS --------

    def get_user(self, username):
        try:
            return Signup.objects.get(username=username)
        except Signup.DoesNotExist:
            return None

    def get_admin(self):
        return Signup.objects.filter(user_type="admin").first()

    def get_or_create_chat(self, user):
        chat, _ = Chat.objects.get_or_create(user=user)
        return chat

    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(
            chat=chat,
            sender=sender,
            receiver=receiver,
            text=text
        )


# ================= ADMIN SOCKET =================

class AdminConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query = parse_qs(self.scope["query_string"].decode())
        username = query.get("username", [None])[0]

        if not username:
            await self.close()
            return

        self.admin_user = await database_sync_to_async(self.get_admin_user)(username)
        if not self.admin_user:
            await self.close()
            return

        self.admin_id = self.admin_user.id
        self.group_name = admin_group(self.admin_id)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        message_text = data.get("message")
        target_username = data.get("target_username")

        if not message_text or not target_username:
            return

        # Get user
        signup_user = await database_sync_to_async(self.get_user)(target_username)
        if not signup_user:
            return

        # Get or create chat
        chat = await database_sync_to_async(self.get_or_create_chat)(signup_user)

        # Save message
        message = await database_sync_to_async(self.create_message)(
            chat=chat,
            sender=self.admin_user,
            receiver=signup_user,
            text=message_text
        )

        payload = {
            "message": message.text,
            "sender": self.admin_user.username,
            "sender_id": self.admin_user.id,
            "receiver_id": signup_user.id,
            "sender_is_admin": True,
            "target_username": signup_user.username,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }

        # Send to user
        await self.channel_layer.group_send(
            user_group(signup_user.id),
            {"type": "forward.message", "payload": payload}
        )

        # Echo to admin
        await self.send(text_data=json.dumps(payload))

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    # -------- DB HELPERS --------

    def get_admin_user(self, username):
        try:
            return Signup.objects.get(username=username, user_type="admin")
        except Signup.DoesNotExist:
            return None

    def get_user(self, username):
        try:
            return Signup.objects.get(username=username)
        except Signup.DoesNotExist:
            return None

    def get_or_create_chat(self, user):
        chat, _ = Chat.objects.get_or_create(user=user)
        return chat

    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(
            chat=chat,
            sender=sender,
            receiver=receiver,
            text=text
        )