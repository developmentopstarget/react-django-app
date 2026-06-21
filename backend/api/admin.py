from django.contrib import admin

from .models import Item


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    list_filter = ("owner", "created_at")
    search_fields = ("name", "owner__username", "owner__email")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
