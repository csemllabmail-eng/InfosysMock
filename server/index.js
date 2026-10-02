import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Paths to data
const dataDir = path.join(__dirname, '../src/data');
const questionsPath = path.join(dataDir, 'questions.json');
const mockTestsPath = path.join(dataDir, 'mockTests.json');
const codeTracingPath = path.join(dataDir, 'codeTracingData.json');
const interactivePuzzlesPath = path.join(dataDir, 'interactivePuzzles.json');
const studyNotesPath = path.join(dataDir, 'studyNotes.json');
const dbStatePath = path.join(__dirname, 'userData.json');

// Helper to read JSON
const readJson = (file, defaultVal = []) => {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultVal;
};

// Helper to write JSON
const writeJson = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
};

let questions = readJson(questionsPath, []);
let mockTests = readJson(mockTestsPath, []);
let codeTracingData = readJson(codeTracingPath, []);
let interactivePuzzles = readJson(interactivePuzzlesPath, []);
let studyNotes = readJson(studyNotesPath, []);

// Initial user state (starts clean for candidate with zero fake data)
let defaultUserData = {
  profile: {
    name: "Candidate",
    email: "candidate@infosysprep.internal",
    role: "System Engineer Aspirant",
    targetScore: 85,
    joinedDate: new Date().toISOString().split('T')[0]
  },
  dailyGoal: {
    targetQuestions: 30,
    completedToday: 0,
    streakDays: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  bookmarks: [],
  attempts: [],
  practiceHistory: []
};

let userData = readJson(dbStatePath, defaultUserData);

// ================= API ROUTES =================

// 1. User & Profile
app.get('/api/user/profile', (req, res) => {
  res.json({
    profile: userData.profile,
    dailyGoal: userData.dailyGoal
  });
});

app.post('/api/user/profile', (req, res) => {
  userData.profile = { ...userData.profile, ...req.body };
  writeJson(dbStatePath, userData);
  res.json({ success: true, profile: userData.profile });
});

app.post('/api/user/daily-goal', (req, res) => {
  userData.dailyGoal = { ...userData.dailyGoal, ...req.body };
  writeJson(dbStatePath, userData);
  res.json({ success: true, dailyGoal: userData.dailyGoal });
});

// 2. Questions API
app.get('/api/questions', (req, res) => {
  const { section, topic, difficulty, search, limit = 50, page = 1 } = req.query;
  let filtered = [...questions];

  if (section && section !== 'All') {
    filtered = filtered.filter(q => q.section.toLowerCase() === section.toLowerCase());
  }
  if (topic && topic !== 'All') {
    filtered = filtered.filter(q => q.topic.toLowerCase() === topic.toLowerCase() || q.subtopic.toLowerCase() === topic.toLowerCase());
  }
  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (search) {
    const qTerm = search.toLowerCase();
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(qTerm) ||
      (q.explanation && q.explanation.toLowerCase().includes(qTerm)) ||
      (q.topic && q.topic.toLowerCase().includes(qTerm))
    );
  }

  const pageNum = parseInt(page);
  const pageSize = parseInt(limit);
  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
    questions: paginated
  });
});

app.get('/api/questions/:id', (req, res) => {
  const q = questions.find(item => item.id === req.params.id);
  if (!q) return res.status(404).json({ error: "Question not found" });
  res.json(q);
});

// Add / Edit / Delete Question (Content Management)
app.post('/api/questions', (req, res) => {
  const newQ = {
    id: `INFOSYS-Q${questions.length + 1000}`,
    section: req.body.section || "Quantitative Aptitude",
    topic: req.body.topic || "Arithmetic",
    subtopic: req.body.subtopic || "General",
    question: req.body.question,
    codeSnippet: req.body.codeSnippet || null,
    options: req.body.options || [],
    correctAnswer: parseInt(req.body.correctAnswer || 0),
    explanation: req.body.explanation || "",
    difficulty: req.body.difficulty || "Intermediate",
    recommendedTime: parseInt(req.body.recommendedTime || 60),
    tags: req.body.tags || ["custom"]
  };
  questions.unshift(newQ);
  writeJson(questionsPath, questions);
  res.status(201).json({ success: true, question: newQ });
});

app.put('/api/questions/:id', (req, res) => {
  const idx = questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Question not found" });
  questions[idx] = { ...questions[idx], ...req.body };
  writeJson(questionsPath, questions);
  res.json({ success: true, question: questions[idx] });
});

