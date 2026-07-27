import React, { useState } from 'react';
import { submitAnswer } from '../api';

const QuestionPanel = ({ question, studentId, onAnswerSubmit, isComplete }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 glass-panel rounded-3xl border border-white/10 space-y-4">
        <div className="text-6xl mb-2 animate-bounce">🎉</div>
        <h3 className="text-3xl font-extrabold text-white font-heading">Course Mastered!</h3>
        <p className="text-text-secondary text-base max-w-sm">
          You have successfully conquered every concept in this knowledge graph.
        </p>
        <div className="mt-4 px-6 py-3 badge-glow-emerald rounded-2xl font-bold font-mono text-sm">
          100% Concept Mastery Achieved
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 glass-panel rounded-3xl border border-white/10">
        <div className="animate-pulse text-text-muted flex items-center gap-3 font-mono text-sm">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Selecting weakest concept & generating targeted practice...
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || loading) return;

    setLoading(true);
    try {
      const response = await submitAnswer(question.id, answer, studentId);
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setResult(null);
    setShowHint(false);
    onAnswerSubmit();
  };

  const isGuided = question.guided || !!question.hint;

  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl backdrop-blur-2xl">
      {/* Header & Question Prompt */}
      <div className="p-6 border-b border-white/10 bg-surface-light/30 max-h-[48%] overflow-y-auto custom-scrollbar space-y-3">
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-mono ${
            isGuided ? 'badge-glow-amber' : 'badge-glow-indigo'
          }`}>
            {isGuided ? 'Guided Practice Stage' : 'Independent Practice Stage'}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10 font-heading">
            {question.concept_name || 'Concept'}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-base md:text-lg font-medium text-white leading-relaxed whitespace-pre-wrap break-words select-text font-heading pt-1">
          {question.text}
        </div>

        {/* Scaffold Hint Drawer */}
        {isGuided && question.hint && (
          <div className="pt-2">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>💡 View Scaffold Hint</span>
              </button>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-100 animate-fade-in font-sans space-y-1">
                <span className="font-bold font-mono text-amber-400 block uppercase tracking-wider">Scaffold Hint</span>
                <p>{question.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Form & Feedback Area */}
      <div className="flex-1 p-6 flex flex-col justify-end overflow-y-auto">
        {result ? (
          <div className="animate-slide-in space-y-4">
            {/* Misconception Re-teach Trigger Alert */}
            {result.new_stage === 'LEARNING' && (
              <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
                <span className="text-base">🔄</span>
                <span>Conceptual gap detected — triggering a targeted micro-lesson re-teach!</span>
              </div>
            )}

            {/* Answer Evaluation Result Card */}
            <div className={`p-4 rounded-2xl ${
              result.correct ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'
            } border backdrop-blur-md shadow-lg space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.correct ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  }`}>
                    {result.correct ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold font-heading ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.correct ? 'Correct!' : 'Needs Revision'}
                  </h3>
                </div>

                {result.error_type && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-rose-300 border border-rose-500/30">
                    {result.error_type.replace('_', ' ')}
                  </span>
                )}
              </div>

              <p className="text-slate-100 text-sm whitespace-pre-wrap break-words leading-relaxed pl-11">
                {result.explanation}
              </p>

              {result.feedback && (
                <p className="text-text-secondary pl-11 text-xs italic">
                  "{result.feedback}"
                </p>
              )}
            </div>
            
            {/* Updated Mastery Progress Bar */}
            {result.new_mastery !== undefined && (
              <div className="px-1 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-text-muted">
                  <span>Bayesian Mastery Estimate</span>
                  <span className="text-white font-mono">{Math.round(result.new_mastery * 100)}% ({result.new_stage})</span>
                </div>
                <div className="h-2.5 bg-surface-lighter rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${result.new_mastery * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-4 btn-primary rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 font-heading"
            >
              <span>{result.new_stage === 'LEARNING' ? 'Continue to Re-teach →' : 'Next Step →'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer or mathematical steps here..."
                className="w-full h-32 bg-surface-light/80 border border-white/10 rounded-2xl p-4 text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 text-sm font-sans shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-text-muted">
              <span>Press <kbd className="px-2 py-1 bg-surface-lighter rounded-md border border-white/10 font-mono text-[11px] text-white">Enter</kbd> to submit</span>
              <button
                type="submit"
                disabled={!answer.trim() || loading}
                className="px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all duration-200 flex items-center gap-2 font-heading"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Evaluating...
                  </span>
                ) : 'Submit Answer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
