# backend/api/auth_views.py
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        get_token(request)  # force-generate token so cookie is set
        return Response({"detail": "CSRF cookie set"})

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("username")  # can be username OR email
        password   = request.data.get("password")
        if not identifier or not password:
            return Response({"detail": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

        # Try direct (assumes identifier is username)
        user = authenticate(request, username=identifier, password=password)

        if not user:
            # If not found, try resolving identifier as email → username
            U = get_user_model()
            try:
                u = U.objects.get(email=identifier)
                user = authenticate(request, username=u.username, password=password)
            except U.DoesNotExist:
                user = None

        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({"detail": "Account inactive"}, status=status.HTTP_403_FORBIDDEN)

        login(request, user)
        return Response({"username": user.username, "email": user.email})

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out"})

class MeView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"isAuthenticated": False})
        u = request.user
        return Response({"isAuthenticated": True, "username": u.username, "email": u.email})
