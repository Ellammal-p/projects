from django.db import connection
from django.shortcuts import render, redirect
from django.shortcuts import render
from .models import QuizResult
from django.http import JsonResponse
from .models import QuizResult
import json
from django.db.models import Sum

# Create your views here.
def quiz_page(request):
    return render(request, "page.html")



def save_result(request):
    if request.method == "POST":
        data = json.loads(request.body)

        QuizResult.objects.create(
            question_no=data["question_no"],
            attempts_used=data["attempts_used"],
            marks_scored=data["marks_scored"],
            correct_answer=data["correct_answer"],
            user_answer=data["user_answer"]
        )

        return JsonResponse({"status": "success"})

def result_list(request):
    results = QuizResult.objects.all()

    total_score = results.aggregate(
        Sum('marks_scored')
    )['marks_scored__sum'] or 0

    return render(
        request,
        "result_list.html",
        {
            "results": results,
            "total_score": total_score
        }
    )

def reset_quiz(request):
    return JsonResponse({"status": "success"})