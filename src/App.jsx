import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import QuantSection from './components/aptitude/QuantSection';
import VerbalSection from './components/verbal/VerbalSection';
import ReasoningSection from './components/reasoning/ReasoningSection';
import PseudocodeSection from './components/pseudocode/PseudocodeSection';
import MockTestsSection from './components/mock/MockTestsSection';
import ExamInterface from './components/mock/ExamInterface';
import AnalyticsSection from './components/analytics/AnalyticsSection';
import QuestionBankSection from './components/questionBank/QuestionBankSection';
import BookmarksSection from './components/bookmarks/BookmarksSection';
import StudyNotesSection from './components/notes/StudyNotesSection';
import { fetchDailyGoal, fetchBookmarks, fetchMockTestDetails, generateCustomTest } from './services/api';
import { Search, X, ArrowRight, Minimize2, Sun, Moon } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('prepforge_dark_mode') === 'true';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Zero Distraction / Full Screen Mode state
  const [isZeroDistraction, setIsZeroDistraction] = useState(false);

  // Active exam session (when taking a full mock test or sectional test)
  const [activeExamTest, setActiveExamTest] = useState(null);

  // Global search modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('prepforge_dark_mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    async function loadMeta() {
      const dg = await fetchDailyGoal();
      const bm = await fetchBookmarks();
      setDailyGoal(dg);
      setBookmarkCount(bm.length);
    }
    loadMeta();
  }, [currentTab, activeExamTest]);

  // Sync zero distraction state with browser fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isZeroDistraction) {
        setIsZeroDistraction(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isZeroDistraction]);

  // Global keyboard shortcuts: '/' for search, 'Escape' to exit search or zero distraction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isZeroDistraction) {
          handleToggleZeroDistraction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isZeroDistraction]);

  const handleToggleZeroDistraction = () => {
    if (!isZeroDistraction) {
      setIsZeroDistraction(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsZeroDistraction(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleLaunchTest = (testObj) => {
    setActiveExamTest(testObj);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchTestById = async (testId) => {
    const test = await fetchMockTestDetails(testId);
    if (test) {
      setActiveExamTest(test);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitTest = () => {
    setActiveExamTest(null);
    setCurrentTab('mock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tabId) => {
    setActiveExamTest(null);
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If candidate is actively taking an exam, render dedicated exam interface
  if (activeExamTest) {
    return (
      <ExamInterface
        test={activeExamTest}
        onExitTest={handleExitTest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Zero Distraction Minimalist Floating Header vs Standard Navbar */}
      {isZeroDistraction ? (
        <div className="sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white px-4 py-2.5 flex items-center justify-between border-b border-purple-500/30 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider uppercase text-purple-300">Zero Distraction Mode</span>
              <span className="text-slate-400 text-xs hidden sm:inline">· Full Screen Focused Study · All distractions hidden</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleZeroDistraction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer"
              title="Exit Zero Distraction Full Screen Mode (or press Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Zero Distraction (Esc)</span>
            </button>
          </div>
        </div>
      ) : (
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          dailyGoal={dailyGoal}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          isZeroDistraction={isZeroDistraction}
          onToggleZeroDistraction={handleToggleZeroDistraction}
        />
      )}

      <div className="flex">
        {/* Sidebar - Completely hidden in Zero Distraction Mode */}
        {!isZeroDistraction && (
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            bookmarkCount={bookmarkCount}
          />
        )}

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-200 min-h-[calc(100vh-4rem)]
          ${isZeroDistraction ? 'max-w-5xl mx-auto w-full p-4 sm:p-8' : `${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full`}
        `}>
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onStartTest={handleLaunchTestById}
            />
          )}

          {currentTab === 'quant' && <QuantSection />}

          {currentTab === 'verbal' && <VerbalSection />}

          {currentTab === 'reasoning' && <ReasoningSection />}

          {currentTab === 'pseudocode' && <PseudocodeSection />}

          {currentTab === 'mock' && (
            <MockTestsSection
              onLaunchTest={handleLaunchTest}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsSection
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'questions' && <QuestionBankSection />}

          {currentTab === 'bookmarks' && (
            <BookmarksSection
              onLaunchCustomQuiz={handleLaunchTest}
            />
          )}

          {currentTab === 'notes' && <StudyNotesSection />}
        </main>
      </div>

      {/* Global Command / Search Modal */}
      {isSearchOpen && (
        <div 
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Search className="w-5 h-5 text-brand-500" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to any module or practice topic..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Navigation
              </span>
              {[
                { title: "Quantitative Aptitude & Speed Trainer", tab: "quant" },
                { title: "Verbal Ability & Vocab Flashcards", tab: "verbal" },
                { title: "Visual Seating & Floor Puzzle Studio", tab: "reasoning" },
                { title: "Pseudocode & Code Tracing Simulator", tab: "pseudocode" },
                { title: "Full-Length Mock Tests (15 Blueprints)", tab: "mock" },
                { title: "Performance Analytics & Recommendations", tab: "analytics" },
                { title: "Formulas, Shortcuts & Revision Notes", tab: "notes" },
                { title: "Saved Bookmarked Questions", tab: "bookmarks" },
                { title: "Question Bank & Content Manager", tab: "questions" }
              ]
                .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleNavigate(item.tab);
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <span>{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