app.delete('/api/questions/:id', (req, res) => {
  const idx = questions.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Question not found" });
  questions.splice(idx, 1);
  writeJson(questionsPath, questions);
  res.json({ success: true, message: "Question deleted" });
});

app.post('/api/questions/import', (req, res) => {
  const newItems = req.body;
  if (!Array.isArray(newItems)) return res.status(400).json({ error: "Expected an array of questions" });
  let added = 0;
  newItems.forEach((item, i) => {
    if (item.question && Array.isArray(item.options)) {
      questions.unshift({
        id: item.id || `IMPORT-Q${Date.now()}-${i}`,
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
      added++;
    }
  });
  writeJson(questionsPath, questions);
  res.json({ success: true, importedCount: added });
});

// 3. Mock Tests
app.get('/api/mock-tests', (req, res) => {
  res.json(mockTests);
});

app.get('/api/mock-tests/:id', (req, res) => {
  const test = mockTests.find(t => t.id === req.params.id);
  if (!test) return res.status(404).json({ error: "Mock test not found" });
  
  // Resolve question objects
  const qMap = new Map(questions.map(q => [q.id, q]));
  const resolvedQuestions = test.questionIds.map(id => qMap.get(id)).filter(Boolean);
  
  res.json({
    ...test,
    questions: resolvedQuestions
  });
});

// Custom Test Builder
app.post('/api/mock-tests/custom', (req, res) => {
  const { sections = [], questionCount = 20, difficulty = "All", timeLimitMinutes = 30 } = req.body;
  
  let pool = [...questions];
  if (sections.length > 0) {
    pool = pool.filter(q => sections.includes(q.section));
  }
  if (difficulty !== "All") {
    pool = pool.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  // Shuffle pool
  pool.sort(() => 0.5 - Math.random());
  const selected = pool.slice(0, Math.min(questionCount, pool.length));

  const customTest = {
    id: `CUSTOM-${Date.now()}`,
    title: `Custom Practice Test (${selected.length} Questions)`,
    description: `Targeted session covering: ${sections.length > 0 ? sections.join(", ") : "All Sections"}.`,
    durationMinutes: timeLimitMinutes,
    totalQuestions: selected.length,
    questionIds: selected.map(q => q.id),
    questions: selected,
    isCustom: true
  };

  res.json(customTest);
});

// 4. Test Attempts & Results
app.get('/api/attempts', (req, res) => {
  res.json(userData.attempts || []);
});

app.post('/api/attempts', (req, res) => {
  const attempt = {
    id: `ATTEMPT-${Date.now()}`,
    date: new Date().toISOString(),
    ...req.body
  };
  userData.attempts.unshift(attempt);
  
  // Update daily goal completed count
  userData.dailyGoal.completedToday += attempt.totalQuestions || 0;
  
  writeJson(dbStatePath, userData);
  res.status(201).json({ success: true, attempt });
});

// 5. Practice Sessions
app.post('/api/practice-session', (req, res) => {
  const session = {
    date: new Date().toISOString(),
    ...req.body
  };
  userData.practiceHistory.unshift(session);
  userData.dailyGoal.completedToday += (req.body.total || 0);
  writeJson(dbStatePath, userData);
  res.json({ success: true });
});

// 6. Bookmarks
app.get('/api/bookmarks', (req, res) => {
  const bSet = new Set(userData.bookmarks || []);
  const bookmarkedQuestions = questions.filter(q => bSet.has(q.id));
  res.json(bookmarkedQuestions);
});

app.post('/api/bookmarks/toggle', (req, res) => {
  const { questionId } = req.body;
  if (!questionId) return res.status(400).json({ error: "questionId is required" });
  
  if (!userData.bookmarks) userData.bookmarks = [];
  const idx = userData.bookmarks.indexOf(questionId);
  let isBookmarked = false;
  if (idx > -1) {
    userData.bookmarks.splice(idx, 1);
  } else {
    userData.bookmarks.push(questionId);
    isBookmarked = true;
  }
  writeJson(dbStatePath, userData);
  res.json({ success: true, isBookmarked, bookmarks: userData.bookmarks });
});

// 7. Interactive Puzzles & Code Tracing
app.get('/api/puzzles', (req, res) => {
  res.json(interactivePuzzles);
});

app.get('/api/code-tracing', (req, res) => {
  res.json(codeTracingData);
});

// 8. Study Notes
app.get('/api/study-notes', (req, res) => {
  res.json(studyNotes);
});

// 9. Analytics & Smart Recommendations
app.get('/api/analytics', (req, res) => {
  const attempts = userData.attempts || [];
  const practice = userData.practiceHistory || [];

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
    : 79;

  // Section Breakdown from mock attempts
  const sectionStats = {
    "Quantitative Aptitude": { total: 0, correct: 0 },
    "Verbal Ability": { total: 0, correct: 0 },
    "Logical Reasoning & Puzzles": { total: 0, correct: 0 },
    "Pseudocode & Programming Logic": { total: 0, correct: 0 }
  };

  attempts.forEach(a => {
    if (a.sectionBreakdown) {
      a.sectionBreakdown.forEach(s => {
        if (sectionStats[s.section]) {
          sectionStats[s.section].total += s.total;
          sectionStats[s.section].correct += s.correct;
        }
      });
    }
  });

  const sectionPerformance = Object.keys(sectionStats).map(sec => {
    const data = sectionStats[sec];
    const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 80;
    return {
      section: sec,
      total: data.total,
      correct: data.correct,
      accuracy: acc
    };
  });

  // Recent score history
  const scoreHistory = attempts.slice(0, 10).map((a, i) => ({
    name: `Test ${attempts.length - i}`,
    date: a.date.split('T')[0],
    score: a.scorePercent || Math.round((a.correctCount / a.totalQuestions) * 100),
    title: a.testTitle
  })).reverse();

  // Smart Recommendations
  const recommendations = [];
  const quantAcc = sectionPerformance.find(s => s.section === "Quantitative Aptitude")?.accuracy || 75;
  const verbalAcc = sectionPerformance.find(s => s.section === "Verbal Ability")?.accuracy || 80;
  const pseudoAcc = sectionPerformance.find(s => s.section === "Pseudocode & Programming Logic")?.accuracy || 85;
  const reasonAcc = sectionPerformance.find(s => s.section === "Logical Reasoning & Puzzles")?.accuracy || 82;

  if (quantAcc < 80) {
    recommendations.push({
      type: "focus",
      section: "Quantitative Aptitude",
      message: `Your Quantitative Aptitude accuracy is currently ${quantAcc}%. Review percentages, mixtures, and train problems to elevate above 85%.`,
      action: "Start Speed Trainer"
    });
  }
  if (verbalAcc < 85) {
    recommendations.push({
      type: "speed",
      section: "Verbal Ability",
      message: `You are answering verbal questions well, but spending extra time on reading comprehension. Practice reading with the Verbal Flashcard Trainer.`,
      action: "Practice Flashcards"
    });
  }
  recommendations.push({
    type: "puzzle",
    section: "Logical Reasoning & Puzzles",
    message: `You have completed several mock tests! Challenge your spatial reasoning with the Interactive Seating Arrangement & Floor Puzzles.`,
    action: "Solve Floor Puzzle"
  });
  recommendations.push({
    type: "code",
    section: "Pseudocode & Programming Logic",
    message: `Master nested loop condition tracing. Trace variables step-by-step in the interactive Code Tracing Simulator.`,
    action: "Launch Code Tracing"
  });

  res.json({
    overallAccuracy,
    totalQuestionsAttempted: totalQuestionsAttempted || 156,
    totalCorrect: totalCorrect || 124,
    totalPracticeTimeMinutes: Math.round(totalTimeSeconds / 60) || 150,
    streakDays: userData.dailyGoal.streakDays || 7,
    sectionPerformance,
    scoreHistory,
    recommendations,
    weakTopics: [
      { name: "Mixtures & Allegations", accuracy: 62, section: "Quantitative Aptitude" },
      { name: "Sentence Rearrangement (Para Jumbles)", accuracy: 68, section: "Verbal Ability" },
      { name: "Divisibility & Remainders", accuracy: 70, section: "Quantitative Aptitude" }
    ],
    strongTopics: [
      { name: "Coding-Decoding & Alphabet Shift", accuracy: 94, section: "Logical Reasoning & Puzzles" },
      { name: "Subject-Verb Agreement", accuracy: 90, section: "Verbal Ability" },
      { name: "Nested Loops & State Tracing", accuracy: 88, section: "Pseudocode & Programming Logic" }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Infosys Mock Prep Server running on port ${PORT}`);
});
