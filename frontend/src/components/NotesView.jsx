import React, { useState, useEffect } from 'react';
import { getConceptNotes, getLevelNotes } from '../api';

const NotesView = ({ conceptId, conceptName, levelData, onClose }) => {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (levelData) {
          res = await getLevelNotes(levelData.levelName, levelData.conceptIds);
        } else if (conceptId) {
          res = await getConceptNotes(conceptId);
        }
        if (isMounted && res) {
          setNotes(res.data);
        }
      } catch (err) {
        console.error('Error loading notes:', err);
        if (isMounted) {
          setError('Failed to generate AI slide notes. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchNotes();
    return () => { isMounted = false; };
  }, [conceptId, levelData]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const titleText = levelData ? levelData.levelName : conceptName;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="bg-[#13151a] p-8 rounded-2xl border border-zinc-800 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-[#da6b38] flex items-center justify-center mx-auto text-white text-xl animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-base font-bold text-white font-heading">Generating AI Slide Notes & Diagrams</h3>
          <p className="text-xs text-zinc-400 font-sans">
            Gemini 3.1 & Gemini 2.5 are generating slide-by-slide study notes and visual diagrams for <strong className="text-[#da6b38]">{titleText}</strong>...
          </p>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#da6b38] h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !notes || !notes.slides) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-2xl flex items-center justify-center p-4">
        <div className="bg-[#13151a] p-8 rounded-2xl border border-zinc-800 max-w-md text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h3 className="text-base font-bold text-white font-heading">Notes Generation Unavailable</h3>
          <p className="text-xs text-zinc-400 font-sans">{error || 'Could not load notes at this time.'}</p>
          <button onClick={onClose} className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold font-heading">
            Close
          </button>
        </div>
      </div>
    );
  }

  const slides = notes.slides;
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#13151a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-zinc-800 flex justify-between items-center bg-[#0c0d10]/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold text-base shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#da6b38] font-bold">
                {levelData ? 'Level-by-Level AI Study Deck' : 'Concept AI Study Deck'}
              </div>
              <h2 className="text-base font-extrabold text-white font-heading leading-tight">
                {notes.concept_name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 shadow-sm"
              title="Download or Save as PDF Study Guide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Download Level PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors text-base"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slide Deck Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar print:p-0">
          <div className="bg-[#0c0d10] rounded-2xl p-6 md:p-8 border border-zinc-800 space-y-6 shadow-xl relative min-h-[380px] flex flex-col justify-between">
            {/* Top Slide Meta */}
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <span className="px-3 py-1 rounded-full bg-[#da6b38]/15 text-[#da6b38] border border-[#da6b38]/30 text-xs font-mono font-bold">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
              <h3 className="text-base md:text-lg font-bold text-white font-heading">
                {currentSlide.title}
              </h3>
            </div>

            {/* Slide Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className={`space-y-4 ${currentSlide.image_url ? 'md:col-span-7' : 'md:col-span-12'}`}>
                {currentSlide.content_bullets && (
                  <ul className="space-y-2.5">
                    {currentSlide.content_bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-300 leading-relaxed font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#da6b38] mt-2 shrink-0"></span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {currentSlide.key_term && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs md:text-sm text-zinc-300 space-y-1 font-mono">
                    <div className="text-[10px] uppercase font-bold text-[#da6b38]">Key Definition</div>
                    <div>{currentSlide.key_term}</div>
                  </div>
                )}

                {currentSlide.formula && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs md:text-sm text-cyan-300 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Core Equation / Formula</div>
                    <div className="text-base font-bold text-cyan-200">{currentSlide.formula}</div>
                  </div>
                )}

                {currentSlide.worked_code && (
                  <div className="p-4 rounded-xl bg-[#13151a] border border-zinc-800 font-mono text-xs text-emerald-400 space-y-1 leading-relaxed whitespace-pre-line">
                    <div className="text-[10px] uppercase font-bold text-emerald-500">Worked Problem Derivation</div>
                    <div>{currentSlide.worked_code}</div>
                  </div>
                )}

                {currentSlide.summary_tip && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs md:text-sm text-amber-200 space-y-1 font-mono">
                    <div className="text-[10px] uppercase font-bold text-amber-400">⚡ Master Cheat Sheet Strategy</div>
                    <div>{currentSlide.summary_tip}</div>
                  </div>
                )}
              </div>

              {/* Gemini 3.1 Flash Lite Generated Visual AI Diagram */}
              {currentSlide.image_url && (
                <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
                  <div className="w-full rounded-xl overflow-hidden border border-zinc-800 shadow-lg max-h-56 bg-[#0c0d10]">
                    <img 
                      src={currentSlide.image_url} 
                      alt={`Diagram for ${currentSlide.title}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    🎨 Gemini 3.1 Flash Lite Visual Illustration
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 px-6 border-t border-zinc-800 flex justify-between items-center bg-[#0c0d10]/60 print:hidden">
          <button
            disabled={currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex(prev => prev - 1)}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold font-heading disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            ← Previous Slide
          </button>

          {/* Slide Dots */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentSlideIndex 
                    ? 'bg-[#da6b38] w-6' 
                    : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentSlideIndex === slides.length - 1}
            onClick={() => setCurrentSlideIndex(prev => prev + 1)}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-bold font-heading disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            Next Slide →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesView;
