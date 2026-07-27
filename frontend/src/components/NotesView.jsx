import React, { useState, useEffect } from 'react';
import { getConceptNotes, getLevelNotes } from '../api';

const NotesView = ({ conceptId, conceptName, levelData, onClose }) => {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('presentation'); // 'presentation' or 'grid'

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
          setError('Failed to generate AI presentation slides. Please try again.');
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12H4z" /></svg>
          </div>
          <h3 className="text-base font-bold text-white font-heading">Generating AI Presentation Slides & Visual Notes</h3>
          <p className="text-xs text-zinc-400 font-sans">
            Gemini 3.1 & Gemini 2.5 are creating a slide-by-slide visual presentation deck for <strong className="text-[#da6b38]">{titleText}</strong>...
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
          <h3 className="text-base font-bold text-white font-heading">Presentation Generation Unavailable</h3>
          <p className="text-xs text-zinc-400 font-sans">{error || 'Could not load presentation slides at this time.'}</p>
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
    <div className="fixed inset-0 z-50 bg-[#0c0d10]/95 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#13151a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Navigation Bar */}
        <div className="p-4 px-6 border-b border-zinc-800 flex justify-between items-center bg-[#0c0d10]/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#da6b38] flex items-center justify-center text-white font-bold text-base shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12H4z" /></svg>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#da6b38] font-bold">
                {levelData ? 'Level AI Presentation Deck' : 'Concept AI Presentation Deck'}
              </div>
              <h2 className="text-base font-extrabold text-white font-heading leading-tight">
                {notes.concept_name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-[#0c0d10] p-1 rounded-xl flex items-center border border-zinc-800 font-heading text-xs">
              <button
                onClick={() => setViewMode('presentation')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'presentation' ? 'bg-[#da6b38] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🖥️ Slideshow
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-[#da6b38] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                📊 Storyboard Grid
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 shadow-sm"
              title="Download or Save complete presentation deck as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Download Presentation PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors text-base"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slide Deck Main Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar print:p-0">
          {viewMode === 'presentation' ? (
            /* Widescreen Presentation Canvas Mode */
            <div className="space-y-4">
              <div className="bg-[#0c0d10] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 min-h-[420px] flex flex-col justify-between relative">
                {/* Top Slide Meta */}
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                  <span className="px-3 py-1 rounded-full bg-[#da6b38]/15 text-[#da6b38] border border-[#da6b38]/30 text-xs font-mono font-bold">
                    Slide {currentSlideIndex + 1} / {slides.length}
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-white font-heading">
                    {currentSlide.title}
                  </h3>
                </div>

                {/* 16:9 Presentation Visual Slide Image + Overlay Notes */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
                  {/* Generated AI Presentation Graphic */}
                  {currentSlide.image_url ? (
                    <div className="md:col-span-6 rounded-xl overflow-hidden border border-zinc-800 shadow-xl bg-black max-h-72">
                      <img 
                        src={currentSlide.image_url} 
                        alt={`Presentation Slide Graphic for ${currentSlide.title}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="md:col-span-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center text-zinc-500 font-mono text-xs">
                      [ Visual Slide Illustration ]
                    </div>
                  )}

                  {/* Structured Text Notes rendered on the Slide */}
                  <div className="md:col-span-6 space-y-4">
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
                      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1 font-mono">
                        <div className="text-[10px] uppercase font-bold text-[#da6b38]">Key Glossary Concept</div>
                        <div>{currentSlide.key_term}</div>
                      </div>
                    )}

                    {currentSlide.formula && (
                      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-cyan-300 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-zinc-400">Core Equation</div>
                        <div className="text-sm font-bold text-cyan-200">{currentSlide.formula}</div>
                      </div>
                    )}

                    {currentSlide.worked_code && (
                      <div className="p-3.5 rounded-xl bg-[#13151a] border border-zinc-800 font-mono text-xs text-emerald-400 space-y-1 leading-relaxed whitespace-pre-line">
                        <div className="text-[10px] uppercase font-bold text-emerald-500">Worked Solution Step</div>
                        <div>{currentSlide.worked_code}</div>
                      </div>
                    )}

                    {currentSlide.summary_tip && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1 font-mono">
                        <div className="text-[10px] uppercase font-bold text-amber-400">⚡ Presentation Summary Tip</div>
                        <div>{currentSlide.summary_tip}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Storyboard Slide Strip Timeline */}
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`shrink-0 w-44 rounded-xl border p-2.5 cursor-pointer transition-all ${
                      idx === currentSlideIndex 
                        ? 'bg-[#da6b38]/20 border-[#da6b38] shadow-md scale-102' 
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                      <span className="text-[#da6b38] font-bold">Slide {idx + 1}</span>
                      <span className="text-zinc-500">16:9</span>
                    </div>
                    {slide.image_url ? (
                      <div className="w-full h-16 rounded-md overflow-hidden bg-black mb-1.5 border border-zinc-800">
                        <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-16 rounded-md bg-zinc-950 mb-1.5 flex items-center justify-center text-[9px] text-zinc-600 font-mono">
                        Slide {idx + 1}
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-white truncate font-heading">{slide.title}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Storyboard Grid View (Shows all slides together like Canva presentation deck) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slides.map((slide, idx) => (
                <div key={idx} className="bg-[#0c0d10] rounded-xl border border-zinc-800 p-5 space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#da6b38]/15 text-[#da6b38] border border-[#da6b38]/30 text-[10px] font-mono font-bold">
                      Slide {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white font-heading">{slide.title}</h4>
                  </div>

                  {slide.image_url && (
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                      <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {slide.content_bullets && (
                    <ul className="space-y-1.5">
                      {slide.content_bullets.map((b, bIdx) => (
                        <li key={bIdx} className="text-xs text-zinc-300 flex items-start gap-2 font-sans">
                          <span className="w-1 h-1 rounded-full bg-[#da6b38] mt-1.5 shrink-0"></span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 px-6 border-t border-zinc-800 flex justify-between items-center bg-[#0c0d10]/60 print:hidden">
          <button
            disabled={currentSlideIndex === 0}
            onClick={() => setCurrentSlideIndex(prev => prev - 1)}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold font-heading disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            ← Previous Slide
          </button>

          <div className="text-xs font-mono text-zinc-400">
            {currentSlideIndex + 1} / {slides.length} Slides
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
