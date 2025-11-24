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
    username = models.CharField(max_length=200, unique=True)
    user_type = models.CharField(max_length=200, default='user')
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


class Carriers(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    logo_url = models.CharField(max_length=2000)
    company_id = models.CharField(max_length=200, unique=True)
    esim_required_fields = models.JSONField(default=list)
    physical_required_fields = models.JSONField(default=list)

    def __str__(self):
        return self.name
    

class Plans(models.Model):
    plan_id = models.CharField(max_length=200)
    company_id = models.CharField(max_length=200)
    plan_name = models.CharField(max_length=200)
    popularity = models.CharField(max_length=200)
    plan_type = models.CharField(max_length=200)
    plan_price = models.CharField(max_length=200)
    previous_price = models.CharField(max_length=200)
    plan_duration = models.CharField(max_length=200)
    plan_feature = models.JSONField(default=list)
    off_percentage = models.CharField(max_length=200)
    tagline1 = models.TextField()
    tagline2 = models.TextField()
    details = models.TextField()
    live_status = models.BooleanField(default=True)

    def __str__(self):
        return self.plan_name
    

class Payasyougo(models.Model):
    zipcode = models.CharField(max_length=200)
    e_id = models.CharField(max_length=200)
    plan_id = models.CharField(max_length=200)
    email = models.CharField(max_length=200, unique=True)
    contact_no = models.CharField(max_length=200)
    sim_type = models.CharField(max_length=200)

    def __str__(self):
        return self.email
    

class Topup(models.Model):
    company_id = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_no = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    request_topup = models.CharField(max_length=200)
    status = models.CharField(max_length=200, default='Pending')
    balance_history = models.DecimalField(max_digits=10, decimal_places=3)
    timestamp = models.DateTimeField(auto_now_add=True)
    payable_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.username
    

class Recharge(models.Model):
    recharge_id = models.CharField(max_length=200, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_screenshot = models.CharField(max_length=2000)
    approved = models.BooleanField(default=False)
    username = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    balance_history = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.username
    

class Activate_sim(models.Model):
    activation_id = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    plan_id = models.CharField(max_length=200)
    phone_no = models.CharField(max_length=200)
    eid = models.CharField(max_length=200, default=None)
    emi = models.CharField(max_length=200, default=None)
    iccid = models.CharField(max_length=200, default=None)
    company_id = models.CharField(max_length=200, default=None)
    amount_charged = models.DecimalField(max_digits=10, decimal_places=2)
    offer = models.CharField(max_length=2000)
    pending = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    balance_history = models.DecimalField(max_digits=10, decimal_places=2)
    email = models.CharField(max_length=200, unique=True)
    postal_code = models.IntegerField()

    def __str__(self):
        return self.username
    

class Account_balance(models.Model):
    username = models.CharField(max_length=200)
    account_balance_amount = models.DecimalField(max_digits=20, decimal_places=2)
    last_updated = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
    

class History(models.Model):
    username = models.CharField(max_length=200)
    history_type = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    history_message = models.TextField()
    history_balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.username
    

class Charges_and_Discount(models.Model):
    username = models.CharField(max_length=200)
    recharge_charges = models.DecimalField(max_digits=10, decimal_places=2)
    recharge_discount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.username
    

class Plan_offers(models.Model):
    username = models.CharField(max_length=200)
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2)
    plan_id = models.CharField(max_length=200)

    def __str__(self):
        return self.username
    

class Company_offers(models.Model):
    username = models.CharField(max_length=200)
    discount_percentage = models.DecimalField(max_digits=10, decimal_places=2)
    company_id = models.CharField(max_length=200)

    def __str__(self):
        return self.username
    

class Default_charged_discount(models.Model):
    plan_id = models.CharField(max_length=200)
    company_id = models.CharField(max_length=200)
    recharge_charges = models.DecimalField(max_digits=10, decimal_places=2)
    recharge_discount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.plan_id