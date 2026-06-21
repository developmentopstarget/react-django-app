from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('-id')
    serializer_class = ItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']  # allows ?search=foo


class MeView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })
