from django.contrib import admin
from .models import Question, Assessment, Answer

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ('question_number', 'question_text', 'selected_option')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('order', 'text')
    ordering = ('order',)

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_score', 'risk_category', 'ml_prediction', 'ml_confidence', 'created_at')
    list_filter = ('risk_category', 'created_at')
    search_fields = ('user__username', 'user__email')
    inlines = [AnswerInline]
    readonly_fields = ('created_at',)

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'assessment', 'question_number', 'selected_option')
