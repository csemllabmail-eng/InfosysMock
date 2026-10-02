import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Users, Building2, HelpCircle, 
  Sparkles, CheckCircle2, XCircle, RotateCcw, 
  ArrowRight, Bookmark, BookmarkCheck, Lightbulb, 
  Layers, Shuffle, Check
} from 'lucide-react';
import { 
  fetchQuestions, fetchInteractivePuzzles, 
  toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

export default function ReasoningSection() {
  const [activeTab, setActiveTab] = useState('puzzles'); // 'puzzles' | 'mcq'
  const [puzzles, setPuzzles] = useState([]);
  const [activePuzzleIdx, setActivePuzzleIdx] = useState(0);

  // Interactive puzzle state
  const [linearSeats, setLinearSeats] = useState([]); // array of placed candidates
  const [floorAssignments, setFloorAssignments] = useState({}); // floorNum -> person
  const [unassignedItems, setUnassignedItems] = useState([]);
  const [selectedItemToPlace, setSelectedItemToPlace] = useState(null);
  const [puzzleChecked, setPuzzleChecked] = useState(false);
  const [isPuzzleSolvedCorrectly, setIsPuzzleSolvedCorrectly] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeClueHint, setActiveClueHint] = useState(null);

  // MCQ practice state
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDifficulty]);

  async function loadData() {
    setLoading(true);
    const puzList = await fetchInteractivePuzzles();
    const qList = await fetchQuestions({ 
      section: 'Logical Reasoning & Puzzles',
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
    });
    
    setPuzzles(puzList);
    setMcqQuestions(qList);
    setMcqIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    
    if (puzList.length > 0 && puzzles.length === 0) {
      initPuzzle(puzList[0]);
    }
    if (qList.length > 0) {
      setBookmarked(isQuestionBookmarked(qList[0].id));
    }
    setLoading(false);
  }

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
      // Linear or circular seats
      setLinearSeats(Array(puzzle.slots).fill(null));
      setUnassignedItems([...puzzle.items]);
    }
  }

  const currentPuzzle = puzzles[activePuzzleIdx];
  const currentMcq = mcqQuestions[mcqIndex];

  // Puzzle slot placement logic
  const handleAssignToLinearSeat = (seatIndex) => {
    if (puzzleChecked) return;
    if (selectedItemToPlace) {
      // Place selected item
      const newSeats = [...linearSeats];
      const previousSeat = newSeats.indexOf(selectedItemToPlace);
      if (previousSeat > -1) {
        newSeats[previousSeat] = null;
      }
      // If current seat has an item, return it to unassigned
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
      // Clicking an occupied seat unassigns it
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

  // MCQ Handlers
  const handleSelectMcqOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitMcq = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === currentMcq.correctAnswer;
    logPracticeSession({
      section: 'Logical Reasoning & Puzzles',
      topic: currentMcq.topic,
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const handleNextMcq = () => {
    if (mcqIndex + 1 < mcqQuestions.length) {
      const next = mcqIndex + 1;
      setMcqIndex(next);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setBookmarked(isQuestionBookmarked(mcqQuestions[next].id));
    }
  };

  const handlePrevMcq = () => {
    if (mcqIndex > 0) {
      const prev = mcqIndex - 1;
      setMcqIndex(prev);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setBookmarked(isQuestionBookmarked(mcqQuestions[prev].id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Tabs */}
      <div className="glass-card p-6 border-amber-200/50 dark:border-amber-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Logical Reasoning & Puzzles
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              Interactive Solvers + 285 Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive visual seating, 5-floor building puzzles, blood relations, direction sense, and syllogisms.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('puzzles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'puzzles' 
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Interactive Puzzle Studio
          </button>
          <button
            onClick={() => setActiveTab('mcq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'mcq' 
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Practice Questions ({mcqQuestions.length})
          </button>
        </div>
      </div>

      {/* ================= 1. INTERACTIVE PUZZLE STUDIO ================= */}
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
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
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

                    {/* Circular Slots around the table */}
                    {linearSeats.map((occupant, seatIdx) => {
                      const angle = (seatIdx * (360 / currentPuzzle.slots)) - 90;
                      const rad = (angle * Math.PI) / 180;
                      const radius = 125; // px from center
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
                          className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            occupant 
                              ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30' 
                              : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-300'
                          } ${isCorrect ? 'border-emerald-500 bg-emerald-50/50' : ''} ${isWrong ? 'border-rose-400 bg-rose-50/50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-16 text-xs font-bold text-slate-400">
                              Floor {floorNum} {floorNum === 5 ? '(Top)' : floorNum === 1 ? '(Bottom)' : ''}
                            </span>
                            
                            {occupant ? (
                              <div className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs">
                                <Users className="w-3.5 h-3.5" />
                                {occupant}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Empty floor · Click to assign
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isCorrect && (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct
                              </span>
                            )}
                            {isWrong && (
                              <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Misplaced
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              {occupant ? 'Tap to clear' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Puzzle Controls and Feedback */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => initPuzzle(currentPuzzle)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Puzzle
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={checkPuzzleAnswer}
                    disabled={unassignedItems.length > 0}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Verify Solution
                  </button>
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {showReasoning ? "Hide Reasoning" : "Reveal Logic"}
                  </button>
                </div>
              </div>

              {/* Verified Feedback Banner */}
              {puzzleChecked && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  isPuzzleSolvedCorrectly 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-800 dark:text-rose-300'
                }`}>
                  {isPuzzleSolvedCorrectly ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Outstanding! Your visual spatial arrangement matches all Infosys constraint conditions perfectly.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>One or more constraints were violated. Review the highlighted clues or reveal step-by-step logic below.</span>
                    </>
                  )}
                </div>
              )}

              {/* Step-by-step deduction breakdown */}
              {showReasoning && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
                  <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Step-by-Step Analytical Deductions:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {currentPuzzle.reasoning}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ================= 2. MCQ PRACTICE TAB ================= */}
      {activeTab === 'mcq' && (
        <div className="space-y-4">
          {/* Level Filter Bar */}
          <div className="glass-card p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Level:</span>
              {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDifficulty === diff 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">
              Found {mcqQuestions.length} Questions
            </span>
          </div>

          {currentMcq ? (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Question {mcqIndex + 1} of {mcqQuestions.length}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {currentMcq.topic} · {currentMcq.subtopic}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {currentMcq.difficulty}
                  </span>
                </div>

            <button
              onClick={async () => {
                const res = await toggleBookmark(currentMcq.id);
                setBookmarked(res.isBookmarked);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                bookmarked 
                  ? 'bg-amber-50 border-amber-300 text-amber-500' 
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentMcq.question}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {currentMcq.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentMcq.correctAnswer;

              let optionStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-amber-300";

              if (isAnswerSubmitted) {
                if (isCorrect) optionStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500";
                else if (isSelected && !isCorrect) optionStyle = "border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 ring-1 ring-rose-400";
                else optionStyle = "border-slate-200 opacity-60";
              } else if (isSelected) {
                optionStyle = "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500 font-medium";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectMcqOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {letter}
                  </div>
                  <span className="flex-1">{opt}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMcq}
                disabled={mcqIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleNextMcq}
                disabled={mcqIndex >= mcqQuestions.length - 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitMcq}
                disabled={selectedAnswer === null}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <div className="text-xs text-slate-500">
                {currentMcq.explanation}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-slate-400">
          No questions found matching this level.
        </div>
      )}
    </div>
  )}

</div>
  );
}
