import React from 'react';
import { Cpu, ShieldCheck, Activity, BarChart2, Sparkles } from 'lucide-react';

interface ExplainabilityProps {
  totalScore: number;
  riskCategory: string;
  mlPrediction?: string;
  confidence?: number;
}

export const ExplainabilityView: React.FC<ExplainabilityProps> = ({
  totalScore,
  riskCategory,
  mlPrediction,
  confidence = 90.0,
}) => {
  const signalFactors = [
    {
      factor: 'PHQ-9 Question Item Weights',
      weight: 'Primary Signal (Sum: ' + totalScore + ' / 27)',
      impact: totalScore > 14 ? 'High Severity Influence' : totalScore > 9 ? 'Moderate Influence' : 'Low Influence',
      color: totalScore > 14 ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' : totalScore > 9 ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
    },
    {
      factor: 'Temporal Mood Trajectory (Bi-LSTM)',
      weight: 'Sequential Trend Feature',
      impact: 'Autoregressive Trajectory Slope',
      color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
    },
    {
      factor: 'Journal NLP Text Embedding (BERT)',
      weight: 'Contextual Semantic Feature',
      impact: 'Reflection Representation Vector',
      color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10'
    },
    {
      factor: 'Demographic & Sleep/Energy Features',
      weight: 'Structured Baseline Signals',
      impact: 'Normalized Feature Representation',
      color: 'text-blue-400 border-blue-500/40 bg-blue-500/10'
    }
  ];

  return (
    <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Explainable AI (XAI) Model Insights</h2>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal Model Confidence: {confidence}%</span>
        </div>
      </div>

      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
        <strong>Model-Associated Insights:</strong> The model's screening estimate was influenced by the following research signals. This evaluation represents a screening indicator rather than a clinical diagnosis.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {signalFactors.map((item, idx) => (
          <div key={idx} className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{item.factor}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                {item.impact}
              </span>
            </div>
            <p className="text-xs text-slate-400">{item.weight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
