import React, { useState, useEffect } from 'react';
import { 
  RiDatabase2Line, RiSearchLine, RiFilter3Line, RiAddLine, RiUploadLine, 
  RiDeleteBinLine, RiBookmarkLine, RiBookmarkFill, RiLightbulbLine, 
  RiCheckboxCircleLine, RiCloseCircleLine, RiCodeLine, RiQuestionLine, RiCloseLine 
} from '@remixicon/react';
import { 
  getAllQuestions, addCustomQuestion, 
  importQuestionsJSON, deleteQuestion, 
  toggleBookmark, isQuestionBookmarked 
} from '../../services/api';

export default function QuestionBankSection() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [notification, setNotification] = useState(null);

  // New Question Form state
  const [newQuestionForm, setNewQuestionForm] = useState({
    section: "Quantitative Aptitude",
    topic: "Arithmetic",
    subtopic: "Percentages",
    question: "",
    codeSnippet: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    difficulty: "Intermediate",
    recommendedTime: 60
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = () => {
    setQuestions(getAllQuestions());
  };

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter questions
  const filtered = questions.filter(q => {
    if (selectedSection !== 'All' && q.section !== selectedSection) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(s) ||
        (q.explanation && q.explanation.toLowerCase().includes(s)) ||
        q.topic.toLowerCase().includes(s) ||
        q.id.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleBookmark = async (id) => {
    await toggleBookmark(id);
    loadAll();
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to remove this question?")) {
      await deleteQuestion(id);
      loadAll();
      notify("Question removed from database.");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim()) return alert("Question text is required.");
    if (newQuestionForm.options.some(o => !o.trim())) return alert("All 4 options must be filled.");

    await addCustomQuestion(newQuestionForm);
    setShowAddModal(false);
    loadAll();
    notify("New question successfully added to Question Bank!");
    setNewQuestionForm({
      section: "Quantitative Aptitude",
      topic: "Arithmetic",
      subtopic: "Percentages",
      question: "",
      codeSnippet: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      difficulty: "Intermediate",
      recommendedTime: 60
    });
  };

  const handleImportSubmit = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const count = await importQuestionsJSON(parsed);
      setShowImportModal(false);
      setImportJsonText('');
      loadAll();
      notify(`Successfully imported ${count} questions!`);
    } catch (err) {
      alert("Invalid JSON format. Please verify the JSON structure.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <RiCheckboxCircleLine className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass-card p-6 border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-slate-800 text-white shadow-sm">
              <RiDatabase2Line className="w-5 h-5 text-brand-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Question Bank & Content Manager
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {questions.length} Items Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, tag, curate, and configure questions across all 4 syllabus categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RiUploadLine className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-colors cursor-pointer"
          >
            <RiAddLine className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <RiSearchLine className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by keywords, ID, formulas, or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="All">All Sections</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Verbal Ability">Verbal Ability</option>
              <option value="Logical Reasoning & Puzzles">Logical Reasoning & Puzzles</option>
              <option value="Pseudocode & Programming Logic">Pseudocode & Logic</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing {paginated.length} of {filtered.length} matching questions
        </div>
      </div>

      {/* Questions Table / List */}
      <div className="space-y-3">
        {paginated.map((q) => {
          const isBm = isQuestionBookmarked(q.id);

          return (
            <div
              key={q.id}
              className="glass-card p-5 space-y-3 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500">{q.id}</span>
                  <span className="px-2 py-0.5 rounded font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {q.section}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {q.topic} · {q.subtopic}
                  </span>
                  <span className="text-slate-400">
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isBm ? 'bg-amber-50 border-amber-300 text-amber-500' : 'border-slate-200 text-slate-400'
                    }`}
                    title="Bookmark"
                  >
                    {isBm ? <RiBookmarkFill className="w-3.5 h-3.5" /> : <RiBookmarkLine className="w-3.5 h-3.5" />}
                  </button>
                  {q.tags?.includes("custom") && (
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Question"
                    >
                      <RiDeleteBinLine className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                {q.question}
              </p>

              {q.codeSnippet && (
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300 whitespace-pre">
                  {q.codeSnippet}
                </div>
              )}

              {/* Options pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                      i === q.correctAnswer 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + i)}. {opt}</span>
                    {i === q.correctAnswer && <RiCheckboxCircleLine className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 glass-card text-xs font-semibold">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100"
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= ADD QUESTION MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Create New Assessment Question
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Section</label>
                  <select
                    value={newQuestionForm.section}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, section: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                    <option value="Logical Reasoning & Puzzles">Logical Reasoning & Puzzles</option>
                    <option value="Pseudocode & Programming Logic">Pseudocode & Logic</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Topic</label>
                  <input
                    type="text"
                    value={newQuestionForm.topic}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    placeholder="e.g. Arithmetic / Profit & Loss"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question Statement</label>
                <textarea
                  rows="3"
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Enter the question text clearly..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Code Snippet (Optional for pseudocode)</label>
                <textarea
                  rows="2"
                  value={newQuestionForm.codeSnippet}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, codeSnippet: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                  placeholder="e.g. for(i=1;i<=4;i++) { ... }"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Answer Choices & Correct Option</label>
                {newQuestionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newQuestionForm.correctAnswer === idx}
                      onChange={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: idx })}
                      title="Mark as correct answer"
                    />
                    <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newQuestionForm.options];
                        copy[idx] = e.target.value;
                        setNewQuestionForm({ ...newQuestionForm, options: copy });
                      }}
                      className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows="2"
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  placeholder="Explain why the selected option is correct and provide shortcuts..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= IMPORT JSON MODAL ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Import Questions from JSON
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste an array of question objects containing `question`, `options`, `correctAnswer`, and `explanation`.
            </p>

            <textarea
              rows="8"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 font-mono text-xs text-emerald-400"
              placeholder={`[
  {
    "section": "Quantitative Aptitude",
    "topic": "Arithmetic",
    "question": "Example question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Explanation here..."
  }
]`}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
