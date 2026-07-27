import React, { useState } from 'react';
import GraphView from '../components/GraphView';
import RoadmapListView from '../components/RoadmapListView';
import NotesView from '../components/NotesView';

const RoadmapPage = ({ graphData, activeNodeId, onNodeClick, onStartConceptSession }) => {
  const [displayMode, setDisplayMode] = useState('list'); // 'list' or 'graph'
  const [notesConcept, setNotesConcept] = useState(null); // { id, name } for Concept Notes Modal
  const [levelNotesData, setLevelNotesData] = useState(null); // { levelName, conceptIds } for Level Notes Modal

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-page-in">
        <div className="bg-[#13151a] p-8 rounded-2xl border border-zinc-800 max-w-md space-y-4">
          <div className="text-4xl">📚</div>
          <h2 className="text-xl font-bold text-white font-heading">No Active Course Syllabus</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Please upload a course syllabus or select an example from the library to generate your knowledge map.
          </p>
        </div>
      </div>
    );
  }

  const activeNode = graphData.nodes.find(n => n.id === activeNodeId);

  const handleGenerateLevelNotes = (levelName, conceptIds) => {
    setNotesConcept(null);
    setLevelNotesData({ levelName, conceptIds });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 space-y-4 animate-page-in relative">
      {/* Top Controls & Sub-View Switcher */}
      <div className="flex justify-between items-center bg-[#13151a] p-4 rounded-2xl border border-zinc-800 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white font-heading">Course Structure & Roadmap</h2>
          <p className="text-xs text-zinc-400">
            {graphData.nodes.length} Concepts • Prerequisite Topological Hierarchy
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sub-view Switcher */}
          <div className="bg-[#0c0d10] p-1 rounded-xl flex items-center border border-zinc-800 font-heading text-xs">
            <button
              onClick={() => setDisplayMode('list')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                displayMode === 'list' 
                  ? 'bg-[#da6b38] text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📋</span> Sequential Roadmap List
            </button>
            <button
              onClick={() => setDisplayMode('graph')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                displayMode === 'graph' 
                  ? 'bg-[#da6b38] text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🗺️</span> Interactive Mind Map Canvas
            </button>
          </div>

          {activeNode && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setLevelNotesData(null); setNotesConcept({ id: activeNode.id, name: activeNode.name }); }}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5"
                title="Generate slide-by-slide AI study notes deck for active concept"
              >
                <svg className="w-3.5 h-3.5 text-[#da6b38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Concept AI Notes</span>
              </button>

              <button
                onClick={() => onStartConceptSession(activeNode.id)}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2"
              >
                <span>Focus Session: {activeNode.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Container */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden shadow-2xl relative">
        {displayMode === 'list' ? (
          <RoadmapListView 
            graphData={graphData} 
            onNodeClick={onNodeClick} 
            activeNodeId={activeNodeId} 
            onGenerateLevelNotes={handleGenerateLevelNotes}
          />
        ) : (
          <GraphView 
            graphData={graphData} 
            onNodeClick={onNodeClick} 
            activeNodeId={activeNodeId} 
          />
        )}
      </div>

      {/* Slide Deck AI Notes Modal (Concept or Level) */}
      {(notesConcept || levelNotesData) && (
        <NotesView
          conceptId={notesConcept?.id}
          conceptName={notesConcept?.name}
          levelData={levelNotesData}
          onClose={() => { setNotesConcept(null); setLevelNotesData(null); }}
        />
      )}
    </div>
  );
};

export default RoadmapPage;
