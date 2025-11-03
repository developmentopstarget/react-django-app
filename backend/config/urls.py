# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from api.views import ItemViewSet

def health(request):
    return JsonResponse({"status": "ok"})

router = DefaultRouter()
router.register(r"items", ItemViewSet, basename="item")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/", include(router.urls)),
    # --- auth endpoints ---
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),
]
