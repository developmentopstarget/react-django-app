from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Item


class ItemViewSetTests(APITestCase):

    def test_list_items_returns_200_with_all_items(self):
        Item.objects.create(name="Alpha")
        Item.objects.create(name="Beta")
        url = reverse("item-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_items_returns_expected_fields(self):
        Item.objects.create(name="Alpha")
        url = reverse("item-list")
        response = self.client.get(url)
        item = response.data[0]
        self.assertIn("id", item)
        self.assertIn("name", item)
        self.assertIn("created_at", item)

    def test_create_item_returns_201_and_persists(self):
        url = reverse("item-list")
        response = self.client.post(url, {"name": "Gamma"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 1)
        self.assertEqual(response.data["name"], "Gamma")

    def test_create_item_missing_name_returns_400(self):
        url = reverse("item-list")
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)
