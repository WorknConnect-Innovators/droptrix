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
from backend_app.views import MessagesBySenderAPIView

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
    # path('api/verify-code/', views.verify_code, name='verify_code'),
    path('api/login/', views.login, name='login'),
    path('api/add-carriers/', views.add_carriers, name='add_carriers'),
    path('api/get-carriers/', views.get_carriers, name='get_carriers'),
    path('api/add-plans/', views.add_plans, name='add_plans'),
    path('api/get-plans/', views.get_plans, name='get_plans'),
    path('api/update-plans/', views.update_plans, name='update_plans'),
    path('api/add-payasyougo/', views.add_payasyougo, name='add_payasyougo'),
    path('api/get-payasyougo/', views.get_payasyougo, name='get_payasyougo'),
    path('api/get-signup-data/', views.get_signup, name='get_signup'),
    path('api/add-topup/', views.add_topup, name='add_topup'),
    path('api/get-topup/', views.get_topup, name='get_topup'),
    path('api/fetch-topup/', views.fetch_topup, name='fetch_topup'),
    path('api/make-topup-complete/', views.make_topup_complete, name='make_topup_complete'),
    path('api/user-recharge-account/', views.user_recharge_account, name='user_recharge_account'),
    path('api/get-all-recharge-data/', views.get_recharge_data, name='get_recharge_data'),
    path('api/admin/approve-recharge/', views.admin_approve_recharge, name='admin_approve_recharge'),
    path('api/user-sim-activation/', views.user_sim_activation, name='user_sim_activation'),
    path('api/get-activation-data/', views.get_activation_data, name='get_activation_data'),
    path('api/admin/approve-activation/', views.approve_sim_activation, name='approve_sim_activation'),
    path('api/user-dashboard-summary/', views.dashboard_summary_user, name='dashboard_summary_user'),
    path('api/get-user-recharge-data/', views.get_user_recharge, name='get_user_recharge'),
    path('api/get-user-account-balance/', views.get_user_account_balance, name='get_user_account_balance'),
    path('api/update-charges-discount/', views.update_charges_discount, name='update_charges_discount'),
    path('api/get-company-name/', views.get_company_name, name='get_company_name'),
    path('api/get-plan-name/', views.get_plan_name, name='get_plan_name'),
    path('api/cancel-topup-data/', views.cancel_topup, name='cancel_topup'),
    path('api/get-user-charges-discount/', views.user_charges_discount, name='user_charges_discount'),
    path('api/add-user-offer/', views.add_offer, name='add_offer'),
    path('api/get-user-offers/', views.get_user_offers, name='get_user_offers'),
    path('api/update-user-offer/', views.update_offer, name='update_offer'),
    path('api/default-charges-discount/', views.default_ch_dis, name='default_ch_dis'),
    path('api/update-default-charges-discount/', views.update_default_ch_dis, name='update_default_ch_dis'),
    path('api/add-company-offer/', views.add_company_offer, name='add_company_offer'),
    path('api/get-company-offers/', views.get_company_offers, name='get_company_offers'),
    path('api/update-company-offer/', views.update_company_offer, name='update_company_offer'),
    path('api/get-default-charges-discount', views.get_default_ch_dis, name='get_default_ch_dis'),
    path('api/get-user-activation-data/', views.get_user_activation_data, name='get_user_activation_data'),
    path('api/update-topup/', views.update_topup, name='update_topup'),
    path('api/update-recharge/', views.update_recharge, name='update_recharge'),
    path('api/update-activation/', views.update_activation, name='update_activation'),
    path('api/update-carriers/', views.update_carriers, name='update_carriers'),
    path('api/cancel-sim-activation/', views.cancel_sim_activation, name='cancel_sim_activation'),
    path('api/cancel-recharge/', views.cancel_recharge, name='cancel_recharge'),
    path('api/delete-user/', views.delete_user, name='delete_user'),
    path("api/chat/<int:user_id>/", views.get_user_chat, name="get_user_chat"),
    path("api/admin/chats/", views.get_all_chats, name="get_all_chats"),
    path("api/messages/", MessagesBySenderAPIView.as_view(), name="messages-by-sender"),
    path("api/plan-delete/", views.delete_plan, name='delete_plan'),
    path('api/carrier-delete/', views.delete_carrier, name='delete_carrier'),
]