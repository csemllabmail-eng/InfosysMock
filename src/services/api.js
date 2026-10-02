import defaultQuestions from '../data/questions.json';
import defaultMockTests from '../data/mockTests.json';
import defaultTracing from '../data/codeTracingData.json';
import defaultPuzzles from '../data/interactivePuzzles.json';
import defaultNotes from '../data/studyNotes.json';

// Client-Side Only Data Architecture:
// Every user's data (test scores, bookmarks, attempts) is strictly stored
// inside their own browser's localStorage. No central database is used,
// guaranteeing 100% privacy and zero cross-user data leakage.

// Local Storage keys (scoped to the individual user's browser)
const LS_KEYS = {
  BOOKMARKS: 'prepforge_bookmarks',
  ATTEMPTS: 'prepforge_attempts',
  PRACTICE: 'prepforge_practice',
  DAILY_GOAL: 'prepforge_daily_goal',
  CUSTOM_QUESTIONS: 'prepforge_custom_questions',
  DARK_MODE: 'prepforge_dark_mode'
};

// Safe LS read/write
const getLocal = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocal = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

// Initial state helpers - starts completely fresh with no fake/dummy scores
const getStoredBookmarks = () => getLocal(LS_KEYS.BOOKMARKS, []);
const getStoredAttempts = () => getLocal(LS_KEYS.ATTEMPTS, []);
const getStoredPractice = () => getLocal(LS_KEYS.PRACTICE, []);

const getStoredDailyGoal = () => getLocal(LS_KEYS.DAILY_GOAL, {
  targetQuestions: 30,
  completedToday: 0,
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0]
});

// Combine default questions with custom user added questions
export const getAllQuestions = () => {
  const custom = getLocal(LS_KEYS.CUSTOM_QUESTIONS, []);
  return [...custom, ...defaultQuestions];
};

export const fetchQuestions = async ({ section, topic, difficulty, search } = {}) => {
  let list = getAllQuestions();

  if (section && section !== 'All') {
    list = list.filter(q => q.section.toLowerCase() === section.toLowerCase());
  }
  if (topic && topic !== 'All') {
    list = list.filter(q => 
      q.topic.toLowerCase() === topic.toLowerCase() || 
      q.subtopic.toLowerCase() === topic.toLowerCase()
    );
  }
  if (difficulty && difficulty !== 'All') {
    const dLower = difficulty.toLowerCase();
    list = list.filter(q => {
      const qd = (q.difficulty || '').toLowerCase();
      if (dLower === 'easy' || dLower === 'beginner') {
        return qd === 'easy' || qd === 'beginner';
      }
      if (dLower === 'medium' || dLower === 'intermediate' || dLower === 'moderate') {
        return qd === 'medium' || qd === 'intermediate' || qd === 'moderate';
      }
      if (dLower === 'hard' || dLower === 'advanced') {
        return qd === 'hard' || qd === 'advanced';
      }
      return qd === dLower;
    });
  }
  if (search) {
    const qTerm = search.toLowerCase();
    list = list.filter(q => 
      q.question.toLowerCase().includes(qTerm) ||
      (q.explanation && q.explanation.toLowerCase().includes(qTerm)) ||
      (q.topic && q.topic.toLowerCase().includes(qTerm)) ||
      (q.subtopic && q.subtopic.toLowerCase().includes(qTerm))
    );
  }

  return list;
};

export const fetchQuestionById = async (id) => {
  const all = getAllQuestions();
  return all.find(q => q.id === id) || null;
};

export const addCustomQuestion = async (qData) => {
  const custom = getLocal(LS_KEYS.CUSTOM_QUESTIONS, []);
  const newQ = {
    id: `INFOSYS-CUSTOM-${Date.now()}`,
    section: qData.section || "Quantitative Aptitude",
    topic: qData.topic || "Arithmetic",
    subtopic: qData.subtopic || "General",
    question: qData.question,
    codeSnippet: qData.codeSnippet || null,
    options: qData.options || [],
    correctAnswer: parseInt(qData.correctAnswer || 0),
    explanation: qData.explanation || "",
    difficulty: qData.difficulty || "Intermediate",
    recommendedTime: parseInt(qData.recommendedTime || 60),
    tags: ["custom", ...(qData.tags || [])]
  };
  custom.unshift(newQ);
  setLocal(LS_KEYS.CUSTOM_QUESTIONS, custom);

  return newQ;
};

