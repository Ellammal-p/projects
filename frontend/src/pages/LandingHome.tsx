import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  BookOpen,
  Cpu,
  BarChart3,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Activity
} from 'lucide-react';

export const LandingHome: React.FC = () => {
  const featureCards = [
    {
      title: 'Depression Screening',
      icon: ClipboardCheck,
      color: 'from-blue-500 to-cyan-400',
      description: 'Standardized 9-question PHQ-9 survey evaluating symptom severity bands from minimal to severe.'
    },
    {
      title: 'Mood Tracking',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-400',
      description: 'Interactive daily mood tracking (1 to 5 scale) with dynamic 7-day and 30-day temporal trend charts.'
    },
    {
      title: 'Journal Analysis',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-400',
      description: 'Private reflection journal powered by fine-tuned BERT NLP transformers for contextual representation.'
    },
    {
      title: 'AI Insights',
      icon: Cpu,
      color: 'from-cyan-500 to-blue-600',
      description: 'Multimodal Deep Learning fusion combining structured features, temporal mood, and NLP text embeddings.'
    },
    {
      title: 'Wellness Dashboard',
      icon: BarChart3,
      color: 'from-amber-500 to-orange-400',
      description: 'Comprehensive health dashboard visualizing longitudinal patterns, score indicators, and recent entries.'
    },
    {
      title: 'Support Resources',
      icon: HeartHandshake,
      color: 'from-rose-500 to-pink-400',
      description: 'Guided 4-7-8 breathing exercises, 5-4-3-2-1 grounding techniques, and 24/7 SOS crisis hotline assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 flex flex-col justify-between">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 border-b border-slate-800/80">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI-POWERED MENTAL WELLNESS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            MindWell <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl font-semibold text-slate-300 max-w-3xl mx-auto mb-6 tracking-wide">
            AI-Based Depression Risk Analysis & Mental Wellness Support
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Understand your wellness patterns through AI-powered assessment, mood tracking, journal insights, and personalized mental-wellness support.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/screening"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold px-8 py-3.5 rounded-xl border border-slate-700 transition"
            >
              <span>Explore MindWell AI</span>
            </Link>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center justify-center space-x-2 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Educational Screening Tool:</strong> MindWell AI provides model-associated insights for screening and research. It is not a clinical diagnosis.
            </span>
          </div>

        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="py-20 bg-[#172033]/60 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Multimodal Wellness Platform Features
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Combining standardized PHQ-9 metrics, sequential temporal mood tracking, and NLP transformer journal embeddings into a single system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111827] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} p-2.5 text-white shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
