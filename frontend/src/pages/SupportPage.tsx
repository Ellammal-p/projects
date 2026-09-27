import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Wind,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  LifeBuoy,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [showSosModal, setShowSosModal] = useState(false);

  // 4-7-8 Breathing Exercise State
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    let timer: any = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 1) return prev - 1;
          // Switch phase
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            return 4;
          }
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [breathingActive, phase]);

  const resetBreathing = () => {
    setBreathingActive(false);
    setPhase('Inhale');
    setTimeLeft(4);
  };

  const getPhaseColor = () => {
    if (phase === 'Inhale') return 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10';
    if (phase === 'Hold') return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#172033] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Wellness Support & Crisis Guidance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Mental Wellness Support Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Guided relaxation exercises, grounding techniques, and 24/7 crisis support lines.
          </p>
        </div>
        <button
          onClick={() => setShowSosModal(true)}
          className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5 animate-bounce"
        >
          <PhoneCall className="w-4 h-4" />
          <span>SOS Crisis Hotlines</span>
        </button>
      </div>

      {/* 4-7-8 Breathing Exercise Section */}
      <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            <span>Guided 4-7-8 Breathing Technique</span>
          </h2>
          <span className="text-xs text-slate-400">Inhale 4s • Hold 7s • Exhale 8s</span>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div
            className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 shadow-2xl ${getPhaseColor()}`}
          >
            <span className="text-xs uppercase font-bold tracking-widest text-slate-300">{phase}</span>
            <span className="text-5xl font-extrabold my-1">{timeLeft}s</span>
            <span className="text-[10px] text-slate-400">
              {phase === 'Inhale' ? 'Breathe In Deeply' : phase === 'Hold' ? 'Hold Breath Calmly' : 'Slow Exhale'}
            </span>
          </div>

          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition"
            >
              {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{breathingActive ? 'Pause Exercise' : 'Start Breathing'}</span>
            </button>
            <button
              onClick={resetBreathing}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-4-3-2-1 Grounding Technique */}
      <div className="bg-[#172033] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>5-4-3-2-1 Grounding Technique for Anxiety</span>
        </h2>
        <p className="text-xs text-slate-400">
          When feeling overwhelmed, use your 5 senses to reconnect with your immediate surroundings:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {[
            { num: '5', text: 'Things you can SEE around you' },
            { num: '4', text: 'Things you can TOUCH or feel' },
            { num: '3', text: 'Things you can HEAR right now' },
            { num: '2', text: 'Things you can SMELL' },
            { num: '1', text: 'Thing you can TASTE' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl text-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-extrabold text-sm mx-auto flex items-center justify-center mb-2">
                {item.num}
              </div>
              <p className="text-xs text-slate-300 font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency SOS Crisis Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#172033] border border-rose-500/50 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/20 rounded-xl border border-rose-500/40">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Emergency Crisis Support</h3>
                <p className="text-xs text-rose-300">24/7 National Mental Health Helplines</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you or someone you know is in immediate danger or experiencing a life-threatening crisis, please reach out directly to emergency services or helplines:
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Tele-MANAS (Govt of India Helpline)', number: '14416 / 1800-891-4416' },
                { name: 'KIRAN National Mental Health Line', number: '1800-599-0019' },
                { name: 'Vandrevala Foundation Helpline', number: '9999 666 555' },
                { name: 'AASRA Suicide Helpline', number: '+91 9820466726' },
                { name: 'National Emergency Services', number: '112' }
              ].map((h, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{h.name}</span>
                  <a
                    href={`tel:${h.number}`}
                    className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800"
                  >
                    {h.number}
                  </a>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-[11px] text-amber-300 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                MindWell AI is an educational screening system. In urgent situations, please contact local medical or crisis professionals immediately.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