export const importQuestionsJSON = async (jsonList) => {
  if (!Array.isArray(jsonList)) return 0;
  const custom = getLocal(LS_KEYS.CUSTOM_QUESTIONS, []);
  let count = 0;
  jsonList.forEach((item, idx) => {
    if (item.question && Array.isArray(item.options)) {
      custom.unshift({
        id: item.id || `IMPORT-${Date.now()}-${idx}`,
        section: item.section || "Quantitative Aptitude",
        topic: item.topic || "General",
        subtopic: item.subtopic || "General",
        question: item.question,
        codeSnippet: item.codeSnippet || null,
        options: item.options,
        correctAnswer: item.correctAnswer || 0,
        explanation: item.explanation || "",
        difficulty: item.difficulty || "Intermediate",
        recommendedTime: item.recommendedTime || 60,
        tags: item.tags || ["imported"]
      });
      count++;
    }
  });
  setLocal(LS_KEYS.CUSTOM_QUESTIONS, custom);
  return count;
};

export const deleteQuestion = async (id) => {
  const custom = getLocal(LS_KEYS.CUSTOM_QUESTIONS, []);
  const updated = custom.filter(q => q.id !== id);
  setLocal(LS_KEYS.CUSTOM_QUESTIONS, updated);
  return true;
};

// Mock Tests
export const fetchMockTests = async () => {
  return defaultMockTests;
};

export const fetchMockTestDetails = async (testId) => {
  const test = defaultMockTests.find(t => t.id === testId);
  if (!test) return null;
  const all = getAllQuestions();
  const qMap = new Map(all.map(q => [q.id, q]));
  const questions = test.questionIds.map(id => qMap.get(id)).filter(Boolean);
  return { ...test, questions };
};

