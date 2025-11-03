from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend_app.models import Feedback, Newsletter, Signup, Careers, Plans
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
            signup_data = Signup(
                email=email,
                full_name=full_name,
                password=password
            )
            signup_data.save()
            return JsonResponse({'status': 'success', 'data_received': signup_data.id})
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
            email = data['email']
            password = data['password']
            signup_data = Signup.objects.filter(email=email).first()
            if signup_data:
                if signup_data.email == email and signup_data.password == password:
                    token_payload = {
                        'user_id': signup_data.id,
                        'email': signup_data.email,
                        'exp': datetime.utcnow() + timedelta(hours=1)
                    }
                    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')
                    return JsonResponse({'status': 'success', 'message': 'login successful', 'login_status': True, 'token': token})
                else:
                    return JsonResponse({'status': 'Fail', 'message': 'Email or Password Incorrect', 'login_status': False})
            return JsonResponse({'status': 'Fail', 'message': 'User not found', 'login_status': False}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def add_careers(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            company_count = int(Careers.objects.count())+1
            company_id = f'CMP-{datetime.now().strftime('%Y%m')}-{str(company_count).zfill(4)}'
            careers_data = Careers(
                name=data['name'],
                description=data['description'],
                logo_url=data['logo_url'],
                company_id=company_id
            )
            careers_data.save()
            return JsonResponse({'status': 'success', 'data_received': careers_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


@csrf_exempt
def get_careers(request):
    if request.method == 'GET':
        careers_data = Careers.objects.all()
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
            plans_data = Plans(
                company_id=data['company_id'],
                plan_name=data['plan_name'],
                popularity=data['popularity'],
                plan_type=data['plan_type'],
                plan_price=data['plan_price'],
                previous_price=data['previous_price'],
                plan_duration=data['plan_duration'],
                plan_feature=data['plan_feature'],
                off_percentage=data['off_percentage']
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
                'id': p.id,
                'company_id': p.company_id,
                'plan_name': p.plan_name,
                'popularity': p.popularity,
                'plan_type': p.plan_type,
                'plan_price': p.plan_price,
                'previous_price': p.previous_price,
                'plan_duration': p.plan_duration,
                'plan_feature': p.plan_feature,
                'off_percentage': p.off_percentage
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
            plans_data = Plans.objects.filter(id=data['id']).first()
            plans_data.plan_name = data['plan_name']
            plans_data.popularity = data['popularity']
            plans_data.plan_type = data['plan_type']
            plans_data.plan_price = data['plan_price']
            plans_data.previous_price = data['previous_price']
            plans_data.plan_duration = data['plan_duration']
            plans_data.plan_feature = data['plan_feature']
            plans_data.off_percentage = data['off_percentage']
            plans_data.save()
            return JsonResponse({'status': 'success', 'data_received': plans_data.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)