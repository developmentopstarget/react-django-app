from django.contrib import admin

from .models import Message

admin.site.site_header = "RDA Admin"
admin.site.site_title = "RDA"
admin.site.index_title = "Site administration"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("user", "room_name", "content_preview", "timestamp")
    list_filter = ("room_name", "user", "timestamp")
    search_fields = ("content", "user__username", "user__email", "room_name")
    readonly_fields = ("timestamp",)
    date_hierarchy = "timestamp"
    ordering = ("-timestamp",)

    @admin.display(description="Message")
    def content_preview(self, obj):
        return obj.content[:80] + "…" if len(obj.content) > 80 else obj.content
