import React, { useState, useEffect } from 'react';
import { 
  Bookmark, BookmarkCheck, PlayCircle, Trash2, 
  CheckCircle2, XCircle, ArrowRight, HelpCircle 
} from 'lucide-react';
import { fetchBookmarks, toggleBookmark } from '../../services/api';

export default function BookmarksSection({ onLaunchCustomQuiz }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    const list = await fetchBookmarks();
    setBookmarks(list);
    setLoading(false);
  };

  const handleRemove = async (id) => {
    await toggleBookmark(id);
    loadBookmarks();
  };

  const handlePracticeBookmarks = () => {
    if (bookmarks.length === 0) return;
    onLaunchCustomQuiz({
      id: `BOOKMARKS-${Date.now()}`,
      title: `Bookmarked Questions Practice (${bookmarks.length} Qs)`,
      durationMinutes: Math.max(10, Math.round(bookmarks.length * 1.5)),
      totalQuestions: bookmarks.length,
      questions: bookmarks,
      isCustom: true
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-card p-6 border-amber-200/50 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Bookmark className="w-5 h-5 fill-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Bookmarked Questions
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              {bookmarks.length} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review questions you flagged during mock tests or practice sessions.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <button
            onClick={handlePracticeBookmarks}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practice Saved ({bookmarks.length} Qs)</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No bookmarked questions yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any question in Quantitative, Verbal, Reasoning, or Mock Tests to save it here for targeted revision.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((q, idx) => (
            <div key={q.id} className="glass-card p-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold text-[11px]">
                    {q.section}
                  </span>
                  <span className="text-slate-500">{q.topic}</span>
                </div>
                <button
                  onClick={() => handleRemove(q.id)}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {q.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border ${
                      i === q.correctAnswer
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + i)}. {opt}</span>
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
