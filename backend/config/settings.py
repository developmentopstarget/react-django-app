from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


def csv_env(name: str, default: str) -> list[str]:
    return [value.strip() for value in os.getenv(name, default).split(",") if value.strip()]


DJANGO_ENV = os.getenv("DJANGO_ENV", "development").lower()
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if DJANGO_ENV == "production":
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("SECRET_KEY environment variable must be set in production.")
    SECRET_KEY = "dev-only-fallback-not-safe-for-production"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

ALLOWED_HOSTS = csv_env(
    "ALLOWED_HOSTS",
    "127.0.0.1,localhost,0.0.0.0",
)

CORS_ALLOWED_ORIGINS = csv_env(
    "CORS_ALLOWED_ORIGINS",
    "http://127.0.0.1:5173,http://localhost:5173",
)

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "djoser",
    "channels",
    "api",
    "chat",
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

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASE_URL = os.getenv("DATABASE_URL")
DB_HOST = os.getenv("DB_HOST")

if DATABASE_URL:
    from urllib.parse import urlparse

    db_url = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": db_url.path.lstrip("/"),
            "USER": db_url.username or "",
            "PASSWORD": db_url.password or "",
            "HOST": db_url.hostname or "localhost",
            "PORT": str(db_url.port or 5432),
        }
    }
elif DB_HOST:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "appdb"),
            "USER": os.getenv("DB_USER", "appuser"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": DB_HOST,
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }
elif DJANGO_ENV == "production":
    from django.core.exceptions import ImproperlyConfigured

    raise ImproperlyConfigured("DATABASE_URL or DB_HOST must be set in production.")
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.pubsub.RedisPubSubChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
        },
    },
}