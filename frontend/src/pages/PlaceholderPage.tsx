import React from 'react';
import { DisclaimerCard } from '../components/common/DisclaimerCard';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  phase: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, description, phase }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <Construction className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-xs text-sky-400 font-medium">Scheduled for {phase}</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      <DisclaimerCard />
    </div>
  );
};
