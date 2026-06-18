from django.db import models


class QuizResult(models.Model):
    student = models.ForeignKey('StudentProfile', on_delete=models.CASCADE, null=True, blank=True)
    question_no = models.IntegerField()
    attempts_used = models.IntegerField()
    marks_scored = models.FloatField()

    correct_answer = models.FloatField(null=True, blank=True)
    user_answer = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Question {self.question_no}"


class StudentProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150)
    student_id = models.CharField(max_length=30, unique=True)
    password = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.student_id})"