from pathlib import Path
import os
import pymysql

pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-5u!b5%uy4snzj9t9tk-f#!m0e60qd7s0$1y7!ixq0g3w8npk3b"
DEBUG = True

ALLOWED_HOSTS = ["localhost", ".vercel.app", "127.0.0.1"]

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.hostinger.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "noreply@wncinnovators.com"
EMAIL_HOST_PASSWORD = "Sherlocked21239@"
DEFAULT_FROM_EMAIL = "No Reply Droptrix <noreply@wncinnovators.com>"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "backend_app",
    "rest_framework",
    "corsheaders",
    "channels",
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

CORS_ALLOWED_ORIGINS = [
    "https://droptrix-frontend.vercel.app",
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "https://droptrix-frontend.vercel.app",
    "http://localhost:3000",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',  # For local testing, use Redis for production
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     "hosts": [('127.0.0.1', 6379)],
        # },
    },
}

# ---------- DATABASE (CLEAN, VERCEL SAFE) ----------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "u647796282_droptrix_test",
        "USER": "u647796282_droptrix_test",
        "PASSWORD": "Sherlocked21239@",
        "HOST": "82.197.82.65",
        "PORT": "3306",
    }
}

# ---------- STATIC FILES ----------
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
