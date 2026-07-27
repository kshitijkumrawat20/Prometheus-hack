import React, { useState } from 'react';
import { advanceLessonStage } from '../api';

const LessonPanel = ({ conceptLabel, conceptId, lesson, studentId, onLessonComplete }) => {
  const [loading, setLoading] = useState(false);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 glass-panel rounded-3xl border border-white/10">
        <div className="animate-spin h-8 w-8 text-indigo-400 border-4 border-indigo-400 border-t-transparent rounded-full mb-4"></div>
        <div className="text-text-muted font-mono text-sm">Synthesizing micro-lesson for {conceptLabel}...</div>
      </div>
    );
  }

  const handleStartPractice = async () => {
    setLoading(true);
    try {
      await advanceLessonStage(conceptId, studentId);
      onLessonComplete();
    } catch (error) {
      console.error('Failed to advance stage:', error);
      onLessonComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-surface-light/30">
        <div className="flex justify-between items-center mb-3">
          <span className="badge-glow-cyan px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>📖</span> Micro-Lesson Stage
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10 font-heading">
            {conceptLabel}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
          Understanding {conceptLabel}
        </h2>
      </div>

      {/* Lesson Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar">
        {/* Core Intuition Card */}
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            <span>💡</span> Core Intuition
          </div>
          <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {lesson.explanation}
          </p>
        </div>

        {/* Worked Example */}
        {lesson.worked_example && (
          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                <span>📝</span> Step-by-Step Worked Example
              </span>
              <span className="text-[10px] font-mono text-text-muted bg-white/5 px-2 py-0.5 rounded">Scaffold</span>
            </div>
            <div className="text-slate-200 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed bg-[#080b13] p-4 rounded-xl border border-white/10 shadow-inner select-text">
              {lesson.worked_example}
            </div>
          </div>
        )}

        {/* Mental Model Analogy */}
        {lesson.analogy && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              <span>🧠</span> Mental Model
            </div>
            <p className="text-amber-100/90 text-xs italic leading-relaxed">
              "{lesson.analogy}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-white/10 bg-surface/50">
        <button
          onClick={handleStartPractice}
          disabled={loading}
          className="w-full py-4 btn-primary rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 font-heading"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              Unlocking Scaffolded Practice...
            </span>
          ) : (
            <>
              <span>Got it, let's practice</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonPanel;
