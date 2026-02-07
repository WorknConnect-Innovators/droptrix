import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from backend_app.models import Chat, Message, Signup
from urllib.parse import parse_qs

# ---------------- GROUP HELPERS ----------------

def chat_group(chat_id):
    return f"chat_{chat_id}"

def admin_group(admin_id):
    return f"admin_{admin_id}"

# ================= USER SOCKET =================

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.username = self.scope["url_route"]["kwargs"]["username"]
    
        # Get user
        self.user = await self.get_user(self.username)
        if not self.user:
            await self.close()
            return
    
        # Get admin
        self.admin = await self.get_admin()
        if not self.admin:
            await self.close()
            return
    
        # Get or create chat
        self.chat = await self.get_or_create_chat(self.user)
        self.group_name = chat_group(self.chat.id)
    
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
    
        print(f"{self.username} connected successfully to chat {self.chat.id}")
    
        # Send chat history
        messages = await self.get_chat_messages_serialized(self.user)
        for msg in messages:
            await self.send(text_data=json.dumps(msg))


    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message_text = data.get("message")
        if not message_text:
            return

        # Create message
        message = await self.create_message(
            chat=self.chat,
            sender=self.user,
            receiver=self.admin,
            text=message_text
        )

        payload = self.serialize_message(message)

        # Send to chat group (so admin gets it too)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.message", "payload": payload}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # ---------- DB ----------

    @database_sync_to_async
    def get_user(self, username):
        return Signup.objects.filter(username=username).first()

    @database_sync_to_async
    def get_admin(self):
        return Signup.objects.filter(user_type="admin").first()

    @database_sync_to_async
    def get_or_create_chat(self, user):
        chat, _ = Chat.objects.get_or_create(user=user)
        return chat

    @database_sync_to_async
    def get_chat_messages_serialized(self, user):
        chat = Chat.objects.filter(user=user).first()
        if not chat:
            return []
        messages = []
        for msg in chat.messages.select_related("sender", "receiver").order_by("timestamp"):
            messages.append({
                "message": msg.text,
                "sender_id": msg.sender.id,
                "receiver_id": msg.receiver.id,
                "sender_is_admin": msg.sender.user_type == "admin",
                "timestamp": msg.timestamp.isoformat(),
                "message_id": msg.id,
                "chat_id": chat.id,
            })
        return messages

    @database_sync_to_async
    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(chat=chat, sender=sender, receiver=receiver, text=text)

    def serialize_message(self, message):
        return {
            "message": message.text,
            "sender_id": message.sender.id,
            "receiver_id": message.receiver.id,
            "sender_is_admin": message.sender.user_type == "admin",
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": message.chat.id,
        }

# ================= ADMIN SOCKET =================

class AdminConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query = parse_qs(self.scope["query_string"].decode())
        self.username = query.get("username", [None])[0]

        self.admin = await self.get_admin(self.username)
        if not self.admin:
            await self.close()
            return

        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message_text = data.get("message")
        target_username = data.get("target_username")
        if not message_text or not target_username:
            return

        user = await self.get_user(target_username)
        if not user:
            return

        chat = await self.get_or_create_chat(user)
        group_name = chat_group(chat.id)

        # Join group so admin can receive messages as well
        await self.channel_layer.group_add(group_name, self.channel_name)

        message = await self.create_message(chat=chat, sender=self.admin, receiver=user, text=message_text)
        payload = self.serialize_message(message)

        await self.channel_layer.group_send(
            group_name,
            {"type": "chat.message", "payload": payload}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def disconnect(self, close_code):
        pass  # optionally remove from all groups

    # ---------- DB ----------

    @database_sync_to_async
    def get_admin(self, username):
        return Signup.objects.filter(username=username, user_type="admin").first()

    @database_sync_to_async
    def get_user(self, username):
        return Signup.objects.filter(username=username).first()

    @database_sync_to_async
    def get_or_create_chat(self, user):
        chat, _ = Chat.objects.get_or_create(user=user)
        return chat

    @database_sync_to_async
    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(chat=chat, sender=sender, receiver=receiver, text=text)

    def serialize_message(self, message):
        return {
            "message": message.text,
            "sender_id": message.sender.id,
            "receiver_id": message.receiver.id,
            "sender_is_admin": message.sender.user_type == "admin",
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": message.chat.id,
        }