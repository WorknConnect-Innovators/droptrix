"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from backend_app import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', views.home, name='home'),
    path('api/post-feedback/', views.send_feedback, name='send_feedback'),
    path('api/feedback-published/', views.get_published_feedback, name='get_published_feedback'),
    path('api/feedback-unpublished/', views.get_unpublished_feedback, name='get_unpublished_feedback'),
    path('api/make-feedback-publish/', views.make_published, name='make_published'),
    path('api/make-feedback-unpublish/', views.make_unpublished, name='make_unpublished'),
    path('api/add-newsletter/', views.add_newsletter, name='add_newsletter'),
    path('api/get-newsletter-email/', views.get_newsletter_emails, name='get_newsletter_emails'),
    path('api/unsub-newsletter-email/', views.unsub_newsletter, name='unsub_newsletter'),
    path('api/signup/', views.signup, name='signup'),
    path('api/verify-email/', views.receive_verify_email, name='receive_verify_email'),
    path('api/verify-code/', views.verify_code, name='verify_code'),
    path('api/login/', views.login, name='login'),
]
