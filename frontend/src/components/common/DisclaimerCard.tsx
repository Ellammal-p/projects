import React from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall } from 'lucide-react';

export const DisclaimerCard: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 text-amber-200 shadow-lg backdrop-blur-sm mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-amber-300">Academic & Screening Disclaimer</h4>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded border border-amber-500/30">
              Non-Diagnostic
            </span>
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            <strong>DeepLearn-Mind</strong> is strictly an educational research tool for symptom screening and multimodal analysis. 
            Outputs reflect estimated screening indicators based on self-reported inputs and AI models, <strong>NOT a clinical medical diagnosis</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-amber-300/80 border-t border-amber-500/20 mt-2">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Academic PHQ-9 & Transformer Pipeline</span>
            </span>
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Crisis Helpline: <strong>14416 / 1800-599-0019</strong> (24/7)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
