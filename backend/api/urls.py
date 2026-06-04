from django.urls import path
from .auth_views import CsrfView, LoginView, LogoutView, MeView

urlpatterns = [
    path("auth/csrf/", CsrfView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/user/", MeView.as_view()),
]
