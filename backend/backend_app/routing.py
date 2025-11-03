from django.urls import re_path
from backend_app import consumers

websocket_urlpatterns = [
    re_path(r"ws/chat/user_(?P<user_id>\d+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/chat/admin/$", consumers.AdminConsumer.as_asgi()),
]