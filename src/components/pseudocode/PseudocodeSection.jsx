import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Pause, SkipForward, SkipBack, RotateCcw, 
  Sparkles, CheckCircle2, XCircle, Code2, ArrowRight, 
  HelpCircle, Eye, Cpu, BookOpen, Bookmark, BookmarkCheck,
  Filter, Zap, Clock, Copy, Check, RotateCw, Award
} from 'lucide-react';
import { 
  fetchQuestions, fetchCodeTracingData, 
  toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

const PSEUDO_TOPICS = [
  'All',
  'Loops',
  'Data Structures and Algorithms',
  'Conditionals & Logic',
  'Recursion',
  'Bitwise Operations'
];

export default function PseudocodeSection() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'practice'
  
  // Tracing Simulator state
  const [tracingExercises, setTracingExercises] = useState([]);
  const [activeTraceIdx, setActiveTraceIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [simQuizSelected, setSimQuizSelected] = useState(null);
  const [simQuizSubmitted, setSimQuizSubmitted] = useState(false);
  const simIntervalRef = useRef(null);

  // Practice state
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Session score & retry mode
  const [sessionScore, setSessionScore] = useState({ correct: 0, attempted: 0 });
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [retryMode, setRetryMode] = useState(false);

  // Speed Trainer state
  const [isSpeedTrainerActive, setIsSpeedTrainerActive] = useState(false);
  const [speedDuration, setSpeedDuration] = useState(120);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(120);
  const [speedSolvedCount, setSpeedSolvedCount] = useState(0);
  const [speedCorrectCount, setSpeedCorrectCount] = useState(0);
  const [speedTrainerFinished, setSpeedTrainerFinished] = useState(false);
  const speedTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadData();
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    };
  }, []);

  // Reload questions on filter changes
  useEffect(() => {
    loadFilteredQuestions();
  }, [selectedTopic, selectedDifficulty]);

  async function loadData() {
    setLoading(true);
    const traceList = await fetchCodeTracingData();
    setTracingExercises(traceList);
    await loadFilteredQuestions();
    setLoading(false);
  }

  async function loadFilteredQuestions() {
    let list = await fetchQuestions({
      section: 'Pseudocode & Programming Logic',
      topic: selectedTopic !== 'All' ? selectedTopic : undefined,
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
    });

    if (list.length === 0) {
      list = await fetchQuestions({ section: 'Pseudocode & Programming Logic' });
    }

    setPracticeQuestions(list);
    setPracticeIdx(0);
    resetPracticeState(list[0]);
  }

  function resetPracticeState(q) {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    if (q) {
      setBookmarked(isQuestionBookmarked(q.id));
    }
  }

  const currentTrace = tracingExercises[activeTraceIdx];
  const currentStep = currentTrace && currentTrace.steps ? currentTrace.steps[currentStepIdx] : null;

  const currentPracticeQ = retryMode && incorrectQuestions.length > 0
    ? incorrectQuestions[practiceIdx]
    : practiceQuestions[practiceIdx];

  // -------------------------------------------------------------
  // Simulator Controls
  // -------------------------------------------------------------
  const stopSimInterval = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setSimRunning(false);
  };

  const handleNextStep = () => {
    stopSimInterval();
    if (currentTrace && currentStepIdx < currentTrace.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    stopSimInterval();
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleResetTrace = () => {
    stopSimInterval();
    setCurrentStepIdx(0);
    setSimQuizSelected(null);
    setSimQuizSubmitted(false);
  };

  const handleToggleRunAll = () => {
    if (!currentTrace) return;

    if (simRunning) {
      stopSimInterval();
      return;
    }

    // If reached end, restart from 0
    let startStep = currentStepIdx;
    if (startStep >= currentTrace.steps.length - 1) {
      startStep = 0;
      setCurrentStepIdx(0);
    }

    setSimRunning(true);
    let step = startStep;
    simIntervalRef.current = setInterval(() => {
      if (step < currentTrace.steps.length - 1) {
        step++;
        setCurrentStepIdx(step);
      } else {
        stopSimInterval();
      }
    }, 550);
  };

  const handleSwitchTrace = (idx) => {
    stopSimInterval();
    setActiveTraceIdx(idx);
    setCurrentStepIdx(0);
    setSimQuizSelected(null);
    setSimQuizSubmitted(false);
  };

  // -------------------------------------------------------------
  // Practice Controls
  // -------------------------------------------------------------
  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted && !isSpeedTrainerActive) return;
    setSelectedAnswer(idx);

    if (isSpeedTrainerActive) {
      const isCorrect = idx === currentPracticeQ.correctAnswer;
      setSpeedSolvedCount(prev => prev + 1);
      if (isCorrect) setSpeedCorrectCount(prev => prev + 1);

      if (practiceIdx + 1 < practiceQuestions.length) {
        setPracticeIdx(prev => prev + 1);
        resetPracticeState(practiceQuestions[practiceIdx + 1]);
      } else {
        finishSpeedTrainer();
      }
    }
  };

  const handleSubmitPractice = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    const isCorrect = selectedAnswer === currentPracticeQ.correctAnswer;
    setSessionScore(prev => ({
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));

    if (!isCorrect && !incorrectQuestions.some(q => q.id === currentPracticeQ.id)) {
      setIncorrectQuestions(prev => [...prev, currentPracticeQ]);
    }

    logPracticeSession({
      section: 'Pseudocode & Programming Logic',
      topic: currentPracticeQ.topic,
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const handleNextPractice = () => {
    const list = retryMode ? incorrectQuestions : practiceQuestions;
    if (practiceIdx + 1 < list.length) {
      const nextIdx = practiceIdx + 1;
      setPracticeIdx(nextIdx);
      resetPracticeState(list[nextIdx]);
    }
  };

  const handlePrevPractice = () => {
    if (practiceIdx > 0) {
      const prevIdx = practiceIdx - 1;
      setPracticeIdx(prevIdx);
      const list = retryMode ? incorrectQuestions : practiceQuestions;
      resetPracticeState(list[prevIdx]);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentPracticeQ) return;
    const res = await toggleBookmark(currentPracticeQ.id);
    setBookmarked(res.isBookmarked);
  };

  // Speed Trainer
  const startSpeedTrainer = (seconds = 120) => {
    setIsSpeedTrainerActive(true);
    setSpeedDuration(seconds);
    setSpeedTimeLeft(seconds);
    setSpeedSolvedCount(0);
    setSpeedCorrectCount(0);
    setSpeedTrainerFinished(false);
    setPracticeIdx(0);
    resetPracticeState(practiceQuestions[0]);

    if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    speedTimerRef.current = setInterval(() => {
      setSpeedTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(speedTimerRef.current);
          finishSpeedTrainer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishSpeedTrainer = () => {
    if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    setIsSpeedTrainerActive(false);
    setSpeedTrainerFinished(true);
  };

  const startRetryMode = () => {
    if (incorrectQuestions.length === 0) return;
    setRetryMode(true);
    setPracticeIdx(0);
    resetPracticeState(incorrectQuestions[0]);
  };

  const exitRetryMode = () => {
    setRetryMode(false);
    setPracticeIdx(0);
    resetPracticeState(practiceQuestions[0]);
  };

  const qpm = speedSolvedCount > 0 && speedDuration > speedTimeLeft
    ? ((speedSolvedCount / (speedDuration - speedTimeLeft)) * 60).toFixed(1)
    : "0.0";

  // Clean prompt vs code parser helper
  const parseQuestionText = (qText, codeSnippet) => {
    if (!qText) return { prompt: "What is the output of the following pseudocode?", code: codeSnippet || "" };
    
    // If question has newlines, first line is often the prompt
    if (qText.includes('\n')) {
      const parts = qText.split('\n');
      const prompt = parts[0].trim();
      const code = parts.slice(1).join('\n').trim();
      return { prompt, code: code || codeSnippet || "" };
    }

    return { prompt: qText, code: codeSnippet || "" };
  };

  // Render code lines with syntax highlight for current active line
  const renderCodeLines = (codeText, activeLineNumber) => {
    if (!codeText) return null;
    const lines = codeText.split('\n');
    return lines.map((line, idx) => {
      const lineNum = idx + 1;
      const isCurrentLine = activeLineNumber === lineNum;

      return (
        <div
          key={idx}
          className={`flex items-center font-mono text-xs sm:text-sm py-1 px-3 rounded-lg transition-colors ${
            isCurrentLine 
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border-l-4 border-emerald-500' 
              : 'text-slate-300 hover:bg-slate-800/40'
          }`}
        >
          <span className="w-8 shrink-0 select-none text-slate-500 text-xs text-right pr-3 font-mono">
            {lineNum}
          </span>
          <span className="whitespace-pre">
            {line}
          </span>
          {isCurrentLine && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-white font-sans shrink-0 uppercase tracking-wider font-extrabold animate-pulse">
              Executing
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Tab Switcher & Speed Drill */}
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
              5 Tracing Programs · 75 Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Line-by-line pointer execution with real-time memory mutation, loop boundary checks, and recursion unwinding.
          </p>
        </div>

        {/* Tab Switcher & Speed Drill */}
        <div className="flex flex-wrap items-center gap-2">
          {incorrectQuestions.length > 0 && !retryMode && (
            <button
              onClick={startRetryMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Mistakes ({incorrectQuestions.length})
            </button>
          )}

          {retryMode && (
            <button
              onClick={exitRetryMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Exit Retry Mode
            </button>
          )}

          <button
            onClick={() => startSpeedTrainer(120)}
            disabled={isSpeedTrainerActive}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            Speed Drill (2m)
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => { stopSimInterval(); setActiveTab('simulator'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'simulator' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tracing Simulator
            </button>
            <button
              onClick={() => { stopSimInterval(); setActiveTab('practice'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'practice' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Practice Questions ({practiceQuestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Speed Trainer Active Overlay/Banner */}
      {isSpeedTrainerActive && (
        <div className="glass-card p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-400 dark:border-emerald-600 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white animate-bounce">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                Pseudocode Speed Drill in Progress!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solve code outputs swiftly. Selecting an answer immediately advances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-slate-400">Solved</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{speedSolvedCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">QPM</div>
              <div className="text-lg font-black text-teal-600">{qpm}</div>
            </div>
            <div className="text-center bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-wider">Time Left</div>
              <div className="text-xl font-black font-mono">
                {Math.floor(speedTimeLeft / 60)}:{(speedTimeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speed Trainer Finished Results Modal */}
      {speedTrainerFinished && (
        <div className="glass-card p-6 border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Pseudocode Speed Drill Finished!
          </h3>
          <div className="flex justify-center gap-8 py-2">
            <div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{speedSolvedCount}</div>
              <div className="text-xs text-slate-500">Total Answered</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{speedCorrectCount}</div>
              <div className="text-xs text-slate-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-black text-teal-600">
                {speedSolvedCount > 0 ? ((speedCorrectCount / speedSolvedCount) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-xs text-slate-500">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{qpm}</div>
              <div className="text-xs text-slate-500">Questions/Min</div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSpeedTrainerFinished(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Back to Practice
            </button>
            <button
              onClick={() => startSpeedTrainer(120)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Try Again (2 min)
            </button>
          </div>
        </div>
      )}

      {/* ================= 1. CODE TRACING SIMULATOR ================= */}
      {activeTab === 'simulator' && (
        currentTrace ? (
          <div className="space-y-6">
            
            {/* Exercise Selector bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-md">
              <div className="flex flex-wrap items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Choose Tracing Program:</span>
                <div className="flex flex-wrap gap-1.5 ml-1">
                  {tracingExercises.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSwitchTrace(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTraceIdx === idx 
                          ? 'bg-emerald-500 text-white shadow-xs scale-102' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
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
                    Interactive Pointer Tracing
                  </span>
                </div>

                {/* Code Snippet */}
                <div className="p-4 overflow-x-auto space-y-0.5 min-h-[220px]">
                  {renderCodeLines(currentTrace.code, currentStep?.line)}
                </div>

                {/* Step Navigation Controls */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetTrace}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Reset Simulator to Step 1"
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
                      Prev Step
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
                      onClick={handleToggleRunAll}
                      className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        simRunning 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {simRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Auto Play
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Right 5 Columns: Variable Watch & Output Console */}
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
                        Condition
                      </span>
                      <span>{currentStep.cond}</span>
                    </div>
                  )}
                </div>

                {/* Variable Watch Table */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      Active Variables Watch
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Memory State</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {currentStep?.vars && Object.keys(currentStep.vars).length > 0 ? (
                      Object.entries(currentStep.vars).map(([vName, vVal]) => (
                        <div key={vName} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-850 text-xs">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{vName}</span>
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {Array.isArray(vVal) ? JSON.stringify(vVal) : vVal}
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
            <div className="glass-card p-6 border-emerald-200/50 dark:border-emerald-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Quick Quiz on This Tracing Logic
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTrace.difficulty} Level
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {currentTrace.question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentTrace.options.map((opt, idx) => {
                  const isSelected = simQuizSelected === idx;
                  const isCorrect = idx === currentTrace.correctAnswer;

                  let cardStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300";

                  if (simQuizSubmitted) {
                    if (isCorrect) cardStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500 font-bold";
                    else if (isSelected && !isCorrect) cardStyle = "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200 ring-2 ring-rose-400";
                    else cardStyle = "border-slate-200 dark:border-slate-800 opacity-60";
                  } else if (isSelected) {
                    cardStyle = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !simQuizSubmitted && setSimQuizSelected(idx)}
                      disabled={simQuizSubmitted}
                      className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${cardStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="opacity-75">{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt}</span>
                      </div>
                      {simQuizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {simQuizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!simQuizSubmitted ? (
                  <button
                    onClick={() => simQuizSelected !== null && setSimQuizSubmitted(true)}
                    disabled={simQuizSelected === null}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-40 cursor-pointer shadow-sm"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 w-full">
                    <strong>Solution: </strong>{currentTrace.explanation}
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-card p-12 text-center text-slate-400">
            Loading code tracing exercises...
          </div>
        )
      )}

      {/* ================= 2. PRACTICE QUESTIONS TAB ================= */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          
          {/* Topic & Difficulty Filters Card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Filter Pseudocode Topics & Levels
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {practiceQuestions.length} Questions Available
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Topic Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-400">Topic:</span>
                {PSEUDO_TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTopic === topic
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Difficulty Level Chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">Level:</span>
                {['All', 'Easy', 'Medium', 'Hard'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDifficulty === lvl
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Question Card */}
          {loading ? (
            <div className="glass-card p-12 text-center text-slate-400">
              Loading pseudocode questions...
            </div>
          ) : currentPracticeQ ? (
            (() => {
              const { prompt, code } = parseQuestionText(currentPracticeQ.question, currentPracticeQ.codeSnippet);

              return (
                <div className="glass-card p-6 sm:p-8 space-y-6">
                  
                  {/* Question Header & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Question {practiceIdx + 1} of {(retryMode ? incorrectQuestions : practiceQuestions).length}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {currentPracticeQ.topic}
                      </span>
                      {currentPracticeQ.subtopic && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-500 border border-slate-200 dark:border-slate-700">
                          {currentPracticeQ.subtopic}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {currentPracticeQ.difficulty}
                      </span>
                      {retryMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Retry Mode
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold text-slate-400 hidden sm:block">
                        Accuracy: {sessionScore.attempted > 0 ? ((sessionScore.correct / sessionScore.attempted) * 100).toFixed(0) : 0}%
                      </div>
                      <button
                        onClick={handleToggleBookmark}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          bookmarked 
                            ? 'bg-amber-50 border-amber-300 text-amber-500' 
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                        }`}
                        title={bookmarked ? "Bookmarked" : "Bookmark this question"}
                      >
                        {bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Clean Question Prompt */}
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {prompt}
                  </h2>

                  {/* Syntax Highlighted Monospace IDE Window for Code */}
                  {code && (
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-xs">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-mono text-[11px]">program.pseudo</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 1500);
                          }}
                          className="flex items-center gap-1 text-[11px] hover:text-white cursor-pointer transition-colors"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                        {code}
                      </div>
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
                        if (isCorrect) style = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500";
                        else if (isSelected && !isCorrect) style = "border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400 font-bold";
                        else style = "border-slate-200 dark:border-slate-800 opacity-60";
                      } else if (isSelected) {
                        style = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerSubmitted}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${style}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {letter}
                          </div>
                          <span className="flex-1 font-mono">{opt}</span>
                          {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                          {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons & Explanation */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevPractice}
                          disabled={practiceIdx === 0}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNextPractice}
                          disabled={practiceIdx >= (retryMode ? incorrectQuestions.length : practiceQuestions.length) - 1}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>

                      {!isAnswerSubmitted ? (
                        <button
                          onClick={handleSubmitPractice}
                          disabled={selectedAnswer === null}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 disabled:opacity-50 cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${selectedAnswer === currentPracticeQ.correctAnswer ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {selectedAnswer === currentPracticeQ.correctAnswer ? '✓ Correct Logic' : '✗ Incorrect Evaluation'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Logic Breakdown */}
                    {showExplanation && (
                      <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Logical Execution Breakdown:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                          {currentPracticeQ.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="glass-card p-12 text-center text-slate-400">
              No questions found matching the selected filter.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
