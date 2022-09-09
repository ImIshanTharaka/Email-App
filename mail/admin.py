from django.contrib import admin
from .models import *

# Register your models here.
class EmailAdmin(admin.ModelAdmin):
    list_display = ("id", "user","sender", "subject")
    filter_horizontal = ("recipients",)

admin.site.register(User)
admin.site.register(Email, EmailAdmin)

#admin, admin@example.com, 12345