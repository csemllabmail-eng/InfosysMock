import React, { useState, useEffect } from 'react';
import { 
  Languages, BookOpen, Sparkles, CheckCircle2, XCircle, 
  RotateCcw, ArrowRight, Bookmark, BookmarkCheck, 
  HelpCircle, Volume2, Award, FileText, ChevronRight
} from 'lucide-react';
import { 
  fetchQuestions, toggleBookmark, isQuestionBookmarked, 
  logPracticeSession 
} from '../../services/api';

export default function VerbalSection() {
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'flashcards' | 'trainer'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Question practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Session stats for Verbal Trainer (100% genuine user performance)
  const [trainerStats, setTrainerStats] = useState({
    grammarAttempted: 0,
    grammarCorrect: 0,
    vocabAttempted: 0,
    vocabCorrect: 0,
    rcAttempted: 0,
    rcCorrect: 0,
    mistakes: []
  });

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());

  // High-frequency Infosys vocabulary flashcard seed
  const vocabCards = [
    {
      word: "Capricious",
      type: "adjective",
      pronunciation: "/kəˈprɪʃəs/",
      meaning: "Given to sudden and unaccountable changes of mood or behavior; fickle.",
      example: "The market's capricious behavior made long-term forecasting unpredictable.",
      synonyms: ["fickle", "volatile", "impulsive", "mercurial"],
      antonyms: ["stable", "consistent", "predictable"]
    },
    {
      word: "Obviate",
      type: "verb",
      pronunciation: "/ˈɒbvɪeɪt/",
      meaning: "To remove a need or difficulty; avoid or prevent.",
      example: "Automated regression pipelines obviate the need for manual testing passes.",
      synonyms: ["preclude", "prevent", "eliminate", "forestall"],
      antonyms: ["necessitate", "require", "induce"]
    },
    {
      word: "Parsimonious",
      type: "adjective",
      pronunciation: "/ˌpɑːsɪˈməʊnɪəs/",
      meaning: "Very unwilling to spend money or use resources; frugal or stingy.",
      example: "The parsimonious microservice design conserved precious heap memory.",
      synonyms: ["frugal", "economical", "thrifty", "sparing"],
      antonyms: ["extravagant", "wasteful", "lavish"]
    },
    {
      word: "Unequivocal",
      type: "adjective",
      pronunciation: "/ˌʌnɪˈkwɪvəkəl/",
      meaning: "Leaving no doubt; clear and unambiguous.",
      example: "The audit findings delivered an unequivocal recommendation to refactor legacy modules.",
      synonyms: ["unmistakable", "indisputable", "clear-cut", "explicit"],
      antonyms: ["ambiguous", "equivocal", "vague"]
    },
    {
      word: "Tenuous",
      type: "adjective",
      pronunciation: "/ˈtɛnjʊəs/",
      meaning: "Very weak or slight; having little substance.",
      example: "The link between the two reported incidents remained tenuous at best.",
      synonyms: ["flimsy", "fragile", "shaky", "doubtful"],
      antonyms: ["solid", "strong", "substantial"]
    },
    {
      word: "Intransigent",
      type: "adjective",
      pronunciation: "/ɪnˈtrænsɪdʒənt/",
      meaning: "Unwilling or refusing to change one's views or to agree about something.",
      example: "Despite pushback from stakeholders, the architect remained intransigent on system security.",
      synonyms: ["uncompromising", "stubborn", "inflexible", "obstinate"],
      antonyms: ["amenable", "flexible", "compliant"]
    }
  ];

  // Grammar Rules Reference Cards
  const grammarRules = [
    {
      title: "1. Either... Or / Neither... Nor Agreement",
      rule: "When subjects are joined by 'or' or 'nor', the verb agrees with the subject closest to it.",
      example: "Neither the manager nor the engineers were present. / Neither the engineers nor the manager was present."
    },
    {
      title: "2. Inverted Conditionals & 'Had'",
      rule: "'Had' + Subject + Past Participle in third conditional: 'Had they known, they would have acted.' Do NOT say 'Had they had known'.",
      example: "Correct: Had the auditors detected the error earlier, the outage would have been averted."
    },
    {
      title: "3. Dangling Modifiers",
      rule: "An introductory participial phrase must immediately modify the noun that performs the action.",
      example: "Incorrect: Walking to office, the rain poured down. Correct: While I was walking to the office, the rain poured down."
    }
  ];

  useEffect(() => {
    loadVerbalQuestions();
  }, [selectedTopic, selectedDifficulty]);

  async function loadVerbalQuestions() {
    setLoading(true);
    let list = await fetchQuestions({
      section: 'Verbal Ability',
      topic: selectedTopic !== 'All' ? selectedTopic : undefined,
      difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined
    });
    if (list.length === 0) {
      list = await fetchQuestions({ section: 'Verbal Ability' });
    }
    setQuestions(list);
    setCurrentIndex(0);
    resetState(list[0]);
    setLoading(false);
  }

  function resetState(q) {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    if (q) {
      setBookmarked(isQuestionBookmarked(q.id));
    }
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    const isCorrect = selectedAnswer === currentQ.correctAnswer;

    // Track for verbal ability trainer
    if (currentQ.topic === "Grammar") {
      setTrainerStats(prev => ({
        ...prev,
        grammarAttempted: prev.grammarAttempted + 1,
        grammarCorrect: prev.grammarCorrect + (isCorrect ? 1 : 0),
        mistakes: !isCorrect 
          ? [{ rule: currentQ.subtopic || currentQ.topic, note: currentQ.explanation ? currentQ.explanation.split('.')[0] + '.' : "Review rule for this question." }, ...prev.mistakes.filter(m => m.rule !== (currentQ.subtopic || currentQ.topic)).slice(0, 4)]
          : prev.mistakes
      }));
    } else if (currentQ.topic === "Vocabulary") {
      setTrainerStats(prev => ({
        ...prev,
        vocabAttempted: prev.vocabAttempted + 1,
        vocabCorrect: prev.vocabCorrect + (isCorrect ? 1 : 0),
        mistakes: !isCorrect 
          ? [{ rule: `Vocab: ${currentQ.subtopic || 'Word Meaning'}`, note: currentQ.explanation ? currentQ.explanation.split('.')[0] + '.' : "Check synonyms and usage." }, ...prev.mistakes.filter(m => m.rule !== (currentQ.subtopic || currentQ.topic)).slice(0, 4)]
          : prev.mistakes
      }));
    } else {
      setTrainerStats(prev => ({
        ...prev,
        rcAttempted: prev.rcAttempted + 1,
        rcCorrect: prev.rcCorrect + (isCorrect ? 1 : 0),
        mistakes: !isCorrect 
          ? [{ rule: `RC: ${currentQ.subtopic || 'Comprehension'}`, note: "Re-read context clues carefully before selecting options." }, ...prev.mistakes.slice(0, 4)]
          : prev.mistakes
      }));
    }

    logPracticeSession({
      section: 'Verbal Ability',
      topic: currentQ.topic,
      total: 1,
      correct: isCorrect ? 1 : 0
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetState(questions[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      resetState(questions[prevIdx]);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentQ) return;
    const res = await toggleBookmark(currentQ.id);
    setBookmarked(res.isBookmarked);
  };

  // Flashcards navigation
  const nextCard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev + 1) % vocabCards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev - 1 + vocabCards.length) % vocabCards.length);
  };

  const toggleMastered = (idx) => {
    setMasteredCards(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const currentFlashcard = vocabCards[flashcardIndex];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Sub-Tabs */}
      <div className="glass-card p-6 border-purple-200/50 dark:border-purple-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md shadow-purple-500/25">
              <Languages className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Verbal Ability Section
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              300 Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Master grammar rules, sentence corrections, high-frequency vocabulary flashcards, and critical reading.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'practice' 
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Practice Questions
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'flashcards' 
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Vocab Flashcards ({vocabCards.length})
          </button>
          <button
            onClick={() => setActiveTab('trainer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'trainer' 
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Verbal Ability Trainer
          </button>
        </div>
      </div>

      {/* ================= 1. PRACTICE TAB ================= */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          
          {/* Topic Filters */}
          <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Topic:</span>
              {['All', 'Grammar', 'Vocabulary', 'Reading and Comprehension', 'Sentence and Paragraph Skills'].map(top => (
                <button
                  key={top}
                  onClick={() => setSelectedTopic(top)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedTopic === top 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Level:</span>
              {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDifficulty === diff 
                      ? 'bg-purple-600 text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Card */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !currentQ ? (
            <div className="glass-card p-12 text-center text-slate-500">
              No verbal questions found matching this filter.
            </div>
          ) : (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {currentQ.topic} · {currentQ.subtopic}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {currentQ.difficulty}
                  </span>
                </div>

                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl border transition-colors ${
                    bookmarked 
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-500' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                  }`}
                  title={bookmarked ? "Bookmarked" : "Bookmark this question"}
                >
                  {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let optionStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-purple-300 dark:hover:border-purple-700";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500";
                    } else if (isSelected && !isCorrect) {
                      optionStyle = "border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400";
                    } else {
                      optionStyle = "border-slate-200 dark:border-slate-700 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 ring-1 ring-purple-500 font-medium";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left text-sm transition-all cursor-pointer ${optionStyle}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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

              {/* Navigation & Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= questions.length - 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {showExplanation ? "Hide Explanation" : "Show Grammar Rationale"}
                    </button>
                  )}
                </div>
              </div>

              {/* Explanation & Rules */}
              {showExplanation && (
                <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-800 dark:text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Grammar Rule & Linguistic Explanation:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-800 text-[11px] text-slate-600 dark:text-slate-400">
                    🔍 <span className="font-semibold text-slate-800 dark:text-slate-200">Infosys SE Verbal Pattern:</span> Sentence correction and para-jumble items test subject-verb distance, tense parallelism (such as sequence of past perfect with simple past), and modifier dangling. Always locate the genuine main clause subject first.
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ================= 2. FLASHCARDS TAB ================= */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Infosys High-Frequency Vocabulary Cards
              </h2>
              <p className="text-xs text-slate-500">
                Click the card to flip and reveal meaning, example sentence, and synonyms.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
              Card {flashcardIndex + 1} of {vocabCards.length}
            </span>
          </div>

          {/* Interactive Flip Card */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] rounded-3xl p-8 cursor-pointer transition-all duration-300 select-none bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-800 shadow-xl flex flex-col justify-between hover:scale-[1.01]"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
                <span className="uppercase font-bold tracking-wider">{currentFlashcard.type}</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Click to Flip
                </span>
              </div>

              {!isFlipped ? (
                /* Card Front */
                <div className="text-center py-8">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
                    {currentFlashcard.word}
                  </h3>
                  <p className="text-sm font-mono text-purple-600 dark:text-purple-400">
                    {currentFlashcard.pronunciation}
                  </p>
                  <p className="text-xs text-slate-400 mt-6 italic">
                    Tap to reveal definition, synonyms & usage
                  </p>
                </div>
              ) : (
                /* Card Back */
                <div className="space-y-4 py-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Meaning</span>
                    <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed mt-0.5">
                      {currentFlashcard.meaning}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Example in Tech Context</span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mt-0.5">
                      "{currentFlashcard.example}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Synonyms</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentFlashcard.synonyms.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Antonyms</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentFlashcard.antonyms.map((a, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-purple-100 dark:border-purple-900/60">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMastered(flashcardIndex); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  masteredCards.has(flashcardIndex) 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-600' 
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {masteredCards.has(flashcardIndex) ? "Mastered" : "Mark as Mastered"}
              </button>

              <span className="text-xs text-slate-400">
                {masteredCards.size} of {vocabCards.length} Mastered
              </span>
            </div>
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevCard}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Previous Word
            </button>
            <button
              onClick={nextCard}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-colors"
            >
              Next Word
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. VERBAL ABILITY TRAINER TAB ================= */}
      {activeTab === 'trainer' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border-purple-200/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Verbal Diagnostic & Revision Trainer
            </h2>
            <p className="text-xs text-slate-500">
              Real-time diagnosis of grammatical accuracy, vocabulary breadth, and reading comprehension error rates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">Grammar Accuracy</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {trainerStats.grammarAttempted > 0 ? `${Math.round((trainerStats.grammarCorrect / trainerStats.grammarAttempted) * 100)}%` : '0%'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {trainerStats.grammarCorrect} of {trainerStats.grammarAttempted} correct
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase">Vocabulary Accuracy</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {trainerStats.vocabAttempted > 0 ? `${Math.round((trainerStats.vocabCorrect / trainerStats.vocabAttempted) * 100)}%` : '0%'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {trainerStats.vocabCorrect} of {trainerStats.vocabAttempted} correct
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
                <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase">Reading Comprehension</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {trainerStats.rcAttempted > 0 ? `${Math.round((trainerStats.rcCorrect / trainerStats.rcAttempted) * 100)}%` : '0%'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {trainerStats.rcCorrect} of {trainerStats.rcAttempted} correct
                </div>
              </div>
            </div>

            {/* Frequently Repeated Mistakes & Remediation */}
            <div className="space-y-3 mt-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Frequently Repeated Mistakes & Targeted Review:
              </h3>
              {trainerStats.mistakes.length > 0 ? (
                trainerStats.mistakes.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{m.rule}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">{m.note}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-center">
                  Solve practice questions in the Practice tab to diagnose and log your personal weak spots.
                </div>
              )}
            </div>

            {/* Quick Grammar Rules Checklist */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Core Infosys SE Grammar Rules Checklist:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {grammarRules.map((gr, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="font-bold text-purple-600 dark:text-purple-400">{gr.title}</div>
                    <p className="text-slate-600 dark:text-slate-300">{gr.rule}</p>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 italic">
                      {gr.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
