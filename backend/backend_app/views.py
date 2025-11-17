from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend_app.models import Feedback, Newsletter, Signup, Carriers, Plans, Payasyougo, Topup, Recharge, Activate_sim, Account_balance, History, Charges_and_Discount
from django.core.mail import send_mail
import random
import string
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from backend.settings import SECRET_KEY
from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives


@csrf_exempt
def home(request):
    return HttpResponse('Server is running on vercel again....')


@csrf_exempt
def send_feedback(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data['name']
            email = data['email']
            message = data['message']
            feedback_data = Feedback(
                name=name,
                email=email,
                message=message
            )
            feedback_data.save()
            return JsonResponse({'status': 'success', 'data_received': feedback_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_published_feedback(request):
    if request.method == 'GET':
        feedback_data = Feedback.objects.filter(published=True)
        feedback_pub_data = [
            {
                'id': f.id,
                'name': f.name,
                'email': f.email,
                'message': f.message
            }
            for f in feedback_data
        ]
        return JsonResponse({'status': 'success', 'data': feedback_pub_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def get_unpublished_feedback(request):
    if request.method == 'GET':
        feedback_data = Feedback.objects.filter(published=False)
        feedback_unpub_data = [
            {
                'id': f.id,
                'name': f.name,
                'email': f.email,
                'message': f.message
            }
            for f in feedback_data
        ]
        return JsonResponse({'status': 'success', 'data': feedback_unpub_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def make_published(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pub_id = data['id']
            pub_data = Feedback.objects.filter(id=pub_id).first()
            pub_data.published = True
            pub_data.save()
            return JsonResponse({'status': 'success', 'data_received': pub_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def make_unpublished(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pub_id = data['id']
            pub_data = Feedback.objects.filter(id=pub_id).first()
            pub_data.published = False
            pub_data.save()
            return JsonResponse({'status': 'success', 'data_received': pub_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_newsletter(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data['email']
            newsletter_data = Newsletter(
                email=email
            )
            newsletter_data.save()
            return JsonResponse({'status': 'success', 'data_received': newsletter_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_newsletter_emails(request):
    if request.method == 'GET':
        email_data = Newsletter.objects.filter(subscribed=True)
        email_all_data = [
            {
                'id': n.id,
                'email': n.email,
            }
            for n in email_data
        ]
        return JsonResponse({'status': 'success', 'data': email_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def unsub_newsletter(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data['email']
            email_data = Newsletter.objects.filter(email=email).first()
            email_data.subscribed = False
            email_data.save()
            return JsonResponse({'status': 'success', 'data_received': email_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data['email']
            full_name = data['full_name']
            password = data['password']
            username = data['username']
            user_type = data['user_type']
            signup_data = Signup(
                email=email,
                full_name=full_name,
                password=password,
                username=username,
                user_type=user_type
            )
            signup_data.save()
            user_balance = Account_balance(
                username=username,
                account_balance_amount=0.0,
            )
            user_balance.save()
            charges_add = Charges_and_Discount(
                username=username,
                topup_charges=0.0,
                recharge_charges=0.0,
                sim_activation_charges=0.0
            )
            charges_add.save()
            return JsonResponse({'status': 'success', 'data_received': signup_data.id, 'account_balance': user_balance.account_balance_amount})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_signup(request):
    if request.method == 'POST':
        signup_data = Signup.objects.all()
        signup_all_data = [
            {
                'email': s.email,
                'full_name': s.full_name,
                'password': s.password,
                'username': s.username,
                'user_type': s.user_type
            }
            for s in signup_data
        ]
        return JsonResponse({'status': 'success', 'data': signup_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


def ver_code():
    letters_and_digits = string.ascii_letters + string.digits
    code = ''.join(random.choice(letters_and_digits) for i in range(6))
    return code


@csrf_exempt
def receive_verify_email(request):
    if request.method == 'POST':
        ver_email = json.loads(request.body).get('ver_email')
        code = ver_code()
        subject = 'Droptrix Email Verification Code'
        body = f"""
Hello,

Welcome to Droptrix!

To complete your registration, please use the verification code below:

********************************
        {code}
********************************

This code is valid for 10 minutes. If you did not request this, please ignore this email.

Best regards,
The Droptrix Team
"""
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [ver_email],
            fail_silently=False,
        )
        return JsonResponse({'status': 'success', 'code': code})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


# @csrf_exempt
# def verify_code(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             input_code = data['code']
#             org_code = code
#             if org_code != input_code:
#                 return JsonResponse({'status': 'error', 'message': 'Code Unmatched'}, status=200)
#             return JsonResponse({'status': 'success', 'data_received': True})
#         except Exception as e:
#             return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
#     return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']
            signup_data = Signup.objects.filter(username=username).first()
            if signup_data:
                if signup_data.username == username and signup_data.password == password:
                    token_payload = {
                        'user_id': signup_data.id,
                        'email': signup_data.email,
                        'exp': datetime.utcnow() + timedelta(hours=1)
                    }
                    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
                    return JsonResponse({'status': 'success', 'message': 'login successful', 'login_status': True, 'token': token, 'data': {'user_type': signup_data.user_type, 'username': signup_data.username, 'full_name': signup_data.full_name, 'email': signup_data.email}})
                else:
                    return JsonResponse({'status': 'Fail', 'message': 'Email or Password Incorrect', 'login_status': False})
            return JsonResponse({'status': 'Fail', 'message': 'User not found', 'login_status': False}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_carriers(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            company_count = int(Carriers.objects.count())+1
            company_id = f"CMP-{datetime.now().strftime('%Y%m')}-{str(company_count).zfill(4)}"
            carriers_data = Carriers(
                name=data['name'],
                description=data['description'],
                logo_url=data['logo_url'],
                company_id=company_id
            )
            carriers_data.save()
            return JsonResponse({'status': 'success', 'data_received': carriers_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_carriers(request):
    if request.method == 'GET':
        careers_data = Carriers.objects.all()
        careers_all_data = [
            {
                'name': c.name,
                'description': c.description,
                'logo_url': c.logo_url,
                'company_id': c.company_id
            }
            for c in careers_data
        ]
        return JsonResponse({'status': 'success', 'data': careers_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def add_plans(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            plans_count = int(Plans.objects.count())+1
            plan_id = f"PLN-{datetime.now().strftime('%Y%m')}-{str(plans_count).zfill(4)}"
            plans_data = Plans(
                plan_id=plan_id,
                company_id=data['company_id'],
                plan_name=data['plan_name'],
                popularity=data['popularity'],
                plan_type=data['plan_type'],
                plan_price=data['plan_price'],
                previous_price=data['previous_price'],
                plan_duration=data['plan_duration'],
                plan_feature=data['plan_feature'],
                off_percentage=data['off_percentage'],
                tagline1=data['tagline1'],
                tagline2=data['tagline2'],
                details=data['details'],
                live_status=data['live_status']
            )
            plans_data.save()
            return JsonResponse({'status': 'success', 'data_received': plans_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_plans(request):
    if request.method == 'GET':
        plans_data = Plans.objects.all()
        plans_all_data = [
            {
                'plan_id': p.plan_id,
                'company_id': p.company_id,
                'plan_name': p.plan_name,
                'popularity': p.popularity,
                'plan_type': p.plan_type,
                'plan_price': p.plan_price,
                'previous_price': p.previous_price,
                'plan_duration': p.plan_duration,
                'plan_feature': p.plan_feature,
                'off_percentage': p.off_percentage,
                'tagline1': p.tagline1,
                'tagline2': p.tagline2,
                'details': p.details,
                'live_status': p.live_status
            }
            for p in plans_data
        ]
        return JsonResponse({'status': 'success', 'data': plans_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def update_plans(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            plans_data = Plans.objects.filter(plan_id=data['plan_id']).first()
            plans_data.plan_name = data['plan_name']
            plans_data.popularity = data['popularity']
            plans_data.plan_type = data['plan_type']
            plans_data.plan_price = data['plan_price']
            plans_data.previous_price = data['previous_price']
            plans_data.plan_duration = data['plan_duration']
            plans_data.plan_feature = data['plan_feature']
            plans_data.off_percentage = data['off_percentage']
            plans_data.tagline1 = data['tagline1']
            plans_data.tagline2 = data['tagline2']
            plans_data.details = data['details']
            plans_data.live_status = data['live_status']
            plans_data.save()
            return JsonResponse({'status': 'success', 'data_received': plans_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_payasyougo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            payasyougo_data = Payasyougo(
                zipcode=data['zipcode'],
                e_id=data['e_id'],
                plan_id=data['plan_id'],
                email=data['email'],
                contact_no=data['contact_no'],
                sim_type=data['sim_type']
            )
            payasyougo_data.save()
            return JsonResponse({'status': 'success', 'data_received': payasyougo_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_payasyougo(request):
    if request.method == 'GET':
        payasyougo_data = Payasyougo.objects.all()
        payasyougo_all_data = [
            {
                'id': p.id,
                'zipcode': p.zipcode,
                'e_id': p.e_id,
                'plan_id': p.plan_id,
                'email': p.email,
                'contact_no': p.contact_no,
                'sim_type': p.sim_type
            }
            for p in payasyougo_data
        ]
        return JsonResponse({'status': 'success', 'data': payasyougo_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def add_topup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            topup_data = Topup(
                company_id=data['company_id'],
                amount=data['amount'],
                phone_no=data['phone_no'],
                username=data['username'],
                request_topup=data['request_topup'],
                balance_history=balance_data.account_balance_amount
            )
            topup_data.save()
            history_message=f'You added a topup of amount {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Topup History',
                history_message=history_message,
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': topup_data.id, 'history_added': history_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_topup(request):
    if request.method == 'GET':
        topup_data = Topup.objects.all()
        topup_all_data = [
            {
                'company_id': t.company_id,
                'amount': t.amount,
                'phone_no': t.phone_no,
                'username': t.username,
                'request_topup': t.request_topup,
                'pending_status': t.pending_status,
                'balance_history': t.balance_history
            }
            for t in topup_data
        ]
        return JsonResponse({'status': 'success', 'data': topup_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def fetch_topup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            topup_data = list(Topup.objects.filter(username=username).values())
            return JsonResponse({'status': 'success', 'data_received': topup_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def make_topup_complete(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topup_id = data['topup_id']
            topup_data = Topup.objects.filter(id=topup_id).first()
            topup_data.pending_status = False
            user_balance_data = Account_balance.objects.filter(username=data['username']).first()
            user_balance_data.account_balance_amount += topup_data.amount
            user_balance_data.last_updated = datetime.now()
            user_balance_data.save()
            topup_data.balance_history = user_balance_data.account_balance_amount
            topup_data.save()
            return JsonResponse({'status': 'success', 'data_received': topup_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def user_recharge_account(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            recharge_count = int(Recharge.objects.count())+1
            recharge_id = f"RCRG-{datetime.now().strftime('%Y%m%d')}-{str(recharge_count).zfill(4)}"
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            recharge_data = Recharge(
                recharge_id=recharge_id,
                amount=data['amount'],
                payment_screenshot=data['payment_screenshot'],
                username=data['username'],
                balance_history=balance_data.account_balance_amount
            )
            recharge_data.save()
            history_message=f'You submitted a request for recharge of amount {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Recharge History',
                history_message=history_message,
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': recharge_data.recharge_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def get_recharge_data(request):
    if request.method == 'GET':
        recharge_data = Recharge.objects.all()
        recharge_all_data = [
            {
                'recharge_id': r.recharge_id,
                'amount': r.amount,
                'payment_screenshot': r.payment_screenshot,
                'username': r.username,
                'timestamp': r.timestamp,
                'approved': r.approved,
                'balance_history': r.balance_history
            }
            for r in recharge_data
        ]
        return JsonResponse({'status': 'success', 'data': recharge_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def get_user_recharge(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            recharge_data = list(Recharge.objects.filter(username=username).values())
            return JsonResponse({'status': 'success', 'data_received': recharge_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def admin_approve_recharge(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            recharge_id = data['recharge_id']
            username = data['username']
            recharge_data = Recharge.objects.filter(recharge_id=recharge_id).first()
            recharge_data.approved = True
            user_balance_data = Account_balance.objects.filter(username=username).first()
            user_balance_data.account_balance_amount += recharge_data.amount
            user_balance_data.last_updated = datetime.now()
            user_balance_data.save()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            recharge_data.balance_history = balance_data.account_balance_amount
            recharge_data.save()
            history_message=f'Admin approved your recharge of amount {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Recharge History',
                history_message=history_message,
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': recharge_data.recharge_id, 'account_balance': user_balance_data.account_balance_amount})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def user_sim_activation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            activation_count = int(Recharge.objects.count())+1
            activation_id = f"ACTSIM-{datetime.now().strftime('%Y%m%d')}-{str(activation_count).zfill(4)}"
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            sim_activation_data = Activate_sim(
                activation_id=activation_id,
                username=data['username'],
                plan_id=data['plan_id'],
                phone_no=data['phone_no'],
                amount_charged=data['amount_charged'],
                offer=data['offer'],
                balance_history=balance_data.account_balance_amount
            )
            if balance_data < data['amount_charged']:
                return JsonResponse({'status': 'success', 'message': 'Insufficient balance. Please recharge your account.'}, status=200)
            balance_data.account_balance_amount -= data['amount_charged']
            sim_activation_data.save()
            balance_data.save()
            history_message=f'You sent a request of sim activation for amount of {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Sim Activation History',
                history_message=history_message,
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': sim_activation_data.id, 'account_balance': balance_data.account_balance_amount})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_activation_data(request):
    if request.method == 'GET':
        activation_data = Activate_sim.objects.all()
        activation_all_data = [
            {
                'activation_id': a.activation_id,
                'username': a.username,
                'plan_id': a.plan_id,
                'phone_no': a.phone_no,
                'amount_charged': a.amount_charged,
                'offer': a.offer,
                'pending': a.pending,
                'timestamp': a.timestamp,
                'balance_history': a.balance_history
            }
            for a in activation_data
        ]
        return JsonResponse({'status': 'success', 'data': activation_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def approve_sim_activation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            activation_id = data['activation_id']
            activation_data = Activate_sim.objects.filter(activation_id=activation_id).first()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            activation_data.pending = False
            activation_data.save()
            history_data = History(
                username=data['username'],
                history_type='Sim Activation History',
                history_message='Your Sim Activation Approved.',
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': activation_data.activation_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_user_activation_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            activation_data = list(Activate_sim.objects.filter(username=username).values())
            return JsonResponse({'status': 'success', 'data_received': activation_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def dashboard_summary_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            active_sims_count = len(Activate_sim.objects.filter(username=username, pending=False))
            active_sims = Activate_sim.objects.filter(username=username, pending=False)
            available_balance = Account_balance.objects.filter(username=username).first().account_balance_amount
            plan_ids_data = Activate_sim.objects.filter(username=username)
            plan_ids = []
            for i in plan_ids_data:
                plan_ids.append(i.plan_id)
            plan_ids = list(set(plan_ids))
            perchased_plans = []
            for j in plan_ids:
                perchased_plans.append(Plans.objects.filter(plan_id=j).first())
            topup_history = Topup.objects.filter(username=username)
            recharge_history = Recharge.objects.filter(username=username)
            activation_history = Activate_sim.objects.filter(username=username)
            transaction_history = {'activation_history': activation_history, 'recharge_history': recharge_history}
            return JsonResponse(
                {
                    'status': 'success',
                    'data_received': {
                        'active_sims_count': active_sims_count,
                        'active_sims': active_sims,
                        'available_balance': available_balance,
                        'perchased_plans': perchased_plans,
                        'topup_history': topup_history,
                        'transaction_history': transaction_history
                    }
                }
            )
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_user_account_balance(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            balance_data = Account_balance.objects.filter(username=username).first()
            return JsonResponse({'status': 'success', 'data_received': balance_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)