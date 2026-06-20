from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Item


class ItemViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass")
        self.token = Token.objects.create(user=self.user)
        self.url = reverse("item-list")

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_unauthenticated_list_is_rejected(self):
        response = self.client.get(self.url)

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_list_items_returns_200_with_all_items(self):
        self.authenticate()
        Item.objects.create(name="Alpha")
        Item.objects.create(name="Beta")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_item_response_fields_shape(self):
        self.authenticate()
        Item.objects.create(name="Alpha")

        response = self.client.get(self.url)
        item = response.data[0]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(item["name"], "Alpha")
        self.assertIn("id", item)
        self.assertIn("created_at", item)

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
