from django.db import models


class Feedback(models.Model):
    name = models.CharField(max_length=200)
    email = models.CharField(max_length=200)
    message = models.TextField()
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    

class Newsletter(models.Model):
    email = models.CharField(max_length=200)
    subscribed = models.BooleanField(default=True)

    def __str__(self):
        return self.email
    

class Signup(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.CharField(max_length=200)
    password = models.CharField(max_length=200)

    def __str__(self):
        return self.email
    

class Chat(models.Model):
    # one chat per user to admin relationship (admin optional)
    user = models.ForeignKey(Signup, related_name="chats", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    # If you have multiple admins, you can add admin ForeignKey here
    # admin = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='admin_chats')

    def __str__(self):
        return f"Chat(user={self.user_id})"

class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(Signup, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ["timestamp"]