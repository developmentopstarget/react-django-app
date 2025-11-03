from django.contrib import admin
from .models import Message

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'room_name', 'content', 'timestamp')
    list_filter = ('user', 'timestamp')
    search_fields = ('content', 'user__username')
    readonly_fields = ('timestamp',)

    def __str__(self):
        return "Message Admin"

admin.site.register(Message, MessageAdmin)
