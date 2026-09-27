import React, { useState, useEffect, useMemo } from 'react';
import {
  Smile,
  TrendingUp,
  Calendar,
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  PlusCircle,
  Search,
  BarChart3,
  Info,
  Sparkles,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { moodApi, MoodEntry, MoodStats } from '../api/mood';

const MOOD_OPTIONS = [
  {
    score: 1,
    label: 'Very Low',
    emoji: '😫',
    color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
    activeBg: 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/50',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    barColor: '#f43f5e',
  },
  {
    score: 2,
    label: 'Low',
    emoji: '😔',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
    activeBg: 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/50',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    barColor: '#f59e0b',
  },
  {
    score: 3,
    label: 'Neutral',
    emoji: '😐',
    color: 'from-yellow-500/20 to-zinc-500/10 border-yellow-500/40 text-yellow-400',
    activeBg: 'bg-yellow-500/20 border-yellow-500 text-yellow-300 ring-2 ring-yellow-500/50',
    badgeBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    barColor: '#eab308',
  },
  {
    score: 4,
    label: 'Good',
    emoji: '🙂',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    activeBg: 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    barColor: '#10b981',
  },
  {
    score: 5,
    label: 'Very Good',
    emoji: '😊',
    color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/40 text-sky-400',
    activeBg: 'bg-sky-500/20 border-sky-500 text-sky-300 ring-2 ring-sky-500/50',
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    barColor: '#38bdf8',
  },
];

export const MoodTracker: React.FC = () => {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [note, setNote] = useState('');

  // Editing state
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  // Filter & Chart timeframe
  const [timeframe, setTimeframe] = useState<'7days' | '30days'>('7days');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, entriesRes] = await Promise.all([moodApi.getStats(), moodApi.getEntries()]);
      setStats(statsRes);
      setEntries(entriesRes);
    } catch (err: any) {
      console.error('Error fetching mood data:', err);
      setFeedback({ type: 'error', message: 'Failed to load mood records. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScore) {
      setFeedback({ type: 'error', message: 'Please select a mood level before submitting.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      if (editingEntry) {
        await moodApi.updateEntry(editingEntry.id, {
          mood_score: selectedScore,
          note: note.trim(),
        });
        setFeedback({ type: 'success', message: 'Mood entry updated successfully!' });
        setEditingEntry(null);
      } else {
        await moodApi.createEntry({
          mood_score: selectedScore,
          note: note.trim(),
        });
        setFeedback({ type: 'success', message: 'Daily mood logged successfully!' });
      }

      setSelectedScore(null);
      setNote('');
      await loadData();
    } catch (err: any) {
      console.error('Error saving mood entry:', err);
      setFeedback({ type: 'error', message: err.response?.data?.detail || 'Failed to save mood entry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (entry: MoodEntry) => {
    setEditingEntry(entry);
    setSelectedScore(entry.mood_score);
    setNote(entry.note || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setSelectedScore(null);
    setNote('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this mood record?')) return;
    try {
      setDeletingId(id);
      await moodApi.deleteEntry(id);
      setFeedback({ type: 'success', message: 'Mood record deleted.' });
      await loadData();
    } catch (err: any) {
      console.error('Error deleting mood entry:', err);
      setFeedback({ type: 'error', message: 'Failed to delete mood record.' });
    } finally {
      setDeletingId(null);
    }
  };

  // Helper for formatting timestamps
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatShortDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Chart dataset based on timeframe
  const chartData = useMemo(() => {
    if (!stats) return [];
    const sourceList = timeframe === '7days' ? stats.history_7days : stats.history_30days;
    return sourceList.map((entry) => {
      const moodConfig = MOOD_OPTIONS.find((m) => m.score === entry.mood_score);
      return {
        id: entry.id,
        date: formatShortDate(entry.created_at),
        fullDate: `${formatDate(entry.created_at)} ${formatTime(entry.created_at)}`,
        score: entry.mood_score,
        label: moodConfig?.label || '',
        emoji: moodConfig?.emoji || '',
        note: entry.note,
      };
    });
  }, [stats, timeframe]);

  // Filtered history list for table
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter((e) => {
      const moodConfig = MOOD_OPTIONS.find((m) => m.score === e.mood_score);
      return (
        moodConfig?.label.toLowerCase().includes(q) ||
        e.note.toLowerCase().includes(q) ||
        formatDate(e.created_at).toLowerCase().includes(q)
      );
    });
  }, [entries, searchQuery]);

  const getMoodConfig = (score: number) => {
    return MOOD_OPTIONS.find((m) => m.score === score) || MOOD_OPTIONS[2];
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading mood analytics & history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-1 rounded-full font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Phase 3 • Mood Analytics Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Daily Mood Tracker & Time-Series Analytics
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Record daily emotional reflections and analyze multi-day symptom trajectories. Temporal mood trends provide structured inputs for sequence modeling and longitudinal mental wellness tracking.
          </p>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium transition ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Status Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Mood</span>
            <Smile className="w-5 h-5 text-emerald-400" />
          </div>
          {stats?.today_entry ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getMoodConfig(stats.today_entry.mood_score).emoji}</span>
                <span className="text-xl font-bold text-white">
                  {getMoodConfig(stats.today_entry.mood_score).label}
                </span>
              </div>
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Logged Today
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-lg font-bold text-slate-400">Not Logged Yet</span>
              <p className="text-xs text-slate-500">Record how you feel today below</p>
            </div>
          )}
        </div>

        {/* 7-Day Average Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">7-Day Average</span>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.avg_7days !== null && stats?.avg_7days !== undefined ? stats.avg_7days : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-400">Mean rating over last 7 days</p>
        </div>

        {/* 30-Day Average Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">30-Day Average</span>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.avg_30days !== null && stats?.avg_30days !== undefined ? stats.avg_30days : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-400">Mean rating over last 30 days</p>
        </div>

        {/* Total Logs Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recorded</span>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats?.total_entries || 0}</span>
            <span className="text-xs text-slate-400">entries</span>
          </div>
          <p className="text-xs text-slate-400">Lifetime user logs</p>
        </div>
      </div>

      {/* Main Form + Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Logger Form Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                {editingEntry ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingEntry ? 'Edit Mood Record' : 'Record Daily Mood'}
                </h2>
                <p className="text-xs text-slate-400">
                  Select your current mood state and add optional reflections
                </p>
              </div>
            </div>
            {editingEntry && (
              <button
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                How are you feeling right now? <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MOOD_OPTIONS.map((item) => {
                  const isSelected = selectedScore === item.score;
                  return (
                    <button
                      key={item.score}
                      type="button"
                      onClick={() => setSelectedScore(item.score)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? item.activeBg
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span className="text-3xl mb-2 transition-transform transform group-hover:scale-110">
                        {item.emoji}
                      </span>
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Scale {item.score}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note / Reflection Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Optional Reflection Note
                </label>
                <span className="text-slate-500">{note.length} / 500 chars</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="What factors contributed to your mood today? (e.g., sleep, activity, work, stress)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-none"
              />
            </div>

            {/* Action Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedScore}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Smile className="w-4 h-4" />
                    <span>{editingEntry ? 'Update Mood Entry' : 'Save Mood Entry'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mood Distribution Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm border-b border-slate-800 pb-3">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Mood Level Distribution</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Frequency distribution across all recorded emotional ratings
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.mood_distribution || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.label}</p>
                          <p className="text-slate-300">Recorded: <span className="font-bold text-sky-400">{data.count}</span> times</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {stats?.mood_distribution.map((entry) => (
                    <Cell key={`cell-${entry.score}`} fill={getMoodConfig(entry.score).barColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed flex items-start space-x-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>Regular daily logging enhances trend accuracy for early symptom variation detection.</span>
          </div>
        </div>
      </div>

      {/* Recharts Time-Series Trend Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Mood Trajectory & Recharts Visualization</h2>
            </div>
            <p className="text-xs text-slate-400">
              Time-series graph illustrating continuous mood variations over selected evaluation windows
            </p>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === '7days'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7-Day Window
            </button>
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeframe === '30days'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30-Day Window
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Smile className="w-10 h-10 opacity-30 text-slate-400" />
            <p className="text-sm font-medium">No mood records found in the selected timeframe.</p>
            <p className="text-xs text-slate-600">Log a mood entry above to generate your trend curve.</p>
          </div>
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#94a3b8"
                  tickFormatter={(val) => {
                    const cfg = MOOD_OPTIONS.find((m) => m.score === val);
                    return cfg ? `${val} ${cfg.emoji}` : val;
                  }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const moodConfig = getMoodConfig(data.score);
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-2 max-w-xs text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400">{data.fullDate}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${moodConfig.badgeBg}`}>
                              {moodConfig.emoji} {moodConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Score Rating:</span>
                            <span className="font-extrabold text-white text-sm">{data.score} / 5</span>
                          </div>
                          {data.note && (
                            <p className="text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed text-[11px]">
                              "{data.note}"
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Average Reference Line */}
                <ReferenceLine
                  y={timeframe === '7days' ? stats?.avg_7days || 3 : stats?.avg_30days || 3}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg: ${timeframe === '7days' ? stats?.avg_7days : stats?.avg_30days}`,
                    fill: '#10b981',
                    fontSize: 11,
                    position: 'top',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  dot={{ r: 5, fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Mood History Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Mood History Log</h2>
            <p className="text-xs text-slate-400">
              Detailed breakdown of all your recorded mood entries
            </p>
          </div>

          {/* Search filter input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history or notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-sm font-medium">No matching mood entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Date & Time</th>
                  <th className="py-3.5 px-4">Mood Level</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Reflection Note</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEntries.map((entry) => {
                  const moodConfig = getMoodConfig(entry.mood_score);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4 font-medium text-slate-200">
                        <div>{formatDate(entry.created_at)}</div>
                        <div className="text-[10px] text-slate-400">{formatTime(entry.created_at)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${moodConfig.badgeBg}`}
                        >
                          <span>{moodConfig.emoji}</span>
                          <span>{moodConfig.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-white">{entry.mood_score} / 5</td>
                      <td className="py-4 px-4 max-w-xs">
                        {entry.note ? (
                          <span className="text-slate-300 block truncate" title={entry.note}>
                            {entry.note}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No note added</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
