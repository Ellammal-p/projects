from rest_framework import serializers
from .models import Question, Assessment, Answer, PredictionResult, ModelVersion, calculate_phq9_severity


DEFAULT_PHQ9_QUESTIONS = [
    (1, "Little interest or pleasure in doing things"),
    (2, "Feeling down, depressed, or hopeless"),
    (3, "Trouble falling or staying asleep, or sleeping too much"),
    (4, "Feeling tired or having little energy"),
    (5, "Poor appetite or overeating"),
    (6, "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"),
    (7, "Trouble concentrating on things, such as reading the newspaper or watching television"),
    (8, "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual"),
    (9, "Thoughts that you would be better off dead, or of hurting yourself in some way"),
]

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'order', 'text']

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['question_number', 'question_text', 'selected_option']

class AssessmentSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = ['id', 'total_score', 'risk_category', 'ml_prediction', 'ml_confidence', 'created_at', 'answers']

class SingleAnswerInputSerializer(serializers.Serializer):
    question_number = serializers.IntegerField(min_value=1, max_value=9)
    selected_option = serializers.IntegerField(min_value=0, max_value=3)

class PHQ9SubmissionSerializer(serializers.Serializer):
    answers = SingleAnswerInputSerializer(many=True)

    def validate_answers(self, value):
        if len(value) != 9:
            raise serializers.ValidationError("Exactly 9 responses are required for the PHQ-9 screening.")
        
        q_numbers = set(item['question_number'] for item in value)
        if q_numbers != set(range(1, 10)):
            raise serializers.ValidationError("Must provide responses for questions 1 through 9 exactly once.")
        
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        answers_data = validated_data['answers']
        
        # Sort by question_number
        answers_data = sorted(answers_data, key=lambda x: x['question_number'])
        
        # Calculate total score
        total_score = sum(item['selected_option'] for item in answers_data)
        risk_cat, _ = calculate_phq9_severity(total_score)
        
        # Perform ML model inference using trained pipeline
        q_scores = [item['selected_option'] for item in answers_data]
        try:
            from ml_model.predict import predict_risk
            pred_res = predict_risk(q_scores)
            ml_pred = pred_res.get('risk_label', risk_cat)
            ml_conf = float(pred_res.get('confidence', 90.0))
        except Exception:
            ml_pred = f"Screening Category: {risk_cat}"
            ml_conf = 85.0

        # Create Assessment object
        assessment = Assessment.objects.create(
            user=user,
            total_score=total_score,
            risk_category=risk_cat,
            ml_prediction=ml_pred,
            ml_confidence=ml_conf
        )

        # Map question texts
        q_text_map = {q[0]: q[1] for q in DEFAULT_PHQ9_QUESTIONS}
        existing_questions = {q.order: q.text for q in Question.objects.all()}
        q_text_map.update(existing_questions)

        for item in answers_data:
            q_num = item['question_number']
            opt = item['selected_option']
            q_text = q_text_map.get(q_num, f"Question {q_num}")
            
            Answer.objects.create(
                assessment=assessment,
                question_number=q_num,
                question_text=q_text,
                selected_option=opt
            )

        return assessment

class PredictionResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionResult
        fields = [
            'id', 'phq9_score', 'mood_avg', 'journal_sentiment',
            'risk_label', 'confidence', 'model_used', 'signal_breakdown',
            'disclaimer', 'created_at'
        ]

class ModelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelVersion
        fields = ['id', 'model_name', 'version', 'accuracy', 'f1_score', 'metrics_json', 'created_at']

