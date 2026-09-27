import React from 'react';
import { PHQ9Question } from '../../api/phq9';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  question: PHQ9Question;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
}

const RESPONSE_OPTIONS = [
  { value: 0, label: '0 - Not at all', desc: 'Over the last 2 weeks, this did not bother you' },
  { value: 1, label: '1 - Several days', desc: 'Bothered you on several days' },
  { value: 2, label: '2 - More than half the days', desc: 'Bothered you for more than 7 days' },
  { value: 3, label: '3 - Nearly every day', desc: 'Bothered you almost daily' },
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  isFirst,
  isLast,
  submitting,
}) => {
  const progressPercent = Math.round((question.order / totalQuestions) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold tracking-wider uppercase">
          <span>Question {question.order} of {totalQuestions}</span>
          <span className="text-sky-400">{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-2 py-2">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          Over the last 2 weeks, how often have you been bothered by:
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
          {question.order}. {question.text}
        </h2>
      </div>

      {/* 4 Response Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {RESPONSE_OPTIONS.map((opt) => {
          const isSelected = selectedOption === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectOption(opt.value)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between space-x-3 ${
                isSelected
                  ? 'bg-sky-950/60 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-slate-100'
              }`}
            >
              <div className="space-y-1">
                <span className="block font-semibold text-sm">{opt.label}</span>
                <span className="block text-xs text-slate-400">{opt.desc}</span>
              </div>
              <CheckCircle2
                className={`w-5 h-5 shrink-0 transition-opacity ${
                  isSelected ? 'text-sky-400 opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center space-x-2 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={selectedOption === null || submitting}
          className="flex items-center space-x-2 text-sm font-medium px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLast ? (submitting ? 'Submitting...' : 'Complete & Calculate') : 'Next Question'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
