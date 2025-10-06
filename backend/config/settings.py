from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(Path(__file__).resolve().parent.parent, ".env"))

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DEBUG", "True") == "True"
# ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
# ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost,0.0.0.0").split(",")
# ALLOWED_HOSTS = os.getenv(
#     "ALLOWED_HOSTS",
#     "127.0.0.1,localhost,0.0.0.0,10.0.0.34"
# ).split(",")
ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
    "0.0.0.0",
    "10.0.0.34",  # your Mac’s LAN IP (for mobile access)
]



INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",   # ← required
    "corsheaders",   # ← add
    "api",              # ← your app
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ← add at very top
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

STATIC_URL = "static/"

# CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS",
#     "http://127.0.0.1:5173,http://localhost:5173").split(",")


# Allow your frontend origins (both localhost and 127.0.0.1 on common ports)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # CRA/Next
    "http://127.0.0.1:3000",
    "http://10.0.0.34:5173",
]

# Helpful when you post from the browser (prevents CSRF warnings in dev)
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS


