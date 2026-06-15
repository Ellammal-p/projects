from django.db import models

class QuizResult(models.Model):
    question_no = models.IntegerField()
    attempts_used = models.IntegerField()
    marks_scored = models.FloatField()

    correct_answer = models.FloatField(null=True, blank=True)
    user_answer = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Question {self.question_no}"