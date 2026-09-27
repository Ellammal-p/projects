import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DisclaimerCard } from '../components/common/DisclaimerCard';
import { ExplainabilityView } from '../components/analysis/ExplainabilityView';
import { phq9Api, PHQ9Assessment } from '../api/phq9';
import { moodApi, MoodEntry } from '../api/mood';
import { journalApi, JournalEntryItem } from '../api/journal';
import {
  ClipboardList,
  Smile,
  BookOpen,
  Cpu,
  ArrowRight,
  Activity,
  TrendingUp,
  Sparkles,
  HeartHandshake,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [assessments, setAssessments] = useState<PHQ9Assessment[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [aData, mData, jData] = await Promise.all([
          phq9Api.getHistory().catch(() => []),
          moodApi.getEntries().catch(() => []),
          journalApi.getEntries().catch(() => [])
        ]);
        setAssessments(aData);
        setMoods(mData);
        setJournals(jData);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const latestAssessment = assessments[0];
  const latestMood = moods[0];

  // Calculate 7-day mood average
  const last7Moods = moods.slice(0, 7);
  const moodAvg = last7Moods.length > 0
    ? (last7Moods.reduce((acc, m) => acc + m.mood_score, 0) / last7Moods.length).toFixed(1)
    : '--';

  // Format Recharts data for 7-day trend
  const chartData = moods
    .slice(0, 7)
    .reverse()
    .map((item) => ({
      day: new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
      Mood: item.mood_score
    }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#172033] via-slate-900 to-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>MindWell AI Wellness Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.username || 'User'}</span>!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor your longitudinal depression screening estimates, daily mood trends, and AI-associated model insights in one central healthcare dashboard.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/screening"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition transform hover:-translate-y-0.5"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Take PHQ-9 Screening</span>
            </Link>
            <Link
              to="/mood"
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              <Smile className="w-4 h-4 text-emerald-400" />
              <span>Log Daily Mood</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Non-Clinical Disclaimer */}
      <DisclaimerCard />

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Latest PHQ-9 Score */}
        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Latest PHQ-9 Score</span>
            <ClipboardList className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {latestAssessment ? latestAssessment.total_score : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 27</span>
          </div>
          <p className="text-xs text-slate-400">
            {latestAssessment ? latestAssessment.risk_category : 'No screening completed yet'}
          </p>
        </div>

        {/* Card 2: Today's Mood */}
        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Mood</span>
            <Smile className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">
              {latestMood ? `${latestMood.mood_score} / 5` : 'Not Logged'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {latestMood ? latestMood.note || 'Recorded today' : 'Scale 1 (Low) to 5 (Good)'}
          </p>
        </div>

        {/* Card 3: 7-Day Mood Average */}
        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">7-Day Mood Average</span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{moodAvg}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-400">Based on last 7 mood entries</p>
        </div>

        {/* Card 4: Latest Risk Band */}
        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Latest Screening Band</span>
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-cyan-300">
              {latestAssessment ? latestAssessment.risk_category : 'Minimal Symptoms'}
            </span>
          </div>
          <p className="text-xs text-slate-400">Screening Indicator</p>
        </div>
      </div>

      {/* 7-Day Mood Trend Recharts Section */}
      <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>7-Day Mood Trend Trajectory</span>
          </h2>
          <Link to="/mood" className="text-xs text-cyan-400 hover:underline flex items-center">
            Log Mood <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Mood" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
            No mood history logged yet. Click "Log Daily Mood" to start tracking your 7-day trajectory!
          </div>
        )}
      </div>

      {/* Explainable AI (XAI) Component */}
      <ExplainabilityView
        totalScore={latestAssessment ? latestAssessment.total_score : 4}
        riskCategory={latestAssessment ? latestAssessment.risk_category : 'Minimal Symptoms'}
        mlPrediction={latestAssessment ? latestAssessment.ml_prediction : undefined}
        confidence={latestAssessment ? latestAssessment.ml_confidence : 90.0}
      />

      {/* Feature Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">1. PHQ-9 Symptom Screening</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Standardized 9-question PHQ-9 questionnaire evaluating symptom severity brackets.
            </p>
          </div>
          <Link to="/screening" className="inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300">
            Start Assessment <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">2. Daily Mood Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Log daily mood scale (1 to 5) and view longitudinal time-series trajectories.
            </p>
          </div>
          <Link to="/mood" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            Track Mood <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">3. Private Journal & BERT NLP</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Write confidential reflections processed by HuggingFace BERT Transformer model.
            </p>
          </div>
          <Link to="/journal" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            Open Journal <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
