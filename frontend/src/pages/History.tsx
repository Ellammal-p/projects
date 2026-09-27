import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { phq9Api, PHQ9Assessment } from '../api/phq9';
import { DisclaimerCard } from '../components/common/DisclaimerCard';
import { History as HistoryIcon, ClipboardList, ExternalLink, Calendar, Activity } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [assessments, setAssessments] = useState<PHQ9Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await phq9Api.getHistory();
        setAssessments(data);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError('Failed to fetch assessment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getSeverityBadge = (category: string) => {
    switch (category) {
      case 'Minimal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Mild':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Moderately Severe':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Severe':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <HistoryIcon className="w-4 h-4" />
            <span>Screening Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assessment History</h1>
        </div>
        <Link
          to="/screening"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-600/30 transition self-start sm:self-auto"
        >
          <ClipboardList className="w-4 h-4" />
          <span>New PHQ-9 Screening</span>
        </Link>
      </div>

      <DisclaimerCard />

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-slate-400 text-sm">
          Loading past screening records...
        </div>
      ) : error ? (
        <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Screening Records Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven't completed any PHQ-9 symptom screenings yet. Complete your first screening to track symptom trajectory over time.
            </p>
          </div>
          <Link
            to="/screening"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-sky-600/30 transition"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Take PHQ-9 Screening</span>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Date & Time</th>
                  <th className="px-4 py-3 font-semibold">PHQ-9 Score</th>
                  <th className="px-4 py-3 font-semibold">Symptom Severity Range</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850 transition">
                    <td className="px-4 py-3 font-mono text-slate-400">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white font-mono">
                      {item.total_score} <span className="text-slate-500 text-[10px] font-normal">/ 27</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getSeverityBadge(item.risk_category)}`}>
                        {item.risk_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/screening/result/${item.id}`}
                        className="inline-flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-medium"
                      >
                        <span>View Breakdown</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
