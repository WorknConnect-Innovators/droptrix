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
        try:
            self.username = self.scope["url_route"]["kwargs"]["username"]
            print(f"✅ User connection attempt: {self.username}")
            
            # Accept connection FIRST to prevent timeout
            await self.accept()
            print(f"✅ WebSocket accepted for user: {self.username}")
            
            self.user = await self.get_user(self.username)
            if not self.user:
                print(f"❌ User not found: {self.username}")
                await self.close()
                return

            self.admin = await self.get_admin()
            if not self.admin:
                print(f"⚠️ No admin found, but allowing connection")
                self.admin = None

            self.chat = await self.get_or_create_chat(self.user)
            self.group_name = chat_group(self.chat.id)

            # Join the chat group
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            # Send chat history
            messages = await self.get_chat_messages_serialized(self.chat)
            print(f"📨 Sending {len(messages)} historical messages")
            for msg in messages:
                await self.send(text_data=json.dumps(msg))
        except Exception as e:
            print(f"❌ Error in ChatConsumer.connect: {e}")
            import traceback
            traceback.print_exc()
            await self.close()

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            message_text = data.get("message")
            if not message_text:
                return

            # Get or fetch admin if not available
            receiver = self.admin if self.admin else await self.get_admin()
            if not receiver:
                print(f"⚠️ No admin available to receive message")
                return

            message = await self.create_message(self.chat, self.user, receiver, message_text)
            print(f"💾 Message saved: {self.username} -> admin")

            # Broadcast to chat group (both user & admin)
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "chat.message", "payload": self.serialize_message(message)}
            )
        except Exception as e:
            print(f"❌ Error in ChatConsumer.receive: {e}")
            import traceback
            traceback.print_exc()

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # -------- DB --------
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
    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(chat=chat, sender=sender, receiver=receiver, text=text)

    @database_sync_to_async
    def get_chat_messages_serialized(self, chat):
        msgs = chat.messages.select_related("sender", "receiver").all().order_by("timestamp")
        return [
            {
                "message": m.text,
                "sender": m.sender.username,
                "sender_id": m.sender_id,
                "receiver_id": m.receiver_id,
                "sender_is_admin": m.sender.user_type == "admin",
                "timestamp": m.timestamp.isoformat(),
                "message_id": m.id,
                "chat_id": chat.id,
            }
            for m in msgs
        ]

    def serialize_message(self, message):
        return {
            "message": message.text,
            "sender": message.sender.username,
            "receiver": message.receiver.username,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "sender_is_admin": message.sender.user_type == "admin",
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": message.chat_id,
        }

# ================= ADMIN SOCKET =================

class AdminConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        try:
            query = parse_qs(self.scope["query_string"].decode())
            self.username = query.get("username", [None])[0]
            print(f"✅ Admin connection attempt: {self.username}")

            self.admin = await self.get_admin(self.username)
            if not self.admin:
                print(f"❌ Admin not found: {self.username}")
                await self.close()
                return

            await self.accept()
            print(f"✅ WebSocket accepted for admin: {self.username}")
            
            # Join all active chat groups so admin can receive messages from all users
            chats = await self.get_all_chats()
            self.active_groups = []
            for chat in chats:
                group_name = chat_group(chat.id)
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.active_groups.append(group_name)
            print(f"📢 Admin joined {len(self.active_groups)} chat groups")
            
        except Exception as e:
            print(f"❌ Error in AdminConsumer.connect: {e}")
            import traceback
            traceback.print_exc()
            await self.close()

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

        # Ensure admin is in this group (in case it's a new chat)
        if not hasattr(self, 'active_groups'):
            self.active_groups = []
        
        if group_name not in self.active_groups:
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.active_groups.append(group_name)
            print(f"📢 Admin joined new chat group: {group_name}")

        message = await self.create_message(chat=chat, sender=self.admin, receiver=user, text=message_text)
        payload = self.serialize_message(message)
        print(f"💾 Admin message saved: {self.admin.username} -> {target_username}")

        await self.channel_layer.group_send(
            group_name,
            {"type": "chat.message", "payload": payload}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def disconnect(self, close_code):
        # Remove admin from all chat groups
        if hasattr(self, 'active_groups'):
            for group_name in self.active_groups:
                await self.channel_layer.group_discard(group_name, self.channel_name)
            print(f"🧹 Admin removed from {len(self.active_groups)} chat groups")

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
    def get_all_chats(self):
        return list(Chat.objects.all())

    @database_sync_to_async
    def create_message(self, chat, sender, receiver, text):
        return Message.objects.create(chat=chat, sender=sender, receiver=receiver, text=text)

    def serialize_message(self, message):
        return {
            "message": message.text,
            "sender": message.sender.username,
            "receiver": message.receiver.username,
            "sender_id": message.sender.id,
            "receiver_id": message.receiver.id,
            "sender_is_admin": message.sender.user_type == "admin",
            "timestamp": message.timestamp.isoformat(),
            "message_id": message.id,
            "chat_id": message.chat.id,
        }