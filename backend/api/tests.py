from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Item


class HealthCheckTests(APITestCase):
    def test_health_returns_200_and_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})


class ItemViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass")
        self.token = Token.objects.create(user=self.user)
        self.url = reverse("item-list")

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_unauthenticated_get_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_items_returns_200_with_own_items(self):
        self.authenticate()
        Item.objects.create(name="Alpha", owner=self.user)
        Item.objects.create(name="Beta", owner=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_item_response_fields_shape(self):
        self.authenticate()
        Item.objects.create(name="Alpha", owner=self.user)

        response = self.client.get(self.url)
        item = response.data[0]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(item["name"], "Alpha")
        self.assertIn("id", item)
        self.assertIn("created_at", item)
        self.assertNotIn("owner", item)

    def test_create_item_returns_201(self):
        self.authenticate()

        response = self.client.post(self.url, {"name": "Gamma"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Gamma")
        self.assertEqual(Item.objects.count(), 1)

    def test_create_item_missing_name_returns_400(self):
        self.authenticate()

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_authenticated_user_sees_only_own_items(self):
        self.authenticate()
        other = User.objects.create_user(username="other", password="pass")
        Item.objects.create(name="Mine", owner=self.user)
        Item.objects.create(name="Theirs", owner=other)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Mine")

    def test_authenticated_user_does_not_see_other_users_items(self):
        self.authenticate()
        other = User.objects.create_user(username="other2", password="pass")
        Item.objects.create(name="NotMine", owner=other)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_item_assigns_owner_to_request_user(self):
        self.authenticate()

        response = self.client.post(self.url, {"name": "Owned"}, format="json")
        item = Item.objects.get(name="Owned")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(item.owner, self.user)

class MeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="meuser",
            password="pass",
            email="me@example.com",
        )
        self.token = Token.objects.create(user=self.user)
        self.url = "/api/me/"

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_unauthenticated_get_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_get_returns_200(self):
        self.authenticate()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_response_contains_exactly_safe_fields(self):
        self.authenticate()
        response = self.client.get(self.url)
        self.assertEqual(set(response.data.keys()), {"id", "username", "email"})
        self.assertEqual(response.data["id"], self.user.id)
        self.assertEqual(response.data["username"], "meuser")
        self.assertEqual(response.data["email"], "me@example.com")

