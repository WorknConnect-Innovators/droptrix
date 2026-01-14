from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend_app.models import Feedback, Newsletter, Signup, Carriers, Plans, Payasyougo, Topup, Recharge, Activate_sim, Account_balance, History, Charges_and_Discount, Default_charged_discount, Plan_offers, Company_offers, Message
from django.core.mail import send_mail
import random
import string
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from backend.settings import SECRET_KEY
from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives
from django.forms.models import model_to_dict
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Chat
from .serializers import ChatSerializer
from rest_framework.generics import ListAPIView
from backend_app.serializers import MessageSerializer
import pymysql
pymysql.install_as_MySQLdb()


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
            user_data = Signup.objects.filter(username=username).first()
            if user_data:
                if user_data.username == username:
                    return JsonResponse({'status': 'success', 'message': f"Account with username {username} already exist."})
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
                recharge_charges=0.0,
                recharge_discount=0.0,
            )
            charges_add.save()
            return JsonResponse({'status': 'success', 'data_received': signup_data.id, 'account_balance': user_balance.account_balance_amount})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_signup(request):
    if request.method == 'GET':
        signup_data = Signup.objects.all()
        signup_all_data = [
            {
                'id': s.id,
                'email': s.email,
                'full_name': s.full_name,
                'username': s.username,
                'user_type': s.user_type
            }
            for s in signup_data
        ]
        return JsonResponse({'status': 'success', 'data': signup_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def delete_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            user_data = Signup.objects.filter(username=username).first()
            user_data.delete()
            return JsonResponse({'status': 'success', 'data_received': user_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


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
                company_id=company_id,
                esim_required_fields=data['esim_required_fields'],
                physical_required_fields=data['physical_required_fields']
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
                'company_id': c.company_id,
                'esim_required_fields': c.esim_required_fields,
                'physical_required_fields': c.physical_required_fields
            }
            for c in careers_data
        ]
        return JsonResponse({'status': 'success', 'data': careers_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def get_company_name(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            company_id = data['company_id']
            company_name = Carriers.objects.filter(company_id=company_id).first().name
            return JsonResponse({'status': 'success', 'data_received': company_name})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


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
def get_plan_name(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            plan_id = data['plan_id']
            plan_name = Plans.objects.filter(plan_id=plan_id).first().plan_name
            return JsonResponse({'status': 'success', 'data_received': plan_name})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_payasyougo(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            check_data = Payasyougo.objects.filter(email=data['email']).first()
            if check_data:
                if check_data.email == data['email']:
                    return JsonResponse({'status': 'success', 'message': 'Pay as you go with this email already exist.'})
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
                'plan_name': Plans.objects.filter(plan_id=p.plan_id).first().plan_name,
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
                balance_history=balance_data.account_balance_amount,
                payable_amount=data['payable_amount']
            )
            history_message=f'You requested a topup of amount {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Topup',
                history_message=history_message,
            )
            user_balance_data = Account_balance.objects.filter(username=data['username']).first()
            user_balance_data.account_balance_amount -= Decimal(str(topup_data.payable_amount))
            user_balance_data.last_updated = datetime.now()
            history_data.history_balance = user_balance_data.account_balance_amount
            topup_data.balance_history = user_balance_data.account_balance_amount
            user_balance_data.save()
            history_data.save()
            topup_data.save()
            return JsonResponse({'status': 'success', 'data_received': topup_data.id, 'history_added': history_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def cancel_topup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topup_id = data['topup_id']
            topup_amount = data['topup_amount']
            topup_data = Topup.objects.filter(id=topup_id).first()
            topup_data.status = 'Canceled'
            history_message=f'Your request for topup of amount {topup_amount} has canceled.'
            history_data = History(
                username=topup_data.username,
                history_type='Topup',
                history_message=history_message
            )
            user_balance_data = Account_balance.objects.filter(username=topup_data.username).first()
            if topup_data.amount <= topup_data.payable_amount:
                user_balance_data.account_balance_amount += topup_data.amount
            else:
                user_balance_data.account_balance_amount += topup_data.payable_amount
            user_balance_data.last_updated = datetime.now()
            user_balance_data.save()
            topup_data.balance_history = user_balance_data.account_balance_amount
            history_data.history_balance = user_balance_data.account_balance_amount
            topup_data.save()
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': topup_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_topup(request):
    if request.method == 'GET':
        topup_data = Topup.objects.all()
        topup_all_data = [
            {
                'topup_id': t.id,
                'company_id': t.company_id,
                'company_name': Carriers.objects.filter(company_id=t.company_id).first().name,
                'amount': t.amount,
                'phone_no': t.phone_no,
                'username': t.username,
                'request_topup': t.request_topup,
                'status': t.status,
                'balance_history': t.balance_history,
                'timestamp': t.timestamp,
                'payable_amount': t.payable_amount
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
            topup_data.status = 'Approved'
            history_message=f'Your request for topup of amount {topup_data.amount} has approved.'
            history_data = History(
                username=topup_data.username,
                history_type='Topup',
                history_message=history_message
            )
            user_balance_data = Account_balance.objects.filter(username=topup_data.username).first()
            history_data.history_balance = user_balance_data.account_balance_amount
            history_data.save()
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
                balance_history=balance_data.account_balance_amount,
                payable_amount=data['payable_amount']
            )
            recharge_data.save()
            history_message=f'You submitted a request for recharge of amount {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Recharge',
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
                'status': r.status,
                'balance_history': r.balance_history,
                'payable_amount': r.payable_amount
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
            recharge_data.status = 'Approved'
            user_balance_data = Account_balance.objects.filter(username=username).first()
            user_balance_data.account_balance_amount += recharge_data.amount
            user_balance_data.last_updated = datetime.now()
            user_balance_data.save()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            recharge_data.balance_history = balance_data.account_balance_amount
            recharge_data.save()
            history_message = f"Admin approved your recharge of amount {recharge_data.amount}."
            history_data = History(
                username=data['username'],
                history_type='Recharge',
                history_message=history_message,
                history_balance=balance_data.account_balance_amount
            )
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': recharge_data.recharge_id, 'account_balance': user_balance_data.account_balance_amount})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def cancel_recharge(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            recharge_id = data['recharge_id']
            recharge_amount = data['amount']
            recharge_data = Recharge.objects.filter(recharge_id=recharge_id).first()
            recharge_data.status = 'Canceled'
            history_message=f'Your request for recharge of amount {recharge_amount} has canceled.'
            history_data = History(
                username=recharge_data.username,
                history_type='Recharge',
                history_message=history_message
            )
            user_balance_data = Account_balance.objects.filter(username=recharge_data.username).first()
            recharge_data.balance_history = user_balance_data.account_balance_amount
            history_data.history_balance = user_balance_data.account_balance_amount
            recharge_data.save()
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': recharge_data.recharge_id})
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
            act_data = Activate_sim.objects.filter(email=data['email']).first()
            if act_data:
                if act_data.email == data['email']:
                    return JsonResponse({'status': 'success', 'message': 'Sim activation with this email already exist.'})
            plan_details = Plans.objects.filter(plan_id=data['plan_id']).first()
            sim_activation_data = Activate_sim(
                activation_id=activation_id,
                sim_type=data['sim_type'],
                username=data['username'],
                plan_id=data['plan_id'],
                phone_no=data['phone_no'],
                amount_charged=data['amount_charged'],
                balance_history=balance_data.account_balance_amount,
                emi=data['emi'],
                eid=data['eid'],
                iccid=data['iccid'],
                company_id=plan_details.company_id,
                email=data['email'],
                postal_code=data['postal_code'],
                pin_code=data['pin_code'],
                amount=data['amount']
            )
            if balance_data.account_balance_amount < data['amount_charged']:
                return JsonResponse({'status': 'success', 'message': 'Insufficient balance. Please recharge your account.'}, status=200)
            balance_data.account_balance_amount -= Decimal(str(data['amount_charged']))
            sim_activation_data.save()
            balance_data.save()
            history_message=f'You sent a request of sim activation for amount of {data["amount"]}.'
            history_data = History(
                username=data['username'],
                history_type='Sim Activation',
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
                'sim_type': a.sim_type,
                'username': a.username,
                'plan_id': a.plan_id,
                'plan_name': Plans.objects.filter(plan_id=a.plan_id).first().plan_name,
                'phone_no': a.phone_no,
                'amount_charged': a.amount_charged,
                'pending': a.status,
                'timestamp': a.timestamp,
                'balance_history': a.balance_history,
                'emi': a.emi,
                'eid': a.eid,
                'iccid': a.iccid,
                'company_id': a.company_id,
                'company_name': Carriers.objects.filter(company_id=a.company_id).first().name,
                'email': a.email,
                'postal_code': a.postal_code,
                'pin_code': a.pin_code,
                'amount': a.amount
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
            activation_data.status = 'Approved'
            activation_data.save()
            history_data = History(
                username=data['username'],
                history_type='Sim Activation',
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
def cancel_sim_activation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            activation_id = data['activation_id']
            amount = data['amount']
            activation_data = Activate_sim.objects.filter(activation_id=activation_id).first()
            activation_data.status = 'Canceled'
            history_message=f'Your request for Sim Activation of amount {amount} has canceled.'
            history_data = History(
                username=activation_data.username,
                history_type='Sim Activation',
                history_message=history_message
            )
            user_balance_data = Account_balance.objects.filter(username=activation_data.username).first()
            if activation_data.amount <= activation_data.amount_charged:
                user_balance_data.account_balance_amount += activation_data.amount
            else:
                user_balance_data.account_balance_amount += activation_data.amount_charged
            user_balance_data.last_updated = datetime.now()
            user_balance_data.save()
            activation_data.balance_history = user_balance_data.account_balance_amount
            history_data.history_balance = user_balance_data.account_balance_amount
            activation_data.save()
            history_data.save()
            return JsonResponse({'status': 'success', 'data_received': activation_data.activation_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def dashboard_summary_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            active_sims_qs = Activate_sim.objects.filter(username=username, status='Approved')
            active_sims_count = active_sims_qs.count()
            active_sims = list(active_sims_qs.values())
            account_balance_obj = Account_balance.objects.filter(username=username).first()
            available_balance = account_balance_obj.account_balance_amount if account_balance_obj else 0
            plan_ids = Activate_sim.objects.filter(username=username).values_list('plan_id', flat=True).distinct()
            purchased_plans = list(Plans.objects.filter(plan_id__in=plan_ids).values())
            recent_plan = [None if purchased_plans == [] else purchased_plans[-1]]
            topup_history = list(Topup.objects.filter(username=username).values())
            recharge_history = list(Recharge.objects.filter(username=username).values())
            activation_history = list(Activate_sim.objects.filter(username=username).values())
            return JsonResponse({
                'status': 'success',
                'data_received': {
                    'active_sims_count': active_sims_count,
                    'active_sims': active_sims,
                    'available_balance': available_balance,
                    'purchased_plans': purchased_plans,
                    'topup_history': topup_history,
                    'recent_plan': recent_plan,
                    'transaction_history': {
                        'activation_history': activation_history,
                        'recharge_history': recharge_history,
                    }
                }
            })
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
            balance_json = model_to_dict(balance_data)
            return JsonResponse({'status': 'success', 'data_received': balance_json})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_charges_discount(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            usernames = data.get('usernames', [])
            recharge_charges = data.get('recharge_charges')
            recharge_discount = data.get('recharge_discount')
            updated_count = Charges_and_Discount.objects.filter(username__in=usernames).update(
                recharge_charges=recharge_charges,
                recharge_discount=recharge_discount,
            )
            return JsonResponse({"status": "success", "updated_count": updated_count})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})
    return JsonResponse({"status": "fail", "message": "Only POST method allowed"})


@csrf_exempt
def user_charges_discount(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            charges_discount_data = Charges_and_Discount.objects.filter(username=username).first()
            data_json = model_to_dict(charges_discount_data)
            return JsonResponse({'status': 'success', 'data_received': data_json})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_offer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            plan_id = data['plan_id']
            discount_percentage = data['discount_percentage']
            offers_data = Plan_offers(
                username=username,
                discount_percentage=discount_percentage,
                plan_id=plan_id
            )
            offers_data.save()
            return JsonResponse({'status': 'success', 'data_received': offers_data.plan_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_company_offer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            company_id = data['company_id']
            discount_percentage = data['discount_percentage']
            offers_data = Company_offers(
                username=username,
                discount_percentage=discount_percentage,
                company_id=company_id
            )
            offers_data.save()
            return JsonResponse({'status': 'success', 'data_received': offers_data.company_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_user_offers(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            if not username:
                return JsonResponse({'status': 'error', 'message': 'username is required'}, status=400)
            offers = Plan_offers.objects.filter(username=username).order_by('-id')
            unique_latest_offers = {}
            for offer in offers:
                if offer.plan_id not in unique_latest_offers:
                    unique_latest_offers[offer.plan_id] = {
                        "plan_id": offer.plan_id,
                        "plan_name": Plans.objects.filter(plan_id=offer.plan_id).first().plan_name,
                        "discount_percentage": str(offer.discount_percentage),
                        "username": offer.username,
                        "id": offer.id
                    }
            result = list(unique_latest_offers.values())
            return JsonResponse({
                "status": "success",
                "count": len(result),
                "offers": result
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_company_offers(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            if not username:
                return JsonResponse({'status': 'error', 'message': 'username is required'}, status=400)
            offers = Company_offers.objects.filter(username=username).order_by('-id')
            unique_latest_offers = {}
            for offer in offers:
                if offer.company_id not in unique_latest_offers:
                    unique_latest_offers[offer.company_id] = {
                        "company_id": offer.company_id,
                        "company_name": Carriers.objects.filter(company_id=offer.company_id).first().name,
                        "discount_percentage": str(offer.discount_percentage),
                        "username": offer.username,
                        "id": offer.id
                    }
            result = list(unique_latest_offers.values())
            return JsonResponse({
                "status": "success",
                "count": len(result),
                "offers": result
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_offer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            plan_id = data.get('plan_id')
            discount_percentage = data.get('discount_percentage')
            if not username or not plan_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'username and plan_id are required'
                }, status=400)
            offer = Plan_offers.objects.filter(
                username=username,
                plan_id=plan_id
            ).order_by('-id').first()
            if not offer:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Offer not found for this username and plan_id'
                }, status=404)
            if discount_percentage:
                offer.discount_percentage = discount_percentage
            offer.save()
            return JsonResponse({
                'status': 'success',
                'message': 'Offer updated successfully',
                'updated_offer': {
                    'id': offer.id,
                    'username': offer.username,
                    'plan_id': offer.plan_id,
                    'discount_percentage': str(offer.discount_percentage)
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_company_offer(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            company_id = data.get('company_id')
            discount_percentage = data.get('discount_percentage')
            if not username or not company_id:
                return JsonResponse({
                    'status': 'error',
                    'message': 'username and plan_id are required'
                }, status=400)
            offer = Company_offers.objects.filter(
                username=username,
                company_id=company_id
            ).order_by('-id').first()
            if not offer:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Offer not found for this username and plan_id'
                }, status=404)
            if discount_percentage:
                offer.discount_percentage = discount_percentage
            offer.save()
            return JsonResponse({
                'status': 'success',
                'message': 'Offer updated successfully',
                'updated_offer': {
                    'id': offer.id,
                    'username': offer.username,
                    'company_id': offer.company_id,
                    'discount_percentage': str(offer.discount_percentage)
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def default_ch_dis(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            default_data = Default_charged_discount(
                plan_id=data['plan_id'],
                company_id=data['company_id'],
                recharge_charges=data['recharge_charges'],
                recharge_discount=data['recharge_discount'],
            )
            default_data.save()
            return JsonResponse({'status': 'success', 'data_received': default_data.plan_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_default_ch_dis(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            plan_id = data['plan_id']
            default_data = Default_charged_discount.objects.filter(plan_id=plan_id).first()
            default_data.recharge_charges = data['recharge_charges'],
            default_data.recharge_discount = data['recharge_discount'],
            default_data.save()
            return JsonResponse({'status': 'success', 'data_received': default_data.plan_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_default_ch_dis(request):
    if request.method == 'GET':
        get_data = Default_charged_discount.objects.all()
        get_all_data = [
            {
                'plan_id': d.plan_id,
                'plan_name': Plans.objects.filter(plan_id=d.plan_id).first().plan_name,
                'company_id': d.company_id,
                'company_name': Carriers.objects.filter(company_id=d.company_id).first().name,
                'recharge_charges': d.recharge_charges,
                'recharge_discount': d.recharge_discount
            }
            for d in get_data
        ]
        return JsonResponse({'status': 'success', 'data': get_all_data})
    return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'})


@csrf_exempt
def update_topup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topup_id = data['id']
            topup_data = Topup.objects.filter(id=topup_id).first()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            if topup_data.status == 'Pending':
                topup_data.company_id = data['company_id']
                topup_data.amount = data['amount']
                topup_data.phone_no = data['phone_no']
                topup_data.request_topup = data['request_topup']
                topup_data.timestamp = datetime.now()
                aditional_payable_amount = abs(topup_data.payable_amount - Decimal(str(data['payable_amount'])))
                if aditional_payable_amount > balance_data.account_balance_amount:
                    return JsonResponse({'status': 'success', 'message': 'Insufficient balance. Please recharge your account.'})
                balance_data.account_balance_amount -= aditional_payable_amount
                balance_data.save()
                topup_data.balance_history = balance_data.account_balance_amount
                topup_data.payable_amount = data['payable_amount']
                topup_data.save()
            else:
                return JsonResponse({'status': 'success', 'message': 'Topup request is not in pending status.'})
            return JsonResponse({'status': 'success', 'data_received': topup_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_recharge(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            recharge_id = data['recharge_id']
            recharge_data = Recharge.objects.filter(recharge_id=recharge_id).first()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            if recharge_data.approved == False:
                recharge_data.payment_screenshot = data['payment_screenshot']
                recharge_data.amount = data['amount']
                recharge_data.timestamp = datetime.now()
                aditional_payable_amount = abs(recharge_data.payable_amount - Decimal(str(data['payable_amount'])))
                if aditional_payable_amount > balance_data.account_balance_amount:
                    return JsonResponse({'status': 'success', 'message': 'Insufficient balance. Please recharge your account.'})
                balance_data.account_balance_amount -= aditional_payable_amount
                balance_data.save()
                recharge_data.balance_history = balance_data.account_balance_amount
                recharge_data.payable_amount = data['payable_amount']
                recharge_data.save()
            else:
                return JsonResponse({'status': 'success', 'message': 'Recharge request is not in pending status.'})
            return JsonResponse({'status': 'success', 'data_received': recharge_data.recharge_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_activation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            activation_id = data['activation_id']
            activation_data = Activate_sim.objects.filter(activation_id=activation_id).first()
            balance_data = Account_balance.objects.filter(username=data['username']).first()
            if activation_data.pending == True:
                activation_data.plan_id = data['plan_id']
                activation_data.phone_no = data['phone_no']
                activation_data.emi = data['emi']
                activation_data.eid = data['eid']
                activation_data.iccid = data['iccid']
                activation_data.company_id = data['company_id']
                activation_data.email = data['email']
                activation_data.postal_code = data['postal_code']
                activation_data.pin_code = data['pin_code']
                aditional_payable_amount = abs(activation_data.amount_charged - Decimal(str(data['amount_charged'])))
                if aditional_payable_amount > balance_data.account_balance_amount:
                    return JsonResponse({'status': 'success', 'message': 'Insufficient balance. Please recharge your account.'})
                balance_data.account_balance_amount -= aditional_payable_amount
                balance_data.save()
                activation_data.balance_history = balance_data.account_balance_amount
                activation_data.amount_charged = data['amount_charged']
                activation_data.save()
            else:
                return JsonResponse({'status': 'success', 'message': 'Recharge request is not in pending status.'})
            return JsonResponse({'status': 'success', 'data_received': activation_data.activation_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def update_carriers(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            company_data = Carriers.objects.filter(company_id=data['company_id']).first()
            company_data.name = data['name']
            company_data.description = data['description']
            company_data.logo_url = data['logo_url']
            company_data.esim_required_fields = data['esim_required_fields']
            company_data.physical_required_fields = data['physical_required_fields']
            company_data.save()
            return JsonResponse({'status': 'success', 'data_received': company_data.company_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def get_user_chat(request, user_id):
    """
    Get chat room + messages for a given user.
    """
    if request.method == 'GET':
        try:
            chat = Chat.objects.get(user_id=user_id)
            serializer = ChatSerializer(chat)
            return JsonResponse(serializer.data, status=200, safe=False)
        except Chat.DoesNotExist:
            return JsonResponse({"messages": []}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_all_chats(request):
    """
    Get all chat rooms with their messages (for admin).
    """
    if request.method == 'GET':
        try:
            chats = Chat.objects.all().prefetch_related('messages', 'user')
            chat_list = []
            
            for chat in chats:
                messages = []
                for msg in chat.messages.all():
                    messages.append({
                        'id': msg.id,
                        'text': msg.text,
                        'sender_username': msg.sender.username,
                        'sender_name': msg.sender.full_name,
                        'timestamp': msg.timestamp.isoformat(),
                        'read': msg.read
                    })
                
                chat_list.append({
                    'id': chat.id,
                    'user_id': chat.user.id,
                    'user_username': chat.user.username,
                    'user_name': chat.user.full_name,
                    'created_at': chat.created_at.isoformat(),
                    'messages': messages
                })
            
            return JsonResponse({'chats': chat_list}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


class MessagesBySenderAPIView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = []   # ❌ No authentication

    def get_queryset(self):
        sender_id = self.request.query_params.get("sender_id")

        queryset = Message.objects.all()

        if sender_id:
            queryset = queryset.filter(sender_id=sender_id)

        return queryset.select_related("sender", "chat")