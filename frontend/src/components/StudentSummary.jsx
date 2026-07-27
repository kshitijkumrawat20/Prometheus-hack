import React, { useEffect, useState } from 'react';
import { getStudentSummary } from '../api';

const StudentSummary = ({ studentId, graphData, onBack }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await getStudentSummary(studentId);
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [studentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b0f19]/95 backdrop-blur-2xl flex items-center justify-center">
        <div className="animate-pulse text-indigo-400 font-mono flex items-center gap-3 text-sm">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Aggregating Mastery Metrics...
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b0f19]/95 backdrop-blur-2xl flex items-center justify-center">
        <div className="text-rose-400 font-mono text-sm">Failed to load student summary analytics.</div>
      </div>
    );
  }

  const masteryPct = Math.round((summary.average_mastery || 0) * 100);

  // Categorize nodes by stage
  const masteredConcepts = graphData?.nodes?.filter(n => n.stage === 'MASTERED' || n.mastery >= 0.85) || [];
  const practiceConcepts = graphData?.nodes?.filter(n => n.stage === 'INDEPENDENT_PRACTICE' || n.stage === 'GUIDED_PRACTICE') || [];
  const learningConcepts = graphData?.nodes?.filter(n => n.stage === 'LEARNING') || [];
  const unseenConcepts = graphData?.nodes?.filter(n => n.stage === 'UNSEEN') || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19]/95 backdrop-blur-3xl p-6 md:p-10 flex flex-col overflow-y-auto custom-scrollbar animate-fade-in">
      <div className="max-w-5xl w-full mx-auto space-y-8 my-auto">
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="text-text-muted hover:text-white flex items-center gap-2 transition-colors font-medium text-sm group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Return to Learning Graph
          </button>

          <span className="badge-glow-indigo px-3 py-1 rounded-full text-xs font-mono font-semibold">
            Analytics Overview
          </span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">
            Your Learning Journey
          </h1>
          <p className="text-text-secondary text-sm">
            Bayesian Knowledge Tracing & stage progression analytics for your active syllabus.
          </p>
        </div>
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 text-center space-y-1">
            <div className="text-4xl font-extrabold text-indigo-400 font-heading">{masteryPct}%</div>
            <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Average Mastery</div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 text-center space-y-1">
            <div className="text-4xl font-extrabold text-emerald-400 font-heading">{summary.mastered_count}</div>
            <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Mastered Concepts</div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 text-center space-y-1">
            <div className="text-4xl font-extrabold text-amber-400 font-heading">{practiceConcepts.length}</div>
            <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Active Practice</div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 text-center space-y-1">
            <div className="text-4xl font-extrabold text-slate-400 font-heading">{summary.total_concepts}</div>
            <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Total Concepts</div>
          </div>
        </div>
        
        {/* Concept Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mastered List */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              Mastered Concepts ({masteredConcepts.length})
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {masteredConcepts.length > 0 ? (
                masteredConcepts.map(c => (
                  <div key={c.id} className="text-sm text-white bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center font-medium">
                    <span>{c.name}</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold">{Math.round(c.mastery * 100)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-xs italic">Continue practice to master concepts!</p>
              )}
            </div>
          </div>
          
          {/* In-Progress List */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              Active Practice ({practiceConcepts.length})
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {practiceConcepts.length > 0 ? (
                practiceConcepts.map(c => (
                  <div key={c.id} className="text-sm text-white bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center font-medium">
                    <span>{c.name}</span>
                    <span className="text-amber-400 font-mono text-xs font-bold">{Math.round(c.mastery * 100)}% ({c.stage === 'GUIDED_PRACTICE' ? 'Guided' : 'Practice'})</span>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-xs italic">No concepts currently in practice.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Focus Areas */}
        {summary.weakest_concepts && summary.weakest_concepts.length > 0 && (
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <span className="text-rose-400">🎯</span> Target Focus Areas
            </h2>
            <div className="flex flex-wrap gap-3">
              {summary.weakest_concepts.map(id => {
                const node = graphData?.nodes?.find(n => n.id === id);
                return (
                  <div key={id} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-slate-200 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>{node?.name || id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSummary;
