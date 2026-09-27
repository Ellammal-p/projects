import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Smile, BookOpen, History, Cpu, UserCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/screening', label: 'PHQ-9 Screening', icon: ClipboardList },
    { to: '/mood', label: 'Mood Tracker', icon: Smile },
    { to: '/journal', label: 'Private Journal (NLP)', icon: BookOpen },
    { to: '/history', label: 'Assessment History', icon: History },
    { to: '/models', label: 'Model Benchmarks', icon: Cpu },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </p>
        <nav className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800/80">
        <div className="bg-slate-850 bg-slate-800/40 rounded-xl p-3 border border-slate-700/40 space-y-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold">
            <UserCheck className="w-4 h-4" />
            <span>Academic Pipeline</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400/90">
            Multimodal Fusion architecture combining BERT text representations, MLP structured vectors, and LSTM temporal embeddings.
          </p>
        </div>
      </div>
    </aside>
  );
};
