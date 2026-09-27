import React, { useState, useEffect } from 'react';
import { journalApi, JournalEntryItem } from '../api/journal';
import { BookOpen, Send, Sparkles, Clock, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await journalApi.getEntries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch journal entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setMsg('');
    try {
      const created = await journalApi.createEntry({
        title: title.trim() || 'Daily Reflection',
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      setEntries([created, ...entries]);
      setMsg(`Journal entry saved! BERT Sentiment: ${created.sentiment_label}`);
    } catch (err) {
      console.error('Failed to create journal entry', err);
      setMsg('Failed to save journal entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSentimentBadge = (label: string, score: number) => {
    if (label === 'Positive' || score > 0.1) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    } else if (label === 'Negative' || score < -0.1) {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#172033] border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>BERT Transformer NLP Processing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Private Reflection Journal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Write daily reflections for BERT Transformer representation and sentiment insight.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>{entries.length} Entries Saved</span>
        </div>
      </div>

      {/* Editor Form */}
      <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>How are you feeling today?</span>
        </h2>

        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-blue-900/40 border border-cyan-500/40 text-cyan-200 text-xs font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Entry Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Evening Study Reflection..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reflection Content
            </label>
            <textarea
              rows={4}
              placeholder="Write your thoughts, feelings, or daily highlights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Entries are private and processed locally for NLP representations.</span>
            </div>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Analyzing...' : 'Save & Analyze Entry'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Entry History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <span>Journal Entry History</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading reflection entries...</div>
        ) : entries.length === 0 ? (
          <div className="bg-[#172033] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            No journal entries recorded yet. Write your first reflection above!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {entries.map((item) => (
              <div
                key={item.id}
                className="bg-[#172033] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{item.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getSentimentBadge(
                      item.sentiment_label,
                      item.sentiment_score
                    )}`}
                  >
                    {item.sentiment_label} ({item.sentiment_score > 0 ? `+${item.sentiment_score}` : item.sentiment_score})
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
