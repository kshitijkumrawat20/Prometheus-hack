import React, { useEffect, useState } from 'react';
import { getStudentSummary } from '../api';

const AnalyticsPage = ({ studentId, graphData }) => {
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
      <div className="flex-1 flex items-center justify-center p-12 animate-page-in">
        <div className="animate-pulse text-indigo-400 font-mono text-sm flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Compiling Student Mastery Analytics...
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-rose-400 font-mono text-sm">
        Failed to load student analytics.
      </div>
    );
  }

  const masteryPct = Math.round((summary.average_mastery || 0) * 100);
  const masteredConcepts = graphData?.nodes?.filter(n => n.stage === 'MASTERED' || n.mastery >= 0.85) || [];
  const practiceConcepts = graphData?.nodes?.filter(n => n.stage === 'INDEPENDENT_PRACTICE' || n.stage === 'GUIDED_PRACTICE') || [];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 space-y-6 overflow-y-auto custom-scrollbar pr-1 animate-page-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading">Student Mastery Dashboard</h2>
          <p className="text-xs text-text-muted">Bayesian Knowledge Tracing & stage progression metrics</p>
        </div>
        <span className="badge-glow-emerald px-4 py-1.5 rounded-full text-xs font-mono font-bold">
          BKT Model Active
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-1">
          <div className="text-4xl font-extrabold text-indigo-400 font-heading">{masteryPct}%</div>
          <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Average Mastery</div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-1">
          <div className="text-4xl font-extrabold text-emerald-400 font-heading">{summary.mastered_count}</div>
          <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Mastered Concepts</div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-1">
          <div className="text-4xl font-extrabold text-amber-400 font-heading">{practiceConcepts.length}</div>
          <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Active Practice</div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-1">
          <div className="text-4xl font-extrabold text-slate-400 font-heading">{summary.total_concepts}</div>
          <div className="text-text-muted text-xs font-medium uppercase tracking-wider font-mono">Total Concepts</div>
        </div>
      </div>

      {/* Concept Stage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            Mastered Concepts ({masteredConcepts.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {masteredConcepts.length > 0 ? (
              masteredConcepts.map(c => (
                <div key={c.id} className="text-sm text-white bg-white/5 rounded-xl p-3.5 border border-white/5 flex justify-between items-center font-medium">
                  <span>{c.name}</span>
                  <span className="text-emerald-400 font-mono text-xs font-bold">{Math.round(c.mastery * 100)}%</span>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-xs italic">Complete practice sessions to master concepts.</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            Active Practice ({practiceConcepts.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {practiceConcepts.length > 0 ? (
              practiceConcepts.map(c => (
                <div key={c.id} className="text-sm text-white bg-white/5 rounded-xl p-3.5 border border-white/5 flex justify-between items-center font-medium">
                  <span>{c.name}</span>
                  <span className="text-amber-400 font-mono text-xs assessment-badge">{Math.round(c.mastery * 100)}% ({c.stage})</span>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-xs italic">No concepts currently in active practice.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
