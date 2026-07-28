import React, { useState, useEffect } from 'react';
import { getStudentSummary } from '../api';

const StreakHeaderBadge = ({ studentId, graphData }) => {
  const [stats, setStats] = useState({
    streak_days: 1,
    mastery_pct: 0,
    mastered_count: 0,
    total_concepts: 0,
    time_saved_hours: 0.0
  });

  useEffect(() => {
    if (!studentId) return;
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const res = await getStudentSummary(studentId);
        if (isMounted && res && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch streak stats:', err);
      }
    };
    fetchSummary();
    const interval = setInterval(fetchSummary, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [studentId, graphData]);

  if (!studentId) return null;

  return (
    <div className="flex items-center gap-1.5 md:gap-2 font-mono text-xs shrink-0 print-hidden">
      {/* Daily Study Streak Flame */}
      <div 
        className="glass-panel px-2.5 md:px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center gap-1 shadow-sm hover:border-amber-500/50 transition-all cursor-default group"
        title="Daily Learning Streak"
      >
        <span className="text-xs md:text-sm animate-pulse group-hover:scale-125 transition-transform">🔥</span>
        <span className="font-bold text-amber-200 text-[11px] md:text-xs">{stats.streak_days || 1}d Streak</span>
      </div>

      {/* Mastery Score Badge */}
      <div 
        className="glass-panel px-2.5 md:px-3 py-1.5 rounded-xl border border-[#da6b38]/30 bg-[#da6b38]/10 text-[#da6b38] flex items-center gap-1 shadow-sm hover:border-[#da6b38]/50 transition-all cursor-default"
        title="Overall Concept Mastery Level"
      >
        <span className="text-xs md:text-sm">🏆</span>
        <span className="font-bold text-white text-[11px] md:text-xs">{stats.mastery_pct || 0}%</span>
      </div>

      {/* Concepts Mastered Badge (Visible on wider desktops) */}
      <div 
        className="hidden 2xl:flex glass-panel px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 items-center gap-1.5 shadow-sm"
        title="Concepts Mastered vs Total"
      >
        <span className="text-sm">⚡</span>
        <span className="font-bold text-emerald-200 text-xs">{stats.mastered_count || 0}/{stats.total_concepts || 0}</span>
      </div>

      {/* Time Saved Badge (Visible on extra wide monitors) */}
      <div 
        className="hidden 2xl:flex glass-panel px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 items-center gap-1.5 shadow-sm"
        title="Estimated Study Hours Saved"
      >
        <span className="text-sm">⏱️</span>
        <span className="font-bold text-cyan-200 text-xs">{(stats.time_saved_hours || 0).toFixed(1)}h Saved</span>
      </div>
    </div>
  );
};

export default StreakHeaderBadge;
