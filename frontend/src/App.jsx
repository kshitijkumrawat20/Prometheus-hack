import React, { useState, useCallback, useEffect } from 'react';
import LaunchPage from './pages/LaunchPage';
import SyllabusUpload from './components/SyllabusUpload';
import RoadmapPage from './pages/RoadmapPage';
import TutorPage from './pages/TutorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuthModal from './components/AuthModal';
import { uploadSyllabus, getGraph, getNextAction, getMe, logoutUser } from './api';

function transformGraphData(apiData) {
  if (!apiData || !apiData.concepts || apiData.concepts.length === 0) {
    return null;
  }

  const mastery = apiData.mastery || {};
  const stages = apiData.stages || {};
  const edges = apiData.edges || [];

  const prereqs = {};
  apiData.concepts.forEach(c => { prereqs[c.id] = []; });
  edges.forEach(e => {
    if (prereqs[e.target]) {
      prereqs[e.target].push(e.source);
    }
  });

  const MASTERY_THRESHOLD = 0.6;

  const nodes = apiData.concepts.map(c => {
    const m = mastery[c.id] ?? 0.3;
    const stage = stages[c.id] || 'UNSEEN';
    const isLocked = (prereqs[c.id] || []).some(
      pid => (mastery[pid] ?? 0) < MASTERY_THRESHOLD
    );
    return {
      id: c.id,
      name: c.label,
      description: c.description || '',
      mastery: m,
      stage: stage,
      status: isLocked ? 'locked' : 'unlocked',
    };
  });

  const links = edges.map(e => ({
    source: e.source,
    target: e.target,
  }));

  return { nodes, links };
}

function App() {
  const [activeTab, setActiveTab] = useState('launch'); // 'launch', 'upload', 'roadmap', 'tutor', 'analytics'
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [graphData, setGraphData] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  // Student ID derived from session or null
  const studentId = user ? user.user_id : null;

  // Restore session on startup
  useEffect(() => {
    const stored = localStorage.getItem('masterymap_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        getMe().then(res => setUser(res.data)).catch(() => {
          localStorage.removeItem('masterymap_user');
          localStorage.removeItem('masterymap_token');
          setUser(null);
        });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!studentId) return;
    try {
      const [graphRes, actionRes] = await Promise.all([
        getGraph(studentId),
        getNextAction(studentId),
      ]);

      const transformed = transformGraphData(graphRes.data);
      setGraphData(transformed);

      const actionData = actionRes.data;
      if (actionData.complete) {
        setCurrentAction(null);
        setIsComplete(true);
        setActiveNodeId(null);
      } else {
        setCurrentAction(actionData);
        setActiveNodeId(actionData.concept_id);
        setIsComplete(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && activeTab !== 'launch' && activeTab !== 'upload') {
      refreshData();
    }
  }, [studentId, activeTab, refreshData]);

  // Auth Guard Handler
  const handleProtectedAction = (targetTab) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setActiveTab(targetTab);
  };

  const handleUpload = async (text) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      await uploadSyllabus(text, user.user_id);
      await refreshData();
      setActiveTab('roadmap');
    } catch (error) {
      console.error('Failed to upload syllabus:', error);
      alert('Failed to process syllabus. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = async () => {
    await refreshData();
  };

  const handleNodeClick = (node) => {
    setActiveNodeId(node.id);
  };

  const handleStartConceptSession = (conceptId) => {
    setActiveNodeId(conceptId);
    handleProtectedAction('tutor');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('masterymap_user');
    localStorage.removeItem('masterymap_token');
    setUser(null);
    setActiveTab('launch');
  };

  // Dedicated Launch Page View
  if (activeTab === 'launch') {
    return (
      <>
        <LaunchPage 
          user={user}
          onLaunchApp={() => handleProtectedAction('upload')} 
          onTryDemo={() => handleProtectedAction('upload')} 
        />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onAuthSuccess={(u) => {
            setUser(u);
            setActiveTab('upload');
          }} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0c0d10] text-zinc-100 flex flex-col p-3 md:p-5 gap-4 relative font-sans overflow-y-auto custom-scrollbar">
      {/* Top Application Navigation Bar */}
      <header className="flex justify-between items-center z-20 gap-3 glass-panel p-3 px-4 md:px-5 rounded-2xl border border-zinc-800 shadow-xl flex-wrap md:flex-nowrap shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('launch')}>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#da6b38]/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight font-heading leading-none">
              MasteryMap
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Adaptive Learning System</span>
          </div>
        </div>

        {/* Multi-Page Navigation Tabs */}
        <nav className="flex items-center gap-1 glass-panel p-1 rounded-xl border border-zinc-800 font-heading text-xs shrink-0">
          <button
            onClick={() => setActiveTab('launch')}
            className="px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg font-bold transition-all text-zinc-400 hover:text-white flex items-center gap-1.5"
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => handleProtectedAction('upload')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'upload' 
                ? 'bg-[#da6b38] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Syllabus Library</span>
          </button>

          <button
            onClick={() => handleProtectedAction('roadmap')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap' 
                ? 'bg-[#da6b38] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Course Roadmap</span>
            {!user && <span className="text-[10px]">🔒</span>}
          </button>

          <button
            onClick={() => handleProtectedAction('tutor')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'tutor' 
                ? 'bg-[#da6b38] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>AI Tutor Session</span>
            {!user && <span className="text-[10px]">🔒</span>}
            {currentAction && !isComplete && user && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1"></span>
            )}
          </button>

          <button
            onClick={() => handleProtectedAction('analytics')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics' 
                ? 'bg-[#da6b38] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Analytics</span>
            {!user && <span className="text-[10px]">🔒</span>}
          </button>
        </nav>

        {/* User Profile Button */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="glass-panel px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="text-xs font-bold text-white font-mono max-w-[130px] md:max-w-[170px] truncate" title={user.username}>
                {user.username}
              </span>
              <button 
                onClick={handleLogout}
                className="text-[11px] text-zinc-400 hover:text-rose-400 font-medium ml-1 transition-colors shrink-0"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="btn-primary px-3.5 py-1.5 md:py-2 rounded-xl text-xs font-bold font-heading shadow-md flex items-center gap-1.5"
            >
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(u) => {
          setUser(u);
        }} 
      />

      {/* Main Page Workspace */}
      <main className={`flex-1 flex flex-col relative z-0 ${
        activeTab === 'upload' || activeTab === 'analytics' 
          ? 'min-h-0' 
          : 'h-[calc(100vh-100px)] min-h-[580px]'
      }`}>
        {activeTab === 'upload' && (
          <SyllabusUpload onUpload={handleUpload} isLoading={isLoading} />
        )}

        {activeTab === 'roadmap' && user && (
          <RoadmapPage 
            graphData={graphData}
            activeNodeId={activeNodeId}
            onNodeClick={handleNodeClick}
            onStartConceptSession={handleStartConceptSession}
          />
        )}

        {activeTab === 'tutor' && user && (
          <TutorPage 
            currentAction={currentAction}
            studentId={studentId}
            isComplete={isComplete}
            onActionComplete={handleActionComplete}
            onNavigateToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'analytics' && user && (
          <AnalyticsPage 
            studentId={studentId}
            graphData={graphData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
