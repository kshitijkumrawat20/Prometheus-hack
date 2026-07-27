import React from 'react';

const RoadmapListView = ({ graphData, onNodeClick, activeNodeId, onGenerateLevelNotes }) => {
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0c0d10] rounded-2xl border border-zinc-800 p-8">
        <div className="animate-pulse text-zinc-400 font-mono text-xs">Loading roadmap modules...</div>
      </div>
    );
  }

  // Build prerequisites lookup
  const prereqs = {};
  graphData.nodes.forEach(n => { prereqs[n.id] = []; });
  graphData.links.forEach(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    if (prereqs[targetId]) {
      prereqs[targetId].push(sourceId);
    }
  });

  // Calculate topological levels for ordered sequential display
  const levelMap = {};
  const getLevel = (id, visited = new Set()) => {
    if (levelMap[id] !== undefined) return levelMap[id];
    if (visited.has(id)) return 0;
    visited.add(id);
    const parents = prereqs[id] || [];
    if (parents.length === 0) {
      levelMap[id] = 0;
      return 0;
    }
    const maxParentLevel = Math.max(...parents.map(p => getLevel(p, new Set(visited))));
    levelMap[id] = maxParentLevel + 1;
    return levelMap[id];
  };

  graphData.nodes.forEach(n => getLevel(n.id));

  // Sort nodes sequentially by level, then by name
  const sortedNodes = [...graphData.nodes].sort((a, b) => {
    const lvlA = levelMap[a.id] || 0;
    const lvlB = levelMap[b.id] || 0;
    if (lvlA !== lvlB) return lvlA - lvlB;
    return a.name.localeCompare(b.name);
  });

  // Group nodes by level
  const maxLevel = Math.max(...Object.values(levelMap), 0);
  const levels = Array.from({ length: maxLevel + 1 }, (_, i) => i);

  const getStageBadge = (stage, mastery) => {
    if (stage === 'MASTERED' || mastery >= 0.85) {
      return <span className="badge-stage-mastered px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">Mastered</span>;
    }
    if (stage === 'INDEPENDENT_PRACTICE') {
      return <span className="badge-stage-practice px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold font-heading">Independent Practice</span>;
    }
    if (stage === 'GUIDED_PRACTICE') {
      return <span className="badge-stage-guided px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">Guided Practice</span>;
    }
    if (stage === 'LEARNING') {
      return <span className="badge-stage-learning px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">Micro-Lesson</span>;
    }
    return <span className="badge-stage-unseen px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium">Unseen</span>;
  };

  return (
    <div className="w-full h-full bg-[#0c0d10] rounded-2xl overflow-y-auto custom-scrollbar border border-zinc-800 p-6 space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white font-heading">Sequential Learning Roadmap</h2>
          <p className="text-xs text-zinc-400">Master concepts step-by-step in order of prerequisites</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          {sortedNodes.length} Concepts Total
        </span>
      </div>

      {/* Grouped Modules */}
      <div className="space-y-6">
        {levels.map((lvl) => {
          const levelNodes = sortedNodes.filter(n => (levelMap[n.id] || 0) === lvl);
          if (levelNodes.length === 0) return null;

          const levelTitle = lvl === 0 ? "LEVEL 1: FOUNDATIONS & PREREQUISITES" : (lvl === 1 ? "LEVEL 2: CORE CONCEPTS" : (lvl === 2 ? "LEVEL 3: INTERMEDIATE TOPICS" : `LEVEL ${lvl + 1}: ADVANCED TOPICS`));

          return (
            <div key={lvl} className="space-y-3">
              {/* Level Header with Generate Level Notes PDF Action */}
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#da6b38]/20 border border-[#da6b38]/40 flex items-center justify-center text-[#da6b38] font-mono text-xs font-bold">
                    {lvl + 1}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    {levelTitle}
                  </h3>
                </div>

                {/* Level Notes Generation Button */}
                {onGenerateLevelNotes && (
                  <button
                    onClick={() => onGenerateLevelNotes(levelTitle, levelNodes.map(n => n.id))}
                    className="btn-secondary px-3 py-1 rounded-lg text-[11px] font-bold font-mono text-zinc-300 flex items-center gap-1.5 hover:border-[#da6b38]/50 hover:text-white transition-all shadow-sm"
                    title={`Generate slide-by-slide AI study notes deck for ${levelTitle} with PDF export`}
                  >
                    <svg className="w-3.5 h-3.5 text-[#da6b38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span>Generate Level Notes (PDF)</span>
                  </button>
                )}
              </div>

              {/* Concept Cards in Level */}
              <div className="grid grid-cols-1 gap-3 pl-1">
                {levelNodes.map((node, index) => {
                  const isActive = node.id === activeNodeId;
                  const isLocked = node.status === 'locked';
                  const parentNames = (prereqs[node.id] || []).map(pid => {
                    const pNode = graphData.nodes.find(n => n.id === pid);
                    return pNode ? pNode.name : pid;
                  });

                  return (
                    <div
                      key={node.id}
                      onClick={() => onNodeClick(node)}
                      className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-[#da6b38]/15 border-[#da6b38]/60 shadow-lg shadow-[#da6b38]/10 translate-x-1' 
                          : (isLocked 
                              ? 'bg-zinc-950/40 border-zinc-900 opacity-60 hover:opacity-80' 
                              : 'bg-[#13151a] border-zinc-800 hover:border-zinc-700 hover:bg-[#181b22]')
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono mt-0.5 ${
                            isActive ? 'bg-[#da6b38] text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {isLocked ? '🔒' : index + 1}
                          </div>

                          <div>
                            <h4 className={`text-sm font-bold font-heading transition-colors ${
                              isActive ? 'text-[#da6b38]' : 'text-white group-hover:text-zinc-200'
                            }`}>
                              {node.name}
                            </h4>
                            
                            {node.description && (
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {node.description}
                              </p>
                            )}

                            {parentNames.length > 0 && (
                              <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                                <span className="font-semibold text-zinc-400">Prerequisites:</span>
                                <span className="text-zinc-300">{parentNames.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {getStageBadge(node.stage, node.mastery)}
                          <span className="text-[11px] font-mono text-zinc-400">
                            Mastery: <strong className="text-emerald-400">{Math.round((node.mastery || 0) * 100)}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapListView;
