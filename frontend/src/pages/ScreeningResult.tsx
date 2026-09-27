import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phq9Api, PHQ9Assessment } from '../api/phq9';
import { DisclaimerCard } from '../components/common/DisclaimerCard';
import { ShieldCheck, PhoneCall, ArrowLeft, RotateCcw, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';

export const ScreeningResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<PHQ9Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await phq9Api.getDetail(parseInt(id, 10));
        setAssessment(data);
      } catch (err) {
        console.error('Failed to load result:', err);
        setError('Assessment record not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
        Calculating PHQ-9 screening metrics...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <DisclaimerCard />
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <p className="text-slate-300">{error || 'Record not found.'}</p>
          <Link
            to="/screening"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-xs px-4 py-2 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Take New Screening</span>
          </Link>
        </div>
      </div>
    );
  }

  // Determine color theme based on score / risk_category
  const getSeverityTheme = (category: string) => {
    switch (category) {
      case 'Minimal':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500' };
      case 'Mild':
        return { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', bar: 'bg-sky-500' };
      case 'Moderate':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' };
      case 'Moderately Severe':
        return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', bar: 'bg-orange-500' };
      case 'Severe':
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', bar: 'bg-rose-500' };
      default:
        return { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', bar: 'bg-sky-500' };
    }
  };

  const theme = getSeverityTheme(assessment.risk_category);
  const scorePercent = Math.round((assessment.total_score / 27) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">
          Screening ID: #{assessment.id} • {new Date(assessment.created_at).toLocaleDateString()}
        </span>
      </div>

      <DisclaimerCard />

      {/* Primary Result Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Screening Metric Output
            </span>
            <h1 className="text-2xl font-bold text-white">PHQ-9 Symptom Severity Estimate</h1>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${theme.bg} ${theme.border} ${theme.color} flex items-center space-x-2 text-sm font-semibold`}>
            <Activity className="w-4 h-4" />
            <span>{assessment.risk_category} Symptom Range</span>
          </div>
        </div>

        {/* Score Gauge & Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Calculated Total Score
            </span>
            <div className="flex items-baseline justify-center space-x-1">
              <span className={`text-5xl font-extrabold ${theme.color}`}>
                {assessment.total_score}
              </span>
              <span className="text-lg text-slate-400 font-medium">/ 27</span>
            </div>
            <span className="text-xs text-slate-400 block pt-1">
              Standard PHQ-9 Scoring Index
            </span>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Severity Gauge (0-27)</span>
                <span className={theme.color}>{assessment.risk_category} Range</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${theme.bar}`}
                  style={{ width: `${Math.max(4, scorePercent)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                <span>0 Minimal</span>
                <span>5 Mild</span>
                <span>10 Mod</span>
                <span>15 ModSev</span>
                <span>20 Severe</span>
              </div>
            </div>

            {/* Non-Diagnostic Declaration Text */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Screening Guidance Statement</span>
              </div>
              <p>
                Your PHQ-9 score is <strong>{assessment.total_score}</strong>, which falls in the{' '}
                <strong className={theme.color}>{assessment.risk_category.toLowerCase()} symptom-severity range</strong> used by the educational screening instrument.
              </p>
              <p className="text-slate-400 text-[11px] italic">
                Notice: This screening output represents a symptom severity estimate and is <strong>NOT a clinical medical diagnosis</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Action / Next Steps Advice */}
        {assessment.total_score >= 10 ? (
          <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl text-amber-200 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Recommended Next Steps</span>
            </div>
            <p className="leading-relaxed">
              Your responses indicate a level of depressive symptoms that may be worth discussing with a qualified mental-health professional or counselor. 
              Consider scheduling an appointment with a certified practitioner for a formal evaluation.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl text-emerald-200 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Wellness & Self-Care Recommendation</span>
            </div>
            <p className="leading-relaxed">
              Your screening score reflects minimal to mild symptom indicators. Continue logging your daily mood, engaging in physical activity, and practicing self-care routines.
            </p>
          </div>
        )}
      </div>

      {/* Response Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">Item Response Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Q#</th>
                <th className="px-4 py-3 font-semibold">Screening Item</th>
                <th className="px-4 py-3 font-semibold text-right">Selected Response Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assessment.answers.map((ans) => (
                <tr key={ans.question_number} className="hover:bg-slate-850">
                  <td className="px-4 py-3 font-mono font-bold text-sky-400">Q{ans.question_number}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{ans.question_text}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono ${
                      ans.selected_option >= 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ans.selected_option} / 3
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Helpline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>24/7 Verified Emergency Crisis Helplines</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-semibold text-white block">Tele-MANAS (Govt of India)</span>
              <span className="text-slate-400 text-[11px]">24/7 National Mental Health Helpline</span>
            </div>
            <a href="tel:14416" className="text-sky-400 font-mono font-bold bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20 hover:bg-sky-500/20">
              14416
            </a>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-semibold text-white block">KIRAN Mental Health Line</span>
              <span className="text-slate-400 text-[11px]">Toll-Free Helpline</span>
            </div>
            <a href="tel:18005990019" className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20">
              1800-599-0019
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
