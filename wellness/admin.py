from django.contrib import admin
from .models import MentalWellnessTip, SupportHelpline

@admin.register(MentalWellnessTip)
class MentalWellnessTipAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'icon_class', 'created_at')
    list_filter = ('category',)
    search_fields = ('title', 'content')

@admin.register(SupportHelpline)
class SupportHelplineAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'contact_number', 'operating_hours', 'country')
    search_fields = ('name', 'organization', 'contact_number')
