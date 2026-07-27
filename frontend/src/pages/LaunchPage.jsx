import React from 'react';

const LaunchPage = ({ onLaunchApp, onTryDemo, user }) => {
  return (
    <div className="w-full min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col items-center justify-between relative overflow-hidden font-sans">
      {/* Subtle Dark Radial Background */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#da6b38]/10 blur-[180px] pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLaunchApp}>
          <div className="w-9 h-9 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#da6b38]/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-heading leading-none">
              MasteryMap
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Adaptive Learning System</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onTryDemo}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors font-heading hidden sm:block"
          >
            Syllabus Library
          </button>

          {user ? (
            <button
              onClick={onLaunchApp}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold font-heading flex items-center gap-2"
            >
              <span>Go to Workspace</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          ) : (
            <button
              onClick={onLaunchApp}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold font-heading flex items-center gap-2"
            >
              <span>Sign In to Access</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-16 md:py-24 text-center z-10 space-y-8 animate-page-in">
        {/* Sleek Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#da6b38]"></span>
          Adaptive Bayesian Knowledge Engine
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight font-heading leading-[1.12]">
          Master Complex Syllabi with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e07a49] via-amber-200 to-zinc-100">
            Structured Concept Roadmaps
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Upload any course syllabus. MasteryMap parses prerequisite dependencies, delivers 5-stage micro-lessons, tracks probabilistic mastery, and generates slide-by-slide study decks with PDF exports.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto btn-primary px-8 py-4 rounded-xl text-sm font-bold font-heading flex items-center justify-center gap-3 transition-transform hover:scale-102"
          >
            <span>{user ? 'Open Workspace' : 'Sign In / Register to Start'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto btn-secondary px-8 py-4 rounded-xl text-sm font-bold font-heading flex items-center justify-center gap-2"
          >
            <span>View Demo Courses</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-zinc-400 pt-6">
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-zinc-300 font-mono text-[11px]">
            <svg className="w-4 h-4 text-[#da6b38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Bayesian Knowledge Tracing
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-zinc-300 font-mono text-[11px]">
            <svg className="w-4 h-4 text-[#da6b38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            5-Stage Micro-Lesson Engine
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel text-zinc-300 font-mono text-[11px]">
            <svg className="w-4 h-4 text-[#da6b38]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            AI Slide Notes & PDF Export
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-6xl px-6 py-16 z-10 space-y-12 border-t border-zinc-800/60">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
            System Architecture & Flow
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 max-w-xl mx-auto">
            Automated concept extraction and adaptive learning pathway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3 relative group">
            <div className="text-xs font-mono font-bold text-[#da6b38]">01 / INPUT</div>
            <h3 className="text-base font-bold text-white font-heading">Syllabus Parsing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Extracts topic hierarchies and prerequisite dependencies from raw text outlines.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3 relative group">
            <div className="text-xs font-mono font-bold text-[#da6b38]">02 / GRAPH</div>
            <h3 className="text-base font-bold text-white font-heading">Concept DAG</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generates horizontal sequential mind maps and topological prerequisite tiers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3 relative group">
            <div className="text-xs font-mono font-bold text-[#da6b38]">03 / ADAPTIVE</div>
            <h3 className="text-base font-bold text-white font-heading">5-Stage Tutoring</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamically presents micro-lessons, guided practice, and misconception re-teaching.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-800 space-y-3 relative group">
            <div className="text-xs font-mono font-bold text-[#da6b38]">04 / STUDY</div>
            <h3 className="text-base font-bold text-white font-heading">Notes & PDF Export</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizes slide-by-slide study decks with visual diagrams and downloadable PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500 z-10 font-mono">
        MasteryMap Executive Learning Platform
      </footer>
    </div>
  );
};

export default LaunchPage;
