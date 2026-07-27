import React from 'react';
import LessonPanel from '../components/LessonPanel';
import QuestionPanel from '../components/QuestionPanel';

const TutorPage = ({ currentAction, studentId, isComplete, onActionComplete, onNavigateToRoadmap }) => {
  if (isComplete) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-page-in">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 max-w-lg space-y-6">
          <div className="text-6xl animate-bounce">🎓</div>
          <h2 className="text-3xl font-extrabold text-white font-heading">Syllabus Complete!</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            You have successfully mastered every single concept in this course roadmap according to the Bayesian Knowledge Tracing model.
          </p>
          <button
            onClick={onNavigateToRoadmap}
            className="btn-primary px-6 py-3 rounded-xl text-sm font-bold font-heading inline-flex items-center gap-2"
          >
            <span>Review Course Roadmap</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentAction) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-page-in">
        <div className="animate-pulse text-text-muted font-mono text-sm flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Preparing your personalized AI Tutor Session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 space-y-4 animate-page-in">
      {/* Session Navigation Bar */}
      <div className="flex justify-between items-center glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <span className="badge-glow-indigo px-3 py-1 rounded-full text-xs font-mono font-semibold">
            Active Focus Mode
          </span>
          <h2 className="text-lg font-bold text-white font-heading">
            {currentAction.concept_label || 'Current Concept'}
          </h2>
        </div>

        <button
          onClick={onNavigateToRoadmap}
          className="text-xs text-text-muted hover:text-white font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>View Course Roadmap →</span>
        </button>
      </div>

      {/* Main Focus Workspace */}
      <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto">
        {currentAction.action === 'TEACH' ? (
          <LessonPanel 
            conceptLabel={currentAction.concept_label}
            conceptId={currentAction.concept_id}
            lesson={currentAction.lesson}
            studentId={studentId}
            onLessonComplete={onActionComplete}
          />
        ) : (
          <QuestionPanel 
            question={{
              id: currentAction.question_id,
              text: currentAction.prompt,
              concept_name: currentAction.concept_label,
              concept_id: currentAction.concept_id,
              hint: currentAction.hint,
              guided: currentAction.guided
            }}
            studentId={studentId}
            onAnswerSubmit={onActionComplete}
            isComplete={isComplete}
          />
        )}
      </div>
    </div>
  );
};

export default TutorPage;
