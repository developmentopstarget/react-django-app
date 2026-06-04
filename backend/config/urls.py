from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter

from api.views import ItemViewSet
from api.auth_views import CsrfView, LoginView, LogoutView, MeView


def health(request):
    return JsonResponse({"status": "ok"})


router = DefaultRouter()
router.register(r"items", ItemViewSet, basename="item")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/", include(router.urls)),

    # Djoser token auth
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.authtoken")),

    # Session auth
    path("api/auth/csrf/", CsrfView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/logout/", LogoutView.as_view()),
    path("api/auth/user/", MeView.as_view()),
]
