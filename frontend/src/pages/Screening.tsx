import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { phq9Api, PHQ9Question } from '../api/phq9';
import { QuestionCard } from '../components/screening/QuestionCard';
import { DisclaimerCard } from '../components/common/DisclaimerCard';
import { AlertCircle, ClipboardList } from 'lucide-react';

export const Screening: React.FC = () => {
  const [questions, setQuestions] = useState<PHQ9Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await phq9Api.getQuestions();
        setQuestions(data);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('Failed to load questionnaire. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectOption = (value: number) => {
    const currentQ = questions[currentIndex];
    setAnswersMap({
      ...answersMap,
      [currentQ.order]: value,
    });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit assessment
      setSubmitting(true);
      setError(null);
      try {
        const payload = questions.map((q) => ({
          question_number: q.order,
          selected_option: answersMap[q.order] ?? 0,
        }));
        const result = await phq9Api.submitAssessment(payload);
        navigate(`/screening/result/${result.id}`);
      } catch (err: any) {
        console.error('Submission failed:', err);
        setError(err.response?.data?.message || 'Failed to process screening. Please try again.');
        setSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        Loading PHQ-9 screening questions...
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <DisclaimerCard />
        <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-2xl text-red-300 space-y-3">
          <div className="flex items-center space-x-2 font-semibold">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>Screening Error</span>
          </div>
          <p className="text-sm">{error || 'No questions available.'}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answersMap[currentQuestion.order] ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <ClipboardList className="w-4 h-4" />
          <span>Patient Health Questionnaire-9 (PHQ-9)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Educational Symptom Screening
        </h1>
      </div>

      <DisclaimerCard />

      <QuestionCard
        question={currentQuestion}
        totalQuestions={questions.length}
        selectedOption={currentAnswer}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentIndex === 0}
        isLast={currentIndex === questions.length - 1}
        submitting={submitting}
      />
    </div>
  );
};
