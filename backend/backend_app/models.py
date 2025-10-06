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