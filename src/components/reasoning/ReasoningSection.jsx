import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, Users, Building2, HelpCircle, 
  Sparkles, CheckCircle2, XCircle, RotateCcw, 
  ArrowRight, Bookmark, BookmarkCheck, Lightbulb, 
  Layers, Shuffle, Check, Filter, Clock, Zap, Play, ChevronRight, Award
} from 'lucide-react';
import { 
  fetchQuestions, fetchInteractivePuzzles, 
  toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

const REASONING_TOPICS = {
  core: [
    {
      id: 'Seating Arrangement',
      num: 1,
      title: 'Seating Arrangement',
      what: 'Linear, circular, and parallel seating',
      subtopics: ['Linear Seating', 'Circular Seating', 'Parallel Seating']
    },
    {
      id: 'Puzzles',
      num: 2,
      title: 'Puzzles',
      what: 'Floor-based, box-based, scheduling, and ordering puzzles',
      subtopics: ['Floor-based Puzzles', 'Box-based Puzzles', 'Scheduling Puzzles', 'Ordering Puzzles']
    },
    {
      id: 'Blood Relations',
      num: 3,
      title: 'Blood Relations',
      what: 'Family trees, coded relations, and generation-based questions',
      subtopics: ['Family Trees', 'Coded Relations', 'Generation-based Questions']
    },
    {
      id: 'Syllogisms',
      num: 4,
      title: 'Syllogisms',
      what: 'Venn diagrams, conclusions, possibility cases',
      subtopics: ['Venn Diagrams & Deduction', 'Possibility Cases', 'Either-Or Conclusions']
    },
    {
      id: 'Coding-Decoding',
      num: 5,
      title: 'Coding-Decoding',
      what: 'Letter shifting, number coding, substitution patterns',
      subtopics: ['Letter Shifting', 'Number Coding', 'Substitution Patterns']
    },
    {
      id: 'Direction and Distance',
      num: 6,
      title: 'Direction and Distance',
      what: 'Direction sense, shortest distance, final direction',
      subtopics: ['Direction Sense', 'Shortest Distance', 'Final Direction & Turns']
    },
    {
      id: 'Series and Patterns',
      num: 7,
      title: 'Series and Patterns',
      what: 'Number series, alphabet series, mixed series',
      subtopics: ['Number Series', 'Alphabet Series', 'Mixed Alphanumeric Series']
    },
    {
      id: 'Data Sufficiency',
      num: 8,
      title: 'Data Sufficiency',
      what: 'Determining whether given statements provide enough information',
      subtopics: ['Two-Statement Evaluation', 'Order & Relation Sufficiency', 'Numerical Data Sufficiency']
    },
    {
      id: 'Statement and Conclusions',
      num: 9,
      title: 'Statement and Conclusions',
      what: 'Logical deductions, assumptions, and inference',
      subtopics: ['Logical Deductions', 'Implicit Assumptions', 'Course of Action']
    },
    {
      id: 'Analogy and Classification',
      num: 10,
      title: 'Analogy and Classification',
      what: 'Word, number, and alphabet relationships',
      subtopics: ['Word Relationships', 'Number Analogy', 'Alphabet Odd-One-Out']
    }
  ],
  medium: [
    {
      id: 'Order and Ranking',
      num: 11,
      title: 'Order and Ranking',
      what: 'Position from left/right, height and rank',
      subtopics: ['Position from Left/Right', 'Overlapping Positions', 'Height and Comparison Rank']
    },
    {
      id: 'Inequalities',
      num: 12,
      title: 'Inequalities',
      what: 'Coded inequalities and mathematical relationships',
      subtopics: ['Direct Inequalities', 'Coded Inequalities', 'Definite True / False']
    },
    {
      id: 'Clocks',
      num: 13,
      title: 'Clocks',
      what: 'Angle between hands, time-based problems',
      subtopics: ['Angle Between Hands', 'Coincide & Right Angles', 'Clock Gain and Loss']
    },
    {
      id: 'Calendars',
      num: 14,
      title: 'Calendars',
      what: 'Odd days, leap years, day and date calculations',
      subtopics: ['Odd Days Calculation', 'Day and Date Determination', 'Calendar Repetition']
    },
    {
      id: 'Input-Output',
      num: 15,
      title: 'Input-Output',
      what: 'Number and word rearrangement patterns',
      subtopics: ['Word-Number Rearrangement', 'Step-by-Step Machine Shifts', 'Output Trace Logic']
    },
    {
      id: 'Non-Verbal Reasoning',
      num: 16,
      title: 'Non-Verbal Reasoning',
      what: 'Figure series, mirror images, paper folding',
      subtopics: ['Figure Series', 'Mirror & Water Images', 'Paper Folding & Cutting']
    },
    {
      id: 'Logical Venn Diagrams',
      num: 17,
      title: 'Logical Venn Diagrams',
      what: 'Set relationships and diagram-based reasoning',
      subtopics: ['Three-Set Intersections', 'Set Relationship Identification', 'Universal/Particular Sets']
    },
    {
      id: 'Mathematical Operations',
      num: 18,
      title: 'Mathematical Operations',
      what: 'Symbol substitution and equation-based reasoning',
      subtopics: ['Symbol Substitution', 'Equation Balancing', 'Operator Interchange']
    }
  ]
};

export default function ReasoningSection() {
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'puzzles'
  
  // Topic filters
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedSubtopic, setSelectedSubtopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Practice state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Session score & retry
  const [sessionScore, setSessionScore] = useState({ correct: 0, attempted: 0 });
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);
  const [retryMode, setRetryMode] = useState(false);

  // Reasoning Speed Trainer state
  const [isSpeedTrainerActive, setIsSpeedTrainerActive] = useState(false);
  const [speedDuration, setSpeedDuration] = useState(120);
  const [speedTimeLeft, setSpeedTimeLeft] = useState(120);
  const [speedSolvedCount, setSpeedSolvedCount] = useState(0);
  const [speedCorrectCount, setSpeedCorrectCount] = useState(0);
  const [speedTrainerFinished, setSpeedTrainerFinished] = useState(false);
  const timerRef = useRef(null);

  // Interactive puzzle state
  const [puzzles, setPuzzles] = useState([]);
  const [activePuzzleIdx, setActivePuzzleIdx] = useState(0);
  const [linearSeats, setLinearSeats] = useState([]);
  const [floorAssignments, setFloorAssignments] = useState({});
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [selectedItemToPlace, setSelectedItemToPlace] = useState(null);
  const [puzzleChecked, setPuzzleChecked] = useState(false);
  const [isPuzzleSolvedCorrectly, setIsPuzzleSolvedCorrectly] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeClueHint, setActiveClueHint] = useState(null);

  // Load questions whenever filters change
  useEffect(() => {
    loadQuestions();
  }, [selectedTopic, selectedSubtopic, selectedDifficulty]);

  // Load interactive puzzles once on mount
  useEffect(() => {
    async function initPuzzles() {
      const puzList = await fetchInteractivePuzzles();
      setPuzzles(puzList);
      if (puzList.length > 0) {
        initPuzzle(puzList[0]);
      }
    }
    initPuzzles();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    let list = await fetchQuestions({
      section: 'Logical Reasoning & Puzzles',
      topic: selectedTopic !== 'All' ? selectedTopic : undefined,
      subtopic: selectedSubtopic !== 'All' ? selectedSubtopic : undefined,
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
    });

    if (list.length === 0) {
      list = await fetchQuestions({ section: 'Logical Reasoning & Puzzles' });
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

  // Active question helper
  const currentQ = retryMode && incorrectQuestions.length > 0
    ? incorrectQuestions[currentIndex]
    : questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted && !isSpeedTrainerActive) return;
    setSelectedAnswer(idx);

    if (isSpeedTrainerActive) {
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
      section: 'Logical Reasoning & Puzzles',
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

  // Speed trainer timer controls
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

  // Active topic object for subtopics
  const allTopicList = [...REASONING_TOPICS.core, ...REASONING_TOPICS.medium];
  const activeTopicObj = allTopicList.find(t => t.id === selectedTopic);

  // -------------------------------------------------------------
  // Interactive Puzzle Studio Handlers
  // -------------------------------------------------------------
  function initPuzzle(puzzle) {
    setPuzzleChecked(false);
    setIsPuzzleSolvedCorrectly(false);
    setShowReasoning(false);
    setActiveClueHint(null);
    setSelectedItemToPlace(null);

    if (puzzle.type === 'floor_puzzle') {
      setFloorAssignments({});
      setUnassignedItems([...puzzle.items]);
    } else {
      setLinearSeats(Array(puzzle.slots).fill(null));
      setUnassignedItems([...puzzle.items]);
    }
  }

  const currentPuzzle = puzzles[activePuzzleIdx];

  const handleAssignToLinearSeat = (seatIndex) => {
    if (puzzleChecked) return;
    if (selectedItemToPlace) {
      const newSeats = [...linearSeats];
      const previousSeat = newSeats.indexOf(selectedItemToPlace);
      if (previousSeat > -1) {
        newSeats[previousSeat] = null;
      }
      const existingInSeat = newSeats[seatIndex];
      newSeats[seatIndex] = selectedItemToPlace;
      setLinearSeats(newSeats);

      let newUnassigned = unassignedItems.filter(item => item !== selectedItemToPlace);
      if (existingInSeat && existingInSeat !== selectedItemToPlace) {
        newUnassigned.push(existingInSeat);
      }
      setUnassignedItems(newUnassigned);
      setSelectedItemToPlace(null);
    } else {
      const currentInSeat = linearSeats[seatIndex];
      if (currentInSeat) {
        const newSeats = [...linearSeats];
        newSeats[seatIndex] = null;
        setLinearSeats(newSeats);
        setUnassignedItems([...unassignedItems, currentInSeat]);
      }
    }
  };

  const handleAssignToFloor = (floorNumber) => {
    if (puzzleChecked) return;
    if (selectedItemToPlace) {
      const prevFloor = Object.keys(floorAssignments).find(k => floorAssignments[k] === selectedItemToPlace);
      const newAssignments = { ...floorAssignments };
      if (prevFloor) delete newAssignments[prevFloor];

      const existingOnFloor = newAssignments[floorNumber];
      newAssignments[floorNumber] = selectedItemToPlace;
      setFloorAssignments(newAssignments);

      let newUnassigned = unassignedItems.filter(i => i !== selectedItemToPlace);
      if (existingOnFloor && existingOnFloor !== selectedItemToPlace) {
        newUnassigned.push(existingOnFloor);
      }
      setUnassignedItems(newUnassigned);
      setSelectedItemToPlace(null);
    } else {
      const currentOnFloor = floorAssignments[floorNumber];
      if (currentOnFloor) {
        const newAssignments = { ...floorAssignments };
        delete newAssignments[floorNumber];
        setFloorAssignments(newAssignments);
        setUnassignedItems([...unassignedItems, currentOnFloor]);
      }
    }
  };

  const checkPuzzleAnswer = () => {
    if (!currentPuzzle) return;
    setPuzzleChecked(true);

    let isCorrect = false;
    if (currentPuzzle.type === 'floor_puzzle') {
      const sol = currentPuzzle.floorSolution;
      isCorrect = Object.keys(sol).every(fl => floorAssignments[fl] === sol[fl]);
    } else {
      const sol = currentPuzzle.correctSolution;
      isCorrect = linearSeats.every((val, i) => val === sol[i]);
    }

    setIsPuzzleSolvedCorrectly(isCorrect);
    setShowReasoning(true);

    logPracticeSession({
      section: 'Logical Reasoning & Puzzles',
      topic: 'Analytical Puzzles',
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const switchPuzzle = (idx) => {
    setActivePuzzleIdx(idx);
    initPuzzle(puzzles[idx]);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Mode Switcher & Speed Drill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border-amber-200/50 dark:border-amber-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Logical Reasoning Practice
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              18 Topics · 490+ Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dedicated reasoning environment covering all High & Medium Priority topics with step-by-step logic and speed drills.
          </p>
        </div>

        {/* Tab Switcher & Speed Trainer Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {incorrectQuestions.length > 0 && !retryMode && (
            <button
              onClick={startRetryMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry Mistakes ({incorrectQuestions.length})
            </button>
          )}

          {retryMode && (
            <button
              onClick={exitRetryMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors"
            >
              Exit Retry Mode
            </button>
          )}

          <button
            onClick={() => startSpeedTrainer(120)}
            disabled={isSpeedTrainerActive}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            Speed Drill (2m)
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Topic Practice
            </button>
            <button
              onClick={() => setActiveTab('puzzles')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'puzzles'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Puzzle Studio
            </button>
          </div>
        </div>
      </div>

      {/* ================= 1. DEDICATED TOPIC PRACTICE TAB ================= */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          
          {/* Speed Trainer Active Overlay/Banner */}
          {isSpeedTrainerActive && (
            <div className="glass-card p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-400 dark:border-amber-600 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white animate-bounce">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                    Reasoning Speed Drill in Progress!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Solve questions as fast as possible. Selecting an answer immediately advances.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400">Solved</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">{speedSolvedCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">QPM</div>
                  <div className="text-lg font-black text-orange-600">{qpm}</div>
                </div>
                <div className="text-center bg-amber-500 text-white px-3.5 py-1.5 rounded-xl shadow-md">
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
                Speed Drill Completed!
              </h3>
              <div className="flex justify-center gap-8 py-2">
                <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{speedSolvedCount}</div>
                  <div className="text-xs text-slate-500">Total Solved</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">{speedCorrectCount}</div>
                  <div className="text-xs text-slate-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-600">
                    {speedSolvedCount > 0 ? ((speedCorrectCount / speedSolvedCount) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-xs text-slate-500">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-600">{qpm}</div>
                  <div className="text-xs text-slate-500">Questions/Min</div>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setSpeedTrainerFinished(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Return to Normal Practice
                </button>
                <button
                  onClick={() => startSpeedTrainer(120)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Try Again (2 min)
                </button>
              </div>
            </div>
          )}

          {/* 18-Topic Selector Grid */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Reasoning Topic (18 Specialized Modules)
                </span>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {questions.length} questions available
              </span>
            </div>

            {/* Quick Topic Chips with All */}
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Core High-Priority Placement Topics (1 - 10)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setSelectedTopic('All'); setSelectedSubtopic('All'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTopic === 'All'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All 18 Topics
                  </button>
                  {REASONING_TOPICS.core.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => { setSelectedTopic(topic.id); setSelectedSubtopic('All'); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedTopic === topic.id
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={topic.what}
                    >
                      <span className="opacity-60 text-[10px]">{topic.num}.</span>
                      <span>{topic.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Medium Priority Modules (11 - 18)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REASONING_TOPICS.medium.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => { setSelectedTopic(topic.id); setSelectedSubtopic('All'); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedTopic === topic.id
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={topic.what}
                    >
                      <span className="opacity-60 text-[10px]">{topic.num}.</span>
                      <span>{topic.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtopic & Difficulty Filters */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {activeTopicObj ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Subtopic:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedSubtopic('All')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedSubtopic === 'All'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    {activeTopicObj.subtopics.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubtopic(sub)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedSubtopic === sub
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Showing all topics combined
                </div>
              )}

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

          {/* Active Question Practice Card */}
          {loading ? (
            <div className="glass-card p-12 text-center text-slate-400">
              Loading reasoning questions...
            </div>
          ) : currentQ ? (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              
              {/* Question Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Question {currentIndex + 1} of {(retryMode ? incorrectQuestions : questions).length}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentQ.topic}
                  </span>
                  {currentQ.subtopic && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/60 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {currentQ.subtopic}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {currentQ.difficulty}
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
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={bookmarked ? "Bookmarked" : "Bookmark this question"}
                  >
                    {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let optionStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-300";

                  if (isAnswerSubmitted) {
                    if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500";
                    else if (isSelected && !isCorrect) optionStyle = "border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400";
                    else optionStyle = "border-slate-200 opacity-60";
                  } else if (isSelected) {
                    optionStyle = "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500 font-medium";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {letter}
                      </div>
                      <span className="flex-1 pt-0.5 leading-relaxed">{opt}</span>
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
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= (retryMode ? incorrectQuestions.length : questions.length) - 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>

                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${selectedAnswer === currentQ.correctAnswer ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {selectedAnswer === currentQ.correctAnswer ? '✓ Correct Solution' : '✗ Incorrect Answer'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step-by-Step Logic & Shortcut Trick Box */}
                {showExplanation && (
                  <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Step-by-Step Logical Solution & Shortcut:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-400">
              No questions found for the selected topic and level.
            </div>
          )}
        </div>
      )}

      {/* ================= 2. INTERACTIVE PUZZLE STUDIO TAB ================= */}
      {activeTab === 'puzzles' && currentPuzzle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Clues and Scenario */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {currentPuzzle.difficulty} Puzzle
              </span>
              <div className="flex items-center gap-1">
                {puzzles.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => switchPuzzle(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activePuzzleIdx === idx 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {currentPuzzle.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {currentPuzzle.scenario}
            </p>

            {/* Clues Checklist */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Condition Constraints & Clues:</span>
              </div>
              <div className="space-y-2">
                {currentPuzzle.clues.map((clue, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveClueHint(activeClueHint === idx ? null : idx)}
                    className={`p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                      activeClueHint === idx 
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-amber-600 shrink-0">#{idx + 1}</span>
                      <span>{clue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 italic">
              💡 Tip: Click any person below to select, then click an empty slot or floor to assign them.
            </div>
          </div>

          {/* Right Column: Visual Puzzle Solver Interactive Area */}
          <div className="lg:col-span-2 glass-card p-6 space-y-6 flex flex-col justify-between">
            <div>
              {/* Unassigned Candidate Chips */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-500 mb-2">
                  Unassigned Candidates (Click to select, then click position):
                </div>
                <div className="flex flex-wrap gap-2">
                  {unassignedItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedItemToPlace(selectedItemToPlace === item ? null : item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
                        selectedItemToPlace === item 
                          ? 'bg-amber-500 text-white ring-4 ring-amber-300 dark:ring-amber-800 scale-105' 
                          : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  {unassignedItems.length === 0 && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> All candidates assigned! Click 'Verify Solution' below.
                    </span>
                  )}
                </div>
              </div>

              {/* VISUAL LAYOUT BASED ON PUZZLE TYPE */}
              {currentPuzzle.type === 'linear_seating' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                    ← Left extreme (Seat 1) · · · Right extreme (Seat 5) →
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {linearSeats.map((occupant, seatIdx) => (
                      <div
                        key={seatIdx}
                        onClick={() => handleAssignToLinearSeat(seatIdx)}
                        className={`h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-between p-3 transition-all cursor-pointer select-none ${
                          occupant 
                            ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 shadow-md' 
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-amber-300'
                        } ${puzzleChecked ? (occupant === currentPuzzle.correctSolution[seatIdx] ? 'ring-2 ring-emerald-500' : 'ring-2 ring-rose-400') : ''}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400">
                          {currentPuzzle.labels[seatIdx]}
                        </span>
                        
                        {occupant ? (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            {occupant}
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-slate-400">
                            Empty
                          </div>
                        )}

                        <span className="text-[10px] text-slate-400">
                          {occupant ? 'Tap to remove' : 'Tap to place'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CIRCULAR SEATING */}
              {currentPuzzle.type === 'circular_seating' && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-amber-300 dark:border-amber-800 flex items-center justify-center bg-amber-50/20 dark:bg-amber-950/10">
                    <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-center p-3 text-xs font-bold text-slate-500">
                      Center of Conference Table
                    </div>

                    {linearSeats.map((occupant, seatIdx) => {
                      const angle = (seatIdx * (360 / currentPuzzle.slots)) - 90;
                      const rad = (angle * Math.PI) / 180;
                      const radius = 125;
                      const x = Math.round(radius * Math.cos(rad));
                      const y = Math.round(radius * Math.sin(rad));

                      return (
                        <div
                          key={seatIdx}
                          onClick={() => handleAssignToLinearSeat(seatIdx)}
                          style={{
                            transform: `translate(${x}px, ${y}px)`
                          }}
                          className={`absolute w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer shadow-md select-none transition-transform hover:scale-110 ${
                            occupant 
                              ? 'bg-amber-500 border-amber-600 text-white' 
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                          } ${puzzleChecked ? (occupant === currentPuzzle.correctSolution[seatIdx] ? 'ring-4 ring-emerald-500' : 'ring-4 ring-rose-500') : ''}`}
                          title={currentPuzzle.labels[seatIdx]}
                        >
                          <span className="text-xs font-bold">{occupant || (seatIdx + 1)}</span>
                          <span className="text-[8px] opacity-75">{occupant ? 'Seat' : 'Open'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5-FLOOR BUILDING PUZZLE */}
              {currentPuzzle.type === 'floor_puzzle' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Infosys Tech Tower (Floor 5 Top down to Floor 1 Bottom):
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((floorNum) => {
                      const occupant = floorAssignments[floorNum];
                      const isCorrect = puzzleChecked && occupant === currentPuzzle.floorSolution[floorNum];
                      const isWrong = puzzleChecked && occupant && occupant !== currentPuzzle.floorSolution[floorNum];

                      return (
                        <div
                          key={floorNum}
                          onClick={() => handleAssignToFloor(floorNum)}
                          className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer select-none ${
                            occupant 
                              ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 shadow-sm' 
                              : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-amber-300'
                          } ${puzzleChecked ? (isCorrect ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : (isWrong ? 'ring-2 ring-rose-400 bg-rose-50/30' : '')) : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 font-extrabold text-xs flex items-center justify-center text-slate-700 dark:text-slate-200">
                              F{floorNum}
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {floorNum === 5 ? 'Topmost Floor' : (floorNum === 1 ? 'Ground Floor' : `Floor ${floorNum}`)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {occupant ? (
                              <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-xs">
                                {occupant}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Click to Assign</span>
                            )}
                            {puzzleChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {puzzleChecked && isWrong && <XCircle className="w-4 h-4 text-rose-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions for Puzzle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => initPuzzle(currentPuzzle)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Layout
                </button>

                <button
                  onClick={checkPuzzleAnswer}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Verify Solution
                </button>
              </div>

              {/* Solution feedback */}
              {showReasoning && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isPuzzleSolvedCorrectly 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    {isPuzzleSolvedCorrectly ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Flawless deduction! Perfect arrangement.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Arrangement does not satisfy all constraints.</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">
                    <strong>Solution Logic: </strong>{currentPuzzle.reasoningExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
