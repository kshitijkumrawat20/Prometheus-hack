import React from 'react';

const MasteryBar = ({ graphData }) => {
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="w-full glass-panel rounded-xl p-3 flex items-center justify-between">
        <div className="text-xs text-text-muted animate-pulse">Initializing Knowledge Graph Metrics...</div>
      </div>
    );
  }

  const totalConcepts = graphData.nodes.length;
  const masteredCount = graphData.nodes.filter(n => n.stage === 'MASTERED' || (n.mastery || 0) >= 0.85).length;
  const practiceCount = graphData.nodes.filter(n => n.stage === 'INDEPENDENT_PRACTICE').length;
  const guidedCount = graphData.nodes.filter(n => n.stage === 'GUIDED_PRACTICE').length;
  const learningCount = graphData.nodes.filter(n => n.stage === 'LEARNING').length;
  
  const percentage = totalConcepts > 0 ? (masteredCount / totalConcepts) * 100 : 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-3.5 px-5 flex items-center gap-6 border border-white/10 shadow-xl">
      {/* Overview Stat */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3" className="text-white/10" fill="transparent" />
            <circle
              cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="3"
              className="text-emerald-400 transition-all duration-1000 ease-out"
              strokeDasharray={113}
              strokeDashoffset={113 - (113 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className="absolute text-[11px] font-bold font-mono text-white">{Math.round(percentage)}%</span>
        </div>
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-heading">Overall Mastery</h2>
          <div className="text-[11px] text-text-muted mt-0.5">
            <span className="text-emerald-400 font-bold">{masteredCount}</span> of {totalConcepts} Concepts Mastered
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="flex-1 hidden md:flex flex-col justify-center gap-1.5">
        <div className="flex justify-between text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Mastered ({masteredCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Practice ({practiceCount + guidedCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Learning ({learningCount})
          </span>
        </div>

        <div className="w-full h-2.5 bg-surface-lighter rounded-full overflow-hidden p-0.5 border border-white/5 flex gap-0.5">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${(masteredCount / totalConcepts) * 100}%` }}
          />
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${((practiceCount + guidedCount) / totalConcepts) * 100}%` }}
          />
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${(learningCount / totalConcepts) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MasteryBar;
