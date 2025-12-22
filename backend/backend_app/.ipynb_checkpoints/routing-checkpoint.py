from django.urls import re_path
from backend_app.consumers import ChatConsumer, AdminConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/admin/$", AdminConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<username>[\w.@+-]+)/$", ChatConsumer.as_asgi()),
]