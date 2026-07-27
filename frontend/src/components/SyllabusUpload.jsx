import React, { useState } from 'react';

const exampleSyllabi = [
  {
    name: "Algebra I: Linear Equations through Quadratics",
    category: "Mathematics",
    description: "Covers variables, linear equations, systems, polynomials, factoring, and quadratic formulas.",
    text: "1. Basic Algebra Concepts\n- Variables and expressions\n- Order of operations\n- Properties of numbers\n\n2. Linear Equations\n- Solving one-step equations\n- Solving multi-step equations\n- Equations with variables on both sides\n\n3. Linear Inequalities\n- Solving one-step inequalities\n- Solving multi-step inequalities\n- Compound inequalities\n\n4. Graphing Linear Equations\n- Slope and rate of change\n- Slope-intercept form\n- Point-slope form\n\n5. Systems of Equations\n- Solving by graphing\n- Solving by substitution\n- Solving by elimination\n\n6. Polynomials and Factoring\n- Adding and subtracting polynomials\n- Multiplying polynomials\n- Factoring out GCF\n- Factoring quadratics (a=1)\n- Factoring quadratics (a>1)\n\n7. Quadratic Equations\n- Solving by factoring\n- Solving by square roots\n- The quadratic formula"
  },
  {
    name: "Introduction to Machine Learning",
    category: "Computer Science",
    description: "Supervised and unsupervised learning, gradient descent, evaluation metrics, PCA, and neural nets.",
    text: "Module 1: Foundations\n- What is Machine Learning?\n- Types of ML (Supervised, Unsupervised, Reinforcement)\n- Math prerequisites review (Linear Algebra, Calculus basics)\n\nModule 2: Supervised Learning (Regression)\n- Simple Linear Regression\n- Multiple Linear Regression\n- Cost functions and Gradient Descent\n\nModule 3: Supervised Learning (Classification)\n- Logistic Regression\n- K-Nearest Neighbors (KNN)\n- Decision Trees\n\nModule 4: Model Evaluation\n- Training vs Testing data\n- Cross-validation\n- Metrics: Accuracy, Precision, Recall, F1 Score\n- ROC and AUC\n\nModule 5: Unsupervised Learning\n- K-Means Clustering\n- Hierarchical Clustering\n- Principal Component Analysis (PCA)\n\nModule 6: Advanced Topics (Intro)\n- Bias-Variance Tradeoff\n- Overfitting and Regularization\n- Introduction to Neural Networks"
  },
  {
    name: "World War II: Causes and Major Events",
    category: "History",
    description: "Interwar treaties, rise of fascism, European & Pacific theaters, turning points, and aftermath.",
    text: "1. The Interwar Period (1918-1939)\n- Treaty of Versailles and its aftermath\n- The League of Nations\n- The Great Depression\n\n2. Rise of Totalitarianism\n- Fascism in Italy (Mussolini)\n- The Weimar Republic and rise of Nazism in Germany\n- Stalin's Soviet Union\n- Militarism in Japan\n\n3. The Road to War\n- Japanese invasion of Manchuria\n- Italian invasion of Ethiopia\n- German remilitarization and expansion (Rhineland, Anschluss, Sudetenland)\n- The Molotov-Ribbentrop Pact\n\n4. The European Theater (1939-1941)\n- Invasion of Poland\n- The Phoney War and Fall of France\n- Battle of Britain\n- Operation Barbarossa\n\n5. The Pacific Theater (1941-1942)\n- Pearl Harbor attack\n- Japanese expansion in Southeast Asia\n- Battle of Midway\n- Guadalcanal Campaign\n\n6. The Turning Point (1942-1943)\n- Battle of Stalingrad\n- Battle of El Alamein\n- Invasion of Italy\n\n7. Allied Victory (1944-1945)\n- D-Day (Normandy Invasion)\n- Battle of the Bulge\n- Island hopping campaign\n- Yalta and Potsdam Conferences\n- Atomic bombings of Hiroshima and Nagasaki\n- End of the war"
  }
];

const SyllabusUpload = ({ onUpload, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onUpload(text);
    }
  };

  return (
    <div className="w-full py-6 md:py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden animate-page-in">
      <div className="w-full max-w-5xl z-10 space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#da6b38]"></span>
            Syllabus Knowledge Parsing Engine
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
            Course Syllabus Library
          </h1>
          
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Paste any course outline to synthesize a personalized, 5-stage AI learning roadmap.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg glass-panel text-[11px] font-mono text-zinc-300">
              <span className="text-[#da6b38]">✓</span> Bayesian Knowledge Tracing
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg glass-panel text-[11px] font-mono text-zinc-300">
              <span className="text-[#da6b38]">✓</span> Concept Prerequisite DAG
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg glass-panel text-[11px] font-mono text-zinc-300">
              <span className="text-[#da6b38]">✓</span> 5-Stage Micro-Lessons
            </span>
          </div>
        </div>

        {/* Main Upload Card */}
        <div className="glass-panel border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Textarea Form */}
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span>Paste Course Syllabus</span>
                  </h2>
                  <span className="text-xs text-zinc-400 font-mono">{text.length} characters</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Enter course modules, textbook chapters, or topic outlines below:
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="E.g. Module 1: Introduction to Calculus&#10;- Limits and Continuity&#10;- Derivatives&#10;- Applications of Derivatives..."
                  className="flex-1 w-full bg-[#0c0d10] border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#da6b38] resize-none min-h-[240px] mb-5 font-mono text-xs md:text-sm leading-relaxed transition-all"
                  disabled={isLoading}
                />
                
                <button
                  type="submit"
                  disabled={!text.trim() || isLoading}
                  className="w-full py-3.5 btn-primary rounded-xl font-bold text-sm md:text-base transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-heading"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      <span>Parsing Knowledge Graph...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Knowledge Graph</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Preset Demos */}
            <div className="lg:col-span-5 p-6 md:p-8 bg-zinc-900/40 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#da6b38] mb-1 font-mono">
                  Preset Syllabi
                </h3>
                <h4 className="text-sm font-semibold text-white mb-3 font-heading">
                  Try a Pre-loaded Course
                </h4>
                
                <div className="space-y-3">
                  {exampleSyllabi.map((example, idx) => (
                    <div
                      key={idx}
                      onClick={() => setText(example.text)}
                      className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        text === example.text 
                          ? 'bg-[#da6b38]/15 border-[#da6b38]/40' 
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                          {example.category}
                        </span>
                        {text === example.text && (
                          <span className="text-[10px] uppercase font-bold text-[#da6b38] tracking-wider font-mono">Selected</span>
                        )}
                      </div>
                      <h5 className="font-bold text-white text-xs md:text-sm group-hover:text-[#da6b38] transition-colors font-heading">
                        {example.name}
                      </h5>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                        {example.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2.5 font-mono">
                <span>💡</span>
                <span className="text-[11px]">Syllabus outlines are parsed into a 5-stage sequential learning roadmap.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusUpload;
