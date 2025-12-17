import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend_app.models import Chat, Message, Signup


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
    """
    Admin WebSocket. Admin must be authenticated via Django Admin login.
    """

    async def connect(self):
        user = self.scope["user"]

        if user.is_anonymous or not user.is_staff:
            await self.close()
            return

        await self.channel_layer.group_add(admin_group(), self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(admin_group(), self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)

        message_text = data.get("message")
        target_user_id = data.get("target_user_id")

        if not message_text or not target_user_id:
            return

        # Get Signup user
        try:
            signup_user = await database_sync_to_async(Signup.objects.get)(id=target_user_id)
        except Signup.DoesNotExist:
            return

        # Get/create chat
        chat = await database_sync_to_async(Chat.objects.get_or_create)(user=signup_user)
        chat = chat[0]

        # Create message (sender=admin Django user)
        message = await database_sync_to_async(Message.objects.create)(
            chat=chat,
            sender=signup_user,  # ➤ If admin should be sender, we need a Signup instance representing admin
            text=message_text
        )

        payload = {
            "type": "chat.message",
            "message": message_text,
            "sender_id": signup_user.id,
            "sender_is_admin": True,
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": chat.id,
        }

        # Send to user group
        await self.channel_layer.group_send(
            user_group(target_user_id), {"type": "forward.message", "payload": payload}
        )

        await self.send(text_data=json.dumps(payload))

    async def forward_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))