export const generateCustomTest = async ({ sections, questionCount, difficulty, timeLimitMinutes }) => {
  let pool = getAllQuestions();
  if (sections && sections.length > 0) {
    pool = pool.filter(q => sections.includes(q.section));
  }
  if (difficulty && difficulty !== "All") {
    pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  pool = [...pool].sort(() => 0.5 - Math.random());
  const selected = pool.slice(0, Math.min(questionCount || 20, pool.length));

  return {
    id: `CUSTOM-${Date.now()}`,
    title: `Custom Test (${selected.length} Qs)`,
    description: `Targeted practice for ${sections && sections.length > 0 ? sections.join(", ") : "All Topics"}.`,
    durationMinutes: timeLimitMinutes || 30,
    totalQuestions: selected.length,
    questionIds: selected.map(q => q.id),
    questions: selected,
    isCustom: true
  };
};

export const generateMistakesTest = async () => {
  const attempts = getStoredAttempts();
  const wrongIds = new Set();
  attempts.forEach(a => {
    if (a.wrongQuestionIds) {
      a.wrongQuestionIds.forEach(id => wrongIds.add(id));
    }
  });

  const all = getAllQuestions();
  let pool = all.filter(q => wrongIds.has(q.id));
  if (pool.length === 0) {
    // Pick 15 challenging questions as smart fallback
    pool = all.filter(q => q.difficulty === "Advanced").slice(0, 15);
  }

  return {
    id: `MISTAKES-${Date.now()}`,
    title: `Previous Mistakes Revision Test (${pool.length} Qs)`,
    description: `Targeted remediation on questions previously missed or tagged for revision.`,
    durationMinutes: Math.max(15, pool.length * 1.5),
    totalQuestions: pool.length,
    questionIds: pool.map(q => q.id),
    questions: pool,
    isCustom: true
  };
};

// Attempts
export const saveAttempt = async (attemptData) => {
  const attempts = getStoredAttempts();
  const newAttempt = {
    id: `ATTEMPT-${Date.now()}`,
    date: new Date().toISOString(),
    ...attemptData
  };
  attempts.unshift(newAttempt);
  setLocal(LS_KEYS.ATTEMPTS, attempts);

  // Update daily goal
  const dailyGoal = getStoredDailyGoal();
  dailyGoal.completedToday += (attemptData.totalQuestions || 0);
  setLocal(LS_KEYS.DAILY_GOAL, dailyGoal);

  return newAttempt;
};

export const fetchAttempts = async () => {
  return getStoredAttempts();
};

// Bookmarks
export const fetchBookmarks = async () => {
  const ids = new Set(getStoredBookmarks());
  const all = getAllQuestions();
  return all.filter(q => ids.has(q.id));
};

export const toggleBookmark = async (questionId) => {
  const bookmarks = getStoredBookmarks();
  const idx = bookmarks.indexOf(questionId);
  let isBookmarked = false;
  if (idx > -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(questionId);
    isBookmarked = true;
  }
  setLocal(LS_KEYS.BOOKMARKS, bookmarks);

  return { isBookmarked, bookmarks };
};

export const isQuestionBookmarked = (questionId) => {
  const b = getStoredBookmarks();
  return b.includes(questionId);
};

// Code Tracing & Puzzles
export const fetchCodeTracingData = async () => {
  return defaultTracing;
};

export const fetchInteractivePuzzles = async () => {
  return defaultPuzzles;
};

export const fetchStudyNotes = async () => {
  return defaultNotes;
};

// Daily Goal & Profile
export const fetchDailyGoal = async () => {
  return getStoredDailyGoal();
};

export const updateDailyGoalTarget = async (newTarget) => {
  const dg = getStoredDailyGoal();
  dg.targetQuestions = newTarget;
  setLocal(LS_KEYS.DAILY_GOAL, dg);
  return dg;
};

// Analytics Computation
export const fetchAnalyticsData = async () => {
  const attempts = getStoredAttempts();
  const practice = getLocal(LS_KEYS.PRACTICE, []);
  const dailyGoal = getStoredDailyGoal();

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalTimeSeconds = 0;

  attempts.forEach(a => {
    totalQuestionsAttempted += (a.totalQuestions - (a.unattemptedCount || 0));
    totalCorrect += (a.correctCount || 0);
    totalTimeSeconds += (a.timeSpentSeconds || 0);
  });

  practice.forEach(p => {
    totalQuestionsAttempted += (p.total || 0);
    totalCorrect += (p.correct || 0);
  });

  const overallAccuracy = totalQuestionsAttempted > 0 
    ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) 
    : 0;

  const allQs = getAllQuestions();
  const totalQuestionsInBank = allQs.length;

  const sectionCounts = {
    "Quantitative Aptitude": allQs.filter(q => q.section === "Quantitative Aptitude").length,
    "Verbal Ability": allQs.filter(q => q.section === "Verbal Ability").length,
    "Logical Reasoning & Puzzles": allQs.filter(q => q.section === "Logical Reasoning & Puzzles").length,
    "Pseudocode & Programming Logic": allQs.filter(q => q.section === "Pseudocode & Programming Logic").length
  };

  const sectionStats = {
    "Quantitative Aptitude": { totalAvailable: sectionCounts["Quantitative Aptitude"], completed: 0, correct: 0 },
    "Verbal Ability": { totalAvailable: sectionCounts["Verbal Ability"], completed: 0, correct: 0 },
    "Logical Reasoning & Puzzles": { totalAvailable: sectionCounts["Logical Reasoning & Puzzles"], completed: 0, correct: 0 },
    "Pseudocode & Programming Logic": { totalAvailable: sectionCounts["Pseudocode & Programming Logic"], completed: 0, correct: 0 }
  };

  // Aggregate from mock test attempts
  attempts.forEach(a => {
    if (a.sectionBreakdown) {
      a.sectionBreakdown.forEach(s => {
        if (sectionStats[s.section]) {
          sectionStats[s.section].completed += s.total;
          sectionStats[s.section].correct += s.correct;
        }
      });
    }
  });

  // Aggregate from practice sessions
  practice.forEach(p => {
    if (sectionStats[p.section]) {
      sectionStats[p.section].completed += (p.total || 0);
      sectionStats[p.section].correct += (p.correct || 0);
    }
  });

  const sectionPerformance = Object.keys(sectionStats).map(sec => {
    const data = sectionStats[sec];
    const acc = data.completed > 0 ? Math.round((data.correct / data.completed) * 100) : 0;
    return {
      section: sec,
      available: data.totalAvailable,
      completed: data.completed,
      correct: data.correct,
      accuracy: acc
    };
  });

  const scoreHistory = attempts.map((a, i) => ({
    name: `Test ${attempts.length - i}`,
    date: a.date.split('T')[0],
    score: a.scorePercent || Math.round((a.correctCount / a.totalQuestions) * 100),
    title: a.testTitle
  })).reverse();

  // Smart Recommendations derived from real user data
  const recommendations = [];
  if (totalQuestionsAttempted === 0) {
    recommendations.push({
      type: "start",
      section: "Full Mock Test",
      message: "Take your first Infosys SE Mock Test to establish your initial score baseline across all 4 sections.",
      action: "Start Mock Test 1",
      targetTab: "mock"
    });
    recommendations.push({
      type: "focus",
      section: "Quantitative Aptitude",
      message: "Build arithmetic solving speed with the timed Aptitude Speed Trainer.",
      action: "Launch Speed Trainer",
      targetTab: "quant"
    });
  } else {
    sectionPerformance.forEach(s => {
      if (s.completed > 0 && s.accuracy < 80) {
        recommendations.push({
          type: "focus",
          section: s.section,
          message: `Your accuracy in ${s.section} is currently ${s.accuracy}%. Practice targeted questions to reach the 80%+ benchmark.`,
          action: `Practice ${s.section.split(' ')[0]}`,
          targetTab: s.section.includes("Quant") ? "quant" : s.section.includes("Verbal") ? "verbal" : s.section.includes("Pseudocode") ? "pseudocode" : "reasoning"
        });
      }
    });
    if (recommendations.length === 0) {
      recommendations.push({
        type: "maintain",
        section: "Exam Strategy",
        message: "Great performance across your completed tests! Continue taking full-length mock tests to practice test-day pacing.",
        action: "Take Next Mock Test",
        targetTab: "mock"
      });
    }
  }

  return {
    overallAccuracy,
    totalQuestionsInBank,
    totalQuestionsAttempted,
    totalCorrect,
    totalPracticeTimeMinutes: Math.round(totalTimeSeconds / 60),
    streakDays: dailyGoal.streakDays || 0,
    dailyGoal,
    sectionPerformance,
    scoreHistory,
    recommendations
  };
};

export const logPracticeSession = (data) => {
  const p = getLocal(LS_KEYS.PRACTICE, []);
  p.unshift({ date: new Date().toISOString(), ...data });
  setLocal(LS_KEYS.PRACTICE, p);

  const dg = getStoredDailyGoal();
  dg.completedToday += (data.total || 0);
  setLocal(LS_KEYS.DAILY_GOAL, dg);
};

// Reset all local user storage (browser sandboxed)
export const clearAllUserData = () => {
  localStorage.removeItem(LS_KEYS.ATTEMPTS);
  localStorage.removeItem(LS_KEYS.PRACTICE);
  localStorage.removeItem(LS_KEYS.BOOKMARKS);
  localStorage.removeItem(LS_KEYS.DAILY_GOAL);
  localStorage.removeItem(LS_KEYS.CUSTOM_QUESTIONS);
};
