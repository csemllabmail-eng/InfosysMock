import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertTriangle, 
  ChevronLeft, ChevronRight, Bookmark, RotateCcw, 
  Award, BarChart3, HelpCircle, Check, Sparkles, X
} from 'lucide-react';
import { saveAttempt } from '../../services/api';

export default function ExamInterface({ test, onExitTest, onRetryMistakes }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const totalQuestions = test.questions.length;
  
  // User responses: array of { selected: number | null, isMarkedForReview: boolean, isVisited: boolean }
  const [responses, setResponses] = useState(
    Array(totalQuestions).fill(null).map((_, i) => ({
      selected: null,
      isMarkedForReview: false,
      isVisited: i === 0
    }))
  );

  // Timer
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((test.durationMinutes || 90) * 60);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [filterReviewMode, setFilterReviewMode] = useState('All'); // 'All' | 'Incorrect' | 'Marked'

  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = test.questions[currentIdx];
  const currentResp = responses[currentIdx];

  const handleSelectOption = (optIdx) => {
    if (isTestSubmitted) return;
    setResponses(prev => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        selected: optIdx,
        isVisited: true
      };
      return copy;
    });
  };

  const handleClearResponse = () => {
    if (isTestSubmitted) return;
    setResponses(prev => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        selected: null
      };
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    if (isTestSubmitted) return;
    setResponses(prev => {
      const copy = [...prev];
      copy[currentIdx] = {
        ...copy[currentIdx],
        isMarkedForReview: !copy[currentIdx].isMarkedForReview
      };
      return copy;
    });
  };

  const handleJumpToQuestion = (idx) => {
    if (idx < 0 || idx >= totalQuestions) return;
    setResponses(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], isVisited: true };
      return copy;
    });
    setCurrentIdx(idx);
  };

  const handleSaveAndNext = () => {
    if (currentIdx + 1 < totalQuestions) {
      handleJumpToQuestion(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      handleJumpToQuestion(currentIdx - 1);
    }
  };

  // Submit and grade test
  const handleSubmitTest = (auto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitModal(false);

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const wrongIds = [];

    const sectionBreakdownMap = {};

    test.questions.forEach((q, i) => {
      const userAns = responses[i].selected;
      const sec = q.section || "General";

      if (!sectionBreakdownMap[sec]) {
        sectionBreakdownMap[sec] = { section: sec, total: 0, correct: 0 };
      }
      sectionBreakdownMap[sec].total += 1;

      if (userAns === null) {
        unattempted++;
      } else if (userAns === q.correctAnswer) {
        correct++;
        sectionBreakdownMap[sec].correct += 1;
      } else {
        incorrect++;
        wrongIds.push(q.id);
      }
    });

    const timeSpent = ((test.durationMinutes || 90) * 60) - timeLeftSeconds;
    const scorePct = Math.round((correct / totalQuestions) * 100);

    const result = {
      testId: test.id,
      testTitle: test.title,
      totalQuestions,
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted,
      scorePercent: scorePct,
      timeSpentSeconds: timeSpent,
      wrongQuestionIds: wrongIds,
      sectionBreakdown: Object.values(sectionBreakdownMap)
    };

    saveAttempt(result);
    setTestResult(result);
    setIsTestSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isWarn = timeLeftSeconds <= 900;
  const isDanger = timeLeftSeconds <= 300;

  // Stats calculation
  const answeredCount = responses.filter(r => r.selected !== null).length;
  const markedCount = responses.filter(r => r.isMarkedForReview).length;
  const unvisitedCount = responses.filter(r => !r.isVisited).length;
  const visitedUnanswered = responses.filter(r => r.isVisited && r.selected === null).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-40 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            SE
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
              {test.title}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {test.questions[currentIdx]?.section} · Question {currentIdx + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          {!isTestSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold border transition-colors ${
              isDanger 
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:border-rose-900 animate-pulse' 
                : isWarn 
                  ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:border-amber-900' 
                  : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:border-brand-900'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          )}

          {!isTestSubmitted ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={onExitTest}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Back to Tests
            </button>
          )}
        </div>
      </header>

      {/* ================= ACTIVE TEST MODE ================= */}
      {!isTestSubmitted && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Question Area (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between glass-card p-6 sm:p-8 space-y-6">
            
            <div className="space-y-4">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    Question {currentIdx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentQ.section}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentQ.subtopic || currentQ.topic}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-400">
                  Mark: +1.0 / 0.0
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </div>

              {/* Code snippet if any */}
              {currentQ.codeSnippet && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre">
                  {currentQ.codeSnippet}
                </div>
              )}

              {/* Answer Choices */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = currentResp.selected === optIdx;

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all cursor-pointer select-none ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500 font-semibold' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected 
                          ? 'bg-brand-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {letter}
                      </div>
                      <span className="flex-1">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Test Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentResp.isMarkedForReview 
                      ? 'bg-purple-50 dark:bg-purple-950 border-purple-300 text-purple-600' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {currentResp.isMarkedForReview ? "Marked for Review" : "Mark for Review"}
                </button>

                {currentResp.selected !== null && (
                  <button
                    onClick={handleClearResponse}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  {currentIdx === totalQuestions - 1 ? "Save Response" : "Save & Next"}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Question Palette (4 cols) */}
          <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                Question Palette
              </h3>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Marked ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Not Answered ({visitedUnanswered})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span>Not Visited ({unvisitedCount})</span>
                </div>
              </div>

              {/* Question Number Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-6 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {responses.map((resp, qIndex) => {
                  const isCurrent = qIndex === currentIdx;
                  let bgStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"; // not visited

                  if (resp.selected !== null && resp.isMarkedForReview) {
                    bgStyle = "bg-purple-600 text-white font-bold ring-2 ring-purple-300";
                  } else if (resp.selected !== null) {
                    bgStyle = "bg-emerald-500 text-white font-bold";
                  } else if (resp.isMarkedForReview) {
                    bgStyle = "bg-purple-500 text-white font-bold";
                  } else if (resp.isVisited) {
                    bgStyle = "bg-amber-500 text-white font-bold";
                  }

                  return (
                    <button
                      key={qIndex}
                      onClick={() => handleJumpToQuestion(qIndex)}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${bgStyle} ${
                        isCurrent ? 'ring-2 ring-brand-500 scale-105 shadow-md' : 'hover:opacity-85'
                      }`}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Finish & Submit Test
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Submission
              </h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to finish and submit your exam? Here is your question attempt summary:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-slate-500 block">Answered:</span>
                <span className="text-lg font-black text-emerald-600">{answeredCount} Qs</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-slate-500 block">Unanswered:</span>
                <span className="text-lg font-black text-amber-600">{totalQuestions - answeredCount} Qs</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="text-slate-500 block">Marked for Review:</span>
                <span className="text-lg font-black text-purple-600">{markedCount} Qs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block">Remaining Time:</span>
                <span className="text-lg font-black text-brand-600 font-mono">{formatTime(timeLeftSeconds)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Resume Test
              </button>
              <button
                onClick={() => handleSubmitTest(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-colors cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESULT ANALYSIS & REVIEW SCREEN ================= */}
      {isTestSubmitted && testResult && (
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 lg:p-8 space-y-8">
          
          {/* Top Score Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-xl text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider">
              Official Assessment Simulated Result
            </span>
            <div className="text-5xl sm:text-6xl font-black">
              {testResult.correctCount} <span className="text-2xl font-normal text-white/70">/ {testResult.totalQuestions}</span>
            </div>
            <p className="text-sm sm:text-base text-white/90">
              You scored <span className="font-bold text-amber-300">{testResult.scorePercent}%</span> in {Math.round(testResult.timeSpentSeconds / 60)} minutes.
              {testResult.scorePercent >= 80 
                ? " Great job! You comfortably clear the standard Infosys SE hiring threshold." 
                : " Review your mistakes below to reach the recommended 80%+ target."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/20 max-w-2xl mx-auto text-xs">
              <div>
                <span className="text-white/70">Correct</span>
                <div className="text-xl font-bold text-emerald-300">{testResult.correctCount}</div>
              </div>
              <div>
                <span className="text-white/70">Incorrect</span>
                <div className="text-xl font-bold text-rose-300">{testResult.incorrectCount}</div>
              </div>
              <div>
                <span className="text-white/70">Unattempted</span>
                <div className="text-xl font-bold text-slate-300">{testResult.unattemptedCount}</div>
              </div>
              <div>
                <span className="text-white/70">Accuracy</span>
                <div className="text-xl font-bold text-amber-300">
                  {testResult.totalQuestions - testResult.unattemptedCount > 0 
                    ? Math.round((testResult.correctCount / (testResult.totalQuestions - testResult.unattemptedCount)) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Sectional Breakdown Table */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-500" />
              Section-wise Performance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3">Questions</th>
                    <th className="py-2.5 px-3">Correct</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {testResult.sectionBreakdown.map((sec, idx) => {
                    const acc = sec.total > 0 ? Math.round((sec.correct / sec.total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{sec.section}</td>
                        <td className="py-3 px-3 text-slate-500">{sec.total}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-600">{sec.correct}</td>
                        <td className="py-3 px-3 font-bold">{acc}%</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc >= 80 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : acc >= 60 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            {acc >= 80 ? "Proficient" : acc >= 60 ? "Borderline" : "Needs Revision"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Question Review with Explanations */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Detailed Answer Key & Solutions
                </h3>
                <p className="text-xs text-slate-500">
                  Review every question with your submitted answer and step-by-step explanations.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                {['All', 'Incorrect', 'Marked'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterReviewMode(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      filterReviewMode === f 
                        ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {test.questions.map((q, qIndex) => {
                const userAns = responses[qIndex].selected;
                const isCorrect = userAns === q.correctAnswer;
                const isMarked = responses[qIndex].isMarkedForReview;

                if (filterReviewMode === 'Incorrect' && (userAns === null || isCorrect)) return null;
                if (filterReviewMode === 'Marked' && !isMarked) return null;

                return (
                  <div 
                    key={qIndex}
                    className={`glass-card p-6 space-y-4 border-l-4 ${
                      isCorrect 
                        ? 'border-l-emerald-500' 
                        : userAns === null 
                          ? 'border-l-slate-400' 
                          : 'border-l-rose-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Q{qIndex + 1}.</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.section}
                        </span>
                      </div>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-600' : userAns === null ? 'text-slate-400' : 'text-rose-500'}`}>
                        {isCorrect ? "Correct (+1)" : userAns === null ? "Unattempted (0)" : "Incorrect (0)"}
                      </span>
                    </div>

                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {q.question}
                    </p>

                    {q.codeSnippet && (
                      <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300 whitespace-pre">
                        {q.codeSnippet}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 pt-1 text-xs">
                      {q.options.map((opt, optI) => {
                        const isCorrectOption = optI === q.correctAnswer;
                        const isUserChoice = optI === userAns;

                        let badgeStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300";
                        if (isCorrectOption) {
                          badgeStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold";
                        } else if (isUserChoice && !isCorrectOption) {
                          badgeStyle = "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 font-semibold";
                        }

                        return (
                          <div key={optI} className={`flex items-center justify-between p-3 rounded-xl border ${badgeStyle}`}>
                            <span>{String.fromCharCode(65 + optI)}. {opt}</span>
                            {isCorrectOption && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Correct Answer</span>}
                            {isUserChoice && !isCorrectOption && <span className="text-[10px] text-rose-600 font-bold">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      💡 <span className="font-bold">Explanation:</span> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              onClick={onExitTest}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Return to Test Dashboard
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
