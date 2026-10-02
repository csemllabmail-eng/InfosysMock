import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Zap, Clock, CheckCircle2, XCircle, 
  Bookmark, BookmarkCheck, ArrowRight, RotateCcw, 
  HelpCircle, Sparkles, Filter, ChevronRight, Play, Check
} from 'lucide-react';
import { 
  fetchQuestions, toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

export default function QuantSection() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedSubtopic, setSelectedSubtopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [sessionScore, setSessionScore] = useState({ correct: 0, attempted: 0 });
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [retryMode, setRetryMode] = useState(false);

  // Speed Trainer Mode state
  const [isSpeedTrainerActive, setIsSpeedTrainerActive] = useState(false);
  const [speedDuration, setSpeedDuration] = useState(120); // 2 minutes
  const [speedTimeLeft, setSpeedTimeLeft] = useState(120);
  const [speedSolvedCount, setSpeedSolvedCount] = useState(0);
  const [speedCorrectCount, setSpeedCorrectCount] = useState(0);
  const [speedTrainerFinished, setSpeedTrainerFinished] = useState(false);
  const timerRef = useRef(null);

  // Topics and Subtopics definition
  const topicHierarchy = {
    'Arithmetic': [
      'Percentages', 'Profit and Loss', 'Simple and Compound Interest', 
      'Ratio and Proportion', 'Averages', 'Mixtures and Allegations', 
      'Time and Work', 'Pipes and Cisterns', 'Time, Speed and Distance', 
      'Problems on Trains', 'Ages'
    ],
    'Number Systems': [
      'Divisibility', 'HCF and LCM', 'Remainders', 'Number Series', 'Unit Digits'
    ],
    'Advanced Quantitative Aptitude': [
      'Permutations and Combinations', 'Probability', 'Data Interpretation', 
      'Data Sufficiency', 'Mensuration', 'Algebra', 'Geometry'
    ]
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedTopic, selectedSubtopic, selectedDifficulty]);

  async function loadQuestions() {
    setLoading(true);
    let list = await fetchQuestions({
      section: 'Quantitative Aptitude',
      topic: selectedSubtopic !== 'All' ? selectedSubtopic : (selectedTopic !== 'All' ? selectedTopic : undefined),
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
    });

    if (list.length === 0) {
      // Fallback to all quant
      list = await fetchQuestions({ section: 'Quantitative Aptitude' });
    }

    setQuestions(list);
    setCurrentIndex(0);
    resetQuestionState(list[0]);
    setLoading(false);
  }

  function resetQuestionState(q) {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    if (q) {
      setBookmarked(isQuestionBookmarked(q.id));
    }
  }

  const currentQ = retryMode && incorrectQuestions.length > 0 
    ? incorrectQuestions[currentIndex] 
    : questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted && !isSpeedTrainerActive) return;
    setSelectedAnswer(idx);

    if (isSpeedTrainerActive) {
      // Instant next in speed trainer
      const isCorrect = idx === currentQ.correctAnswer;
      setSpeedSolvedCount(prev => prev + 1);
      if (isCorrect) setSpeedCorrectCount(prev => prev + 1);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        resetQuestionState(questions[currentIndex + 1]);
      } else {
        finishSpeedTrainer();
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    setSessionScore(prev => ({
      attempted: prev.attempted + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));

    if (!isCorrect && !incorrectQuestions.some(q => q.id === currentQ.id)) {
      setIncorrectQuestions(prev => [...prev, currentQ]);
    }

    logPracticeSession({
      section: 'Quantitative Aptitude',
      topic: currentQ.topic,
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const handleNext = () => {
    const list = retryMode ? incorrectQuestions : questions;
    if (currentIndex + 1 < list.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetQuestionState(list[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const list = retryMode ? incorrectQuestions : questions;
      resetQuestionState(list[prevIdx]);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentQ) return;
    const res = await toggleBookmark(currentQ.id);
    setBookmarked(res.isBookmarked);
  };

  // Speed trainer timer functions
  const startSpeedTrainer = (seconds = 120) => {
    setIsSpeedTrainerActive(true);
    setSpeedDuration(seconds);
    setSpeedTimeLeft(seconds);
    setSpeedSolvedCount(0);
    setSpeedCorrectCount(0);
    setSpeedTrainerFinished(false);
    setCurrentIndex(0);
    resetQuestionState(questions[0]);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSpeedTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishSpeedTrainer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishSpeedTrainer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSpeedTrainerActive(false);
    setSpeedTrainerFinished(true);
  };

  const startRetryMode = () => {
    if (incorrectQuestions.length === 0) return;
    setRetryMode(true);
    setCurrentIndex(0);
    resetQuestionState(incorrectQuestions[0]);
  };

  const exitRetryMode = () => {
    setRetryMode(false);
    setCurrentIndex(0);
    resetQuestionState(questions[0]);
  };

  const qpm = speedSolvedCount > 0 && speedDuration > speedTimeLeft
    ? ((speedSolvedCount / (speedDuration - speedTimeLeft)) * 60).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Speed Trainer Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border-blue-200/50 dark:border-blue-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Quantitative Aptitude
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              150+ Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Topic-wise practice with step-by-step arithmetic tricks, formulas, and timed speed drill.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {incorrectQuestions.length > 0 && !retryMode && (
            <button
              onClick={startRetryMode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Mistakes ({incorrectQuestions.length})
            </button>
          )}

          {retryMode && (
            <button
              onClick={exitRetryMode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Exit Retry Mode
            </button>
          )}

          <button
            onClick={() => startSpeedTrainer(120)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch Speed Trainer (2 Min)</span>
          </button>
        </div>
      </div>

      {/* Speed Trainer Modal / Banner when active */}
      {isSpeedTrainerActive && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white shadow-lg animate-soft-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <div>
                <h3 className="font-extrabold text-base">Aptitude Speed Trainer Active</h3>
                <p className="text-xs text-white/80">Select your answer immediately — questions advance automatically!</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md">
                Timer: <span className="font-mono text-base font-bold ml-1">{speedTimeLeft}s</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md">
                Solved: <span className="text-base font-bold ml-1">{speedSolvedCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md">
                QPM: <span className="text-base font-bold ml-1">{qpm}</span>
              </div>
              <button
                onClick={finishSpeedTrainer}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold transition-colors cursor-pointer"
              >
                End Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speed Trainer Results Modal */}
      {speedTrainerFinished && (
        <div className="glass-card p-6 border-cyan-400 bg-gradient-to-br from-white via-cyan-50/20 to-blue-50/20 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500 fill-cyan-500" />
              Speed Trainer Results
            </h3>
            <button
              onClick={() => setSpeedTrainerFinished(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400">Total Solved</span>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100">{speedSolvedCount} Qs</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400">Correct Answers</span>
              <div className="text-xl font-black text-emerald-500">{speedCorrectCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400">Drill Accuracy</span>
              <div className="text-xl font-black text-blue-500">
                {speedSolvedCount > 0 ? Math.round((speedCorrectCount / speedSolvedCount) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-400">Avg Time / Q</span>
              <div className="text-xl font-black text-purple-500">
                {speedSolvedCount > 0 ? ((speedDuration - speedTimeLeft) / speedSolvedCount).toFixed(1) : 0}s
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => startSpeedTrainer(120)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Try Again (2 Min)
            </button>
          </div>
        </div>
      )}

      {/* Filter Row */}
      {!isSpeedTrainerActive && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Topic & Subtopic Filters</span>
            </div>
            <span className="text-xs text-slate-400">
              Found {questions.length} Questions
            </span>
          </div>

          {/* Topics buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedTopic('All'); setSelectedSubtopic('All'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedTopic === 'All' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Topics
            </button>
            {Object.keys(topicHierarchy).map(top => (
              <button
                key={top}
                onClick={() => { setSelectedTopic(top); setSelectedSubtopic('All'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTopic === top 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {top}
              </button>
            ))}
          </div>

          {/* Subtopics row if a topic is picked */}
          {selectedTopic !== 'All' && topicHierarchy[selectedTopic] && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center">Subtopics:</span>
              <button
                onClick={() => setSelectedSubtopic('All')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedSubtopic === 'All'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {topicHierarchy[selectedTopic].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubtopic(sub)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    selectedSubtopic === sub
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Difficulty pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Level:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  selectedDifficulty === diff 
                    ? 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-700' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Practice Question Card */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !currentQ ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">No questions found matching this filter criteria.</p>
        </div>
      ) : (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          
          {/* Question Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                Question {currentIndex + 1} of {retryMode ? incorrectQuestions.length : questions.length}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentQ.topic} · {currentQ.subtopic}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition-colors ${
                  bookmarked 
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-500' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                }`}
                title={bookmarked ? "Bookmarked" : "Bookmark this question"}
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Statement */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctAnswer;
              
              let optionStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-700";

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400";
                } else {
                  optionStyle = "border-slate-200 dark:border-slate-700 opacity-60";
                }
              } else if (isSelected) {
                optionStyle = "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500 font-medium";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted && !isSpeedTrainerActive}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1">{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Submit / Show Explanation */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= (retryMode ? incorrectQuestions.length - 1 : questions.length - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-3">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Check Solution
                </button>
              ) : (
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {showExplanation ? "Hide Steps" : "Show Steps & Shortcuts"}
                </button>
              )}
            </div>
          </div>

          {/* Step-by-Step Solution & Shortcut Trick Callout */}
          {showExplanation && (
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-800 dark:text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Step-by-Step Mathematical Explanation & Shortcut Method:
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-800 text-[11px] text-slate-600 dark:text-slate-400">
                💡 <span className="font-semibold text-slate-800 dark:text-slate-200">Infosys Exam Calculation Trick:</span> Where possible, convert percentages to fractions (e.g. 20% = 1/5, 12.5% = 1/8) or use LCM-based total work units to eliminate multi-digit division steps under test time limits.
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
