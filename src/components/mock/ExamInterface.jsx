import React, { useState, useEffect, useRef } from 'react';
import { 
  RiTimeLine, 
  RiCheckboxCircleLine, 
  RiCloseCircleLine, 
  RiAlertLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine, 
  RiBookmarkLine, 
  RiBarChartBoxLine, 
  RiQuestionLine, 
  RiCheckLine, 
  RiShieldCheckLine, 
  RiCloseLine 
} from '@remixicon/react';
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
        isMarkedForReview: !copy[currentIdx].isMarkedForReview,
        isVisited: true
      };
      return copy;
    });
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setResponses(prev => {
        const copy = [...prev];
        copy[nextIdx] = { ...copy[nextIdx], isVisited: true };
        return copy;
      });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setResponses(prev => {
        const copy = [...prev];
        copy[prevIdx] = { ...copy[prevIdx], isVisited: true };
        return copy;
      });
    }
  };

  const handleSaveAndNext = () => {
    handleNext();
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentIdx(idx);
    setResponses(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], isVisited: true };
      return copy;
    });
  };

  // Submit test and compute genuine results
  const handleSubmitTest = (autoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitModal(false);

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const wrongIds = [];

    const sectionBreakdownMap = {};

    test.questions.forEach((q, idx) => {
      const resp = responses[idx];
      const secName = q.section || "General";
      if (!sectionBreakdownMap[secName]) {
        sectionBreakdownMap[secName] = { section: secName, total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      sectionBreakdownMap[secName].total++;

      if (resp.selected === null) {
        unattempted++;
        sectionBreakdownMap[secName].unattempted++;
      } else if (resp.selected === q.correctAnswer) {
        correct++;
        sectionBreakdownMap[secName].correct++;
      } else {
        incorrect++;
        sectionBreakdownMap[secName].incorrect++;
        wrongIds.push(q.id);
      }
    });

    const timeSpent = ((test.durationMinutes || 90) * 60) - timeLeftSeconds;
    const scorePct = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    const result = {
      testId: test.id,
      title: test.title,
      timestamp: new Date().toISOString(),
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090e17] flex flex-col font-sans">
      
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-40 h-14 bg-white dark:bg-[#0d1522] border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            SE
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
              {test.title}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {test.questions[currentIdx]?.section} · Question {currentIdx + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          {!isTestSubmitted ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs font-semibold border ${
              isDanger 
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:border-rose-900' 
                : isWarn 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:border-amber-900' 
                  : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}>
              <RiTimeLine className="w-3.5 h-3.5 shrink-0" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          ) : (
            <button
              onClick={onExitTest}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Exit Review
            </button>
          )}
        </div>
      </header>

      {/* ================= ACTIVE TEST MODE ================= */}
      {!isTestSubmitted && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Question Area (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 sm:p-7 space-y-6 shadow-xs">
            
            <div className="space-y-4">
              {/* Question metadata badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Question {currentIdx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {currentQ.section}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    · {currentQ.subtopic || currentQ.topic}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-400">
                  Mark: +1.0 / 0.0
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base font-medium text-slate-900 dark:text-white leading-relaxed pt-1">
                {currentQ.question}
              </div>

              {/* Code snippet if any */}
              {currentQ.codeSnippet && (
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre">
                  {currentQ.codeSnippet}
                </div>
              )}

              {/* Answer Choices */}
              <div className="space-y-2.5 pt-3">
                {currentQ.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = currentResp.selected === optIdx;

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center gap-3 p-3 rounded-md border text-xs sm:text-sm transition-colors cursor-pointer select-none ${
                        isSelected 
                          ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-100 font-semibold' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
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

            {/* Test Navigation Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentResp.isMarkedForReview 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <RiBookmarkLine className="w-3.5 h-3.5" />
                  {currentResp.isMarkedForReview ? "Marked for Review" : "Mark for Review"}
                </button>

                {currentResp.selected !== null && (
                  <button
                    onClick={handleClearResponse}
                    className="px-3 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-3.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-4 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  {currentIdx === totalQuestions - 1 ? "Save Response" : "Save & Next"}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Question Palette (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-5 shadow-xs">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Question Palette
              </h3>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                  <span>Marked ({markedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
                  <span>Unanswered ({visitedUnanswered})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
                  <span>Not Visited ({unvisitedCount})</span>
                </div>
              </div>

              {/* Question Number Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-6 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {responses.map((resp, qIndex) => {
                  const isCurrent = qIndex === currentIdx;
                  let bgStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"; // not visited

                  if (resp.selected !== null && resp.isMarkedForReview) {
                    bgStyle = "bg-indigo-600 text-white font-bold ring-1 ring-indigo-300";
                  } else if (resp.selected !== null) {
                    bgStyle = "bg-emerald-600 text-white font-bold";
                  } else if (resp.isMarkedForReview) {
                    bgStyle = "bg-indigo-600 text-white font-bold";
                  } else if (resp.isVisited) {
                    bgStyle = "bg-amber-600 text-white font-bold";
                  }

                  return (
                    <button
                      key={qIndex}
                      onClick={() => handleJumpToQuestion(qIndex)}
                      className={`h-8 rounded text-xs font-semibold transition-colors cursor-pointer ${bgStyle} ${
                        isCurrent ? 'ring-2 ring-brand-600 ring-offset-1 dark:ring-offset-slate-900' : 'hover:opacity-90'
                      }`}
                    >
                      {qIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Single, Primary Submit Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Submit Examination
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= SUBMIT CONFIRMATION MODAL ================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0d1522] rounded-lg p-5 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <RiAlertLine className="w-4 h-4 text-amber-500" />
                Confirm Examination Submission
              </h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to finish and submit your exam? Here is your question attempt summary:
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Answered:</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{answeredCount} Qs</span>
              </div>
              <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Unanswered:</span>
                <span className="text-base font-bold text-amber-700 dark:text-amber-300">{totalQuestions - answeredCount} Qs</span>
              </div>
              <div className="p-2.5 rounded bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Marked for Review:</span>
                <span className="text-base font-bold text-indigo-700 dark:text-indigo-300">{markedCount} Qs</span>
              </div>
              <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Time Remaining:</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">{formatTime(timeLeftSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-3.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Resume Exam
              </button>
              <button
                onClick={() => handleSubmitTest(false)}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESULT ANALYSIS & REVIEW SCREEN ================= */}
      {isTestSubmitted && testResult && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 lg:p-6 space-y-6">
          
          {/* Top Formal Scorecard */}
          <div className="rounded-lg bg-[#0f2038] dark:bg-[#091322] border border-slate-700 text-white p-6 shadow-xs text-center space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/10 uppercase tracking-wider text-slate-300">
              Examination Evaluation Report
            </span>
            <div className="text-4xl font-bold tracking-tight">
              {testResult.correctCount} <span className="text-xl font-normal text-slate-400">/ {testResult.totalQuestions}</span>
            </div>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Score: <span className="font-bold text-amber-300">{testResult.scorePercent}%</span> · Completed in {Math.round(testResult.timeSpentSeconds / 60)} minutes.
              {testResult.scorePercent >= 70 
                ? " You meet the standard Infosys SE qualification cutoff." 
                : " Review the questions below to address weaker areas."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-700 max-w-xl mx-auto text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Correct</span>
                <div className="text-lg font-bold text-emerald-400">{testResult.correctCount}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Incorrect</span>
                <div className="text-lg font-bold text-rose-400">{testResult.incorrectCount}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Unattempted</span>
                <div className="text-lg font-bold text-slate-300">{testResult.unattemptedCount}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Accuracy</span>
                <div className="text-lg font-bold text-amber-300">
                  {testResult.totalQuestions - testResult.unattemptedCount > 0 
                    ? Math.round((testResult.correctCount / (testResult.totalQuestions - testResult.unattemptedCount)) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Sectional Breakdown Table */}
          <div className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <RiBarChartBoxLine className="w-4 h-4 text-slate-500" />
              Sectional Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                    <th className="py-2 px-3">Section</th>
                    <th className="py-2 px-3">Questions</th>
                    <th className="py-2 px-3">Correct</th>
                    <th className="py-2 px-3">Accuracy</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {testResult.sectionBreakdown.map((sec, idx) => {
                    const acc = sec.total > 0 ? Math.round((sec.correct / sec.total) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{sec.section}</td>
                        <td className="py-2.5 px-3 text-slate-500">{sec.total}</td>
                        <td className="py-2.5 px-3 font-medium text-emerald-600">{sec.correct}</td>
                        <td className="py-2.5 px-3 font-semibold">{acc}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            acc >= 70 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {acc >= 70 ? "Qualified" : "Below Cutoff"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Question Review with Solutions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Answer Key & Explanations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review each question and detailed step-by-step solution.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded">
                {['All', 'Incorrect', 'Marked'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterReviewMode(f)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      filterReviewMode === f 
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 font-semibold shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {test.questions.map((q, qIndex) => {
                const userAns = responses[qIndex].selected;
                const isCorrect = userAns === q.correctAnswer;
                const isMarked = responses[qIndex].isMarkedForReview;

                if (filterReviewMode === 'Incorrect' && (userAns === null || isCorrect)) return null;
                if (filterReviewMode === 'Marked' && !isMarked) return null;

                return (
                  <div key={qIndex} className="bg-white dark:bg-[#0d1522] border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Q{qIndex + 1}. {q.section}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        userAns === null 
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                          : isCorrect 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {userAns === null ? "Unattempted" : isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      {q.question}
                    </p>

                    {q.codeSnippet && (
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre">
                        {q.codeSnippet}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optI) => {
                        const isCorrectOption = optI === q.correctAnswer;
                        const isUserChoice = optI === userAns;

                        let badgeStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300";
                        if (isCorrectOption) {
                          badgeStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold";
                        } else if (isUserChoice && !isCorrectOption) {
                          badgeStyle = "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold";
                        }

                        return (
                          <div key={optI} className={`flex items-center justify-between p-2.5 rounded border ${badgeStyle}`}>
                            <span>{String.fromCharCode(65 + optI)}. {opt}</span>
                            {isCorrectOption && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Correct</span>}
                            {isUserChoice && !isCorrectOption && <span className="text-[10px] text-rose-600 font-semibold">Selected</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
