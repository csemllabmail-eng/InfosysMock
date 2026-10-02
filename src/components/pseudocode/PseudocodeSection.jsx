import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, SkipForward, SkipBack, RotateCcw, 
  Sparkles, CheckCircle2, XCircle, Code2, ArrowRight, 
  HelpCircle, Eye, Cpu, BookOpen
} from 'lucide-react';
import { 
  fetchQuestions, fetchCodeTracingData, 
  toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

export default function PseudocodeSection() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'practice'
  
  // Tracing Simulator state
  const [tracingExercises, setTracingExercises] = useState([]);
  const [activeTraceIdx, setActiveTraceIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [simRunning, setSimRunning] = useState(false);

  // Practice state
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const traceList = await fetchCodeTracingData();
    const qList = await fetchQuestions({ section: 'Pseudocode & Programming Logic' });
    
    setTracingExercises(traceList);
    setPracticeQuestions(qList);
    
    if (qList.length > 0) {
      setBookmarked(isQuestionBookmarked(qList[0].id));
    }
    setLoading(false);
  }

  const currentTrace = tracingExercises[activeTraceIdx];
  const currentStep = currentTrace ? currentTrace.steps[currentStepIdx] : null;
  const currentPracticeQ = practiceQuestions[practiceIdx];

  // Simulator controls
  const handleNextStep = () => {
    if (currentTrace && currentStepIdx < currentTrace.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleResetTrace = () => {
    setCurrentStepIdx(0);
    setSimRunning(false);
  };

  const handleRunAll = () => {
    if (!currentTrace) return;
    setSimRunning(true);
    let step = currentStepIdx;
    const interval = setInterval(() => {
      if (step < currentTrace.steps.length - 1) {
        step++;
        setCurrentStepIdx(step);
      } else {
        clearInterval(interval);
        setSimRunning(false);
      }
    }, 450);
  };

  // Practice controls
  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitPractice = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    const isCorrect = selectedAnswer === currentPracticeQ.correctAnswer;
    logPracticeSession({
      section: 'Pseudocode & Programming Logic',
      topic: currentPracticeQ.topic,
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const handleNextPractice = () => {
    if (practiceIdx + 1 < practiceQuestions.length) {
      const next = practiceIdx + 1;
      setPracticeIdx(next);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
      setBookmarked(isQuestionBookmarked(practiceQuestions[next].id));
    }
  };

  const handlePrevPractice = () => {
    if (practiceIdx > 0) {
      const prev = practiceIdx - 1;
      setPracticeIdx(prev);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
      setBookmarked(isQuestionBookmarked(practiceQuestions[prev].id));
    }
  };

  // Render code lines with syntax & highlighted line
  const renderCodeLines = (codeText, activeLineNumber) => {
    const lines = codeText.split('\n');
    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const isCurrentLine = activeLineNumber === lineNum;

      return (
        <div
          key={idx}
          className={`flex items-center font-mono text-xs sm:text-sm py-1 px-3 rounded-lg transition-colors ${
            isCurrentLine 
              ? 'bg-brand-500/20 text-brand-300 font-bold border-l-4 border-brand-500' 
              : 'text-slate-300 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-8 shrink-0 select-none text-slate-500 text-xs text-right pr-3">
            {lineNum}
          </span>
          <span className="whitespace-pre">
            {line}
          </span>
          {isCurrentLine && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-brand-500 text-white font-sans shrink-0 uppercase tracking-wider">
              Executing
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Tabs */}
      <div className="glass-card p-6 border-emerald-200/50 dark:border-emerald-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Pseudocode & Programming Logic
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Interactive Simulator + 75 Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Step-by-step code execution tracing, live variable state mutation, nested loops, and array logic.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'simulator' 
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Code Tracing Simulator
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'practice' 
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Practice Questions ({practiceQuestions.length})
          </button>
        </div>
      </div>

      {/* ================= 1. CODE TRACING SIMULATOR ================= */}
      {activeTab === 'simulator' && currentTrace && (
        <div className="space-y-6">
          
          {/* Exercise Selector bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-md">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Tracing Programs:</span>
              <div className="flex gap-1.5 ml-2">
                {tracingExercises.map((ex, idx) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setActiveTraceIdx(idx);
                      setCurrentStepIdx(0);
                      setSimRunning(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      activeTraceIdx === idx 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}. {ex.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Step <span className="text-emerald-400 font-bold">{currentStepIdx + 1}</span> of {currentTrace.steps.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Code Editor Window */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {currentTrace.title.toLowerCase().replace(/\s+/g, '_')}.pseudo
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Read-Only Simulator
                </span>
              </div>

              {/* Code Snippet */}
              <div className="p-4 overflow-x-auto space-y-0.5">
                {renderCodeLines(currentTrace.code, currentStep?.line)}
              </div>

              {/* Step Navigation Controls */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetTrace}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIdx === 0}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStepIdx >= currentTrace.steps.length - 1}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <span>Next Step</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRunAll}
                    disabled={simRunning || currentStepIdx >= currentTrace.steps.length - 1}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Run All
                  </button>
                </div>
              </div>

            </div>

            {/* Right 5 Columns: Variable Watch, Condition Evaluator & Output Console */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Step Commentary Box */}
              <div className="glass-card p-5 border-emerald-200/50 dark:border-emerald-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Execution Inspector
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Line {currentStep?.line}: {currentStep?.note}
                </h4>

                {/* Condition evaluation pill if present */}
                {currentStep?.cond && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-mono text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span className="font-sans font-bold text-[10px] uppercase bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded">
                      Branch Condition
                    </span>
                    <span>{currentStep.cond}</span>
                  </div>
                )}
              </div>

              {/* Variable Watch Table */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-brand-500" />
                    Active Variables Watch
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Memory State</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {currentStep?.vars && Object.keys(currentStep.vars).length > 0 ? (
                    Object.entries(currentStep.vars).map(([vName, vVal]) => (
                      <div key={vName} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-850 text-xs">
                        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{vName}</span>
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {vVal}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No active local variables initialized yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal / Print Output */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  Standard Output (Stdout)
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800/80 min-h-[48px] flex items-center">
                  {currentStep?.output ? (
                    <span className="text-emerald-400 font-bold text-sm">
                      &gt; {currentStep.output}
                    </span>
                  ) : (
                    <span className="text-slate-600 italic">
                      [Program executing — no output printed yet]
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Question on the Traced Code */}
          <div className="glass-card p-6 border-emerald-200/50 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {currentTrace.question}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentTrace.options.map((opt, idx) => {
                const isCorrect = idx === currentTrace.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center text-xs font-bold ${
                      isCorrect 
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + idx)}. </span>
                    <span>{opt}</span>
                    {isCorrect && <span className="block text-[10px] text-emerald-600 mt-1">Verified Answer</span>}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              💡 {currentTrace.explanation}
            </p>
          </div>

        </div>
      )}

      {/* ================= 2. PRACTICE QUESTIONS TAB ================= */}
      {activeTab === 'practice' && currentPracticeQ && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Question {practiceIdx + 1} of {practiceQuestions.length}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentPracticeQ.topic} · {currentPracticeQ.subtopic}
              </span>
            </div>

            <button
              onClick={async () => {
                const res = await toggleBookmark(currentPracticeQ.id);
                setBookmarked(res.isBookmarked);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                bookmarked ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-400'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentPracticeQ.question}
          </h2>

          {/* Code snippet block if question has code */}
          {currentPracticeQ.codeSnippet && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre">
              {currentPracticeQ.codeSnippet}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentPracticeQ.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentPracticeQ.correctAnswer;

              let style = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-emerald-300";
              if (isAnswerSubmitted) {
                if (isCorrect) style = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold ring-1 ring-emerald-500";
                else if (isSelected && !isCorrect) style = "border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-400";
                else style = "border-slate-200 opacity-60";
              } else if (isSelected) {
                style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 font-bold ring-1 ring-emerald-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1 font-mono">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPractice}
                disabled={practiceIdx === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleNextPractice}
                disabled={practiceIdx >= practiceQuestions.length - 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitPractice}
                disabled={selectedAnswer === null}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                {showExplanation ? "Hide Explanation" : "Show Logic Breakdown"}
              </button>
            )}
          </div>

          {showExplanation && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                Logical Execution Breakdown:
              </span>
              {currentPracticeQ.explanation}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
