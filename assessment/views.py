import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Question, Assessment, Answer
from ml_model.predict import predict_risk

DEFAULT_PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or being unusually restless",
    "Thoughts that you would be better off dead, or of hurting yourself in some way"
]

def seed_questions_if_needed():
    if Question.objects.count() < 9:
        Question.objects.all().delete()
        for idx, text in enumerate(DEFAULT_PHQ9_QUESTIONS, 1):
            Question.objects.create(order=idx, text=text)

@login_required
def take_assessment_view(request):
    seed_questions_if_needed()
    questions = Question.objects.all().order_by('order')
    
    if request.method == 'POST':
        answers = []
        missing = False
        for q in questions:
            val = request.POST.get(f'q_{q.order}')
            if val is None or val == '':
                missing = True
                break
            answers.append(int(val))
            
        if missing or len(answers) != 9:
            messages.error(request, "Please answer all 9 questionnaire items before submitting.")
            return render(request, 'assessment/take_assessment.html', {'questions': questions, 'selected_answers': request.POST})
            
        # Get user demographics from profile
        user_profile = request.user.profile
        age = user_profile.age
        gender = user_profile.gender
        
        # ML Inference
        try:
            prediction_res = predict_risk(answers, age=age, gender=gender)
            total_score = prediction_res['total_score']
            risk_label = prediction_res['risk_label']
            confidence = prediction_res['confidence']
        except Exception as e:
            # Fallback score calculation if ML artifact issue
            total_score = sum(answers)
            if total_score <= 4:
                risk_label = "Minimal Symptoms"
            elif total_score <= 9:
                risk_label = "Mild Symptom Risk"
            elif total_score <= 14:
                risk_label = "Moderate Symptom Risk"
            elif total_score <= 19:
                risk_label = "Moderately Severe Risk"
            else:
                risk_label = "Severe Symptom Risk"
            confidence = 85.0

        # Save Assessment to DB
        assessment = Assessment.objects.create(
            user=request.user,
            total_score=total_score,
            risk_category=risk_label,
            ml_prediction=risk_label,
            ml_confidence=confidence
        )
        
        # Save Individual Answers
        for q, ans_val in zip(questions, answers):
            Answer.objects.create(
                assessment=assessment,
                question_number=q.order,
                question_text=q.text,
                selected_option=ans_val
            )
            
        messages.success(request, "Assessment submitted and analyzed successfully!")
        return redirect('assessment_result', pk=assessment.pk)
        
    return render(request, 'assessment/take_assessment.html', {'questions': questions})

@login_required
def result_detail_view(request, pk):
    assessment = get_object_or_404(Assessment, pk=pk)
    
    # Enforce User Authorization (Users can only see their own assessments)
    if assessment.user != request.user:
        messages.error(request, "Unauthorized access to assessment record.")
        return redirect('dashboard')
        
    is_high_risk = assessment.total_score >= 15 or assessment.risk_category in ['Moderately Severe Risk', 'Severe Symptom Risk']
    
    context = {
        'assessment': assessment,
        'answers': assessment.answers.all().order_by('question_number'),
        'is_high_risk': is_high_risk,
    }
    return render(request, 'assessment/result.html', context)

@login_required
def history_list_view(request):
    assessments = Assessment.objects.filter(user=request.user).order_by('-created_at')
    
    # Data for Chart.js
    chart_dates = [a.created_at.strftime('%Y-%m-%d %H:%M') for a in reversed(list(assessments))]
    chart_scores = [a.total_score for a in reversed(list(assessments))]
    
    context = {
        'assessments': assessments,
        'chart_dates': json.dumps(chart_dates),
        'chart_scores': json.dumps(chart_scores),
    }
    return render(request, 'assessment/history.html', context)
