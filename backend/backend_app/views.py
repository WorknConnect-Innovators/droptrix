from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
import json
from django.views.decorators.csrf import csrf_exempt
from backend_app.models import Feedback, Newsletter
from django.core.mail import send_mail
from django.conf import settings


@csrf_exempt
def home(request):
    return HttpResponse('Server is running....')


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